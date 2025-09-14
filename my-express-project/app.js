const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory databases
let members = [];
let books = [];
let borrows = [];
let reservations = [];

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to HackTheAI Library Management API' });
});

// Q1: Create Member
app.post('/api/members', (req, res) => {
  const newMember = req.body;
  
  // Validate request
  if (!newMember.member_id || !newMember.name || !newMember.age) {
    return res.status(400).json({ error: 'Member ID, name, and age are required' });
  }
  
  // Validate age
  if (newMember.age < 12) {
    return res.status(400).json({ error: 'Member must be at least 12 years old' });
  }
  
  // Check if member already exists
  if (members.some(m => m.member_id === newMember.member_id)) {
    return res.status(400).json({ error: 'Member with this ID already exists' });
  }
  
  members.push(newMember);
  res.status(201).json(newMember);
});

// Q2: Get Member Info
app.get('/api/members/:member_id', (req, res) => {
  const id = parseInt(req.params.member_id);
  const member = members.find(m => m.member_id === id);
  
  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }
  
  res.json(member);
});

// Q3: List All Members
app.get('/api/members', (req, res) => {
  res.json(members);
});

// Q4: Update Member Info
app.put('/api/members/:member_id', (req, res) => {
  const id = parseInt(req.params.member_id);
  const updatedMember = req.body;
  
  // Find the member
  const index = members.findIndex(m => m.member_id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Member not found' });
  }
  
  // Validate age if provided
  if (updatedMember.age && updatedMember.age < 12) {
    return res.status(400).json({ error: 'Member must be at least 12 years old' });
  }
  
  // Update member while preserving the original ID
  members[index] = { ...members[index], ...updatedMember, member_id: id };
  res.json(members[index]);
});

// Q5: Borrow Book
app.post('/api/borrow', (req, res) => {
  const { member_id, book_id, borrow_date, return_date } = req.body;
  
  // Validate request
  if (!member_id || !book_id || !borrow_date || !return_date) {
    return res.status(400).json({ error: 'Member ID, book ID, borrow date, and return date are required' });
  }
  
  // Check if member exists
  const member = members.find(m => m.member_id === member_id);
  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }
  
  // Check if book exists
  const book = books.find(b => b.book_id === book_id);
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  
  // Check if book is available
  if (!book.available) {
    return res.status(400).json({ error: 'Book is not available for borrowing' });
  }
  
  // Check if member already has an active borrow for this book
  const existingBorrow = borrows.find(b => 
    b.member_id === member_id && 
    b.book_id === book_id && 
    !b.returned
  );
  
  if (existingBorrow) {
    return res.status(400).json({ error: 'Member already has this book borrowed' });
  }
  
  // Create borrow record
  const borrow = {
    borrow_id: borrows.length + 1,
    member_id,
    book_id,
    borrow_date,
    return_date,
    returned: false,
    actual_return_date: null
  };
  
  // Update book availability
  book.available = false;
  
  // Add to borrows
  borrows.push(borrow);
  
  res.status(201).json(borrow);
});

// Q6: Return Book
app.post('/api/return', (req, res) => {
  const { member_id, book_id, return_date } = req.body;
  
  // Validate request
  if (!member_id || !book_id || !return_date) {
    return res.status(400).json({ error: 'Member ID, book ID, and return date are required' });
  }
  
  // Find the borrow record
  const borrowIndex = borrows.findIndex(b => 
    b.member_id === member_id && 
    b.book_id === book_id && 
    !b.returned
  );
  
  if (borrowIndex === -1) {
    return res.status(404).json({ error: 'No active borrow found for this member and book' });
  }
  
  // Update borrow record
  borrows[borrowIndex].returned = true;
  borrows[borrowIndex].actual_return_date = return_date;
  
  // Find the book and update availability
  const book = books.find(b => b.book_id === book_id);
  if (book) {
    book.available = true;
  }
  
  res.json(borrows[borrowIndex]);
});

