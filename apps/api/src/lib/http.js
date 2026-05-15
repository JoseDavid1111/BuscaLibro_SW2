const { URL } = require("node:url");

class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function createRouter() {
  const routes = [];

  const add = (method, path, ...handlers) => {
    const { regex, keys } = compilePath(path);
    const middlewares = handlers.slice(0, -1);
    const action = handlers[handlers.length - 1];
    routes.push({ method, path, regex, keys, middlewares, action });
  };

  const handler = async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
      const route = matchRoute(routes, req.method, url.pathname);

      if (!route) {
        sendJson(res, 404, { message: "Ruta no encontrada" });
        return;
      }

      const body = await parseBody(req);
      res.json = (data) => sendJson(res, 200, data);
      res.status = (code) => ({ json: (data) => sendJson(res, code, data) });
      req.query = Object.fromEntries(url.searchParams.entries());
      req.params = route.params;
      req.body = body;

      for (const middleware of route.middlewares) {
        await new Promise((resolve, reject) => {
          let called = false;
          const next = (err) => {
            if (called) return;
            called = true;
            if (err) return reject(err);
            resolve();
          };
          middleware(req, res, next);
          if (!called && res.writableEnded) {
            resolve();
          }
        });
        if (res.writableEnded) return;
      }

      const result = await route.action(req, res);
      if (!res.writableEnded) {
        sendJson(res, result.status || 200, result.body);
      }
    } catch (error) {
      if (error instanceof HttpError) {
        sendJson(res, error.status, {
          message: error.message,
          details: error.details || null,
        });
        return;
      }

      sendJson(res, 500, {
        message: "Error interno del servidor",
        details: error.message,
      });
    }
  };

  return {
    get: (path, ...handlers) => add("GET", path, ...handlers),
    post: (path, ...handlers) => add("POST", path, ...handlers),
    put: (path, ...handlers) => add("PUT", path, ...handlers),
    delete: (path, ...handlers) => add("DELETE", path, ...handlers),
    handler,
  };
}

function compilePath(path) {
  const keys = [];
  const regexPath = path.replace(/:([A-Za-z0-9_]+)/g, (_, key) => {
    keys.push(key);
    return "([^/]+)";
  });

  return {
    regex: new RegExp(`^${regexPath}$`),
    keys,
  };
}

function matchRoute(routes, method, pathname) {
  for (const route of routes) {
    if (route.method !== method) {
      continue;
    }

    const match = pathname.match(route.regex);
    if (!match) {
      continue;
    }

    const params = {};
    route.keys.forEach((key, index) => {
      params[key] = decodeURIComponent(match[index + 1]);
    });

    return {
      ...route,
      params,
    };
  }

  return null;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    if (req.method === "GET" || req.method === "DELETE") {
      resolve(undefined);
      return;
    }

    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      if (!data) {
        resolve(undefined);
        return;
      }

      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(new HttpError(400, "El cuerpo de la solicitud no es JSON valido"));
      }
    });
    req.on("error", () => {
      reject(new HttpError(400, "No fue posible leer la solicitud"));
    });
  });
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(body, null, 2));
}

module.exports = {
  HttpError,
  createRouter,
};
