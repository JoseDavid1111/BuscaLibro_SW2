const fs = require("node:fs");
const path = require("node:path");

loadDotEnv();

const config = {
  appName: process.env.APP_NAME || "BuscaLibro API",
  nodeEnv: process.env.NODE_ENV || "development",
  dataSource: process.env.DATA_SOURCE || "memory",
  databaseUrl: process.env.DATABASE_URL || "",
  databaseSsl: String(process.env.DATABASE_SSL || "true").toLowerCase() === "true",
};

function loadDotEnv() {
  const envPath = path.resolve(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

module.exports = {
  config,
};