// Q7: List Borrowed Books
app.get('/api/borrowed', (req, res) => {
  // Get all active borrows
  const activeBorrows = borrows.filter(b => !b.returned);
  
  // Enhance with member and book details
  const borrowedBooks = activeBorrows.map(borrow => {
    const member = members.find(m => m.member_id === borrow.member_id) || {};
    const book = books.find(b => b.book_id === borrow.book_id) || {};
    
    return {
      ...borrow,
      member: {
        member_id: member.member_id,
        name: member.name
      },
      book: {
        book_id: book.book_id,
        title: book.title,
        author: book.author
      }
    };
  });
  
  res.json(borrowedBooks);
});

// Q8: Get Borrowing History
app.get('/api/members/:member_id/history', (req, res) => {
  const id = parseInt(req.params.member_id);
  
  // Check if member exists
  const member = members.find(m => m.member_id === id);
  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }
  
  // Get all borrows for this member
  const memberBorrows = borrows.filter(b => b.member_id === id);
  
  // Enhance with book details
  const borrowHistory = memberBorrows.map(borrow => {
    const book = books.find(b => b.book_id === borrow.book_id) || {};
    
    return {
      ...borrow,
      book: {
        book_id: book.book_id,
        title: book.title,
        author: book.author
      }
    };
  });
  
  res.json(borrowHistory);
});

// Q9: Delete Member
app.delete('/api/members/:member_id', (req, res) => {
  const id = parseInt(req.params.member_id);
  
  // Check if member exists
  const memberIndex = members.findIndex(m => m.member_id === id);
  if (memberIndex === -1) {
    return res.status(404).json({ error: 'Member not found' });
  }
  
  // Check if member has active borrows
  const hasActiveBorrows = borrows.some(b => b.member_id === id && !b.returned);
  if (hasActiveBorrows) {
    return res.status(400).json({ error: 'Cannot delete member with active borrows' });
  }
  
  // Remove member
  members.splice(memberIndex, 1);
  
  res.json({ message: 'Member deleted successfully' });
});

// Q10: Get Overdue Books
app.get('/api/overdue', (req, res) => {
  const currentDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD
  
  // Find all active borrows where return_date is before current date
  const overdueBorrows = borrows.filter(b => 
    !b.returned && new Date(b.return_date) < new Date(currentDate)
  );
  
  // Enhance with member and book details
  const overdueBooks = overdueBorrows.map(borrow => {
    const member = members.find(m => m.member_id === borrow.member_id) || {};
    const book = books.find(b => b.book_id === borrow.book_id) || {};
    
    return {
      ...borrow,
      member: {
        member_id: member.member_id,
        name: member.name
      },
      book: {
        book_id: book.book_id,
        title: book.title,
        author: book.author
      }
    };
  });
  
  res.json(overdueBooks);
});

// Q11: Add Book
app.post('/api/books', (req, res) => {
  const newBook = req.body;
  
  // Validate request
  if (!newBook.book_id || !newBook.title || !newBook.author) {
    return res.status(400).json({ error: 'Book ID, title, and author are required' });
  }
  
  // Check if book already exists
  if (books.some(b => b.book_id === newBook.book_id)) {
    return res.status(400).json({ error: 'Book with this ID already exists' });
  }
  
  // Set availability to true by default if not provided
  if (newBook.available === undefined) {
    newBook.available = true;
  }
  
  // Add categories, rating, and published_date if not provided
  if (!newBook.categories) newBook.categories = [];
  if (!newBook.rating) newBook.rating = 0;
  if (!newBook.published_date) newBook.published_date = null;
  
  books.push(newBook);
  res.status(201).json(newBook);
});

// Q12: Get Book Info
app.get('/api/books/:book_id', (req, res) => {
  const id = parseInt(req.params.book_id);
  const book = books.find(b => b.book_id === id);
  
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  
  res.json(book);
});

