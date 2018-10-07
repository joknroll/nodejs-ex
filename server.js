//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    morgan  = require('morgan'),
    user    = require('./auth/user.js'),
    mongoose = require('mongoose');
    
Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}


var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var MongoClient = require('mongodb').MongoClient;
  if (MongoClient == null) return;


  mongoose.connect(mongoURL).then(
        () => {console.log('Database connection is successful at: %s', mongoURL); db = true },
        err => { console.log('Error when connecting to the database'+ err); return;}
  );
};

var pageCountMessageSchema = new mongoose.Schema({
  pageCountMessage: Number
}, { collection : 'counts' });

var PageCount = mongoose.model('PageCount', pageCountMessageSchema);


var visiteInfoSchema = new mongoose.Schema({
  ip: String, 
  date: Date
}, { collection : 'counts' });

var VisiteInfo = mongoose.model('VisiteInfo', visiteInfoSchema);

app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {

    PageCount.find((err, todos) =>{
      if(err){
        console.log(err);
      }
      else {
        res.json(todos);
      }
    });

    // var col = db.collection('counts');
    // Create a document with request IP and current time of request
    // col.insert({ip: req.ip, date: Date.now()});

    insert(req);
    var visiteInfo = new VisiteInfo({ip: req.ip, date: Date.now()});
    visiteInfo.countDocuments(function(err, count){
      if (err) {
        console.log('Error running count. Message:\n'+err);
      }
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
    });
  } else {
    res.render('index.html', { pageCountMessage : null});
  }
});



var insert = function(req){
    // var col = db.collection('counts');
    var visiteInfo = new VisiteInfo({ip: req.ip, date: Date.now()});
    visiteInfo.save(function(err){
      if (err) return console.error(err);
    });
};

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    visiteInfoSchema.count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

var Hop = require('./core/hops/Hop');

app.get('/hops', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }

  if (db) {
    var hopList = [];
    db.collection('test').find({}).toArray(function(err, list ){
      // console.log('list hops '+ JSON.stringify(list));
      hopList =  JSON.stringify(list);
      // hops = JSON.stringify(list);
      //res.send('{ hops: ' + JSON.stringify(list) + '}');
      res.render('hops.html', { 'hops' : list});
    });
    console.log('after list hops '+ JSON.stringify(hopList));
    // res.render('hops.html', { 'hops' : hopList});
  } else {
    res.send('{ hops: -1 }');
  }
});

app.post('/user', function (req, res){

  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {

    var userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      passwordConf: req.body.passwordConf,
    }

    //use schema.create to insert data into the db
    User.create(userData, function (err, user) {
      if (err) {
        return next(err)
      } else {
        return res.redirect('/profile');
      }
    });
  }

});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
