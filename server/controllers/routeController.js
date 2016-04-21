var mongoose = require('mongoose');
var Route = require('../models/routeModel.js');

exports.getAllRoutes = function(req, res) {

  Route.find({}, function(err, routes) {
    if (err) {
      logger.error('ERROR in getAllPOI: ', err);
      return res.json(err);
    } 
      
    // logger.info('Successfully retrieved pois: ' + pois);
    res.json(pois); 
  });
};

exports.getPOI = function(req, res) {

  // Route.find({}, function(err, routes) {
  //   if (err) {
  //     logger.error('ERROR in getAllPOI: ', err);
  //     return res.json(err);
  //   } 
      
  //   // logger.info('Successfully retrieved pois: ' + pois);
  //   res.json(pois); 
  // });
};