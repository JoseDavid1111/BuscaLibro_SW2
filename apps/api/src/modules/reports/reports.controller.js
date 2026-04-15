const { buildStatistics } = require("./reports.service");

async function getStatistics() {
  return {
    status: 200,
    body: await buildStatistics(),
  };
}

module.exports = {
  getStatistics,
};
