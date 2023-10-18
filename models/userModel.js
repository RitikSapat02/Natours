const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email!'],
    unique: true,
    lowercase: true, //transform email to lowercase
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  //once user uploads a photot then that will be stored somewhere in our file system and path to that photo is stored here in photo field

  password: {
    type: String,
    required: [true, 'please provide a password'],
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {
      //This is only works on CERATE and  SAVE(): so whenever we want to update the user we will always use SAVE() and not the findone and update.so only workd when we create a new object (.CREATE() or .save())
      validator: function (el) {
        return el === this.password;
      },

      message: 'Passwords are not same!',
    },
  },
});

userSchema.pre('save', async function (next) {
  //we only want to encrypt password if password is updated means only when it is chnaged or also when it is created new. bceause if user is only updating email then in that case we dont want to encyrpt the password again

  //if password is not changed so go to next middleware
  if (!this.isModified('password')) return next();

  //hash password
  //becrypt algorithm is used here: donwloanad 'bcryptjs' module
  //hash password with cost of 12 . 12 because so it will alos run fast and more secure. if you add greater number then cpu will be slow
  this.password = await bcrypt.hash(this.password, 12); //hash is asynchrounous version so returns promise

  //delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});
const User = mongoose.model('User', userSchema);
//mongoose.model(name of model, created out of which schema)

module.exports = User;
