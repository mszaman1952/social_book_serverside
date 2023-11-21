const clientError = async (res, statusCode, message) => {
  res.status(statusCode).send({
      success: false,
      message: message
  });
};
const serverError = async (res, statusCode, message) => {
  res.status(statusCode).send({
      success: false,
      message: message
  });
};

module.exports = {
  clientError,
  serverError
}