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
    console.log(process.env.TEST_DB_URL);
    console.log(process.env.NODE_ENV);
    app.use('db', db);
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
  });
});