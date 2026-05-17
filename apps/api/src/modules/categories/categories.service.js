const {
  listCategories: listCategoriesFromStore,
  findCategoryById: findCategoryByIdFromStore,
  createCategory: createCategoryInStore,
  updateCategory: updateCategoryInStore,
  deleteCategory: deleteCategoryFromStore,
} = require("../../data/store");

async function listAllCategories() {
  return listCategoriesFromStore();
}

async function findCategory(id) {
  return findCategoryByIdFromStore(id);
}

async function createNewCategory(data) {
  return createCategoryInStore(data);
}

async function editCategory(id, data) {
  return updateCategoryInStore(id, data);
}

async function removeCategory(id) {
  return deleteCategoryFromStore(id);
}

module.exports = {
  listAllCategories,
  findCategory,
  createNewCategory,
  editCategory,
  removeCategory,
};
