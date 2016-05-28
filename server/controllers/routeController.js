var mongoose = require('mongoose');
var Route = require('../models/routeModel.js');

exports.getAllRoutes = function(req, res) {
  Route.find({}, function(err, routes) {
    if (err) {
      logger.error('ERROR in getAllPOI: ', err);
      return res.json(err);
    } 
      
    // logger.info('Successfully retrieved pois: ' + pois);
    res.json(routes); 
  });
};

exports.updateRoute = function (req, res) {
  var route = req.body;
  
  Route.findOneAndUpdate({ '_id': route['_id'] }, route, { },
    function (err, route) {
      res.json(route);
  });
};

exports.getRoutesNearUser = function(req, res) {
  Route.find({
    loc: {
      $near: {
        $geometry: {
          type: "Point", 
          coordinates: [req.body[0], req.body[1]] 
        }, 
        $maxDistance: 3000
      } 
    } 
  }, function(err, routes){
    res.send(routes);
  })
};

exports.deleteRoute = function (req, res) {
  
  if (!req.params.id) {
    console.log('Error: routeID not found when deleting route');
    return;
  }

  Route.findOneAndRemoveAsync({
    '_id': mongoose.Types.ObjectId(req.params.id)
  }).then(function (result) {
    res.status(200);
    res.end();
  }).catch(function (error) {
    console.log('Error: failed to find one and remove', error);
  });
};
