const assert = require("node:assert/strict");
const http = require("node:http");

const { createApp } = require("../src/app");

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        host: "127.0.0.1",
        port: 3200,
        path,
        method,
        headers: payload
          ? {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(payload),
            }
          : {},
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            body: JSON.parse(data),
          });
        });
      }
    );

    req.on("error", reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function main() {
  const server = http.createServer(createApp());
  await new Promise((resolve) => server.listen(3200, "127.0.0.1", resolve));

  try {
    const health = await request("GET", "/health");
    assert.equal(health.status, 200);
    assert.equal(health.body.ok, true);

    const order = await request("POST", "/api/orders", {
      userId: "2",
      items: [{ bookId: "3", quantity: 1 }],
    });
    assert.equal(order.status, 201);
    assert.equal(order.body.total, 48000);

    process.stdout.write("Smoke tests passed\n");
  } finally {
    server.close();
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack}\n`);
  process.exitCode = 1;
});
