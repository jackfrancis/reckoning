var request = require('supertest'),
    expect = require('expect'),
    require = require('really-need');

describe('loading express', function () {
  var server;
  beforeEach(function () {
    server = require('../index.js', { bustCache: true });
  });
  afterEach(function (done) {
    server.close(done);
  });
  it('GET /', function testSlash (done) {
    this.timeout(1000);
    request(server)
      .get('/')
      .expect(200, done);
  });
});

describe('test POST/GET activity', function () {
  var server,
      thing = 'thing1',
      postData = {
        activities: [
          'install'
        ],
        version: '0.0.1'
      };
  beforeEach(function () {
    server = require('../index.js');
  });
  it('POST a thing/activity', function testPost (done) {
    this.timeout(1000);
    request(server)
      .post('/' + thing)
      .send(postData)
      .end(function (err, res) {
        if (err) {
          throw err;
        }
        expect(res.status).toBe(200);
        expect(res.body.data.model.activities.length).toBe(1);
        done();
      });
  });
  it('test another POST', function testAnotherPost (done) {
    this.timeout(1000);
    postData.activities.push('update');
    request(server)
      .post('/' + thing)
      .send(postData)
      .end(function (err, res) {
        if (err) {
          throw err;
        }
        expect(res.status).toBe(200);
        expect(res.body.data.model.activities.length).toBe(2);
        done();
      });
  });
  it('GET /', function testThing1 (done) {
    this.timeout(1000);
    request(server)
      .get('/' + thing)
      .end(function (err, res) {
        if (err) {
          throw err;
        }
        expect(res.status).toBe(200);
        expect(res.body[postData.activities[0]].count).toBe(2);
        expect(res.body[postData.activities[0]].today).toBe(2);
        expect(res.body[postData.activities[0]].week).toBe(2);
        expect(res.body[postData.activities[0]].month).toBe(2);
        expect(res.body[postData.activities[0]].year).toBe(2);
        expect(res.body[postData.activities[1]].count).toBe(1);
        expect(res.body[postData.activities[1]].today).toBe(1);
        expect(res.body[postData.activities[1]].week).toBe(1);
        expect(res.body[postData.activities[1]].month).toBe(1);
        expect(res.body[postData.activities[1]].year).toBe(1);
        done();
      });
  });
});