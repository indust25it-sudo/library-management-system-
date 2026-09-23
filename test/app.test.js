import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  getBooks,
  addBook,
  getMembers,
  addMember,
  getIssues,
  issueBook,
  returnBook,
  calculateFine,
  getStats,
  INITIAL_BOOKS,
  INITIAL_MEMBERS,
  INITIAL_ISSUES
} from '../backend/db.js';
import { askLibraryAI } from '../backend/ai.js';

test('Supabase Schema verification', (t) => {
  const schemaPath = path.resolve(process.cwd(), 'supabase', 'schema.sql');
  assert.ok(fs.existsSync(schemaPath), 'schema.sql must exist');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  // Verify all 4 required tables exist in SQL
  assert.match(sql, /CREATE TABLE IF NOT EXISTS books/i, 'books table defined');
  assert.match(sql, /CREATE TABLE IF NOT EXISTS members/i, 'members table defined');
  assert.match(sql, /CREATE TABLE IF NOT EXISTS book_issues/i, 'book_issues table defined');
  assert.match(sql, /CREATE TABLE IF NOT EXISTS fines/i, 'fines table defined');

  // Verify foreign keys and constraints
  assert.match(sql, /REFERENCES books\(id\)/i, 'foreign key to books');
  assert.match(sql, /REFERENCES members\(id\)/i, 'foreign key to members');
  assert.match(sql, /UNIQUE/i, 'member_id unique constraint');
});

test('Data Migration integrity', (t) => {
  // Check that all initial records from the original UI are preserved
  assert.strictEqual(INITIAL_BOOKS.length, 5, 'All original books preserved');
  assert.ok(INITIAL_BOOKS.some(b => b.title === 'The Great Gatsby'), 'The Great Gatsby preserved');
  assert.ok(INITIAL_BOOKS.some(b => b.title === 'Atomic Habits'), 'Atomic Habits preserved');
  assert.ok(INITIAL_BOOKS.some(b => b.title === 'Clean Code'), 'Clean Code preserved');

  assert.strictEqual(INITIAL_MEMBERS.length, 3, 'All original members preserved');
  assert.ok(INITIAL_MEMBERS.some(m => m.member_id === 'LIB001'), 'Rahul Kumar LIB001 preserved');
  assert.ok(INITIAL_MEMBERS.some(m => m.member_id === 'LIB002'), 'Priya S LIB002 preserved');
  assert.ok(INITIAL_MEMBERS.some(m => m.member_id === 'LIB003'), 'Arjun R LIB003 preserved');

  assert.strictEqual(INITIAL_ISSUES.length, 3, 'All original issues preserved');
});

test('SRS FR-01: Book Management', async (t) => {
  const books = await getBooks();
  assert.ok(Array.isArray(books), 'books should be an array');
  assert.ok(books.length >= 5, 'books should have at least initial 5 items');

  // Add new book
  const newBook = await addBook({
    title: 'The Pragmatic Programmer',
    author: 'David Thomas',
    category: 'Software Engineering',
    copies: 6
  });

  assert.ok(newBook.id, 'new book has ID');
  assert.strictEqual(newBook.title, 'The Pragmatic Programmer');
  assert.strictEqual(newBook.status, 'available');

  // Query search
  const found = await getBooks('Pragmatic');
  assert.ok(found.some(b => b.title === 'The Pragmatic Programmer'), 'Search finds added book');
});

test('SRS FR-04: Student Member Management', async (t) => {
  const members = await getMembers();
  assert.ok(Array.isArray(members), 'members should be an array');
  assert.ok(members.length >= 3, 'should contain existing members');

  // Add new member
  const newMember = await addMember({
    name: 'Ananya Sharma',
    member_id: 'LIB004',
    department: 'Data Science',
    email: 'ananya@student.edu'
  });

  assert.ok(newMember.id, 'new member has ID');
  assert.strictEqual(newMember.member_id, 'LIB004');
  assert.strictEqual(newMember.status, 'active');

  const searchMember = await getMembers('LIB004');
  assert.strictEqual(searchMember.length, 1);
  assert.strictEqual(searchMember[0].name, 'Ananya Sharma');
});

test('SRS FR-02 & FR-05: Issue Book and Due Date Tracking', async (t) => {
  const initialIssues = await getIssues();
  const countBefore = initialIssues.length;

  const issue = await issueBook({
    book_id: 1,
    book_title: 'The Great Gatsby',
    member_id: 1,
    member_name: 'Rahul Kumar',
    issue_date: '2026-09-21',
    due_date: '2026-10-05'
  });

  assert.ok(issue.id, 'Issue record created');
  assert.strictEqual(issue.status, 'active');

  const issuesAfter = await getIssues();
  assert.strictEqual(issuesAfter.length, countBefore + 1, 'Issue list increased');

  // Verify book status became issued
  const books = await getBooks();
  const issuedBook = books.find(b => b.title === 'The Great Gatsby');
  assert.strictEqual(issuedBook?.status, 'issued');
});

