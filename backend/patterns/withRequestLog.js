function withRequestLog(handler) {
  return async (req, res, context) => {
    const startedAt = Date.now();
    try {
      await handler(req, res, context);
    } finally {
      const elapsed = Date.now() - startedAt;
      console.log(`${req.method} ${req.url} ${res.statusCode} ${elapsed}ms`);
    }
  };
}

module.exports = {withRequestLog};
