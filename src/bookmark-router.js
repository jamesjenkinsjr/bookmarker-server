const express = require('express');
const store = require('./store');

const bookmarkRouter = express.Router();

bookmarkRouter
  .route('/')
  .get((req, res) => {
    res.status(200).json(store);
  });

module.exports = bookmarkRouter;