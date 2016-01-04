# Reckoning: a simple HTTP interface for activity accounting

## Summary

Reckoning is designed as a dead simple HTTP interface for accepting, storing, and returning basic accounting stats. Expressed with maximum abstraction:

- How many times has a `thing` *done* `some action`?

## Use Case

You shipped a client application that performs certain actions, for example:

- It can `install` a common, remote `package` on the user's local machine.

In order to keep track of the number of times a `package` has been `install`ed across your entire application's user community, the client application will have to ship back its activity data to a single source of authority.

In addition, your user community may benefit from being able to easily retrieve application community usage data, for example to assess `package` popularity.

## How Reckoning fits in

To take those two examples above in order. Let's assume you have a running Reckoning API at `http://reckoning.example.org/api`.

1. Your client application POSTs data over HTTP to the reckoning API each time a package is installed. Expressed as a curl command:
```
curl -H "Content-Type: application/json" -X POST -d '{"version": "1.0.0", "activities": ["install"]}' http://reckoning.example.org/api/my-neat-package
```
2. You build a UI front end to enable your users to search for packages and gather statistics. This is how you would rely upon Reckoning in your front end app, also running and responsive at http://reckoning.example.org, expressed as a jquery ajax call:
```
$.ajax({
    accepts: "application/json"
    url: "/api/my-neat-package"
}).done(function (data) {
    console.log(data)
});
```

```
>
Object {
    install {
        count: 200342
        today: 1233
        week: 6100
        month: 14122
        year: 18001
    }
}
```

## Under the hood

Reckoning uses a simple, [recognizable node/express pattern](index.js) to respond to HTTP GET and POST (**requires node.js version 0.10 or greater**). Optionally, via a [config file](config.json), you can build up a whitelist of known trackable `activities` ("install" in the example above).

Isolation (in the *ACID* sense) is currently provided using a simple job queue via the [kue](https://github.com/Automattic/kue) package; this requires a proximate redis connection (for dev'ing, kue will default to 127.0.0.1:6379, so simply launching a redis process on your development host using the default connection configuration will fulfill this requirement).

A persistent data solution is not provided, and instead an in-memory, process-dependent memo object has been provided as a placeholder.

[Tests are provided](test/index.js) that use mocha, supertest, and expect.

## Installation

1. Clone the repo && cd to new dir
2. `npm install`
3. `npm test` to test
4. `node index.js` to run the node server locally