// Q13: Advanced Book Search
app.get('/api/books/search', (req, res) => {
  let filteredBooks = [...books];
  const {
    q, category, author, published_after, published_before,
    min_rating, max_rating, availability,
    sort_by, sort_order, page, limit,
    include_analytics, member_preferences, borrowing_trends
  } = req.query;
  
  // Apply text search
  if (q) {
    const searchTerm = q.toLowerCase();
    filteredBooks = filteredBooks.filter(book => 
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm)
    );
  }
  
  // Filter by category
  if (category) {
    filteredBooks = filteredBooks.filter(book => 
      book.categories && book.categories.includes(category)
    );
  }
  
  // Filter by author
  if (author) {
    filteredBooks = filteredBooks.filter(book => 
      book.author.toLowerCase().includes(author.toLowerCase())
    );
  }
  
  // Filter by publication date range
  if (published_after) {
    filteredBooks = filteredBooks.filter(book => 
      book.published_date && new Date(book.published_date) >= new Date(published_after)
    );
  }
  
  if (published_before) {
    filteredBooks = filteredBooks.filter(book => 
      book.published_date && new Date(book.published_date) <= new Date(published_before)
    );
  }
  
  // Filter by rating range
  if (min_rating) {
    filteredBooks = filteredBooks.filter(book => 
      book.rating >= parseFloat(min_rating)
    );
  }
  
  if (max_rating) {
    filteredBooks = filteredBooks.filter(book => 
      book.rating <= parseFloat(max_rating)
    );
  }
  
  // Filter by availability
  if (availability) {
    const isAvailable = availability.toLowerCase() === 'true';
    filteredBooks = filteredBooks.filter(book => book.available === isAvailable);
  }
  
  // Calculate popularity score based on borrow history
  filteredBooks = filteredBooks.map(book => {
    const borrowCount = borrows.filter(b => b.book_id === book.book_id).length;
    return {
      ...book,
      popularity_score: borrowCount
    };
  });
  
  // Sorting
  if (sort_by) {
    const sortField = sort_by.toLowerCase();
    const sortDirection = (sort_order && sort_order.toLowerCase() === 'desc') ? -1 : 1;
    
    filteredBooks.sort((a, b) => {
      if (sortField === 'popularity') {
        return sortDirection * (a.popularity_score - b.popularity_score);
      } else if (sortField === 'rating') {
        return sortDirection * (a.rating - b.rating);
      } else if (sortField === 'title') {
        return sortDirection * a.title.localeCompare(b.title);
      } else if (sortField === 'author') {
        return sortDirection * a.author.localeCompare(b.author);
      } else if (sortField === 'published_date') {
        const dateA = a.published_date ? new Date(a.published_date) : new Date(0);
        const dateB = b.published_date ? new Date(b.published_date) : new Date(0);
        return sortDirection * (dateA - dateB);
      }
      return 0;
    });
  }
  
  // Additional analytics if requested
  if (include_analytics === 'true') {
    // Calculate aggregated statistics
    const totalBooks = filteredBooks.length;
    const availableBooks = filteredBooks.filter(b => b.available).length;
    const averageRating = filteredBooks.reduce((sum, book) => sum + book.rating, 0) / totalBooks || 0;
    
    // Add analytics to response
    const analytics = {
      total_count: totalBooks,
      available_count: availableBooks,
      borrowed_count: totalBooks - availableBooks,
      average_rating: averageRating.toFixed(2)
    };
    
    // Add borrowing trends if requested
    if (borrowing_trends === 'true') {
      // Get monthly borrowing data for the past 6 months
      const today = new Date();
      const sixMonthsAgo = new Date(today.setMonth(today.getMonth() - 6));
      
      const recentBorrows = borrows.filter(b => new Date(b.borrow_date) >= sixMonthsAgo);
      
      // Group by month
      const borrowingTrends = {};
      recentBorrows.forEach(borrow => {
        const month = borrow.borrow_date.substring(0, 7); // YYYY-MM
        borrowingTrends[month] = (borrowingTrends[month] || 0) + 1;
      });
      
      analytics.borrowing_trends = borrowingTrends;
    }
    
    // Pagination
    const pageNum = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;
    const startIndex = (pageNum - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedBooks = filteredBooks.slice(startIndex, endIndex);
    
    // Return results with analytics
    return res.json({
      books: paginatedBooks,
      analytics: analytics,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total: filteredBooks.length,
        pages: Math.ceil(filteredBooks.length / pageSize)
      }
    });
  } else {
    // Pagination without analytics
    const pageNum = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;
    const startIndex = (pageNum - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedBooks = filteredBooks.slice(startIndex, endIndex);
    
    // Return paginated results
    return res.json({
      books: paginatedBooks,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total: filteredBooks.length,
        pages: Math.ceil(filteredBooks.length / pageSize)
      }
    });
  }
});

