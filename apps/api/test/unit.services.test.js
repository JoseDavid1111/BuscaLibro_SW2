const assert = require("node:assert/strict");

const store = require("../src/data/store");

let createdBookId;
let createdAuthorId;
let createdCategoryId;
let createdOrderId;

async function run() {
  process.stdout.write("--- Unit tests ---\n");

  await testListBooks();
  await testListBooksWithFilters();
  await testFindBookById();
  await testLookupBook();
  await testCreateBook();
  await testUpdateBook();
  await testDeleteBook();
  await testListAuthors();
  await testCreateAuthor();
  await testUpdateAuthor();
  await testDeleteAuthor();
  await testDeleteAuthorWithBooks();
  await testListCategories();
  await testCreateCategory();
  await testUpdateCategory();
  await testDeleteCategory();
  await testListOrders();
  await testCreateOrder();
  await testUpdateOrder();
  await testCancelOrder();
  await testGetStatistics();
  await testListUsers();

  process.stdout.write("All unit tests passed\n");
}

async function testListBooks() {
  const result = await store.listBooks({});
  assert.ok(Array.isArray(result));
  assert.equal(result.length, 5);
  assert.equal(result[0].title, "Cien anos de soledad");
}

async function testListBooksWithFilters() {
  const byAuthor = await store.listBooks({ author: "gabriel" });
  assert.equal(byAuthor.length, 1);
  assert.equal(byAuthor[0].authorId, "1");

  const byCategory = await store.listBooks({ category: "infantil" });
  assert.equal(byCategory.length, 1);
  assert.equal(byCategory[0].categoryId, "5");

  const byQuery = await store.listBooks({ q: "principito" });
  assert.equal(byQuery.length, 1);

  const byAvailability = await store.listBooks({ availability: "available" });
  assert.ok(byAvailability.every((b) => b.availability === "Available"));
}

async function testFindBookById() {
  const book = await store.findBookById("1");
  assert.ok(book);
  assert.equal(book.isbn, "9780307476463");
}

async function testLookupBook() {
  const byIsbn = await store.lookupBook("9780061120084");
  assert.ok(byIsbn);
  assert.equal(byIsbn.title, "Matar a un ruisenor");

  const byCode = await store.lookupBook("BL-005");
  assert.ok(byCode);
  assert.equal(byCode.title, "El principito");

  const byTitle = await store.lookupBook("Sapiens");
  assert.ok(byTitle);

  await assert.rejects(
    () => store.lookupBook("NONEXISTENT"),
    /codigo, ISBN o titulo exacto/
  );
}

async function testCreateBook() {
  const book = await store.createBookInStore({
    isbn: "9990000000001",
    title: "Test Unitario",
    authorId: "1",
    categoryId: "2",
    price: 30000,
    stock: 5,
  });
  assert.ok(book);
  assert.equal(book.title, "Test Unitario");
  assert.equal(book.price, 30000);
  assert.equal(book.stock, 5);
  assert.equal(book.availability, "Available");
  createdBookId = book.id;
}

async function testUpdateBook() {
  const updated = await store.updateBookInStore(createdBookId, {
    price: 35000,
    stock: 10,
  });
  assert.equal(updated.price, 35000);
  assert.equal(updated.stock, 10);
}

async function testDeleteBook() {
  const result = await store.deleteBookFromStore(createdBookId);
  assert.equal(result.id, createdBookId);
}

async function testListAuthors() {
  const result = await store.listAuthors();
  assert.ok(Array.isArray(result));
  assert.equal(result.length, 5);
}

async function testCreateAuthor() {
  const author = await store.createAuthor({
    name: "Autor Test",
    nationality: "Colombiana",
  });
  assert.ok(author);
  assert.equal(author.name, "Autor Test");
  createdAuthorId = author.id;
}

async function testUpdateAuthor() {
  const updated = await store.updateAuthor(createdAuthorId, {
    nationality: "Mexicana",
  });
  assert.equal(updated.nationality, "Mexicana");
}

async function testDeleteAuthor() {
  const result = await store.deleteAuthor(createdAuthorId);
  assert.equal(result.id, createdAuthorId);
}

async function testDeleteAuthorWithBooks() {
  await assert.rejects(
    () => store.deleteAuthor("1"),
    /autor con libros activos/
  );
}

async function testListCategories() {
  const result = await store.listCategories();
  assert.ok(Array.isArray(result));
  assert.equal(result.length, 5);
}

async function testCreateCategory() {
  const cat = await store.createCategory({ name: "Categoria Test" });
  assert.ok(cat);
  assert.equal(cat.name, "Categoria Test");
  createdCategoryId = cat.id;
}

async function testUpdateCategory() {
  const updated = await store.updateCategory(createdCategoryId, {
    name: "Categoria Test Updated",
  });
  assert.equal(updated.name, "Categoria Test Updated");
}

async function testDeleteCategory() {
  const result = await store.deleteCategory(createdCategoryId);
  assert.equal(result.name, "Categoria Test Updated");
}

async function testListOrders() {
  const result = await store.listOrders();
  assert.ok(Array.isArray(result));
  assert.equal(result.length, 1);
  assert.equal(result[0].userId, "2");
}

async function testCreateOrder() {
  const order = await store.createOrder({
    userId: "2",
    items: [{ bookId: "3", quantity: 1 }],
    source: "manual",
  });
  assert.ok(order);
  assert.equal(order.status, "Pendiente");
  assert.equal(order.total, 48000);
  assert.equal(order.items.length, 1);
  createdOrderId = order.id;
}

async function testUpdateOrder() {
  const updated = await store.updateOrder(createdOrderId, {
    userId: "2",
    items: [
      { bookId: "3", quantity: 1 },
      { bookId: "5", quantity: 2 },
    ],
  });
  assert.equal(updated.items.length, 2);
  assert.equal(updated.total, 118000);
}

async function testCancelOrder() {
  const cancelled = await store.cancelOrder(createdOrderId);
  assert.equal(cancelled.status, "Cancelado");
}

async function testGetStatistics() {
  const stats = await store.getStatistics();
  assert.ok(stats.summary);
  assert.ok(typeof stats.summary.totalBooks === "number");
  assert.ok(Array.isArray(stats.mostRequestedBooks));
  assert.ok(Array.isArray(stats.ordersByCategory));
  assert.ok(Array.isArray(stats.mostExpensiveBooks));
}

async function testListUsers() {
  const result = await store.listUsers();
  assert.ok(Array.isArray(result));
  assert.equal(result.length, 3);
  assert.equal(result[0].email, "jose@buscalibro.local");
}

run().catch((error) => {
  process.stderr.write(`FAIL: ${error.stack}\n`);
  process.exitCode = 1;
});
