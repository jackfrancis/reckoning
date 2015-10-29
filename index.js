'use strict';

var config = require('./config.json'), // config.json-sourced configuration
    express = require('express'),
    http = require('http'),
    https = require('https'),
    app = express(),
    bodyParser = require('body-parser'),
    timeout = require('connect-timeout'),
    router = express.Router(),
    _ = require('lodash'),
    moment = require('moment'),
    server,
    memo = {}; // temporary in-memory key-value store

router.get('/', function (req, res) {
  if (req.url.indexOf('favico') === -1) {
    res.json(memo); // dump the whole thing!
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

router.get('/:thing', function (req, res) {
  var thing = req.params.thing;

  res.json(getStats(thing));
});

router.post('/:thing', bodyParser.json(), function (req, res) {
  var thing = req.params.thing,
      data = {};
  if (Array.isArray(req.body)) {
    req.body.forEach(function (item) {
      var activity = String(item);
      if (validateActivity(activity)) {
        incrementActivity(thing, activity);
      }
    });
  }
  data[thing] = memo[thing];
  res.json(data);
});

/**
 * Returns a stats object for a thing
 * @param thing
 * @returns {{}}
 */
function getStats (thing) {
  var stats = {};
  if (exists(thing)) {
    _.forEach(memo[thing], function (data, activity) {
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
 * Increment a specific thing's activity count by 1
 * @param {String} thing the thing whose activity counter we are incrementing
 * @param {String} activity the activity we want to record as having occurred one more time
 */
function incrementActivity (thing, activity) {
  if (!exists(thing)) {
    add(thing);
  }
  increment(thing, activity);
}

/**
 * Light wrapper to determine if a thing, and optionally a thing's activity, has been previously recorded
 * @param {String} thing the thing we want to check for being already present in the thing data store
 * @param {String?} activity the thing's activity we want to check for having been previously recorded
 * @returns {boolean}
 */
function exists (thing, activity) {
  if (activity) {
    return memo[thing] ? !!memo[thing][activity] : false;
  } else {
    return !!memo[thing];
  }
}

/**
 * Light wrapper to "increment" an activity counter, stored as time-stamped elements in a array.
 * If we haven't ever recorded this activity for this thing, we initialize a new array.
 * @param {String} thing the thing whose activity counter we are incrementing
 * @param {String} activity the activity we want to record as having occurred one more time
 */
function increment (thing, activity) {
  if (!memo[thing][activity]) {
    memo[thing][activity] = [];
  }
  memo[thing][activity].push(moment());
}

/**
 * Add a new thing to our data store
 * @param {String} thing the thing we want to add
 */
function add (thing) {
  memo[thing] = {};
}