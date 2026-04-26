import { PassThrough, Readable, Writable } from "node:stream";

const createSocketStub = () => {
  const socket = new PassThrough();
  socket.remoteAddress = "127.0.0.1";
  return socket;
};

export const dispatchHttpRequest = async (
  app,
  { body, headers = {}, method = "GET", path = "/" } = {}
) => {
  const payload =
    body === undefined
      ? null
      : Buffer.isBuffer(body)
        ? body
        : Buffer.from(
            typeof body === "string" ? body : JSON.stringify(body),
            "utf8"
          );

  const requestHeaders = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
  );

  if (payload && !requestHeaders["content-length"]) {
    requestHeaders["content-length"] = String(payload.length);
  }

  if (payload && !requestHeaders["content-type"]) {
    requestHeaders["content-type"] = "application/json";
  }

  return await new Promise((resolve, reject) => {
    const req = new Readable({
      read() {
        if (payload) {
          this.push(payload);
        }
        this.push(null);
      },
    });

    Object.assign(req, {
      headers: requestHeaders,
      method,
      socket: createSocketStub(),
      url: path,
    });
    Object.setPrototypeOf(req, app.request);

    const responseChunks = [];
    const responseHeaders = {};

    const res = new Writable({
      write(chunk, _encoding, callback) {
        responseChunks.push(Buffer.from(chunk));
        callback();
      },
    });

    Object.assign(res, {
      app,
      headersSent: false,
      locals: {},
      req,
      statusCode: 200,
      end(chunk) {
        if (chunk) {
          responseChunks.push(Buffer.from(chunk));
        }

        this.headersSent = true;
        const text = Buffer.concat(responseChunks).toString("utf8");
        const contentType = String(this.getHeader("content-type") || "");
        const parsedBody = contentType.includes("application/json") && text
          ? JSON.parse(text)
          : text;

        resolve({
          body: parsedBody,
          headers: { ...responseHeaders },
          status: this.statusCode,
          text,
        });

        return this;
      },
      getHeader(name) {
        return responseHeaders[name.toLowerCase()];
      },
      removeHeader(name) {
        delete responseHeaders[name.toLowerCase()];
      },
      setHeader(name, value) {
        responseHeaders[name.toLowerCase()] = value;
      },
      writeHead(statusCode, headersObject) {
        this.statusCode = statusCode;
        if (headersObject) {
          for (const [key, value] of Object.entries(headersObject)) {
            this.setHeader(key, value);
          }
        }
        return this;
      },
    });

    req.res = res;
    Object.setPrototypeOf(res, app.response);

    req.on("error", reject);
    res.on("error", reject);

    app.handle(req, res, reject);
  });
};
