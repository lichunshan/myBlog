var mongoose = require('mongoose');

var userSchema = require('../schemas/users.js');

module.exports = mongoose.model('User',userSchema);