'use strict';

/*
 *    <----->
 * --> stats <--
 *    <----->
 *
 * An simple stats library
 * Copyright(c) 2015 Jack Francis
 * Apache 2.0 License
 *
 */

var _ = require('lodash'),
    moment = require('moment');

/**
 * Returns a stats object for a given data object
 * @param {Object} data
 * @returns {{}}
 */
exports.getStats = function getStats (data) {
  var stats = {};
  // We assume the data object contains 'action' keys whose values are
  // an array of logged, timestamped 'activity' entries
  // e.g.:
  // {
  //   'install': ['2016-01-04T20:36:52.766Z', '2016-01-04T20:36:53.487Z']
  // }
  _.forEach(data, function (activity, action) {
    stats[action] = getActivityStats(action, activity);
  });
  return stats;
};

/**
 * Wrapper function interface to provide activity-specific stats gathering
 * @param {String} activity activity string identifier, e.g., "download"
 * @param {Array} data array
 * @returns {{}}
 */
function getActivityStats (action, activity) {
  switch (action) {
    default :
      return getCountingStats(activity);
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
