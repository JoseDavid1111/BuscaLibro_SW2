# 📚 BuscaLibro - Especificaciones del Proyecto

---

## 1. Descripción General

**BuscaLibro** es un sistema de gestión de inventario y pedidos para librerías y centros de lectura. Centraliza el control de inventario, seguimiento de pedidos y reportes estadísticos, resolviendo problemas comunes como la falta de visibilidad en fechas de entrega y disponibilidad de stock.

### Problema que resuelve

La gestión manual y descentralizada en librerías genera errores críticos de stock y retrasos en entregas. BuscaLibro:

- **Elimina la incertidumbre:** Visibilidad en tiempo real del stock de libros
- **Automatiza el flujo:** Sincroniza inventario con cada transacción
- **Interoperabilidad:** Intercambio de datos JSON con sistemas externos
- **Decisiones basadas en datos:** Reportes cuantificables para crecimiento estratégico

---

## 2. Arquitectura

### Monorepo (npm workspaces)

```
BuscaLibro_SW2/
├── apps/
│   ├── api/          # Backend REST API (Node.js)
│   └── web/          # Frontend SPA (React + Vite)
├── packages/
│   └── shared/       # Constantes y validadores compartidos
├── database/
│   ├── schema.sql    # Esquema PostgreSQL completo
│   ├── migrations/   # Migraciones (vacío actualmente)
│   └── seeds/        # Seeds iniciales (incluidos en schema.sql)
├── infra/
│   ├── docker-compose.yml  # (vacío actualmente)
│   └── nginx/
├── docs/
│   ├── API.md
│   └── ARCHITECTURE.md
└── package.json      # Workspace root
```

### Patrón Backend

```
app.js           # Enrutador principal
├── lib/
│   └── http.js      # Router custom (sin Express framework)
├── middlewares/
│   ├── auth.middleware.js   # JWT verification + role guard
│   └── validate.middleware.js  # Zod validation
├── modules/
│   ├── auth/        # Login, token, user profile
│   ├── books/       # Catálogo de libros
│   ├── orders/      # Pedidos (CRUD)
│   ├── reports/     # Estadísticas
│   ├── exchange/    # Import/export JSON
│   ├── inventory/   # (vacío)
│   └── suppliers/   # (vacío)
├── data/
│   ├── store.js     # In-memory data store (dev mode)
│   └── postgres.js  # PostgreSQL queries (prod mode)
└── config/
    ├── db.js        # Knex connection
    └── config.js    # Environment + dot env loader
```

### Patrón Frontend

```
src/
├── main.jsx         # Entry point + Providers
├── App.jsx          # Routes
├── context/
│   └── AuthContext.jsx    # Auth state (user, token, login, logout)
├── pages/
│   ├── auth/
│   │   └── LoginPage.jsx  # ✅ Implementada
│   ├── inventory/         # ❌ Vacío
│   ├── orders/            # ❌ Vacío
│   └── reports/           # ❌ Vacío
├── components/
│   ├── ProtectedRoute.jsx  # Auth guard
│   ├── layout/
│   └── ui/
├── services/
│   └── auth.service.js     # ✅ Solo auth
├── hooks/
├── store/
└── utils/
```

---

## 3. Tech Stack

| Capa | Tecnología | Versión |
|---|---|---|
| **Frontend** | React + Vite | 19.x |
| **Routing** | React Router DOM | 7.x |
| **Backend** | Node.js (custom router) | - |
| **Database** | PostgreSQL | via pg + knex |
| **Auth** | JWT + bcrypt | jsonwebtoken 9.x, bcryptjs |
| **Validation** | Zod | 4.x |
| **Data Layer** | Dual mode (memory/postgres) | Switch via env var |
| **Package Manager** | pnpm workspaces | - |

---

## 4. Base de Datos (PostgreSQL)

### Tablas

