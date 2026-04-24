import express from "express";

const router = express.Router();

let readRouter = null;
let readRouterPending = null;
let writeRouter = null;
let writeRouterPending = null;

const loadReadRouter = async () => {
  if (readRouter) {
    return readRouter;
  }

  if (!readRouterPending) {
    readRouterPending = import("./projectReadRoutes.js")
      .then((module) => module.default)
      .then((loadedRouter) => {
        readRouter = loadedRouter;
        return loadedRouter;
      })
      .catch((error) => {
        readRouterPending = null;
        throw error;
      });
  }

  return readRouterPending;
};

const loadWriteRouter = async () => {
  if (writeRouter) {
    return writeRouter;
  }

  if (!writeRouterPending) {
    writeRouterPending = import("./projectWriteRoutes.js")
      .then((module) => module.default)
      .then((loadedRouter) => {
        writeRouter = loadedRouter;
        return loadedRouter;
      })
      .catch((error) => {
        writeRouterPending = null;
        throw error;
      });
  }

  return writeRouterPending;
};

router.use(async (req, res, next) => {
  try {
    if (req.method === "GET" || req.method === "HEAD") {
      const loadedRouter = await loadReadRouter();
      return loadedRouter(req, res, next);
    }

    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      const loadedRouter = await loadWriteRouter();
      return loadedRouter(req, res, next);
    }

    return next();
  } catch (error) {
    return next(error);
  }
});

export default router;
