function normalizeBookFilters(query) {
  return {
    q: query.q ? String(query.q).trim().toLowerCase() : "",
    author: query.author ? String(query.author).trim().toLowerCase() : "",
    category: query.category ? String(query.category).trim().toLowerCase() : "",
    availability: query.availability
      ? String(query.availability).trim().toLowerCase()
      : "",
  };
}

module.exports = {
  normalizeBookFilters,
};