| Tabla | Columnas clave | Descripción |
|---|---|---|
| `usuarios` | id_usuario, nombre, rol, correo, telefono, fecha_creacion | Usuarios del sistema (Admin/Vendedor/Cliente) |
| `autores` | id_autor, nombre, nacionalidad, descripcion | Autores de libros |
| `categorias` | id_categoria, nombre_categoria | Categorías/géneros |
| `libros` | id_libro, isbn, titulo, id_autor, id_categoria, editorial, anio_publicacion, precio, esta_activo | Catálogo de libros |
| `inventario` | id_inventario, id_libro, stock_fisico, stock_reservado, ubicacion_pasillo, ultima_actualizacion | Stock por libro (1:1 con libros) |
| `pedidos` | id_pedido, id_usuario, fecha_registro, estado, precio_total, direccion_entrega, archivo_intercambio_json | Órdenes/pedidos |
| `detalle_pedidos` | id_detalle, id_pedido, id_libro, cantidad, precio_historico | Líneas de pedido |

### Vistas

| Vista | Propósito |
|---|---|
| `vista_reporte_mas_vendidos` | Libros más solicitados (agrupa detalle_pedidos) |
| `vista_frecuencia_categorias` | Frecuencia de compra por categoría |

### Triggers

| Trigger | Función |
|---|---|
| `tr_gestionar_inventario_detalle_pedido` | Actualiza stock_fisico automáticamente al insertar/actualizar/eliminar detalle_pedidos. Valida stock disponible (stock_fisico - stock_reservado >= cantidad) |

### Roles de usuario

- **Administrador:** Acceso total
- **Vendedor:** Gestión de pedidos e inventario
- **Cliente:** Consultar catálogo y crear pedidos

### Seed Data

3 usuarios, 5 autores, 5 categorías, 5 libros, 5 registros de inventario (incluido en schema.sql)

---

## 5. API Endpoints

### Auth

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | ❌ | Login con email/password |
| GET | `/api/auth/me` | ✅ | Obtener perfil del usuario actual |

### Libros

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/books` | ✅ | Listar libros (con filtros: q, author, category, availability) |
| GET | `/api/books/lookup?value=` | ✅ | Búsqueda exacta por codigo_libro, ISBN o título |
| GET | `/api/books/:id` | ✅ | Obtener libro por ID |

### Pedidos

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/orders` | ✅ | Listar todos los pedidos |
| POST | `/api/orders` | ✅ | Crear nuevo pedido |
| GET | `/api/orders/:id` | ✅ | Obtener pedido por ID |
| PUT | `/api/orders/:id` | ✅ | Actualizar pedido |
| DELETE | `/api/orders/:id` | ✅ | Cancelar pedido |
| GET | `/api/users/:userId/orders` | ✅ | Historial de pedidos de un usuario |

### Reportes

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/reports/statistics` | ✅ | Estadísticas generales |

### Exchange (Import/Export)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/exchange/orders/export` | ✅ | Exportar pedidos como JSON |
| POST | `/api/exchange/orders/import` | ✅ | Importar pedidos desde JSON |

### Utilidades

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/health` | ❌ | Health check |

---

## 6. Estructura de datos

### Login Request/Response

```json
// POST /api/auth/login
{ "email": "jose@buscalibro.local", "password": "123456" }

// Response
{ "token": "eyJ...", "user": { "id": "1", "email": "...", "role": "Administrador" } }
```

### Pedido Request/Response

```json
// POST /api/orders
{ "userId": "2", "items": [{ "bookId": "1", "quantity": 1 }] }

