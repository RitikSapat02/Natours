class AppError extends Error {
  constructor(message, statusCode) {
    super(message); //as usual when we extend a parent class we call super in order to call parent constructot and here we do that with message because message is only parameter that the builtin Error accepts. so its like calling Error()

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    //we can send status as arg to object but e know if statuscode is 400 or 404 then fail and only if 500 (internsal server error) then error

    //now all error we create using this class will be operational errors
    this.isOperational = true;

    //so all errors made by this class will get this prop  set to true and we are doing that so that later we can then test for this property and only send error messages back to the client for this operational errors that we created using this class and these is useful because some other crazy unexpected errors that might happen in your application for example prog. error,some bug in our require package and this errors will not have this property on them.

    Error.captureStackTrace(this, this.constructor); //we need to specify current object and then the class (AppError)itself .
    // so in this way when a new object is created and constructor function is called then that function call will not appear in stacktrace.
  }
}

module.exports = AppError;
