'use strict';

var config = require('./config.json'), // config.json-sourced configuration
    express = require('express'),
    kue = require('kue'),
    queue = kue.createQueue(),
    app = express(),
    bodyParser = require('body-parser'),
    timeout = require('connect-timeout'),
    router = express.Router(),
    _ = require('lodash'),
    moment = require('moment'),
    server,
    dataStore = require('./lib/memo'), // using ephemeral in-memory data store library by default
    models = require('./lib/models'),
    stats = require('./lib/stats');

router.get('/', function (req, res) {
  if (req.url.indexOf('favico') === -1) {
    res.json(dataStore.get()); // dump the whole thing!
  }
});

app.use('/', router);
app.use(timeout(10000));
app.use(bodyParser.json());
app.use(function ignoreTimeout(req, res, next){
  next();
});

server = app.listen(8000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('App listening at http://%s:%s', host, port);
});

module.exports = server;

queue.process('incrementer', function (job, done) {
  var activities = job.data.activities,
      thing = job.data.thing;
  activities.forEach(function (activity) {
    increment(thing, activity);
  });
  done();
});

router.get('/:thing', function (req, res) {
  var thing = req.params.thing;

  if (dataStore.exists(thing)) {
    res.json(stats.getStats(dataStore.get(thing)));
  }
});

router.post('/:thing', bodyParser.json(), function (req, res) {
  var model = models.make({
      thing: req.params.thing,
      version: _.get(req.body, 'version'),
      activities: _.get(req.body, 'activities'),
      signature: _.get(req.body, 'signature'),
      user: _.get(req.body, 'user')
  }),
      job;

  if (model) {
    job = queue.create('incrementer', model).save(function (err) {
      if (!err) {
        res.json(job);
      }
    });
  } else {
    res.status(400).send('Invalid parameters passed to API!');
  }
});

/**
 * Light wrapper to "increment" an activity counter, stored as time-stamped elements in a array.
 * @param {String} thing the thing whose activity counter we are incrementing
 * @param {String} activity the activity we want to record as having occurred one more time
 */
function increment (thing, activity) {
  dataStore.addActivity(thing, activity, moment());
}