// Response
{ "id": "...", "userId": "2", "userName": "...", "status": "Pendiente", "total": 69000, "items": [...] }
```

### Estadísticas Response

```json
{
  "summary": { "totalBooks": 5, "activeOrders": 2, "totalRevenue": 206000 },
  "mostRequestedBooks": [{ "bookId": "1", "title": "...", "quantity": 3 }],
  "ordersByCategory": [{ "category": "Novela", "quantity": 3 }],
  "mostExpensiveBooks": [{ "id": "4", "title": "Sapiens", "price": 87000 }]
}
```

---

## 7. Data Layer Dual

El backend soporta dos modos de datos, controlado por `DATA_SOURCE`:

### Memory Mode (`DATA_SOURCE=memory`, default)

- Datos en memoria (`store.js`)
- Ideal para desarrollo sin necesidad de PostgreSQL
- Simula lógica de negocio completa: validación de stock, cancelación, actualización
- 5 libros precargados, 3 usuarios, 1 pedido de ejemplo

### Postgres Mode (`DATA_SOURCE=postgres`)

- Usa `postgres.js` con pool de conexiones pg
- Transacciones con `BEGIN/COMMIT/ROLLBACK`
- Query directa al esquema PostgreSQL
- Requiere `DATABASE_URL` configurado

### Switch

```js
// En store.js
function usePostgres() {
  return config.dataSource === "postgres";
}
```

Cada función del store chequea este flag y delega a postgres.js si corresponde.

---

## 8. Autenticación y Autorización

### Flujo

1. Cliente envía `POST /api/auth/login` con email/password
2. Server valida credenciales (memory: plaintext, postgres: bcrypt)
3. Server genera JWT con `{ userId, role }` y expira en 8h
4. Cliente almacena token en localStorage
5. Cada request protegido incluye `Authorization: Bearer <token>`
6. Middleware `verifyToken` decodifica y asigna `req.userId` y `req.userRole`
7. Opcionalmente `requireRole('Administrador')` restringe por rol

### JWT

- **Secret:** `process.env.JWT_SECRET || 'dev-secret'`
- **Expiración:** 8 horas por defecto
- **Payload:** `{ userId, role, iat, exp }`

---

## 9. Gestión de Inventario

### Lógica de stock

- **stock_fisico:** Unidades físicas disponibles
- **stock_reservado:** Unidades reservadas (para futuros pedidos)
- **Disponible:** `stock_fisico - stock_reservado`

### Automatización (trigger)

Al crear un pedido (`INSERT detalle_pedidos`):
- Trigger resta `cantidad` de `stock_fisico`
- Si `stock_fisico - stock_reservado < cantidad` → excepción

Al cancelar pedido (`UPDATE pedidos SET estado = 'Cancelado'`):
- Detalle eliminado → trigger restaura `stock_fisico`

---

## 10. Estado Actual

### ✅ Implementado

**Backend:**
- [x] Router custom con soporte de middlewares
- [x] Auth (login + me) con JWT
- [x] CRUD de libros (list, lookup, byId, create, update, delete)
- [x] CRUD de autores (list, byId, create, update, delete)
- [x] CRUD de categorías (list, byId, create, update, delete)
- [x] CRUD de pedidos (crear, listar, editar, cancelar)
- [x] Reportes (estadísticas)
- [x] Exchange (import/export de pedidos)
- [x] Middleware de autenticación (verifyToken, requireRole)
- [x] Data layer dual (memory + postgres)
- [x] Validación con Zod (schemas definidos)
- [x] Health endpoint
- [x] Smoke tests

**Frontend:**
- [x] App shell con React Router
- [x] LoginPage
- [x] AuthContext + AuthProvider
- [x] ProtectedRoute
- [x] DashboardLayout (sidebar + header + logout)
- [x] AuthService (login + me)
- [x] BooksService (list, getById, lookup, create, update, remove)
- [x] OrdersService (list, getById, create, update, cancel, getUserHistory)
- [x] ReportsService (getStatistics)
- [x] AuthorsService (list, getById, create, update, remove)
- [x] CategoriesService (list, getById, create, update, remove)
- [x] UsersService (list)
- [x] Modal component reusable
- [x] InventoryPage (listado, búsqueda, filtros por autor/categoría/disponibilidad, CRUD completo)
- [x] OrdersPage (listado, creación con selección de usuario y libros, edición, cancelación, detalle expandible)
- [x] ReportsPage (dashboard estadístico: tarjetas de resumen, libros más solicitados, frecuencia por categoría, libros más caros)
- [x] Estilos CSS completos para todas las páginas y componentes

**Backend:**
- [x] Endpoint GET /api/users (lista de usuarios activos para formularios)

**Database:**
- [x] Schema SQL completo
- [x] Vistas de reportes
- [x] Trigger de inventario
- [x] Seed data

### ❌ Pendiente

**Backend:**
- [ ] Módulo inventory (endpoints para ajuste de stock)
- [ ] Módulo suppliers

**Infraestructura:**
- [ ] docker-compose.yml
- [ ] CI/CD (GitHub Actions)
- [ ] Documentar ARCHITECTURE.md

---

## 11. Variables de Entorno

### Backend (`apps/api/.env`)

| Variable | Default | Descripción |
|---|---|---|
| `DATA_SOURCE` | `memory` | `memory` o `postgres` |
| `DATABASE_URL` | - | Connection string PostgreSQL |
| `DATABASE_SSL` | `true` | Habilitar SSL para DB |
| `JWT_SECRET` | `dev-secret` | Secret para firmar JWTs |
| `JWT_EXPIRES_IN` | `8h` | Expiración del token |
| `APP_NAME` | `BuscaLibro API` | Nombre de la app |
| `NODE_ENV` | `development` | Entorno |
| `DB_HOST` | `localhost` | DB host (knex fallback) |
| `DB_PORT` | `5432` | DB port |
| `DB_NAME` | `buscalibro` | DB name |
| `DB_USER` | `postgres` | DB user |
| `DB_PASSWORD` | - | DB password |

### Frontend (`apps/web/.env`)

| Variable | Default | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000/api` | URL base del API |

