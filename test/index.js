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
  it('GET /', function testSlash(done) {
    this.timeout(1000);
    request(server)
      .get('/')
      .expect(200, done);
  });
});

describe('test POST/GET activity', function () {
  var server,
      thing = 'thing1',
      activity = 'install';
  beforeEach(function () {
    server = require('../index.js');
  });
  it('POST a thing/activity', function testPost(done) {
    this.timeout(1000);
    request(server)
      .post('/' + thing)
      .send([activity])
      .end(function (err, res) {
        if (err) {
          throw err;
        }
        expect(res.status).toBe(200);
        expect(res.body.data.activities.length).toBe(1);
        done();
      });
  });
  it('test another POST', function testAnotherPost(done) {
    this.timeout(1000);
    request(server)
      .post('/' + thing)
      .send([activity, activity])
      .end(function (err, res) {
        if (err) {
          throw err;
        }
        expect(res.status).toBe(200);
        expect(res.body.data.activities.length).toBe(2);
        done();
      });
  });
  it('GET /', function testThing1(done) {
    this.timeout(1000);
    request(server)
      .get('/' + thing)
      .end(function (err, res) {
        if (err) {
          throw err;
        }
        expect(res.status).toBe(200);
        expect(res.body[activity].count).toBe(3);
        expect(res.body[activity].today).toBe(3);
        expect(res.body[activity].week).toBe(3);
        expect(res.body[activity].month).toBe(3);
        expect(res.body[activity].year).toBe(3);
        done();
      });
  });
});