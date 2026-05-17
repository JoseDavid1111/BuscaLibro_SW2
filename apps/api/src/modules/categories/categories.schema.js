const { z } = require('zod');
const { HttpError } = require("../../lib/http");

const createCategorySchema = z.object({
  name: z.string().min(1, 'El nombre de la categoría es obligatorio'),
});

const updateCategorySchema = z.object({
  name: z.string().min(1, 'El nombre no puede estar vacío'),
});

function validateCreateCategory(data) {
  if (!data || typeof data !== "object") {
    throw new HttpError(400, "Debe enviar una categoria valida");
  }

  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    throw new HttpError(400, "El nombre de la categoria es obligatorio");
  }

  return {
    name: data.name.trim(),
  };
}

function validateUpdateCategory(data) {
  if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
    throw new HttpError(400, "Debe enviar al menos un campo para actualizar");
  }

  if (data.name === undefined) {
    throw new HttpError(400, "Debe enviar el campo name para actualizar");
  }

  if (!String(data.name).trim()) {
    throw new HttpError(400, "El nombre no puede estar vacio");
  }

  return {
    name: String(data.name).trim(),
  };
}

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  validateCreateCategory,
  validateUpdateCategory,
};
