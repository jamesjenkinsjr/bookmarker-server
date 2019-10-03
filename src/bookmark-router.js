const express = require('express');
const bookmarks = require('./store');
const logger = require('./logger');
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
  .post((req, res) => {
    if(!req.body) {
      return res.status(400).send('invalid data');
    }
    const { title, url, content = '', rating = 5,  } = req.body;
    if(!title) {
      logger.error('title is required');
      return res.status(400).json({error: 'invalid data - title and url are required'});
    } 
    if(!url) {
      logger.error('url is required');
      return res.status(400).json({error: 'invalid data - title and url are required'});
    }
    if(!validator.isURL(url)) {
      logger.error('url is not in proper format');
      return res.status(400).json({error: 'invalid data - url must have proper format'});
    }
    if(!parseInt(rating)) {
      logger.error('rating is not valid');
      return res.status(400).json({error: 'invalid data - rating must be a number'});
    }

    const newBookmark = {
      id: uuid(),
      title,
      url,
      content,
      rating: parseInt(rating)
    };

    bookmarks.push(newBookmark);
    logger.info(`Bookmark with id ${newBookmark.id} created`);
    return res.status(201).json({message: `Bookmark with id ${newBookmark.id} created`});
  });

bookmarkRouter
  .route('/:id')
  .get((req, res) => {
    const { id } = req.params;
    const bookmark = bookmarks.find(bookmark => bookmark.id === id);
    if(!id) {
      logger.error('id is required');
      return res.status(400).json({error: 'invalid data - check that your id is valid'});
    }
    if(!bookmark) {
      logger.error(`id ${id} not found`);
      return res.status(400).json({error: 'invalid data - check that your id is valid'});
    }
    return res.status(200).json(bookmark);
  })
  .delete((req, res) => {
    const { id } = req.params;
    const bookmark = bookmarks.find(bookmark => bookmark.id === id);
    const bookmarkID = bookmarks.findIndex(bookmark => bookmark.id === id);
    if(!id) {
      logger.error('id is required');
      return res.status(400).json({error: 'invalid data - check that your id is valid'});
    }
    if(!bookmark) {
      logger.error(`id ${id} not found`);
      return res.status(400).json({error: 'invalid data - check that your id is valid'});
    }
    bookmarks.splice(bookmarkID, 1);
    return res.status(204).end();
  });

module.exports = bookmarkRouter;