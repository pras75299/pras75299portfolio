export const logServerError = (context, error) => {
  console.error(`${context}:`, error);
};

export const sendServerError = (
  res,
  message = "An internal server error occurred."
) => {
  return res.status(500).json({ message });
};
