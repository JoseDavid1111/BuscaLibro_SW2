const {
  listBooks: listBooksFromStore,
  findBookById: findBookByIdFromStore,
  lookupBook: lookupBookFromStore,
} = require("../../data/store");

async function listAllBooks(filters) {
  return listBooksFromStore(filters);
}

async function findBookById(id) {
  return findBookByIdFromStore(id);
}

async function lookupBook(query) {
  return lookupBookFromStore(query);
}

module.exports = {
  listAllBooks,
  findBookById,
  lookupBook,
};
