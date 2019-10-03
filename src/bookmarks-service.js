

const BookmarksService = {
  getAllBookmarks(db) {
    return(db)
      .select('*')
      .from('bookmark_items');
  },

  getBookmarkByID: (db, ID) => {
    return(db)
      .select('*')
      .from('bookmark_items')
      .where({ID});
  }
};

module.exports = { BookmarksService };