'use strict';

var config = require('./config.json'), // config.json-sourced configuration
    express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    timeout = require('connect-timeout'),
    router = express.Router(),
    _ = require('lodash'),
    moment = require('moment'),
    server,
    dataStore = require('./lib/memo'), // using ephemeral in-memory data store library by default
    models = require('./lib/models'),
    queue = require('./lib/queue'),
    stats = require('./lib/stats');

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

router.get('/', function (req, res) {
  if (req.url.indexOf('favico') === -1) {
    res.json(dataStore.get()); // dump the whole thing!
  }
});

router.get('/:thing', function (req, res) {
  var thing = req.params.thing;

  if (dataStore.exists(thing)) {
    res.json(stats.getStats(dataStore.get(thing)));
  } else {
    res.status(404).send({});
  }
});

router.post('/:thing', bodyParser.json(), function (req, res) {
  var model = models.make({
      thing: req.params.thing,
      version: _.get(req.body, 'version'),
      activities: _.get(req.body, 'activities'),
      when: moment(),
      signature: _.get(req.body, 'signature'),
      user: _.get(req.body, 'user')
  }),
    jobSpecs = {};

  if (model) {
    jobSpecs.title = model.thing + ':' + model.version + ' --> ' + model.activities[0];
    jobSpecs.model = model;
    queue.add(jobSpecs, res);
  } else {
    res.status(400).send('Invalid parameters passed to API!');
  }
});

// Define a job called 'incrementer' to be handled by the worker queue
queue.define('incrementer', increment);


/**
 * The increment job as expressed as a function interface that our worker queue understands.
 * What 'increment' actually does is enumerate over an 'activities' array defined inside the job,
 * and add each activity to our data store, essentially recording the following:
 *   - 'thing' did this 'activity' at a certain time 'when'
 * @param {Object} job a queue job object
 * @param {Function} done a function to be invoked when job execution is complete
 */
function increment (job, done) {
  var activities = job.data.model.activities,
    thing = job.data.model.thing;
  activities.forEach(function (activity) {
    dataStore.addActivity(thing, activity, job.data.model.when);
  });
  done();
}