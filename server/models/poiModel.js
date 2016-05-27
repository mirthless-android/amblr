var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

var poiSchema = mongoose.Schema({
  lat: { type: Number, required: true },
  long: { type: Number, required: true },
  type: { type: String },
  description: { type: String },
  routeId: { type: String },
  title: { type: String, required: true },
  userID: { type: String}
});

poiSchema.plugin(timestamps);

module.exports = mongoose.model('POI', poiSchema);

