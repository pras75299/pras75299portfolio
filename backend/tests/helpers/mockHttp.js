export const createMockRequest = ({
  body = {},
  file = null,
  headers = {},
  params = {},
} = {}) => ({
  body,
  file,
  headers,
  params,
});

export const createMockResponse = () => {
  const response = {
    body: null,
    headers: {},
    statusCode: 200,
    json(payload) {
      this.body = payload;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
  };

  return response;
};
