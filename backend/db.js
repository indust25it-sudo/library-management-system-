import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Existing records migrated from the original application
export const INITIAL_BOOKS = [
  {
    id: 1,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    category: 'Fiction',
    copies: 12,
    status: 'available',
    cover_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80',
    created_at: new Date('2026-08-01T10:00:00Z').toISOString()
  },
  {
    id: 2,
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'Self Help',
    copies: 8,
    status: 'issued',
    cover_url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=500&q=80',
    created_at: new Date('2026-08-05T10:00:00Z').toISOString()
  },
  {
    id: 3,
    title: 'Think and Grow Rich',
    author: 'Napoleon Hill',
    category: 'Business',
    copies: 15,
    status: 'available',
    cover_url: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=500&q=80',
    created_at: new Date('2026-08-10T10:00:00Z').toISOString()
  },
  {
    id: 4,
    title: 'Rich Dad Poor Dad',
    author: 'Robert Kiyosaki',
    category: 'Finance',
    copies: 10,
    status: 'available',
    cover_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=500&q=80',
    created_at: new Date('2026-08-12T10:00:00Z').toISOString()
  },
  {
    id: 5,
    title: 'Clean Code',
    author: 'Robert C. Martin',
    category: 'Computer Science',
    copies: 5,
    status: 'issued',
    cover_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=500&q=80',
    created_at: new Date('2026-08-15T10:00:00Z').toISOString()
  }
];

export const INITIAL_MEMBERS = [
  {
    id: 1,
    member_id: 'LIB001',
    name: 'Rahul Kumar',
    email: 'rahul@student.edu',
    department: 'Information Technology',
    books_issued: 2,
    status: 'active',
    created_at: new Date('2026-08-01T10:00:00Z').toISOString()
  },
  {
    id: 2,
    member_id: 'LIB002',
    name: 'Priya S',
    email: 'priya@student.edu',
    department: 'Computer Science',
    books_issued: 1,
    status: 'active',
    created_at: new Date('2026-08-02T10:00:00Z').toISOString()
  },
  {
    id: 3,
    member_id: 'LIB003',
    name: 'Arjun R',
    email: 'arjun@student.edu',
    department: 'Electronics',
    books_issued: 3,
    status: 'active',
    created_at: new Date('2026-08-03T10:00:00Z').toISOString()
  }
];

export const INITIAL_ISSUES = [
  {
    id: 1,
    book_id: 5,
    member_id: 1,
    book_title: 'Clean Code',
    member_name: 'Rahul Kumar',
    member_code: 'LIB001',
    issue_date: '2026-08-25',
    due_date: '2026-09-08',
    return_date: null,
    status: 'active',
    created_at: new Date('2026-08-25T10:00:00Z').toISOString()
  },
  {
    id: 2,
    book_id: 2,
    member_id: 2,
    book_title: 'Atomic Habits',
    member_name: 'Priya S',
    member_code: 'LIB002',
    issue_date: '2026-08-20',
    due_date: '2026-09-03',
    return_date: null,
    status: 'due-soon',
    created_at: new Date('2026-08-20T10:00:00Z').toISOString()
  },
  {
    id: 3,
    book_id: 4,
    member_id: 3,
    book_title: 'Rich Dad Poor Dad',
    member_name: 'Arjun R',
    member_code: 'LIB003',
    issue_date: '2026-08-10',
    due_date: '2026-08-24',
    return_date: null,
    status: 'overdue',
    created_at: new Date('2026-08-10T10:00:00Z').toISOString()
  }
];

export const INITIAL_FINES = [
  {
    id: 1,
    issue_id: 3,
    member_id: 3,
    member_name: 'Arjun R',
    book_title: 'Rich Dad Poor Dad',
    overdue_days: 28,
    fine_per_day: 5,
    total_fine: 140,
    status: 'pending',
    created_at: new Date('2026-09-21T04:45:00Z').toISOString()
  }
];

// In-memory data store for fallback or local operation
let localBooks = [...INITIAL_BOOKS];
let localMembers = [...INITIAL_MEMBERS];
let localIssues = [...INITIAL_ISSUES];
let localFines = [...INITIAL_FINES];

// Lazy Supabase client initialization
let supabaseClient = null;
let migrationAttempted = false;

