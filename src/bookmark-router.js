const express = require('express');
const bookmarks = require('./store');
const logger = require('./logger');
const uuid = require('uuid/v4');
const validator = require('validator');

const bookmarkRouter = express.Router();

bookmarkRouter
  .route('/')
  .get((req, res) => {
    return res.status(200).json(bookmarks);
  })
  .post((req, res) => {
    !req.body && res.status(400).json('Invalid data');
    const { title, url, content = '', rating = 5,  } = req.body;
    if(!title) {
      logger.error('title is required');
      return res.status(400).json('invalid data');
    } 
    if(!url) {
      logger.error('url is required');
      return res.status(400).json('invalid data');
    }
    if(!validator.isURL(url)) {
      logger.error('url is not in proper format');
      return res.status(400).json('invalid data');
    }

    const newBookmark = {
      id: uuid(),
      title,
      url,
      content,
      rating
    };

    bookmarks.push(newBookmark);
    logger.info(`Bookmark with id ${newBookmark.id} created`);
    return res.status(201).json(`Bookmark with id ${newBookmark.id} created`);
  });

bookmarkRouter
  .route('/:id')
  .get((req, res) => {
    const { id } = req.params;
    const bookmark = bookmarks.find(bookmark => bookmark.id === id);
    if(!id) {
      logger.error('id is required');
      return res.status(400).json('invalid data');
    }
    if(!bookmark) {
      logger.error(`id ${id} not found`);
      return res.status(400).json('invalid data');
    }
    res.status(200).json(bookmark);
  })
  .delete((req, res) => {
    const { id } = req.params;
    const bookmark = bookmarks.find(bookmark => bookmark.id === id);
    const bookmarkID = bookmarks.findIndex(bookmark => bookmark.id === id);
    if(!id) {
      logger.error('id is required');
      return res.status(400).json('invalid data');
    }
    if(!bookmark) {
      logger.error(`id ${id} not found`);
      return res.status(400).json('invalid data');
    }
    bookmarks.splice(bookmarkID, 1);
    res.status(204).end();
  });

module.exports = bookmarkRouter;