const mongoose = require('mongoose');
const dotenv = require('dotenv');

//uncaught Exception
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({
  path: './config.env',
}); //first config and then import app as order is important

const app = require('./app');
// console.log(process.env);

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

//local database :mongoose.connect(process.env.DATABASE_LOCAL,{}).thne();
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true, //LLL
  })
  .then(() => console.log('DB connection successful!'));

//mongoose.connect we pass connection string and we pass object we certain values it returns promise so we handle it using then and promise gets access to connection object(bassically this connection will be the result value of promise)

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`app listening on port ${port}....`);
});

//unhandled rejection
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! shutting down...');
  server.close(() => {
    process.exit(1);
  });
});

// console.log(x); //will generate uncaught exception
