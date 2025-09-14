// Make sure to update your server.js with these route order fixes

// Define the search endpoint before the book_id endpoint
// This is important because Express routes are matched in order
// and '/api/books/search' could be interpreted as '/api/books/:book_id' with book_id = 'search'

// Move this route BEFORE the '/api/books/:book_id' route
app.get('/api/books/search', (req, res) => {
  // ... your existing search implementation ...
});

// Then define the book_id endpoint
app.get('/api/books/:book_id', (req, res) => {
  // ... your existing implementation ...
});
