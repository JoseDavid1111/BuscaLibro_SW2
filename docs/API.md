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

- `GET /health`
- `POST /api/auth/login`
- `GET /api/books`
- `GET /api/books/lookup?value=BL-001`
- `GET /api/books/:id`
- `GET /api/orders`
- `POST /api/orders`
- `PUT /api/orders/:id`
- `DELETE /api/orders/:id`
- `GET /api/orders/:id`
- `GET /api/users/:userId/orders`
- `GET /api/reports/statistics`
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
