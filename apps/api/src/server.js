const http = require("node:http");
const { createApp } = require("./app");

const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || "0.0.0.0";

const server = http.createServer(createApp());

server.listen(PORT, HOST, () => {
  process.stdout.write(
    `BuscaLibro API escuchando en http://${HOST}:${PORT}\n`
  );
});