test('SRS FR-03: Return Book', async (t) => {
  const result = await returnBook({
    book_title: 'The Great Gatsby',
    return_date: '2026-09-22'
  });

  assert.ok(result.success, 'Return succeeded');

  // Book should be available again
  const books = await getBooks();
  const returnedBook = books.find(b => b.title === 'The Great Gatsby');
  assert.strictEqual(returnedBook?.status, 'available');
});

test('SRS FR-06: Fine Calculation', async (t) => {
  const fine = await calculateFine({
    overdue_days: 10,
    fine_per_day: 5
  });

  assert.strictEqual(fine.overdue_days, 10);
  assert.strictEqual(fine.fine_per_day, 5);
  assert.strictEqual(fine.total_fine, 50, '10 days * 5 rate = 50');
  assert.strictEqual(fine.formatted, '₹50');
});

test('System Stats and Diagnostics', async (t) => {
  const stats = await getStats();
  assert.ok(typeof stats.totalBooks === 'number', 'totalBooks is a number');
  assert.ok(typeof stats.issuedBooks === 'number', 'issuedBooks is a number');
  assert.ok(typeof stats.studentMembers === 'number', 'studentMembers is a number');
  assert.ok(typeof stats.isSupabaseConnected === 'boolean', 'isSupabaseConnected is boolean');
  assert.ok(typeof stats.databaseMode === 'string', 'databaseMode is descriptive string');
});

test('AI Feature: Grounded Library Assistant Query Handling', async (t) => {
  // Test 1: Overdue Query
  const overdueRes = await askLibraryAI('Which books are overdue?');
  assert.ok(overdueRes, 'Overdue query returns a response');
  assert.ok(typeof overdueRes.reply === 'string', 'Reply is string');
  assert.ok(overdueRes.reply.length > 10, 'Reply is informative');
  assert.ok(overdueRes.liveDataIncluded, 'Live data snapshot is included');
  assert.ok(typeof overdueRes.liveDataIncluded.totalBooks === 'number');

  // Test 2: Book Availability Query
  const bookRes = await askLibraryAI('Is Clean Code available?');
  assert.ok(bookRes.reply.includes('Clean Code'), 'Reply mentions the queried book');

  // Test 3: Member Query
  const memberRes = await askLibraryAI('Tell me about Rahul Kumar');
  assert.ok(memberRes.reply.includes('Rahul Kumar') || memberRes.reply.includes('LIB001'), 'Reply mentions member name or ID');

  // Test 4: Management Summary Query
  const summaryRes = await askLibraryAI('Give me an overview summary report of the library');
  assert.ok(summaryRes.reply.includes('LibraX') || summaryRes.reply.includes('Books') || summaryRes.reply.includes('Titles'), 'Summary contains operational overview');

  // Test 5: Validation for empty input
  await assert.rejects(
    async () => {
      await askLibraryAI('');
    },
    /Message cannot be empty/,
    'Empty message must be rejected'
  );
});

test('Production Health Check and PWA Asset Verification', (t) => {
  // Check PWA assets exist
  const manifestPath = path.resolve(process.cwd(), 'frontend', 'manifest.webmanifest');
  assert.ok(fs.existsSync(manifestPath), 'manifest.webmanifest exists');

  const swPath = path.resolve(process.cwd(), 'frontend', 'sw.js');
  assert.ok(fs.existsSync(swPath), 'sw.js exists');

  const icon192 = path.resolve(process.cwd(), 'frontend', 'icons', 'icon-192.png');
  assert.ok(fs.existsSync(icon192), 'icon-192.png exists');

  const icon512 = path.resolve(process.cwd(), 'frontend', 'icons', 'icon-512.png');
  assert.ok(fs.existsSync(icon512), 'icon-512.png exists');

  const iconMaskable = path.resolve(process.cwd(), 'frontend', 'icons', 'icon-maskable-512.png');
  assert.ok(fs.existsSync(iconMaskable), 'icon-maskable-512.png exists');

  // Verify manifest contents
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.strictEqual(manifest.display, 'standalone');
  assert.strictEqual(manifest.short_name, 'LibraX');
  assert.ok(manifest.icons.length >= 3);
});


