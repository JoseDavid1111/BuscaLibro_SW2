const {
  listBooks: listBooksFromStore,
  findBookById: findBookByIdFromStore,
  lookupBook: lookupBookFromStore,
  createBookInStore,
  updateBookInStore,
  deleteBookFromStore,
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

async function createNewBook(data) {
  return createBookInStore(data);
}

async function editBook(id, data) {
  return updateBookInStore(id, data);
}

async function removeBook(id) {
  return deleteBookFromStore(id);
}

module.exports = {
  listAllBooks,
  findBookById,
  lookupBook,
  createNewBook,
  editBook,
  removeBook,
};
