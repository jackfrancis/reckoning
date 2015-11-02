'use strict';

/*
 *    <----->
 * --> queue <--
 *    <----->
 *
 * An simple queue interface, currently a thin wrapper around 'kue'
 * Copyright(c) 2015 Jack Francis
 * Apache 2.0 License
 *
 */

var kue = require('kue'),
    queue = kue.createQueue(),
    numJobs = require('../config.json').workerQueue.concurrency,
    enableUi = require('../config.json').workerQueue.enableUi;

/**
 * A thin wrapper around kue's "create" method, which creates a new job in the queue.
 * @param {Object} specs an object with some kue-specific key/value data and a 'model' property with job-specific data
 * @param {Object} res the express response object attached to the initial POST request
 */
exports.add = function (specs, res) {
  var job = queue.create('incrementer', specs).removeOnComplete(true).save(function (err) {
    if (!err) {
      res.json(job);
    } else {
      res.json(500).send('Something went wrong! Unable to create a job to process the request', req);
    }
  });
};


/**
 * A thin wrapper around kue's "process" method, which defines a worker job.
 * The func argument has an arity of two, the 1st argument of which is the job object defined at creation time,
 * and the 2nd of which is a function whose invocation will indicate to the queue that job execution is complete.
 * @param {String} name the name of the job to define
 * @param {Function} func kue process function
 */
exports.define = function (name, func) {
  queue.process(name, numJobs, func);
};

/**
 * Log job queue errors
 */
queue.on('error', function(err) {
  console.log(err);
});

/**
 * Kue UI
 */
if (enableUi) {
  kue.app.listen(3000);
}