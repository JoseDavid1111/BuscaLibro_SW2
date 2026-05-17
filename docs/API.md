# API BuscaLibro

## Base URL

`http://localhost:3001`

## Configurar Supabase

1. Crea el archivo `apps/api/.env`.
2. Copia el contenido de `apps/api/.env.example`.
3. Si quieres usar Supabase, cambia estas variables:

```env
DATA_SOURCE=postgres
DATABASE_URL=postgresql://postgres:[TU_PASSWORD]@db.[TU_PROJECT_REF].supabase.co:5432/postgres
DATABASE_SSL=true
```

4. Ejecuta [database/schema.sql](/C:/Users/José%20David/Documents/GitHub/BuscaLibro_SW2/database/schema.sql:1) en el SQL Editor de Supabase.

## Endpoints principales

### Salud
- `GET /health`

### Auth
- `POST /api/auth/login`
- `GET /api/auth/me`

### Libros (CRUD completo)
- `GET /api/books` — Listar (filtros: q, author, category, availability)
- `GET /api/books/lookup?value=BL-001` — Búsqueda exacta por código, ISBN o título
- `GET /api/books/:id`
- `POST /api/books` — Crear
- `PUT /api/books/:id` — Actualizar
- `DELETE /api/books/:id` — Eliminación lógica (soft delete)

### Autores (CRUD completo)
- `GET /api/authors`
- `GET /api/authors/:id`
- `POST /api/authors`
- `PUT /api/authors/:id`
- `DELETE /api/authors/:id`

### Categorías (CRUD completo)
- `GET /api/categories`
- `GET /api/categories/:id`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

### Pedidos
- `GET /api/orders`
- `POST /api/orders`
- `GET /api/orders/:id`
- `PUT /api/orders/:id`
- `DELETE /api/orders/:id` — Cancelar pedido
- `GET /api/users/:userId/orders`

### Reportes
- `GET /api/reports/statistics`

### Exchange (Import/Export JSON)
- `GET /api/exchange/orders/export`
- `POST /api/exchange/orders/import`

## Ejemplo de login

```json
{
  "email": "jose@buscalibro.local",
  "password": "123456"
}
```

## Ejemplo de pedido

```json
{
  "userId": "2",
  "items": [
    { "bookId": "1", "quantity": 1 },
    { "bookId": "3", "quantity": 2 }
  ]
}
```
