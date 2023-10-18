// const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// const {
//   dirname
// } = require('path');

const app = express();

//////////////////1) MIDDLEWARES /////////////////////////

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //third party middleware
}

app.use(express.json()); //middleware
app.use(express.static(`${__dirname}/public`));

// app.use((req, res, next) => {
//   console.log('Hello from the middleware ');
//   next();
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

////////////////// 3) ROUTES //////////////////////////////
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//if we have a request makes it into this point of our code then that means that neither the tourRouter nor UserRouter were able to catch it. so if use any middleware here then it will only be reach if not handled by any other routers

//for handling unhandled req for any http method you need to pass app.HTTP method but here we want to handle for all unhandled req for all types of http so express has all() so run for all http methods

//thne we have to pass url so here we are using '*' for everything

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));

  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this server!`); ///we use Error constructor to create a new error. we pass a string then that string will be then the error message property
  // err.status = 'fail';
  // err.statusCode = 404;

  // //now we havre to reach that next step,that next middleware for that we use next in a special way.we need to pass err to next
  // next(err); //if next function recieves an argument no matter what express will auomatically know that there was an error.it will assume that whatever we pass into next is an error and then it will skip all other middlwares in stack and send the error that we passsed in to the global error handling middlware.
});

app.use(globalErrorHandler);
module.exports = app;
