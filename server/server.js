var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan');
var app = module.exports = express();
var logger = require('./config/logger.js');
var fs = require('fs');
var passport = require('passport');
var https = require('https');

var poiRouter = require('./routers/poiRouter.js');
var userRouter = require('./routers/userRouter.js');
var routeRouter = require('./routers/routeRouter.js');

// configuration variables for server port and mongodb URI
var port = process.env.PORT || 443;
var dbUri = process.env.MONGOLAB_URI || 'mongodb://localhost/app_database';
var env = process.env.NODE_ENV || 'production';

//create connection to mongodb
mongoose.connect(dbUri);

app.use(passport.initialize());
app.use(passport.session());

// log db connection success or error
// TODO: update to use winston logging
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log('connection to mongoose!');
});

console.log('stream: ' + logger.stream);

app.use(require('morgan')('combined', { 'stream': logger.stream }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//serve static files
app.use(express.static(__dirname + '/../client/www'));

app.all('/*', function (req, res, next) {
  /* hack to allow setting cookies for different ports */
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Headers', 'Content-Type,X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE');
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

// middleware to configure routes for all poi-related URIs
app.use('/api/pois', poiRouter);

// middleware to configure routes for all user-related URIs
app.use('/api/users', userRouter);

app.use('/api/routes', routeRouter);

var options = {
  key: fs.readFileSync('./config/keys/privKey.pem'),
  cert: fs.readFileSync('./config/keys/cert.pem')
};

app.get('/checklogin',function(req,res){
  if (req.user) {
    res.send(true);
  }
  else {
    res.send(false);
  }
});

app.get('/checkuserid', function(req, res){
  if (req.user) {
    res.send(req.user._id);
  } else {
    res.send(null);
  }
})

// Create an HTTPS service 
https.createServer(options, app).listen(port, function(err) {
  if (err) {
    return console.log(err);
  }
  console.log('Amblr API server is listening on port: ' + port);
});

