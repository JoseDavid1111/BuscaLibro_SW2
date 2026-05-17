const { HttpError } = require("../../lib/http");
const { normalizeBookFilters, validateCreateBook, validateUpdateBook } = require("./books.schema");
const {
  listAllBooks,
  findBookById,
  lookupBook,
  createNewBook,
  editBook,
  removeBook,
} = require("./books.service");

async function listBooks({ query }) {
  return {
    status: 200,
    body: {
      items: await listAllBooks(normalizeBookFilters(query)),
    },
  };
}

async function getBookById({ params }) {
  return {
    status: 200,
    body: await findBookById(params.id),
  };
}

async function getBookLookup({ query }) {
  if (!query.value) {
    throw new HttpError(400, "Debe enviar el parametro value");
  }

  return {
    status: 200,
    body: await lookupBook(query.value),
  };
}

async function createBook({ body }) {
  return {
    status: 201,
    body: await createNewBook(validateCreateBook(body)),
  };
}

async function updateBook({ params, body }) {
  return {
    status: 200,
    body: await editBook(params.id, validateUpdateBook(body)),
  };
}

async function deleteBook({ params }) {
  return {
    status: 200,
    body: await removeBook(params.id),
  };
}

module.exports = {
  listBooks,
  getBookById,
  getBookLookup,
  createBook,
  updateBook,
  deleteBook,
};
