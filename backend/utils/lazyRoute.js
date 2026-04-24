export const lazyRoute = (loadRouter) => {
  let loadedRouter = null;
  let pendingRouter = null;

  return async (req, res, next) => {
    try {
      if (loadedRouter) {
        return loadedRouter(req, res, next);
      }

      if (!pendingRouter) {
        pendingRouter = loadRouter()
          .then((module) => module.default)
          .catch((error) => {
            pendingRouter = null;
            throw error;
          });
      }

      loadedRouter = await pendingRouter;
      return loadedRouter(req, res, next);
    } catch (error) {
      return next(error);
    }
  };
};
