var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

var routeSchema = mongoose.Schema({
  name: {type: String, required: true},
  userID: {type: String},
  loc: {
    type: {type: String},
    coordinates: {type: []},
  },
  POIs: {type: [] },
});

routeSchema.index({loc: '2dsphere'});

routeSchema.plugin(timestamps);

module.exports = mongoose.model('Route', routeSchema);

