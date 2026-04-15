const { getStatistics } = require("../../data/store");

async function buildStatistics() {
  return getStatistics();
}

module.exports = {
  buildStatistics,
};