// Q14: Complex Book Reservation System
app.post('/api/reservations', (req, res) => {
  const { member_id, book_id, reservation_date, is_premium, priority_reason } = req.body;
  
  // Validate request
  if (!member_id || !book_id || !reservation_date) {
    return res.status(400).json({ error: 'Member ID, book ID, and reservation date are required' });
  }
  
  // Check if member exists
  const member = members.find(m => m.member_id === member_id);
  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }
  
  // Check if book exists
  const book = books.find(b => b.book_id === book_id);
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  
  // Calculate member priority score
  let priorityScore = 0;
  
  // Factor 1: Borrowing frequency
  const memberBorrows = borrows.filter(b => b.member_id === member_id);
  priorityScore += memberBorrows.length;
  
  // Factor 2: Return punctuality
  const lateBorrows = memberBorrows.filter(b => 
    b.returned && 
    new Date(b.actual_return_date) > new Date(b.return_date)
  );
  priorityScore -= lateBorrows.length * 2; // Penalty for late returns
  
  // Factor 3: Premium membership
  if (is_premium) {
    priorityScore += 10;
  }
  
  // Factor 4: Special circumstances
  if (priority_reason) {
    priorityScore += 5;
  }
  
  // Create reservation
  const reservation = {
    reservation_id: reservations.length + 1,
    member_id,
    book_id,
    reservation_date,
    priority_score: priorityScore,
    status: book.available ? 'ready' : 'queued',
    is_premium: is_premium || false,
    priority_reason: priority_reason || '',
    expiration_date: (() => {
      // Set expiration 7 days from reservation date
      const expDate = new Date(reservation_date);
      expDate.setDate(expDate.getDate() + 7);
      return expDate.toISOString().split('T')[0];
    })()
  };
  
  // If book is available, mark it as reserved
  if (book.available) {
    book.available = false;
  }
  
  // Find existing reservations for this book
  const bookReservations = reservations.filter(r => 
    r.book_id === book_id && 
    r.status === 'queued'
  );
  
  // Add to reservations
  reservations.push(reservation);
  
  // Sort the queue based on priority score
  const queue = [...bookReservations, reservation]
    .sort((a, b) => b.priority_score - a.priority_score)
    .map((r, index) => ({
      ...r,
      queue_position: index + 1
    }));
  
  // Update the reservation with queue position
  reservation.queue_position = queue.find(q => q.reservation_id === reservation.reservation_id).queue_position;
  
  // Calculate estimated availability
  if (reservation.status === 'queued') {
    // Assume each borrower keeps the book for 14 days
    const estimatedDays = (reservation.queue_position - 1) * 14;
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);
    reservation.estimated_availability = estimatedDate.toISOString().split('T')[0];
  } else {
    reservation.estimated_availability = reservation.reservation_date;
  }
  
  res.status(201).json(reservation);
});

// Q15: Delete Book
app.delete('/api/books/:book_id', (req, res) => {
  const id = parseInt(req.params.book_id);
  
  // Check if book exists
  const bookIndex = books.findIndex(b => b.book_id === id);
  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }
  
  // Check if book has active borrows
  const hasActiveBorrows = borrows.some(b => b.book_id === id && !b.returned);
  if (hasActiveBorrows) {
    return res.status(400).json({ error: 'Cannot delete book with active borrows' });
  }
  
  // Remove book
  books.splice(bookIndex, 1);
  
  res.json({ message: 'Book deleted successfully' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
