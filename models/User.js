// mongoose require
const mongoose = require('mongoose');

// validator require
const validator = require('validator');

// bcrypt require
const bcrypt = require('bcryptjs');

// -------------------------------------------------------

// schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide email'],
    validate: {
      validator: validator.isEmail,
      message: 'Please provide vaild email'
    }
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  }
});

// pre hook
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// compare password
UserSchema.methods.comparePassword = async function(writtenPassword) {
  return await bcrypt.compare(writtenPassword, this.password);
};

// export
module.exports = mongoose.model('User', UserSchema);