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

  const add = (method, path, action) => {
    const { regex, keys } = compilePath(path);
    routes.push({ method, path, regex, keys, action });
  };

  const handler = async (req, res) => {
    try {
      if (req.method === "OPTIONS") {
        sendJson(res, 204);
        return;
      }

      const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
      const route = matchRoute(routes, req.method, url.pathname);

      if (!route) {
        sendJson(res, 404, { message: "Ruta no encontrada" });
        return;
      }

      const body = await parseBody(req);
      const ctx = {
        req,
        res,
        body,
        query: Object.fromEntries(url.searchParams.entries()),
        params: route.params,
      };

      const result = await route.action(ctx);
      sendJson(res, result.status || 200, result.body);
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
    get: (path, action) => add("GET", path, action),
    post: (path, action) => add("POST", path, action),
    put: (path, action) => add("PUT", path, action),
    delete: (path, action) => add("DELETE", path, action),
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
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  });
  if (status === 204) {
    res.end();
    return;
  }
  res.end(JSON.stringify(body, null, 2));
}

module.exports = {
  HttpError,
  createRouter,
};
