#!/bin/bash

API_URL="http://localhost:8000"

echo "Testing Library Management API..."
echo "=================================="

# Test 1: Create a member
echo "Test 1: Creating a member"
curl -X POST "$API_URL/api/members" \
  -H "Content-Type: application/json" \
  -d '{"member_id": 1, "name": "Alice", "age": 22}'
echo -e "\n"

# Test 2: Create a book
echo "Test 2: Creating a book"
curl -X POST "$API_URL/api/books" \
  -H "Content-Type: application/json" \
  -d '{"book_id": 1, "title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "categories": ["fiction", "classic"], "published_date": "1925-04-10", "rating": 4.5}'
echo -e "\n"

# Test 3: Borrow a book
echo "Test 3: Borrowing a book"
curl -X POST "$API_URL/api/borrow" \
  -H "Content-Type: application/json" \
  -d '{"member_id": 1, "book_id": 1, "borrow_date": "2023-09-15", "return_date": "2023-09-29"}'
echo -e "\n"

# Test 4: Get all borrowed books
echo "Test 4: Getting all borrowed books"
curl -X GET "$API_URL/api/borrowed"
echo -e "\n"

# Test 5: Return a book
echo "Test 5: Returning a book"
curl -X POST "$API_URL/api/return" \
  -H "Content-Type: application/json" \
  -d '{"member_id": 1, "book_id": 1, "return_date": "2023-09-20"}'
echo -e "\n"

# Test 6: Get member history
echo "Test 6: Getting member borrow history"
curl -X GET "$API_URL/api/members/1/history"
echo -e "\n"

echo "=================================="
echo "API Testing Complete"
