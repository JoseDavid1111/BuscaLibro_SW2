const { z } = require('zod');
const { HttpError } = require("../../lib/http");

const createAuthorSchema = z.object({
  name: z.string().min(1, 'El nombre del autor es obligatorio'),
  nationality: z.string().optional().default(''),
  description: z.string().optional().default(''),
});

const updateAuthorSchema = z.object({
  name: z.string().min(1, 'El nombre no puede estar vacío').optional(),
  nationality: z.string().optional(),
  description: z.string().optional(),
});

function validateCreateAuthor(data) {
  if (!data || typeof data !== "object") {
    throw new HttpError(400, "Debe enviar un autor valido");
  }

  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    throw new HttpError(400, "El nombre del autor es obligatorio");
  }

  return {
    name: data.name.trim(),
    nationality: data.nationality ? String(data.nationality).trim() : "",
    description: data.description ? String(data.description).trim() : "",
  };
}

function validateUpdateAuthor(data) {
  if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
    throw new HttpError(400, "Debe enviar al menos un campo para actualizar");
  }

  const result = {};

  if (data.name !== undefined) {
    if (!String(data.name).trim()) {
      throw new HttpError(400, "El nombre no puede estar vacio");
    }
    result.name = String(data.name).trim();
  }

  if (data.nationality !== undefined) {
    result.nationality = String(data.nationality).trim();
  }

  if (data.description !== undefined) {
    result.description = String(data.description).trim();
  }

  return result;
}

module.exports = {
  createAuthorSchema,
  updateAuthorSchema,
  validateCreateAuthor,
  validateUpdateAuthor,
};
