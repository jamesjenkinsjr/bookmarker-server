const express = require('express');
const bookmarks = require('./store');
const logger = require('./logger');
const xss = require('xss');
const uuid = require('uuid/v4');
const validator = require('validator');

const bookmarkRouter = express.Router();
const { BookmarksService } = require('./bookmarks-service');

bookmarkRouter
  .route('/')
  .get((req, res, next) => {
    const db = req.app.get('db');
    BookmarksService.getAllBookmarks(db)
      .then(bookmarks => res.json(bookmarks))
      .catch(error => next(error));
  })
  .post((req, res, next) => {
    const db = req.app.get('db');
    if(!req.body) {
      return res.status(400).send('invalid data');
    }
    const { id, title, url, description = '', rating = 5 } = req.body;
    const newBookmark = { id, title, url, description, rating };
    if(!newBookmark.title || !newBookmark.url) {
      return res.status(400).json({error: {message: 'invalid data - title and url are required'}});
    }
    BookmarksService.addBookmark(db, newBookmark)
      .then(bookmark => {
        return res.status(201).json(bookmark);
      })
      .catch(error => next(error));
  });

bookmarkRouter
  .route('/:id')
  .get((req, res, next) => {
    const db = req.app.get('db');
    const { id } = req.params;
    if(!id) {
      logger.error('id is required');
      return res.status(400).json({error: 'invalid data - check that your id is valid'});
    }
    BookmarksService.getBookmarkByID(db, id)
      .then(bookmark => {
        if(!bookmark) {
          return res.status(400).json({error: {message: 'invalid data - check that your id is valid'}});
        }
        return res.json({
          id: bookmark.id,
          title: xss(bookmark.title),
          url: xss(bookmark.url),
          description: xss(bookmark.description),
          rating: bookmark.rating
        });
      })
      .catch(error => next(error));
  })
  .delete((req, res, next) => {
    const db = req.app.get('db');
    const { id } = req.params;
    if(!id) {
      logger.error('id is required');
      return res.status(400).json({error: 'invalid data - check that your id is valid'});
    }
    BookmarksService.deleteBookmark(db, id)
      .then(res.status(204).end())
      .catch(error => next(error));
  });

module.exports = bookmarkRouter;