---

## 12. Scripts Disponibles

```bash
# Root
npm run dev            # Inicia api + web en paralelo
npm run install-all    # Instala dependencias de todos los workspaces
npm test               # Corre tests de todos los workspaces

# API
npm run dev            # API con --watch (auto-reload)
npm run start          # API producción
npm run test           # Smoke tests
npm run test:unit      # Tests unitarios
npm run test:integration # Tests de integración
npm run test:all       # Todos los tests

# Web
npm run dev            # Vite dev server
npm run build          # Build producción
npm run lint           # ESLint
npm run preview        # Preview build
```

---

## 13. Convenciones de Código

### Backend

- **Controladores:** Reciben `(req, res)` estilo Express
- **Services:** Capa de lógica de negocio pura
- **Schemas:** Zod para validación de entrada
- **Errores:** `HttpError` con status code + mensaje
- **Rutas:** Sin Express, router custom con `createRouter()`

### Frontend

- **Components:** Funcionales con hooks
- **Context:** AuthContext para estado global de auth
- **Services:** Funciones puras que llaman fetch
- **Routes:** ProtectedRoute para rutas autenticadas

### Database

- **Naming:** snake_case para columnas, nombres en español
- **IDs:** SERIAL auto-incrementales
- **Fechas:** TIMESTAMP con CURRENT_TIMESTAMP default

---

## 14. Historial de Cambios Recientes

### Sesión actual (Fase 2 - Calidad y Conexiones):

| Archivo | Cambio |
|---|---|
| `apps/api/src/middlewares/validate.middleware.js` | Fix para Zod v4 (`.issues` en vez de `.errors`) |
| `apps/api/src/modules/books/books.schema.js` | + `createBookSchema`, `updateBookSchema` (Zod) |
| `apps/api/src/modules/authors/authors.schema.js` | + `createAuthorSchema`, `updateAuthorSchema` (Zod) |
| `apps/api/src/modules/categories/categories.schema.js` | + `createCategorySchema`, `updateCategorySchema` (Zod) |
| `apps/api/src/modules/orders/orders.schema.js` | + `createOrderSchema`, `updateOrderSchema` (Zod) |
| `apps/api/src/app.js` | + `validateBody` middleware conectado a POST/PUT de todas las rutas; GET /api/books público |
| `apps/api/test/unit.services.test.js` | **Nuevo** - 18 tests unitarios para store (libros, autores, categorías, pedidos, reportes) |
| `apps/api/test/api.integration.test.js` | **Nuevo** - 19 tests de integración sobre HTTP (health, auth, CRUD completo, exchange) |
| `apps/api/package.json` | + scripts `test:unit`, `test:integration`, `test:all` |
| `package.json` | + script `test:all` |
| `apps/web/src/pages/MainPage.jsx` | **Reescrito** - Conexión a API, loading/error/empty states, busca por search bar, placeholders con gradientes |
| `apps/web/src/pages/MainPage.css` | + `.login-link`, `.book-initials`, `.loading`, `.empty-text` |
| `apps/web/src/pages/inventory/InventoryPage.jsx` | + Reset de error en openCreate/openEdit, error en handleDelete |
| `apps/web/src/pages/orders/OrdersPage.jsx` | + Reset de error en openCreate/openEdit, error en handleCancel |
| `apps/web/src/pages/reports/ReportsPage.jsx` | Error inline con botón reintentar en vez de pantalla completa; empty state |
| `SPECS.md` | Actualizado estado actual e historial |

