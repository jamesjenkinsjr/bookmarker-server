

const BookmarksService = {
  getAllBookmarks(db) {
    return(db)
      .select('*')
      .from('bookmark_items');
  },

  getBookmarkByID: (db, id) => {
    return(db)
      .select('*')
      .from('bookmark_items')
      .where({id})
      .returning('*')
      .then(rows => rows[0]);
  }
};

module.exports = { BookmarksService };