const { z } = require('zod');
const { HttpError } = require("../../lib/http");

const createBookSchema = z.object({
  isbn: z.string().min(1, 'ISBN es requerido'),
  title: z.string().min(1, 'Título es requerido'),
  authorId: z.union([z.string(), z.number()]).transform(String),
  categoryId: z.union([z.string(), z.number()]).transform(String),
  code: z.string().optional().default(''),
  description: z.string().optional().default(''),
  editorial: z.string().optional().default(''),
  anioPublicacion: z.number().optional().nullable().default(null),
  price: z.number().optional().default(0),
  stock: z.number().optional().default(0),
});

const updateBookSchema = z.object({
  isbn: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  authorId: z.union([z.string(), z.number()]).transform(String).optional(),
  categoryId: z.union([z.string(), z.number()]).transform(String).optional(),
  code: z.string().optional(),
  description: z.string().optional(),
  editorial: z.string().optional(),
  anioPublicacion: z.number().optional().nullable(),
  price: z.number().optional(),
  stock: z.number().optional(),
});

function normalizeBookFilters(query) {
  return {
    q: query.q ? String(query.q).trim().toLowerCase() : "",
    author: query.author ? String(query.author).trim().toLowerCase() : "",
    category: query.category ? String(query.category).trim().toLowerCase() : "",
    availability: query.availability
      ? String(query.availability).trim().toLowerCase()
      : "",
  };
}

function validateCreateBook(data) {
  if (!data || typeof data !== "object") {
    throw new HttpError(400, "Debe enviar un libro valido");
  }

  if (!data.isbn || typeof data.isbn !== "string" || !data.isbn.trim()) {
    throw new HttpError(400, "El campo isbn es obligatorio");
  }

  if (!data.title || typeof data.title !== "string" || !data.title.trim()) {
    throw new HttpError(400, "El campo title es obligatorio");
  }

  if (!data.authorId) {
    throw new HttpError(400, "El campo authorId es obligatorio");
  }

  if (!data.categoryId) {
    throw new HttpError(400, "El campo categoryId es obligatorio");
  }

  return {
    isbn: String(data.isbn).trim(),
    title: String(data.title).trim(),
    description: data.description ? String(data.description).trim() : "",
    authorId: String(data.authorId),
    categoryId: String(data.categoryId),
    editorial: data.editorial ? String(data.editorial).trim() : "",
    anioPublicacion: data.anioPublicacion ? Number(data.anioPublicacion) : null,
    price: data.price !== undefined ? Number(data.price) : 0,
    stock: data.stock !== undefined ? Number(data.stock) : 0,
    code: data.code ? String(data.code).trim() : "",
  };
}

function validateUpdateBook(data) {
  if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
    throw new HttpError(400, "Debe enviar al menos un campo para actualizar");
  }

  const result = {};

  if (data.isbn !== undefined) {
    if (!String(data.isbn).trim()) throw new HttpError(400, "El isbn no puede estar vacio");
    result.isbn = String(data.isbn).trim();
  }

  if (data.title !== undefined) {
    if (!String(data.title).trim()) throw new HttpError(400, "El title no puede estar vacio");
    result.title = String(data.title).trim();
  }

  if (data.description !== undefined) result.description = String(data.description).trim();
  if (data.authorId !== undefined) result.authorId = String(data.authorId);
  if (data.categoryId !== undefined) result.categoryId = String(data.categoryId);
  if (data.editorial !== undefined) result.editorial = String(data.editorial).trim();
  if (data.anioPublicacion !== undefined) result.anioPublicacion = Number(data.anioPublicacion);
  if (data.price !== undefined) result.price = Number(data.price);
  if (data.stock !== undefined) result.stock = Number(data.stock);
  if (data.code !== undefined) result.code = String(data.code).trim();

  return result;
}

module.exports = {
  createBookSchema,
  updateBookSchema,
  normalizeBookFilters,
  validateCreateBook,
  validateUpdateBook,
};
