export const CATEGORIES_LIST_SELECTORS = {
  addCategoryButton: '[data-test-id="create-category"]',
};

export const categoryRow = categoryId => `[data-test-id*="${categoryId}"]`;
