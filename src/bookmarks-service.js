

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
  },
  addBookmark: (db, data) => {
    return(db)
      .into('bookmark_items')
      .insert(data)
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  deleteBookmark: (db, id) => {
    console.log('what am I?',id);
    return(db)
      .from('bookmark_items')
      .delete()
      .where({id});
  },
  updateBookmark: (db, id, data) => {
    return db('bookmark_items')
      .where({id})
      .update(data);
  }
};

module.exports = { BookmarksService };