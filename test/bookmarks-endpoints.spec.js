/* global supertest, expect */

const knex = require('knex');
const app = require('../src/app');
const { BookmarksFixtures } = require('./fixtures');

describe('Bookmarks endpoints', () => {
  let db;
  before('create db config', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });
  before('clean bookmark_items table', () => {
    return db('bookmark_items').truncate();
  });
  after('clean bookmark_items table', () => {
    return db('bookmark_items').truncate();
  });
  after('drop db connection', () => {
    db.destroy();
  });
  context('bookmark_items has data', () => {
    const testData = BookmarksFixtures();

    beforeEach('insert test data into bookmark_items', () => {
      return db('bookmark_items').insert(testData);
    });
    afterEach('clean data from bookmarks_list', () => {
      return db('bookmark_items').truncate();
    });
    it('GET getAllBookmarks returns 200 with expected data', () => {
      return supertest(app)
        .get('/api/bookmarks')
        .expect(200, testData);
    });
    it('GET getBookmarkByID returns 200 with expected data', () => {
      return supertest(app)
        .get('/api/bookmarks/1')
        .expect(200, testData[0]);
    });
    it('POST addBookmark returns 201 and expected data present in db', () => {
      const testBookmark = {
        id: 4,
        title: 'new bookmark very cool',
        url: 'http://newbookmark.com',
        description: 'new desc',
        rating: 4,
      };
      return supertest(app)
        .post('/api/bookmarks')
        .send(testBookmark)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id');
          expect(res.body.title).to.eql(testBookmark.title);
          expect(res.body.url).to.eql(testBookmark.url);
          expect(res.body.description).to.eql(testBookmark.description);
          expect(res.body.rating).to.eql(testBookmark.rating);
        })
        .then(res => {
          return supertest(app)
            .get(`/api/bookmarks/${res.body.id}`)
            .expect(res.body);
        });
    });
    it('POST addBookmark gives 400 status and error when missing required fields', () => {
      return supertest(app)
        .post('/api/bookmarks')
        .send({rating: 4})
        .expect(400, {error: {message: 'invalid data - title and url are required'}});
    });
    it('DELETE deleteBookmark return 204 and item is deleted', () => {
      return supertest(app)
        .delete(`/api/bookmarks/${testData[0].id}`)
        .expect(204)
        .then(res => {
          return supertest(app)
            .get(`/api/bookmarks/${testData[0].id}`)
            .expect(404, {error: {message: 'invalid data - check that your id is valid'}});
        });
    });
    it('PATCH returns 204 and updates are reflected', () => {
      const updatedBookmarkID = testData[0].id;
      const updateData = { title: 'updated title', url: 'http://updated.com', description: 'updated description', rating: 1 };
      return supertest(app)
        .patch(`/api/bookmarks/${updatedBookmarkID}`)
        .send(updateData)
        .expect(204)
        .then( res => {
          return supertest(app)
            .get(`/api/bookmarks/${updatedBookmarkID}`)
            .expect({...updateData, id: updatedBookmarkID});
        });
    });

  });
  context('bookmark_items has no data', () => {
    const testData = [];
    it('GET getAllBookmarks returns 200 and empty array', () => {
      return supertest(app)
        .get('/api/bookmarks')
        .expect(200, testData);
    });
    it('GET getBookmarkById returns 400 and error', () => {
      return supertest(app)
        .get('/api/bookmarks/1')
        .expect(404, {
          error: { message: 'invalid data - check that your id is valid' },
        });
    });
    it('PATCH returns 404 and error', () => {
      const testData = { title: 'foo', url: 'http://update.com', description: 'stuff', rating: 4 };
      return supertest(app)
        .patch('/api/bookmarks/12345')
        .send(testData)
        .expect(404, {error: {message: 'invalid data - check that your id is valid'}});
    });

  });
});