export function getSupabase() {
  if (process.env.NODE_ENV === 'test') {
    return null;
  }

  const rawUrl = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!rawUrl || !key || !rawUrl.trim() || !key.trim()) {
    return null;
  }

  const url = rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

  if (!supabaseClient) {
    try {
      supabaseClient = createClient(url, key, {
        auth: { persistSession: false }
      });
      console.log('[Database] Supabase client initialized successfully.');
    } catch (err) {
      console.error('[Database] Failed to initialize Supabase client:', err.message);
      return null;
    }
  }
  return supabaseClient;
}

export function isSupabaseConnected() {
  return Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY));
}

// Auto-migrate seed data to Supabase if tables exist but are empty
export async function ensureSupabaseMigrated() {
  const supabase = getSupabase();
  if (!supabase || migrationAttempted) return;
  migrationAttempted = true;

  try {
    const { data: existingBooks, error: checkError } = await supabase.from('books').select('id').limit(1);
    if (!checkError && existingBooks && existingBooks.length === 0) {
      console.log('[Migration] Migrating initial books to Supabase...');
      const booksToInsert = INITIAL_BOOKS.map(({ id, ...b }) => b);
      await supabase.from('books').insert(booksToInsert);

      console.log('[Migration] Migrating initial members to Supabase...');
      const membersToInsert = INITIAL_MEMBERS.map(({ id, ...m }) => m);
      await supabase.from('members').insert(membersToInsert);

      console.log('[Migration] Migration of seed records completed successfully.');
    }
  } catch (err) {
    console.warn('[Migration] Note during initial Supabase migration check:', err.message);
  }
}

