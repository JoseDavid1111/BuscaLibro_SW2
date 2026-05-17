const { validateCreateAuthor, validateUpdateAuthor } = require("./authors.schema");
const {
  listAllAuthors,
  findAuthor,
  createNewAuthor,
  editAuthor,
  removeAuthor,
} = require("./authors.service");

async function listAuthors() {
  return {
    status: 200,
    body: {
      items: await listAllAuthors(),
    },
  };
}

async function getAuthorById({ params }) {
  return {
    status: 200,
    body: await findAuthor(params.id),
  };
}

async function createAuthor({ body }) {
  return {
    status: 201,
    body: await createNewAuthor(validateCreateAuthor(body)),
  };
}

async function updateAuthor({ params, body }) {
  return {
    status: 200,
    body: await editAuthor(params.id, validateUpdateAuthor(body)),
  };
}

async function deleteAuthor({ params }) {
  return {
    status: 200,
    body: await removeAuthor(params.id),
  };
}

module.exports = {
  listAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
};
