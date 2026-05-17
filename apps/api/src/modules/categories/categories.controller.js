const { validateCreateCategory, validateUpdateCategory } = require("./categories.schema");
const {
  listAllCategories,
  findCategory,
  createNewCategory,
  editCategory,
  removeCategory,
} = require("./categories.service");

async function listCategories() {
  return {
    status: 200,
    body: {
      items: await listAllCategories(),
    },
  };
}

async function getCategoryById({ params }) {
  return {
    status: 200,
    body: await findCategory(params.id),
  };
}

async function createCategory({ body }) {
  return {
    status: 201,
    body: await createNewCategory(validateCreateCategory(body)),
  };
}

async function updateCategory({ params, body }) {
  return {
    status: 200,
    body: await editCategory(params.id, validateUpdateCategory(body)),
  };
}

async function deleteCategory({ params }) {
  return {
    status: 200,
    body: await removeCategory(params.id),
  };
}

module.exports = {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
