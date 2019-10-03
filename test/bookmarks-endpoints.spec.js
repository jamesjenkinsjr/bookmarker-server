/* global supertest, expect */

const knex = require('knex');
const app = require('../src/app');
const { BookmarksFixtures } = require('./fixtures');

describe('Bookmarks endpoints', () => {
  let db;
  before('create db config', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
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
      return db('bookmark_items')
        .insert(testData);
    });
    afterEach('clean data from bookmarks_list', () => {
      return db('bookmark_items')
        .truncate();
    });
    it('GET getAllBookmarks returns 200 with expected data', () => {
      return supertest(app)
        .get('/bookmarks')
        .expect(200, testData);
    });
    it('GET getBookmarkByID returns 200 with expected data', () => {
      return supertest(app)
        .get('/bookmarks/1')
        .expect(200, testData[0]);
    });
  });
  context('bookmark_items has no data', () => {
    const testData = [];
    it('GET getAllBookmarks returns 200 and empty array', () => {
      return supertest(app)
        .get('/bookmarks')
        .expect(200, testData);
    });
    it('GET getBookmarkById returns 400 and error', () => {
      return supertest(app)
        .get('/bookmarks/1')
        .expect(400, {error: {message: 'invalid data - check that your id is valid'}});
    });

  });
});