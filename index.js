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
    dataStore = require('./lib/memo'); // using ephemeral in-memory data store library by default

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
  activities.forEach(function (item) {
    var activity = String(item);
    if (validateActivity(activity)) {
      increment(thing, activity);
    }
  });
  done();
});

router.get('/:thing', function (req, res) {
  var thing = req.params.thing;

  res.json(getStats(thing));
});

router.post('/:thing', bodyParser.json(), function (req, res) {
  var thing = req.params.thing,
      job;

  if (Array.isArray(req.body)) {
    job = queue.create('incrementer', {
      thing: thing,
      activities: req.body
    }).save(function (err) {
      if (!err) {
        res.json(job);
      }
    });
  }
});

/**
 * Returns a stats object for a thing
 * @param thing
 * @returns {{}}
 */
function getStats (thing) {
  var stats = {};
  if (dataStore.exists(thing)) {
    _.forEach(dataStore.get(thing), function (data, activity) {
      stats[activity] = getActivityStats(activity, data);
    });
  }
  return stats;
}

/**
 * Wrapper function interface to provide activity-specific stats gathering
 * @param {String} activity activity string identifier, e.g., "download"
 * @param {Array} data array
 * @returns {{}}
 */
function getActivityStats (activity, data) {
  switch (activity) {
    default :
      return getCountingStats(data);
  }
}

/**
 *
 * @param {Array} data array of moment objects
 * @returns {{count: *, today: Number, week: Number, month: Number, year: Number}}
 */
function getCountingStats (data) {
  return {
    count: data.length,
    today: data.filter(function (item) {
      return moment().isSame(item, 'day');
    }).length,
    week: data.filter(function (item) {
      return moment().isSame(item, 'week');
    }).length,
    month: data.filter(function (item) {
      return moment().isSame(item, 'month');
    }).length,
    year: data.filter(function (item) {
      return moment().isSame(item, 'year');
    }).length
  };
}

/**
 * Ensure that the we keep a sane, predictable reckoning.
 * I.e.: Is this a "whitelisted" activity that we actually want to track?
 * If the "activities" array in our config is empty, we assume a global whitelist
 * @param activity
 * @returns {boolean}
 */
function validateActivity (activity) {
  var whitelist = config.activities;
  return whitelist.length === 0 || whitelist.some(function (element, index, array) {
    return array.length === 0 || element === activity;
  });
}

/**
 * Light wrapper to "increment" an activity counter, stored as time-stamped elements in a array.
 * @param {String} thing the thing whose activity counter we are incrementing
 * @param {String} activity the activity we want to record as having occurred one more time
 */
function increment (thing, activity) {
  dataStore.addActivity(thing, activity, moment());
}