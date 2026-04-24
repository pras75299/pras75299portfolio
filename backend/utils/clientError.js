export const getClientErrorResponse = (error) => {
  if (!error) {
    return null;
  }

  if (error.name === "CastError") {
    return {
      message: "The provided identifier is invalid.",
      status: 400,
    };
  }

  if (error.name === "ValidationError") {
    return {
      message: "The submitted data is invalid.",
      status: 400,
    };
  }

  return null;
};