### Sesiones anteriores (Fase 1 - Frontend):

| Archivo | Cambio |
|---|---|
| `apps/api/.env` | Cambiado DATA_SOURCE de postgres a memory |
| `apps/api/src/data/store.js` | + listUsers() |
| `apps/api/src/data/postgres.js` | + listUsers() |
| `apps/api/src/modules/auth/auth.service.js` | + listAllUsers() |
| `apps/api/src/modules/auth/auth.controller.js` | + listUsers handler |
| `apps/api/src/app.js` | + GET /api/users route |
| `apps/web/src/services/books.service.js` | + create, update, remove methods |
| `apps/web/src/services/authors.service.js` | **Nuevo** - Service de autores |
| `apps/web/src/services/categories.service.js` | **Nuevo** - Service de categorías |
| `apps/web/src/services/users.service.js` | **Nuevo** - Service de usuarios |
| `apps/web/src/components/ui/Modal.jsx` | **Nuevo** - Componente modal reutilizable |
| `apps/web/src/pages/inventory/InventoryPage.jsx` | **Reescrito** - CRUD completo con filtros, tabla y formulario modal |
| `apps/web/src/pages/orders/OrdersPage.jsx` | **Reescrito** - Listado, creación, edición, cancelación y detalle expandible |
| `apps/web/src/pages/reports/ReportsPage.jsx` | **Reescrito** - Dashboard estadístico con tarjetas y tablas |
| `apps/web/src/index.css` | + Estilos para todas las páginas, tablas, modales, formularios, badges |
| `SPECS.md` | Actualizado estado actual e historial |

### Commits anteriores:
- `33c9861` Merge PR #20 - Add login
- `3c01033` Backend_V1
- `86896bf` Update Structure
- `337c158` Basic Structure

---

## 15. Decisiones de Diseño Importantes

1. **Router custom sin Express:** El backend usa un router propio basado en Node.js http nativo. Esto reduce dependencias pero requiere mantenimiento manual.

2. **Dual data layer:** Permite desarrollar sin PostgreSQL, facilitando onboarding de nuevos devs. En producción, siempre usar modo postgres.

3. **Plaintext passwords en memory mode:** Solo para desarrollo. En postgres, las contraseñas usan bcrypt.

4. **Trigger de inventario en DB:** La gestión de stock se delega a PostgreSQL, garantizando consistencia incluso con accesos concurrentes.

5. **Sin CSS framework:** El frontend no usa librerías de UI, permitiendo diseño completamente custom pero requiere más trabajo manual.

6. **GET /api/books público:** Los endpoints GET de libros no requieren autenticación para permitir que la landing page pública (MainPage) muestre el catálogo sin login. Las operaciones de escritura (POST/PUT/DELETE) siguen protegidas con JWT.

7. **Doble validación (Zod + manual):** Los esquemas Zod validan el formato de entrada en el middleware, y las funciones manuales existentes (`validateCreateBook`, etc.) actúan como segunda capa de defensa y transformación de datos en los controladores.
