// const {
//   listen
// } = require('../app');
// const {
//   findByIdAndDelete
// } = require('../models/tourModel');
const Tour = require('../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.aliasTopTours = (req, res, next) => {
  //prefilling the querystring
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  console.log(req.query);
  /*
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
*/
  //EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  //SEND RESPONSE

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours, //"tours : tours" is same as "tours"
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  //Tour.findOne({_id:req.params.id})

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  //const newTour = new Tour({})
  //newTour.save()

  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });

  // try {
  //   //const newTour = new Tour({})
  //   //newTour.save()

  //   const newTour = await Tour.create(req.body);

  //   res.status(201).json({
  //     status: 'success',
  //     data: {
  //       tour: newTour,
  //     },
  //   });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: err,
  //   });
  // }
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true, //new updated tour should be returned
    runValidators: true, //validators should run again. Imp validtion should happen to the updated data also
  });

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  // .aggregate([stages])
  const stats = await Tour.aggregate([
    {
      //stage 01
      $match: {
        ratingsAverage: {
          $gte: 4.5,
        },
      },
    },
    {
      //stage 02
      $group: {
        //id:-what we want to group by.here we want all tours in one group so null

        // _id: null, //no groups. it will simply calculate for all
        // _id: '$difficulty',
        _id: {
          $toUpper: '$difficulty',
        },
        numTours: {
          $sum: 1,
        },
        numRatings: {
          $sum: '$ratingsQuantity',
        },
        avgRating: {
          $avg: '$ratingsAverage',
        },
        avgPrice: {
          $avg: '$price',
        },
        minPrice: {
          $min: '$price',
        },
        maxPrice: {
          $max: '$price',
        },
      },
    },
    {
      $sort: {
        avgPrice: 1, //1 or -1. 1 for accending
      },
    },
    ////we can repeat stages
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; //convert to number

  const plan = await Tour.aggregate([
    {
      //one document for each date in startdates array of each tour
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        //grouping by month
        _id: {
          $month: '$startDates',
        },
        numTourStarts: {
          $sum: 1,
        }, //how many tours in each month
        tours: {
          $push: '$name',
        }, //arrays of name of tours
        //we create an array by using push operator
      },
    },
    {
      //this stage is used to add  fields 😶
      $addFields: {
        month: '$_id',
      }, //nameofNewField : value
    },
    {
      $project: {
        _id: 0, //we give each of the field names a 0 or 1.here we gave id 0 so it will no longer shows up . if 1 then would show up
      },
    },
    {
      $sort: {
        numTourStarts: -1,
      }, //descending
    },
    {
      $limit: 12, //only 12 documents
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
