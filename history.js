///////////////////////////////////01//////////////////////////////////
////////////creating and mounting multiple routers//////////////////

/*
const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express();

//////////////////1) MIDDLEWARES ///////////////////////
app.use(morgan('dev')); //third party middleware
app.use(express.json()); //middleware

app.use((req, res, next) => {
  console.log('Hello from the middleware ');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

////////////////2) ROUTE HANDLERS ////////////////////

const getAllTours = (req, res) => {
  console.log(req.requestTime);

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours: tours, //"tours : tours" is same as "tours"
    },
  });
};

const getTour = (req, res) => {
  console.log(req.params);
  const id = req.params.id * 1; //convert into int
  const tour = tours.find((el) => el.id === id);

  // if(!tour){
  if (id > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

const createTour = (req, res) => {
  // console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

const updateTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<updated tour here...>',
    },
  });
};

const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

/////////////3) ROUTES ////////////////

app.get('/api/v1/tours',getAllTours);
app.post('/api/v1/tours',createTour);
app.get('/api/v1/tours/:id', getTour);
app.patch('/api/v1/tours/:id', updateTour);
app.delete('/api/v1/tours/:id', deleteTour);

app.route('/api/v1/tours').get(getAllTours).post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

app.route('/api/v1/users').get(getAllUsers).post(createUser);

app
  .route('/api/v1/users/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

const tourRouter = express.Router();
const userRouter = express.Router();

tourRouter.route('/').get(getAllTours).post(createTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

//tourRouter is a middleware and we want to use that middleware for this specific route (/api/v1/tours) means it will run for only that url so now we can change the route below from '/api/v1/tours' to '/'(root) because  tourRouter middleware only runs on this route anyway so once we are in the router so we already at this route '/api/v1/tours'

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

/////////////4) START SERVER /////////////////

const port = 3000;
app.listen(port, (req, res) => {
  console.log(`app listening on port ${port}....`);
});




*/

///////////////////////////////////////////////////////////////////
//02)////////////////////////////////////////////////////////////////
//////////////////mongoose folder: before refactoring////////////
////////////////////////////////////////////////////////////////

/*
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' }); //first config and then import app as order is important

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
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'));

//mongoose.connect we pass connection string and we pass object we certain values it returns promise so we handle it using then and promise gets access to connection object(bassically this connection will be the result value of promise)

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
});

const Tour = mongoose.model('Tour', tourSchema);

//document . its an instance of tour model
const testTour = new Tour({
  name: 'The park Camper',
  price: 997,
});

//save document to tours collection in database.save returns a promise doc is the final dopcument as it is in database
testTour
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => {
    console.log('ERROR :', err);
  });

const port = process.env.PORT || 3000;
app.listen(port, (req, res) => {
  console.log(`app listening on port ${port}....`);
});
*/

///////////////////////////////////////////////////////////////////
//03)////////////////////////////////////////////////////////////////
//////////////////mongoose folder: before refactoring////////////
////////////////////////////////////////////////////////////////

///file: tourCOntroller.js

/*
const fs = require('fs');
const Tour = require('../models/tourModel');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body['price']) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  console.log(req.requestTime);

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours: tours, //"tours : tours" is same as "tours"
    },
  });
};

exports.getTour = (req, res) => {
  console.log(req.params);
  const id = req.params.id * 1; //convert into int
  const tour = tours.find((el) => el.id === id);
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

exports.createTour = (req, res) => {
  // console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<updated tour here...>',
    },
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
*/

///////////////////////////////////////////////////////////////////
//folder: using mongodb with mongoose        i////////////////////////////////////////////////////////////
//////////////////////////////20) refactoring api features (ke pahle)
////////////////////////////////////////////////////////////////

/*
const { listen } = require('../app');
const { findByIdAndDelete } = require('../models/tourModel');
const Tour = require('../models/tourModel');

exports.aliasTopTours = (req, res, next) => {
  //prefilling the querystring
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    console.log(req.query);

    ///////-1st way of writitng a query-----
    // const tours = await Tour.find(req.query);

    ///////-2nd way of writitng a query-----
    // const query =  Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    //BUILD QUERY

    // 1A) *** Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    //exclude this from queries because there are no documents with this values we need them for other purpose
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) *** Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // \b \b for matching exactly this words not part of any string
    console.log(JSON.parse(queryStr));

    //{ difficulty: 'easy', duration:{ $gte: 5 }} //mongoDB syntax
    //{ difficulty: 'easy', duration:{ gte: '5'}} // our query from postman

    //gte,gt,lte,lt

    let query = Tour.find(JSON.parse(queryStr)); //return query object

    // 2) *** Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
      // sort(price ratingsAverage) //mongoose syntax for sorting
    } else {
      query = query.sort('-createdAt');
    }

    // 3) *** Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      console.log(fields);
      query = query.select(fields);
      // query = query.select('name duration price')
    } else {
      query = query.select('-__v'); //- for excluding field
    }

    // 4) *** Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    //page=2&limit=10, 1-10, page1, 11-20, page 2, 21-30 page 3
    query = query.skip(skip).limit(limit); //.skip(n):-skip n results

    if (req.query.page) {
      //check if page not present
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist');
    }

    //EXECUTE QUERY
    const tours = await query;

    //SEND RESPONSE

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours, //"tours : tours" is same as "tours"
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    //Tour.findOne({_id:req.params.id})

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    //const newTour = new Tour({})
    //newTour.save()

    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //new updated tour should be returned
      runValidators: true, //validators should run again
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
 */
