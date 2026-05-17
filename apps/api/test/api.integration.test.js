const assert = require("node:assert/strict");
const http = require("node:http");
const { createApp } = require("../src/app");

function request(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = { ...headers };
    if (payload) {
      reqHeaders["Content-Type"] = "application/json";
      reqHeaders["Content-Length"] = Buffer.byteLength(payload);
    }
    const req = http.request(
      {
        host: "127.0.0.1",
        port: 3201,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            body: JSON.parse(data || "{}"),
          });
        });
      }
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

let token;

async function run() {
  process.stdout.write("--- Integration tests ---\n");

  const server = http.createServer(createApp());
  await new Promise((resolve) => server.listen(3201, "127.0.0.1", resolve));

  try {
    await testHealth();
    await testLoginSuccess();
    await testLoginFailure();
    await testAuthRequired();
    await testBooksList();
    await testBookLookup();
    await testBookCreate();
    await testBookUpdate();
    await testBookDelete();
    await testAuthorsList();
    await testAuthorCreate();
    await testCategoriesList();
    await testCategoryCreate();
    await testOrdersList();
    await testOrderCreate();
    await testOrderCancel();
    await testReports();
    await testUsers();
    await testExchange();

    process.stdout.write("All integration tests passed\n");
  } finally {
    server.close();
  }
}

async function testHealth() {
  const res = await request("GET", "/health");
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
}

async function testLoginSuccess() {
  const res = await request("POST", "/api/auth/login", {
    email: "jose@buscalibro.local",
    password: "123456",
  });
  assert.equal(res.status, 200);
  assert.ok(res.body.token);
  assert.equal(res.body.user.role, "Administrador");
  token = res.body.token;
}

async function testLoginFailure() {
  const res = await request("POST", "/api/auth/login", {
    email: "jose@buscalibro.local",
    password: "wrongpass",
  });
  assert.equal(res.status, 401);
}

async function testAuthRequired() {
  const res = await request("GET", "/api/orders");
  assert.equal(res.status, 401);
}

async function testBooksList() {
  const res = await request("GET", "/api/books", null, {
    Authorization: `Bearer ${token}`,
  });
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.items));
  assert.equal(res.body.items.length, 5);
}

async function testBookLookup() {
  const res = await request("GET", "/api/books/lookup?value=9780061120084", null, {
    Authorization: `Bearer ${token}`,
  });
  assert.equal(res.status, 200);
  assert.equal(res.body.title, "Matar a un ruisenor");
}

async function testBookCreate() {
  const res = await request(
    "POST",
    "/api/books",
    {
      isbn: "9990000000002",
      title: "Integration Test Book",
      authorId: "2",
      categoryId: "3",
      price: 25000,
      stock: 8,
    },
    { Authorization: `Bearer ${token}` }
  );
  assert.equal(res.status, 201);
  assert.equal(res.body.title, "Integration Test Book");
}

async function testBookUpdate() {
  const res = await request(
    "PUT",
    "/api/books/1",
    { price: 99999 },
    { Authorization: `Bearer ${token}` }
  );
  assert.equal(res.status, 200);
  assert.equal(res.body.price, 99999);
}

async function testBookDelete() {
  const res = await request("DELETE", "/api/books/6", null, {
    Authorization: `Bearer ${token}`,
  });
  assert.equal(res.status, 200);
}

async function testAuthorsList() {
  const res = await request("GET", "/api/authors", null, {
    Authorization: `Bearer ${token}`,
  });
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.items));
  assert.equal(res.body.items.length, 5);
}

async function testAuthorCreate() {
  const res = await request(
    "POST",
    "/api/authors",
    { name: "Integration Author", nationality: "Test" },
    { Authorization: `Bearer ${token}` }
  );
  assert.equal(res.status, 201);
  assert.equal(res.body.name, "Integration Author");
}

async function testCategoriesList() {
  const res = await request("GET", "/api/categories", null, {
    Authorization: `Bearer ${token}`,
  });
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.items));
  assert.equal(res.body.items.length, 5);
}

async function testCategoryCreate() {
  const res = await request(
    "POST",
    "/api/categories",
    { name: "Integration Cat" },
    { Authorization: `Bearer ${token}` }
  );
  assert.equal(res.status, 201);
  assert.equal(res.body.name, "Integration Cat");
}

async function testOrdersList() {
  const res = await request("GET", "/api/orders", null, {
    Authorization: `Bearer ${token}`,
  });
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.items));
  assert.ok(res.body.items.length >= 1);
}

async function testOrderCreate() {
  const res = await request(
    "POST",
    "/api/orders",
    { userId: "2", items: [{ bookId: "4", quantity: 1 }] },
    { Authorization: `Bearer ${token}` }
  );
  assert.equal(res.status, 201);
  assert.equal(res.body.total, 87000);
}

async function testOrderCancel() {
  const res = await request("DELETE", "/api/orders/1", null, {
    Authorization: `Bearer ${token}`,
  });
  assert.equal(res.status, 200);
  assert.equal(res.body.status, "Cancelado");
}

async function testReports() {
  const res = await request("GET", "/api/reports/statistics", null, {
    Authorization: `Bearer ${token}`,
  });
  assert.equal(res.status, 200);
  assert.ok(res.body.summary);
  assert.ok(res.body.mostRequestedBooks);
  assert.ok(res.body.ordersByCategory);
  assert.ok(res.body.mostExpensiveBooks);
}

async function testUsers() {
  const res = await request("GET", "/api/users", null, {
    Authorization: `Bearer ${token}`,
  });
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.length >= 2);
}

async function testExchange() {
  const exportRes = await request("GET", "/api/exchange/orders/export", null, {
    Authorization: `Bearer ${token}`,
  });
  assert.equal(exportRes.status, 200);
  assert.ok(exportRes.body.orders);

  if (exportRes.body.orders.length > 0) {
    const importRes = await request(
      "POST",
      "/api/exchange/orders/import",
      { orders: [{ userId: "3", items: [{ bookId: "5", quantity: 1 }] }] },
      { Authorization: `Bearer ${token}` }
    );
    assert.equal(importRes.status, 201);
    assert.equal(importRes.body.imported, 1);
  }
}

run().catch((error) => {
  process.stderr.write(`FAIL: ${error.stack}\n`);
  process.exitCode = 1;
});
