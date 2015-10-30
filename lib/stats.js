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
 * Returns a stats object for a thing
 * @param thing
 * @returns {{}}
 */
exports.getStats = function getStats (data) {
  var stats = {};
  _.forEach(data, function (data, activity) {
    stats[activity] = getActivityStats(activity, data);
  });
  return stats;
};

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