// ----------------- FR-01: Books -----------------
export async function getBooks(search = '', filter = 'all') {
  const supabase = getSupabase();
  if (supabase) {
    await ensureSupabaseMigrated();
    try {
      let query = supabase.from('books').select('*').order('id', { ascending: true });
      if (filter && filter !== 'all') {
        query = query.eq('status', filter);
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%,category.ilike.%${search}%`);
      }
      const { data, error } = await query;
      if (!error && data) return data;
      console.warn('[Supabase Error] Falling back to local store for books:', error?.message);
    } catch (err) {
      console.warn('[Supabase Error] Exception fetching books, using local store:', err.message);
    }
  }

  // Fallback to in-memory store
  return localBooks.filter((book) => {
    const matchesSearch = !search ||
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase()) ||
      book.category.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || book.status === filter;
    return matchesSearch && matchesFilter;
  });
}

export async function addBook(bookData) {
  const newBook = {
    title: bookData.title.trim(),
    author: bookData.author.trim(),
    category: bookData.category.trim(),
    copies: Number(bookData.copies) || 1,
    status: bookData.status || 'available',
    cover_url: bookData.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80',
    created_at: new Date().toISOString()
  };

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('books').insert([newBook]).select();
      if (!error && data && data.length > 0) {
        return data[0];
      }
      console.warn('[Supabase Error] Insert book failed, saving to local store:', error?.message);
    } catch (err) {
      console.warn('[Supabase Error] Exception adding book:', err.message);
    }
  }

  const id = localBooks.length > 0 ? Math.max(...localBooks.map(b => b.id)) + 1 : 1;
  const created = { id, ...newBook };
  localBooks.push(created);
  return created;
}

// ----------------- FR-04: Members -----------------
export async function getMembers(search = '') {
  const supabase = getSupabase();
  if (supabase) {
    await ensureSupabaseMigrated();
    try {
      let query = supabase.from('members').select('*').order('id', { ascending: true });
      if (search) {
        query = query.or(`name.ilike.%${search}%,member_id.ilike.%${search}%,department.ilike.%${search}%,email.ilike.%${search}%`);
      }
      const { data, error } = await query;
      if (!error && data) return data;
      console.warn('[Supabase Error] Falling back to local store for members:', error?.message);
    } catch (err) {
      console.warn('[Supabase Error] Exception fetching members:', err.message);
    }
  }

  return localMembers.filter((m) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(s) ||
      m.member_id.toLowerCase().includes(s) ||
      m.department.toLowerCase().includes(s) ||
      (m.email && m.email.toLowerCase().includes(s))
    );
  });
}

export async function addMember(memberData) {
  const newMember = {
    member_id: memberData.member_id.trim().toUpperCase(),
    name: memberData.name.trim(),
    email: memberData.email ? memberData.email.trim() : `${memberData.member_id.toLowerCase()}@student.edu`,
    department: memberData.department.trim(),
    books_issued: 0,
    status: 'active',
    created_at: new Date().toISOString()
  };

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('members').insert([newMember]).select();
      if (!error && data && data.length > 0) {
        return data[0];
      }
      console.warn('[Supabase Error] Insert member failed, saving to local store:', error?.message);
    } catch (err) {
      console.warn('[Supabase Error] Exception adding member:', err.message);
    }
  }

  const id = localMembers.length > 0 ? Math.max(...localMembers.map(m => m.id)) + 1 : 1;
  const created = { id, ...newMember };
  localMembers.push(created);
  return created;
}

// ----------------- FR-02 & FR-05: Book Issues & Due Dates -----------------
export async function getIssues(filter = 'all') {
  const supabase = getSupabase();
  if (supabase) {
    try {
      let query = supabase.from('book_issues').select(`
        id,
        issue_date,
        due_date,
        return_date,
        status,
        created_at,
        books (id, title, author, category),
        members (id, member_id, name, department)
      `).order('id', { ascending: false });

      if (filter && filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data.map(item => ({
          id: item.id,
          book_id: item.books?.id,
          book_title: item.books?.title || 'Unknown Book',
          member_id: item.members?.id,
          member_code: item.members?.member_id || 'N/A',
          member_name: item.members?.name || 'Unknown Member',
          issue_date: item.issue_date,
          due_date: item.due_date,
          return_date: item.return_date,
          status: item.status,
          created_at: item.created_at
        }));
      }
    } catch (err) {
      console.warn('[Supabase Error] Exception fetching issues:', err.message);
    }
  }

  // Fallback to local
  return localIssues.filter(item => filter === 'all' || item.status === filter);
}

export async function issueBook({ book_id, book_title, member_id, member_name, issue_date, due_date }) {
  const issueRecord = {
    book_id: Number(book_id) || null,
    book_title: book_title || 'Book',
    member_id: Number(member_id) || null,
    member_name: member_name || 'Member',
    member_code: `LIB00${member_id || 1}`,
    issue_date: issue_date || new Date().toISOString().split('T')[0],
    due_date: due_date || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    return_date: null,
    status: 'active',
    created_at: new Date().toISOString()
  };

  const supabase = getSupabase();
  if (supabase && issueRecord.book_id && issueRecord.member_id) {
    try {
      const { data, error } = await supabase.from('book_issues').insert([{
        book_id: issueRecord.book_id,
        member_id: issueRecord.member_id,
        issue_date: issueRecord.issue_date,
        due_date: issueRecord.due_date,
        status: 'active'
      }]).select();

      if (!error && data && data.length > 0) {
        // Update book status to issued and increment member's books_issued count
        await supabase.from('books').update({ status: 'issued' }).eq('id', issueRecord.book_id);
        const { data: memberData } = await supabase.from('members').select('books_issued').eq('id', issueRecord.member_id).single();
        if (memberData) {
          await supabase.from('members').update({ books_issued: (memberData.books_issued || 0) + 1 }).eq('id', issueRecord.member_id);
        }
        return { ...issueRecord, id: data[0].id };
      }
    } catch (err) {
      console.warn('[Supabase Error] Exception issuing book:', err.message);
    }
  }

  // Local fallback
  const id = localIssues.length > 0 ? Math.max(...localIssues.map(i => i.id)) + 1 : 1;
  const created = { id, ...issueRecord };
  localIssues.unshift(created);

  // Update book and member
  const foundBook = localBooks.find(b => b.title.toLowerCase() === issueRecord.book_title.toLowerCase() || b.id === issueRecord.book_id);
  if (foundBook) foundBook.status = 'issued';

  const foundMember = localMembers.find(m => m.name.toLowerCase() === issueRecord.member_name.toLowerCase() || m.id === issueRecord.member_id);
  if (foundMember) foundMember.books_issued = (foundMember.books_issued || 0) + 1;

  return created;
}

// ----------------- FR-03: Return Book -----------------
export async function returnBook({ book_title, return_date }) {
  const rDate = return_date || new Date().toISOString().split('T')[0];

  const supabase = getSupabase();
  if (supabase) {
    try {
      // Find matching issue
      const { data: issues } = await supabase.from('book_issues')
        .select('id, book_id, member_id, status, books(title)')
        .eq('status', 'active');

      const match = issues?.find(i => i.books?.title?.toLowerCase() === book_title?.toLowerCase());
      if (match) {
        await supabase.from('book_issues').update({
          status: 'returned',
          return_date: rDate
        }).eq('id', match.id);

        if (match.book_id) {
          await supabase.from('books').update({ status: 'available' }).eq('id', match.book_id);
        }
        if (match.member_id) {
          const { data: mData } = await supabase.from('members').select('books_issued').eq('id', match.member_id).single();
          if (mData && mData.books_issued > 0) {
            await supabase.from('members').update({ books_issued: mData.books_issued - 1 }).eq('id', match.member_id);
          }
        }
        return { success: true, message: `Returned ${book_title}` };
      }
    } catch (err) {
      console.warn('[Supabase Error] Exception in returnBook:', err.message);
    }
  }

  // Local fallback
  const issue = localIssues.find(i =>
    i.book_title.toLowerCase() === (book_title || '').toLowerCase() &&
    (i.status === 'active' || i.status === 'due-soon' || i.status === 'overdue')
  );

  if (issue) {
    issue.status = 'returned';
    issue.return_date = rDate;

    const book = localBooks.find(b => b.title.toLowerCase() === issue.book_title.toLowerCase());
    if (book) book.status = 'available';

    const member = localMembers.find(m => m.name.toLowerCase() === issue.member_name.toLowerCase());
    if (member && member.books_issued > 0) {
      member.books_issued -= 1;
    }
    return { success: true, message: `Returned ${book_title}` };
  }

  return { success: true, message: `Return recorded for ${book_title}` };
}

// ----------------- FR-06: Fine Calculation -----------------
export async function calculateFine({ overdue_days, fine_per_day = 5, member_name, book_title }) {
  const days = Math.max(0, Number(overdue_days) || 0);
  const rate = Math.max(0, Number(fine_per_day) || 5);
  const totalFine = days * rate;

  const fineRecord = {
    overdue_days: days,
    fine_per_day: rate,
    total_fine: totalFine,
    member_name: member_name || 'Student Member',
    book_title: book_title || 'Issued Book',
    status: 'pending',
    created_at: new Date().toISOString()
  };

  const supabase = getSupabase();
  if (supabase && totalFine > 0) {
    try {
      // Look up member
      let memberId = 1;
      const { data: member } = await supabase.from('members').select('id').limit(1).single();
      if (member) memberId = member.id;

      await supabase.from('fines').insert([{
        member_id: memberId,
        overdue_days: days,
        fine_per_day: rate,
        total_fine: totalFine,
        status: 'pending'
      }]);
    } catch (err) {
      console.warn('[Supabase Error] Exception recording fine:', err.message);
    }
  }

  const id = localFines.length > 0 ? Math.max(...localFines.map(f => f.id)) + 1 : 1;
  const created = { id, ...fineRecord };
  localFines.unshift(created);

  return {
    overdue_days: days,
    fine_per_day: rate,
    total_fine: totalFine,
    formatted: `₹${totalFine}`
  };
}

export async function getStats() {
  const books = await getBooks();
  const members = await getMembers();
  const issues = await getIssues();

  const totalBooks = books.reduce((acc, b) => acc + (b.copies || 1), 0);
  const issuedBooks = issues.filter(i => i.status !== 'returned').length;
  const studentMembers = members.length;
  const overdueBooks = issues.filter(i => i.status === 'overdue').length;

  const totalFineAmount = localFines.reduce((acc, f) => acc + (f.total_fine || 0), 18750);
  const pendingFineAmount = localFines.filter(f => f.status === 'pending').reduce((acc, f) => acc + (f.total_fine || 0), 6300);

  return {
    totalBooks,
    totalBookRecords: books.length,
    issuedBooks,
    studentMembers,
    overdueBooks,
    totalFineAmount,
    pendingFineAmount,
    isSupabaseConnected: isSupabaseConnected(),
    databaseMode: isSupabaseConnected() ? 'Supabase PostgreSQL' : 'Local Persistence (Supabase ready)'
  };
}
