import request from 'supertest';
import { app } from '../index';

describe('GET /api/health_check', () => {
  it('responds with 200', function(done) {
    request(app)
      .get('/api/health_check')
      .expect(200, done);
  });
});

describe('POST /api/items', () => {
  describe('given invalid attributes', () => {
    it('responds with 422', function(done) {
      request(app)
        .post('/api/items')
        .send({})
        .expect(422, done);
    });
  });
});
