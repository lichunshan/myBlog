var mongoose = require('mongoose');
var categoriesSchema = require('../schemas/categories.js');
module.exports = mongoose.model('Category',categoriesSchema);