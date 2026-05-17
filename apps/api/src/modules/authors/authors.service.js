const {
  listAuthors: listAuthorsFromStore,
  findAuthorById: findAuthorByIdFromStore,
  createAuthor: createAuthorInStore,
  updateAuthor: updateAuthorInStore,
  deleteAuthor: deleteAuthorFromStore,
} = require("../../data/store");

async function listAllAuthors() {
  return listAuthorsFromStore();
}

async function findAuthor(id) {
  return findAuthorByIdFromStore(id);
}

async function createNewAuthor(data) {
  return createAuthorInStore(data);
}

async function editAuthor(id, data) {
  return updateAuthorInStore(id, data);
}

async function removeAuthor(id) {
  return deleteAuthorFromStore(id);
}

module.exports = {
  listAllAuthors,
  findAuthor,
  createNewAuthor,
  editAuthor,
  removeAuthor,
};
