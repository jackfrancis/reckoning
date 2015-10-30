'use strict';

/*
 *    <------>
 * --> models <--
 *    <------>
 *
 * An simple model library
 * Copyright(c) 2015 Jack Francis
 * Apache 2.0 License
 *
 */

var activitiesWhitelist = require('../config.json').activities;

/**
 * @param {Object} params model parameters
 * @returns {*}
 */
exports.make = function make (params) {
  return validate(params) ? {
    thing: String(params.thing),
    version: String(params.version),
    activities: params.activities,
    signature: params.signature ? String(params.signature) : undefined,
    user: params.user ? String(params.user) : undefined
  } : null;
};

function validate (params) {
  return params.thing && params.version && validateActivities(params.activities);
}


/**
 * I.e.: Are all the passed-in activities whitelisted?
 * If the "activities" array in our config is empty, we assume a global whitelist
 * @param activity
 * @returns {boolean}
 */
function validateActivities (activities) {
  var whitelist = activitiesWhitelist;
  return whitelist.length === 0 || activities.every(function (activity, index, array) {
      return whitelist.some(function (allowed) {
        return activity === allowed;
      })
    });
}