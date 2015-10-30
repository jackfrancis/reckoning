'use strict';

/*
 *    <---->
 * --> memo <--
 *    <---->
 *
 * An ephemeral data store for {} things and their [] activities
 * e.g.,
 * {
 *     thing1: {
 *         activity1: [
 *             "2015-10-30T16:33:08.755Z",
 *             "2015-10-30T16:33:14.531Z",
 *             "2015-10-30T16:33:15.921Z"
 *         ]
 *     },
 *     thing2: {
 *         activity1: [
 *             "2015-10-30T16:33:17.935Z"
 *         ]
 *     }
 * }
 * Copyright(c) 2015 Jack Francis
 * Apache 2.0 License
 *
 */

var memo = {}; // ephemeral data store

/**
 * Simple thing getter, returns the thing if it exists,
 * or if no thing is provided as an argument, returns all the things!
 * @param {String?} thing the thing we want, optional
 * @returns {*}
 */
exports.get = function get (thing) {
  return thing ? memo[thing] : memo;
};

/**
 * Activity getter, returns null if the thing itself doesn't exist,
 * returns undefined if the activity array doesn't exist in the thing object
 * @param {String} thing the thing whose activity array we want
 * @param {String} activity the activity array we want
 * @returns {Array|undefined|null} returns the activity array if it exists
 */
exports.getActivity = function getActivity (thing, activity) {
  return exports.exists(thing) ? memo[thing][activity] : null;
};

/**
 * Light wrapper to determine if a thing, and optionally a thing's activity, has been previously recorded
 * @param {String} thing the thing we want to check for being already present in the thing data store
 * @param {String?} activity the thing's activity we want to check for having been previously recorded
 * @returns {boolean}
 */
exports.exists = function exists (thing, activity) {
  if (activity) {
    return memo[thing] ? !!memo[thing][activity] : false;
  } else {
    return !!memo[thing];
  }
};

/**
 * Record a thing for the first time, returns null if the thing already exists
 * @param {String} thing the thing we want to create
 * @returns {Object|null}
 */
exports.createNewThing = function createNewThing (thing) {
  return exports.exists(thing) ? null : memo[thing] = {};
};

/**
 * Record a thing's activity for the first time, create's the thing if it doesn't already exist,
 * returns null if the thing's activity already exists
 * @param {String} thing the thing whose activity we want to create
 * @param {String} activity the activity we want to create
 * @returns {Array|null}
 */
exports.createNewActivity = function createNewActivity (thing, activity) {
  if (!exports.exists(thing)) {
    exports.createNewThing(thing);
  }
  return exports.exists(thing, activity) ? null : memo[thing][activity] = [];
};

/**
 * Add an activity record to a thing's activity array,
 * create's the thing's activity array if it doesn't already exist
 * @param {String} thing the thing whose activity we want to create
 * @param {String} activity the activity we want to create
 * @param {*} record the record to add to the activity array
 * @returns {Number} the length of the activity array after addition
 */
exports.addActivity = function addActivity (thing, activity, record) {
  if (!exports.exists(thing, activity)) {
    exports.createNewActivity(thing, activity);
  }
  return exports.getActivity(thing, activity).push(record);
};