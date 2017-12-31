var mongoose = require('mongoose');
var contentsSchema = require('../schemas/contents.js');
module.exports = mongoose.model('Content',contentsSchema);