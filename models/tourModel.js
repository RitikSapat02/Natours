const mongoose = require('mongoose');
const slugify = require('slugify'); //create a slug
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    //1st object:- schema definations
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty can be either: easy,medium,difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      deafult: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      //schema type options
      type: Number,
      validate: {
        //can also use array syntax(as isAplha for name) but it will look weird

        validator: function (val) {
          //pricediscount should be lower than price
          //val :-callback function actuallly has access to the value that was inputed (in this case pricediscount that user specify)
          //this - current document
          //returns true or false
          //this only points to current doc on NEW document creation and not on update
          return val < this.price;
        },

        message: 'discountPrice ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true, //remove all the white spaces in beginning and end// trim is a skimmatype for string
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, //ye nahi dikkhega response me//vid:limiting fileds
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    //2nd object:- Schema options
    toJSON: {
      virtuals: true,
    }, //when data is shown as json then show virtuals in output
    toObject: {
      virtuals: true,
    },
  }
);

//---VIRTUAL PROPERTIES
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//---DOCUMENT MIDDLEAWARE:
//save middlware:-runs for only .save() and .create() but not for insertMany(),findoneandupdate,findbyidandupdate etc

//pre middleware
tourSchema.pre('save', function (next) {
  //pre save hook/middleware
  //callbcak fun is called before an actual doc is saved to db
  console.log(this); //in a save middleware the this key is gonna point to currently processed document

  // create a slug
  this.slug = slugify(this.name, {
    lower: true,
  });
  next();
});

// tourSchema.pre('save', function (next) {
//   console.log('Will save document.....');
//   next();
// })

// //post middleware
// tourSchema.post('save', function (doc, next) { //post save hook/ middleware
//   console.log(doc);
//   next();
// })

//---QUERY MIDDLEAWARE:

tourSchema.pre(/^find/, function (next) {
  //find,findOne,all start find

  // tourSchema.pre('find', function (next) {  //only find
  //'this' will point to current query
  //lets do :-create a secret tour filed and query only for non secret tours

  this.find({
    secretTour: {
      $ne: true,
    },
  });

  this.start = Date.now(); //clock timer to know how much time query took to run. will subtract this from time at post middleware below
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  //docs :all docs return from query
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  console.log(docs);
  next();
});

//---AGGREGATION MIDDLEAWARE:
tourSchema.pre('aggregate', function (next) {
  console.log(this.pipeline());
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
