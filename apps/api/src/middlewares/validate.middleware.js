function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = (result.error.issues || result.error.errors || []).map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(400).json({ error: 'Datos inválidos', errors });
    }
    req.body = result.data;
    next();
  };
}

module.exports = { validateBody };
