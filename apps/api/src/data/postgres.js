const { Pool } = require("pg");
const { config } = require("../config");
const { HttpError } = require("../lib/http");

let pool;

function getPool() {
  if (pool) {
    return pool;
  }

  if (!config.databaseUrl) {
    throw new Error(
      "Falta DATABASE_URL. Configura apps/api/.env con las credenciales de Supabase."
    );
  }

  pool = new Pool({
    connectionString: config.databaseUrl,
    ssl: config.databaseSsl ? { rejectUnauthorized: false } : false,
  });

  return pool;
}

async function query(text, params = [], client = getPool()) {
  return client.query(text, params);
}

async function withTransaction(work) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function findUserByCredentials(credentials) {
  const result = await query(
    `
      SELECT
        id_usuario::text AS id,
        nombre AS name,
        correo AS email,
        rol AS role
      FROM usuarios
      WHERE LOWER(correo) = $1
        AND contrasena = $2
        AND activo = TRUE
      LIMIT 1
    `,
    [credentials.email, credentials.password]
  );

  return result.rows[0] || null;
}

async function findUserById(userId) {
  const result = await query(
    `
      SELECT
        id_usuario::text AS id,
        nombre AS name,
        correo AS email,
        rol AS role
      FROM usuarios
      WHERE id_usuario = $1
        AND activo = TRUE
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] || null;
}

async function listBooks(filters) {
  const result = await query(
    `
      SELECT
        l.id_libro::text AS id,
        COALESCE(l.codigo_libro, l.id_libro::text) AS code,
        l.isbn,
        l.titulo AS title,
        COALESCE(l.descripcion, '') AS description,
        COALESCE(a.nombre, 'Autor desconocido') AS author_name,
        COALESCE(c.nombre_categoria, 'Sin categoria') AS category,
        l.precio::float8 AS price,
        COALESCE(i.stock_fisico - i.stock_reservado, 0) AS stock,
        l.esta_activo AS active
      FROM libros l
      LEFT JOIN autores a ON a.id_autor = l.id_autor
      LEFT JOIN categorias c ON c.id_categoria = l.id_categoria
      LEFT JOIN inventario i ON i.id_libro = l.id_libro
      WHERE l.esta_activo = TRUE
      ORDER BY l.id_libro
    `
  );

  return result.rows
    .map(mapBookRow)
    .filter((book) => applyBookFilters(book, filters));
}

async function findBookById(bookId) {
  const result = await query(
    `
      SELECT
        l.id_libro::text AS id,
        COALESCE(l.codigo_libro, l.id_libro::text) AS code,
        l.isbn,
        l.titulo AS title,
        COALESCE(l.descripcion, '') AS description,
        COALESCE(a.nombre, 'Autor desconocido') AS author_name,
        COALESCE(c.nombre_categoria, 'Sin categoria') AS category,
        l.precio::float8 AS price,
        COALESCE(i.stock_fisico - i.stock_reservado, 0) AS stock,
        l.esta_activo AS active
      FROM libros l
      LEFT JOIN autores a ON a.id_autor = l.id_autor
      LEFT JOIN categorias c ON c.id_categoria = l.id_categoria
      LEFT JOIN inventario i ON i.id_libro = l.id_libro
      WHERE l.id_libro = $1
        AND l.esta_activo = TRUE
      LIMIT 1
    `,
    [bookId]
  );

  if (!result.rows[0]) {
    throw new HttpError(404, "Libro no encontrado");
  }

  return mapBookRow(result.rows[0]);
}

async function lookupBook(value) {
  const result = await query(
    `
      SELECT
        l.id_libro::text AS id,
        COALESCE(l.codigo_libro, l.id_libro::text) AS code,
        l.isbn,
        l.titulo AS title,
        COALESCE(l.descripcion, '') AS description,
        COALESCE(a.nombre, 'Autor desconocido') AS author_name,
        COALESCE(c.nombre_categoria, 'Sin categoria') AS category,
        l.precio::float8 AS price,
        COALESCE(i.stock_fisico - i.stock_reservado, 0) AS stock,
        l.esta_activo AS active
      FROM libros l
      LEFT JOIN autores a ON a.id_autor = l.id_autor
      LEFT JOIN categorias c ON c.id_categoria = l.id_categoria
      LEFT JOIN inventario i ON i.id_libro = l.id_libro
      WHERE l.esta_activo = TRUE
        AND (
          l.id_libro::text = $1
          OR l.isbn = $1
          OR LOWER(l.titulo) = LOWER($1)
          OR LOWER(COALESCE(l.codigo_libro, '')) = LOWER($1)
        )
      LIMIT 1
    `,
    [String(value)]
  );

  if (!result.rows[0]) {
    throw new HttpError(
      404,
      "No se encontro un libro con ese codigo, ISBN o titulo exacto"
    );
  }

  return mapBookRow(result.rows[0]);
}

async function listOrders() {
  return loadOrders();
}

async function findOrderById(orderId) {
  const order = await loadSingleOrder(orderId);
  return order;
}

async function createOrder(payload) {
  return withTransaction(async (client) => {
    await ensureUserExists(payload.userId, client);
    const books = await getBooksForItems(payload.items, client);
    assertStockForItems(payload.items, books);

    const orderInsert = await query(
      `
        INSERT INTO pedidos (id_usuario, estado, precio_total, direccion_entrega, archivo_intercambio_json)
        VALUES ($1, 'Pendiente', 0, $2, $3)
        RETURNING id_pedido::text AS id
      `,
      [
        payload.userId,
        payload.deliveryAddress || null,
        JSON.stringify({ source: payload.source || "manual" }),
      ],
      client
    );

    const orderId = orderInsert.rows[0].id;
    let total = 0;

    for (const item of payload.items) {
      const book = books.get(String(item.bookId));
      total += item.quantity * Number(book.price);
      await query(
        `
          INSERT INTO detalle_pedidos (id_pedido, id_libro, cantidad, precio_historico)
          VALUES ($1, $2, $3, $4)
        `,
        [orderId, item.bookId, item.quantity, book.price],
        client
      );
    }

    await query(
      `
        UPDATE pedidos
        SET precio_total = $2,
            archivo_intercambio_json = $3
        WHERE id_pedido = $1
      `,
      [
        orderId,
        total,
        JSON.stringify({
          source: payload.source || "manual",
          userId: payload.userId,
          items: payload.items,
          total,
        }),
      ],
      client
    );

    return loadSingleOrder(orderId, client);
  });
}

async function updateOrder(orderId, payload) {
  return withTransaction(async (client) => {
    const current = await loadSingleOrder(orderId, client);
    if (current.status === "Cancelado") {
      throw new HttpError(409, "No se puede editar un pedido cancelado");
    }

    await ensureUserExists(payload.userId, client);
    await query("DELETE FROM detalle_pedidos WHERE id_pedido = $1", [orderId], client);

    const books = await getBooksForItems(payload.items, client);
    assertStockForItems(payload.items, books);

    let total = 0;

    for (const item of payload.items) {
      const book = books.get(String(item.bookId));
      total += item.quantity * Number(book.price);
      await query(
        `
          INSERT INTO detalle_pedidos (id_pedido, id_libro, cantidad, precio_historico)
          VALUES ($1, $2, $3, $4)
        `,
        [orderId, item.bookId, item.quantity, book.price],
        client
      );

      await query(
        `
          UPDATE inventario
          SET stock_fisico = stock_fisico - $2,
              ultima_actualizacion = CURRENT_TIMESTAMP
          WHERE id_libro = $1
        `,
        [item.bookId, item.quantity],
        client
      );
    }

    await query(
      `
        UPDATE pedidos
        SET id_usuario = $2,
            precio_total = $3,
            archivo_intercambio_json = $4
        WHERE id_pedido = $1
      `,
      [
        orderId,
        payload.userId,
        total,
        JSON.stringify({
          source: payload.source || current.source,
          userId: payload.userId,
          items: payload.items,
          total,
        }),
      ],
      client
    );

    return loadSingleOrder(orderId, client);
  });
}

async function cancelOrder(orderId) {
  return withTransaction(async (client) => {
    const current = await loadSingleOrder(orderId, client);
    if (current.status === "Cancelado") {
      throw new HttpError(409, "El pedido ya no esta activo");
    }

    const details = await query(
      `
        SELECT id_libro, cantidad
        FROM detalle_pedidos
        WHERE id_pedido = $1
      `,
      [orderId],
      client
    );

    for (const item of details.rows) {
      await query(
        `
          UPDATE inventario
          SET stock_fisico = stock_fisico + $2,
              ultima_actualizacion = CURRENT_TIMESTAMP
          WHERE id_libro = $1
        `,
        [item.id_libro, item.cantidad],
        client
      );
    }

    await query(
      `
        UPDATE pedidos
        SET estado = 'Cancelado'
        WHERE id_pedido = $1
      `,
      [orderId],
      client
    );

    return loadSingleOrder(orderId, client);
  });
}

async function listOrdersByUser(userId) {
  await ensureUserExists(userId);
  return loadOrders(null, userId);
}

async function getStatistics() {
  const [summaryResult, mostRequestedResult, categoriesResult, expensiveResult] =
    await Promise.all([
      query(
        `
          SELECT
            (SELECT COUNT(*) FROM libros WHERE esta_activo = TRUE) AS total_books,
            (SELECT COUNT(*) FROM pedidos WHERE estado <> 'Cancelado') AS active_orders,
            (SELECT COALESCE(SUM(precio_total), 0) FROM pedidos WHERE estado <> 'Cancelado') AS total_revenue
        `
      ),
      query(
        `
          SELECT
            l.id_libro::text AS book_id,
            l.titulo AS title,
            SUM(dp.cantidad)::int AS quantity
          FROM detalle_pedidos dp
          JOIN pedidos p ON p.id_pedido = dp.id_pedido
          JOIN libros l ON l.id_libro = dp.id_libro
          WHERE p.estado <> 'Cancelado'
          GROUP BY l.id_libro, l.titulo
          ORDER BY quantity DESC
        `
      ),
      query(
        `
          SELECT
            c.nombre_categoria AS category,
            COUNT(dp.id_detalle)::int AS quantity
          FROM detalle_pedidos dp
          JOIN pedidos p ON p.id_pedido = dp.id_pedido
          JOIN libros l ON l.id_libro = dp.id_libro
          JOIN categorias c ON c.id_categoria = l.id_categoria
          WHERE p.estado <> 'Cancelado'
          GROUP BY c.nombre_categoria
          ORDER BY quantity DESC
        `
      ),
      query(
        `
          SELECT
            id_libro::text AS id,
            titulo AS title,
            precio::float8 AS price
          FROM libros
          WHERE esta_activo = TRUE
          ORDER BY precio DESC
          LIMIT 5
        `
      ),
    ]);

  const summary = summaryResult.rows[0];

  return {
    summary: {
      totalBooks: Number(summary.total_books),
      activeOrders: Number(summary.active_orders),
      totalRevenue: Number(summary.total_revenue),
    },
    mostRequestedBooks: mostRequestedResult.rows.map((row) => ({
      bookId: row.book_id,
      title: row.title,
      quantity: row.quantity,
    })),
    ordersByCategory: categoriesResult.rows.map((row) => ({
      category: row.category,
      quantity: row.quantity,
    })),
    mostExpensiveBooks: expensiveResult.rows.map((row) => ({
      id: row.id,
      title: row.title,
      price: row.price,
    })),
  };
}

async function listAuthors() {
  const result = await query(`
    SELECT
      id_autor::text AS id,
      nombre AS name,
      nacionalidad AS nationality,
      COALESCE(descripcion, '') AS description
    FROM autores
    ORDER BY id_autor
  `);

  return result.rows;
}

async function findAuthorById(authorId) {
  const result = await query(
    `
    SELECT
      id_autor::text AS id,
      nombre AS name,
      nacionalidad AS nationality,
      COALESCE(descripcion, '') AS description
    FROM autores
    WHERE id_autor = $1
    LIMIT 1
  `,
    [authorId]
  );

  if (!result.rows[0]) {
    throw new HttpError(404, "Autor no encontrado");
  }

  return result.rows[0];
}

async function createAuthor(data) {
  const result = await query(
    `
    INSERT INTO autores (nombre, nacionalidad, descripcion)
    VALUES ($1, $2, $3)
    RETURNING id_autor::text AS id, nombre AS name, nacionalidad AS nationality, COALESCE(descripcion, '') AS description
  `,
    [data.name, data.nationality || null, data.description || null]
  );

  return result.rows[0];
}

async function updateAuthor(authorId, data) {
  const fields = [];
  const params = [];
  let idx = 1;

  if (data.name !== undefined) {
    fields.push(`nombre = $${idx++}`);
    params.push(data.name);
  }
  if (data.nationality !== undefined) {
    fields.push(`nacionalidad = $${idx++}`);
    params.push(data.nationality);
  }
  if (data.description !== undefined) {
    fields.push(`descripcion = $${idx++}`);
    params.push(data.description);
  }

  if (fields.length === 0) {
    return findAuthorById(authorId);
  }

  params.push(authorId);
  const result = await query(
    `
    UPDATE autores
    SET ${fields.join(", ")}
    WHERE id_autor = $${idx}
    RETURNING id_autor::text AS id, nombre AS name, nacionalidad AS nationality, COALESCE(descripcion, '') AS description
  `,
    params
  );

  if (!result.rows[0]) {
    throw new HttpError(404, "Autor no encontrado");
  }

  return result.rows[0];
}

async function deleteAuthor(authorId) {
  const bookCheck = await query(
    "SELECT COUNT(*)::int AS count FROM libros WHERE id_autor = $1 AND esta_activo = TRUE",
    [authorId]
  );

  if (bookCheck.rows[0].count > 0) {
    throw new HttpError(409, "No se puede eliminar un autor con libros activos");
  }

  const result = await query(
    `
    DELETE FROM autores WHERE id_autor = $1
    RETURNING id_autor::text AS id, nombre AS name
  `,
    [authorId]
  );

  if (!result.rows[0]) {
    throw new HttpError(404, "Autor no encontrado");
  }

  return result.rows[0];
}

async function listCategories() {
  const result = await query(`
    SELECT
      id_categoria::text AS id,
      nombre_categoria AS name
    FROM categorias
    ORDER BY id_categoria
  `);

  return result.rows;
}

async function findCategoryById(categoryId) {
  const result = await query(
    `
    SELECT
      id_categoria::text AS id,
      nombre_categoria AS name
    FROM categorias
    WHERE id_categoria = $1
    LIMIT 1
  `,
    [categoryId]
  );

  if (!result.rows[0]) {
    throw new HttpError(404, "Categoria no encontrada");
  }

  return result.rows[0];
}

async function createCategory(data) {
  const dupCheck = await query(
    "SELECT id_categoria FROM categorias WHERE LOWER(nombre_categoria) = LOWER($1)",
    [data.name]
  );

  if (dupCheck.rows[0]) {
    throw new HttpError(409, "Ya existe una categoria con ese nombre");
  }

  const result = await query(
    `
    INSERT INTO categorias (nombre_categoria)
    VALUES ($1)
    RETURNING id_categoria::text AS id, nombre_categoria AS name
  `,
    [data.name]
  );

  return result.rows[0];
}

async function updateCategory(categoryId, data) {
  if (data.name !== undefined) {
    const dupCheck = await query(
      "SELECT id_categoria FROM categorias WHERE LOWER(nombre_categoria) = LOWER($1) AND id_categoria <> $2",
      [data.name, categoryId]
    );

    if (dupCheck.rows[0]) {
      throw new HttpError(409, "Ya existe otra categoria con ese nombre");
    }

    const result = await query(
      `
      UPDATE categorias
      SET nombre_categoria = $2
      WHERE id_categoria = $1
      RETURNING id_categoria::text AS id, nombre_categoria AS name
    `,
      [categoryId, data.name]
    );

    if (!result.rows[0]) {
      throw new HttpError(404, "Categoria no encontrada");
    }

    return result.rows[0];
  }

  return findCategoryById(categoryId);
}

async function deleteCategory(categoryId) {
  const bookCheck = await query(
    "SELECT COUNT(*)::int AS count FROM libros WHERE id_categoria = $1 AND esta_activo = TRUE",
    [categoryId]
  );

  if (bookCheck.rows[0].count > 0) {
    throw new HttpError(409, "No se puede eliminar una categoria con libros activos");
  }

  const result = await query(
    `
    DELETE FROM categorias WHERE id_categoria = $1
    RETURNING id_categoria::text AS id, nombre_categoria AS name
  `,
    [categoryId]
  );

  if (!result.rows[0]) {
    throw new HttpError(404, "Categoria no encontrada");
  }

  return result.rows[0];
}

async function createBookInStore(data) {
  const authorCheck = await query(
    "SELECT id_autor FROM autores WHERE id_autor = $1",
    [data.authorId]
  );
  if (!authorCheck.rows[0]) {
    throw new HttpError(404, "Autor no encontrado");
  }

  const categoryCheck = await query(
    "SELECT id_categoria FROM categorias WHERE id_categoria = $1",
    [data.categoryId]
  );
  if (!categoryCheck.rows[0]) {
    throw new HttpError(404, "Categoria no encontrada");
  }

  return withTransaction(async (client) => {
    const bookInsert = await query(
      `
      INSERT INTO libros (codigo_libro, isbn, titulo, descripcion, id_autor, id_categoria, editorial, anio_publicacion, precio, esta_activo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE)
      RETURNING id_libro::text AS id
    `,
      [
        data.code || null,
        data.isbn,
        data.title,
        data.description || null,
        data.authorId,
        data.categoryId,
        data.editorial || null,
        data.anioPublicacion || null,
        data.price || 0,
      ],
      client
    );

    const bookId = bookInsert.rows[0].id;

    await query(
      `
      INSERT INTO inventario (id_libro, stock_fisico, stock_reservado)
      VALUES ($1, $2, 0)
    `,
      [bookId, data.stock || 0],
      client
    );

    return findBookById(bookId);
  });
}

async function updateBookInStore(bookId, data) {
  const fields = [];
  const params = [];
  let idx = 1;

  if (data.title !== undefined) { fields.push(`titulo = $${idx++}`); params.push(data.title); }
  if (data.isbn !== undefined) { fields.push(`isbn = $${idx++}`); params.push(data.isbn); }
  if (data.description !== undefined) { fields.push(`descripcion = $${idx++}`); params.push(data.description); }
  if (data.editorial !== undefined) { fields.push(`editorial = $${idx++}`); params.push(data.editorial); }
  if (data.anioPublicacion !== undefined) { fields.push(`anio_publicacion = $${idx++}`); params.push(data.anioPublicacion); }
  if (data.price !== undefined) { fields.push(`precio = $${idx++}`); params.push(data.price); }
  if (data.code !== undefined) { fields.push(`codigo_libro = $${idx++}`); params.push(data.code); }
  if (data.authorId !== undefined) {
    const authorCheck = await query("SELECT id_autor FROM autores WHERE id_autor = $1", [data.authorId]);
    if (!authorCheck.rows[0]) throw new HttpError(404, "Autor no encontrado");
    fields.push(`id_autor = $${idx++}`);
    params.push(data.authorId);
  }
  if (data.categoryId !== undefined) {
    const categoryCheck = await query("SELECT id_categoria FROM categorias WHERE id_categoria = $1", [data.categoryId]);
    if (!categoryCheck.rows[0]) throw new HttpError(404, "Categoria no encontrada");
    fields.push(`id_categoria = $${idx++}`);
    params.push(data.categoryId);
  }

  if (fields.length > 0) {
    params.push(bookId);
    const result = await query(
      `UPDATE libros SET ${fields.join(", ")} WHERE id_libro = $${idx} RETURNING id_libro::text AS id`,
      params
    );

    if (!result.rows[0]) {
      throw new HttpError(404, "Libro no encontrado");
    }
  }

  if (data.stock !== undefined) {
    await query(
      `UPDATE inventario SET stock_fisico = $2, ultima_actualizacion = CURRENT_TIMESTAMP WHERE id_libro = $1`,
      [bookId, data.stock]
    );
  }

  return findBookById(bookId);
}

async function deleteBookFromStore(bookId) {
  const orderCheck = await query(
    `
    SELECT COUNT(*)::int AS count
    FROM detalle_pedidos dp
    JOIN pedidos p ON p.id_pedido = dp.id_pedido
    WHERE dp.id_libro = $1 AND p.estado <> 'Cancelado'
  `,
    [bookId]
  );

  if (orderCheck.rows[0].count > 0) {
    throw new HttpError(409, "No se puede eliminar un libro con pedidos activos");
  }

  const result = await query(
    `UPDATE libros SET esta_activo = FALSE WHERE id_libro = $1 RETURNING id_libro::text AS id`,
    [bookId]
  );

  if (!result.rows[0]) {
    throw new HttpError(404, "Libro no encontrado");
  }

  return result.rows[0];
}

function mapBookRow(row) {
  return {
    id: row.id,
    code: row.code,
    isbn: row.isbn,
    title: row.title,
    description: row.description,
    authors: [row.author_name],
    category: row.category,
    price: Number(row.price),
    stock: Number(row.stock),
    active: row.active,
    availability: Number(row.stock) > 0 ? "Available" : "Reserved",
  };
}

function applyBookFilters(book, filters) {
  if (filters.q) {
    const haystack = [
      book.id,
      book.code,
      book.isbn,
      book.title,
      book.description,
      ...book.authors,
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(filters.q)) {
      return false;
    }
  }

  if (filters.author) {
    const matchesAuthor = book.authors.some((author) =>
      author.toLowerCase().includes(filters.author)
    );
    if (!matchesAuthor) {
      return false;
    }
  }

  if (filters.category && !book.category.toLowerCase().includes(filters.category)) {
    return false;
  }

  if (
    filters.availability &&
    book.availability.toLowerCase() !== filters.availability
  ) {
    return false;
  }

  return true;
}

async function ensureUserExists(userId, client = getPool()) {
  const user = await findUserByIdWithClient(userId, client);
  if (!user) {
    throw new HttpError(404, "Usuario no encontrado");
  }
}

async function findUserByIdWithClient(userId, client) {
  const result = await query(
    `
      SELECT id_usuario::text AS id
      FROM usuarios
      WHERE id_usuario = $1
        AND activo = TRUE
      LIMIT 1
    `,
    [userId],
    client
  );

  return result.rows[0] || null;
}

async function getBooksForItems(items, client) {
  const bookIds = [...new Set(items.map((item) => String(item.bookId)))];
  const result = await query(
    `
      SELECT
        l.id_libro::text AS id,
        l.precio::float8 AS price,
        COALESCE(i.stock_fisico - i.stock_reservado, 0) AS stock,
        l.esta_activo AS active
      FROM libros l
      LEFT JOIN inventario i ON i.id_libro = l.id_libro
      WHERE l.id_libro = ANY($1::int[])
    `,
    [bookIds.map(Number)],
    client
  );

  const bookMap = new Map(result.rows.map((row) => [row.id, row]));

  for (const bookId of bookIds) {
    const book = bookMap.get(String(bookId));
    if (!book || !book.active) {
      throw new HttpError(404, `El libro ${bookId} no existe`);
    }
  }

  return bookMap;
}

function assertStockForItems(items, books) {
  items.forEach((item) => {
    const book = books.get(String(item.bookId));
    const stock = Number(book.stock);
    if (stock < item.quantity) {
      throw new HttpError(409, `Stock insuficiente para el libro ${item.bookId}`);
    }
  });
}

async function loadOrders(orderId = null, userId = null, client = getPool()) {
  const filters = [];
  const params = [];

  if (orderId) {
    params.push(orderId);
    filters.push(`p.id_pedido = $${params.length}`);
  }

  if (userId) {
    params.push(userId);
    filters.push(`p.id_usuario = $${params.length}`);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const orderResult = await query(
    `
      SELECT
        p.id_pedido::text AS id,
        p.id_usuario::text AS user_id,
        u.nombre AS user_name,
        p.estado AS status,
        COALESCE((p.archivo_intercambio_json ->> 'source'), 'manual') AS source,
        p.fecha_registro AS created_at,
        p.fecha_registro AS updated_at,
        p.precio_total::float8 AS total
      FROM pedidos p
      JOIN usuarios u ON u.id_usuario = p.id_usuario
      ${whereClause}
      ORDER BY p.id_pedido DESC
    `,
    params,
    client
  );

  if (orderResult.rows.length === 0) {
    return [];
  }

  const orderIds = orderResult.rows.map((row) => Number(row.id));
  const detailResult = await query(
    `
      SELECT
        dp.id_pedido::text AS order_id,
        dp.id_libro::text AS book_id,
        l.titulo AS title,
        dp.cantidad AS quantity,
        dp.precio_historico::float8 AS unit_price
      FROM detalle_pedidos dp
      JOIN libros l ON l.id_libro = dp.id_libro
      WHERE dp.id_pedido = ANY($1::int[])
      ORDER BY dp.id_detalle
    `,
    [orderIds],
    client
  );

  const detailMap = new Map();
  detailResult.rows.forEach((row) => {
    const current = detailMap.get(row.order_id) || [];
    current.push({
      bookId: row.book_id,
      title: row.title,
      quantity: Number(row.quantity),
      unitPrice: Number(row.unit_price),
      subtotal: Number(row.quantity) * Number(row.unit_price),
    });
    detailMap.set(row.order_id, current);
  });

  return orderResult.rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    status: row.status,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    total: Number(row.total),
    items: detailMap.get(row.id) || [],
  }));
}

async function listUsers() {
  const result = await query(`
    SELECT
      id_usuario::text AS id,
      nombre AS name,
      correo AS email,
      rol AS role
    FROM usuarios
    WHERE activo = TRUE
    ORDER BY id_usuario
  `);
  return result.rows;
}

async function loadSingleOrder(orderId, client = getPool()) {
  const orders = await loadOrders(orderId, null, client);
  if (!orders[0]) {
    throw new HttpError(404, "Pedido no encontrado");
  }
  return orders[0];
}

module.exports = {
  findUserByCredentials,
  findUserById,
  listBooks,
  findBookById,
  lookupBook,
  createBookInStore,
  updateBookInStore,
  deleteBookFromStore,
  listOrders,
  findOrderById,
  createOrder,
  updateOrder,
  cancelOrder,
  listOrdersByUser,
  getStatistics,
  listAuthors,
  findAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  listCategories,
  findCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  listUsers,
};
