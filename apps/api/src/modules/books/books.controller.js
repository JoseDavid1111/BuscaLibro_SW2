const { HttpError } = require("../../lib/http");
const { normalizeBookFilters } = require("./books.schema");
const { listAllBooks, findBookById, lookupBook } = require("./books.service");

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

module.exports = {
  listBooks,
  getBookById,
  getBookLookup,
};
