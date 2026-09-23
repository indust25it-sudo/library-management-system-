/* =====================================================
   LIBRARY MANAGEMENT SYSTEM
   FRONTEND JAVASCRIPT WITH SUPABASE / API INTEGRATION
   Source of Truth: SRS (FR-01 to FR-06)
===================================================== */

/* ================= DOM ELEMENTS ================= */
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
const mobileNavBtns = document.querySelectorAll(".mobile-nav-btn");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".page-section");
const themeToggle = document.getElementById("themeToggle");

const toastMessage = document.getElementById("toastMessage");
const toastText = document.getElementById("toastText");

// Modals
const bookModal = document.getElementById("bookModal");
const memberModal = document.getElementById("memberModal");
const bookForm = document.getElementById("bookForm");
const memberForm = document.getElementById("memberForm");
const issueForm = document.getElementById("issueForm");

// Inputs & Selects
const bookSearch = document.getElementById("bookSearch");
const bookFilter = document.getElementById("bookFilter");
const memberSearch = document.getElementById("memberSearch");
const globalSearch = document.getElementById("globalSearch");
const issueDate = document.getElementById("issueDate");
const dueDate = document.getElementById("dueDate");
const returnDate = document.getElementById("returnDate");
const returnBookSelect = document.getElementById("returnBookSelect");
const issueMemberSelect = document.getElementById("issueMemberSelect");
const issueBookSelect = document.getElementById("issueBookSelect");
const dueDateFilter = document.getElementById("dueDateFilter");

// Grids & Tables
const booksGrid = document.getElementById("booksGrid");
const memberTable = document.getElementById("memberTable");
const dueDatesTableBody = document.getElementById("dueDatesTableBody");
const recentIssuesList = document.getElementById("recentIssuesList");

// Stats Elements
const statTotalBooks = document.getElementById("statTotalBooks");
const statIssuedBooks = document.getElementById("statIssuedBooks");
const statStudentMembers = document.getElementById("statStudentMembers");
const statOverdueBooks = document.getElementById("statOverdueBooks");
const dbStatusText = document.getElementById("dbStatusText");

// PWA Elements
const pwaInstallBtn = document.getElementById("pwaInstallBtn");
const sidebarInstallBtn = document.getElementById("sidebarInstallBtn");
const sidebarPwaArea = document.getElementById("sidebarPwaArea");
const offlineIndicator = document.getElementById("offlineIndicator");
const dismissOfflineBtn = document.getElementById("dismissOfflineBtn");
const iosInstallModal = document.getElementById("iosInstallModal");
const iosModalCloseBtn = document.getElementById("iosModalCloseBtn");
const iosGuideOkBtn = document.getElementById("iosGuideOkBtn");

/* ================= SIDEBAR & MOBILE DRAWER ================= */
if (menuToggle) {
    menuToggle.addEventListener("click", () => {
        const isOpen = sidebar.classList.toggle("show");
        if (sidebarOverlay) {
            sidebarOverlay.classList.toggle("show", isOpen);
        }
    });
}

if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener("click", () => {
        if (sidebar) sidebar.classList.remove("show");
        if (sidebarOverlay) sidebarOverlay.classList.remove("show");
    });
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", () => {
        if (sidebar) sidebar.classList.remove("show");
        sidebarOverlay.classList.remove("show");
    });
}

/* ================= NAVIGATION ================= */
navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        const sectionId = link.dataset.section;
        showSection(sectionId);
    });
});

if (mobileNavBtns && mobileNavBtns.length > 0) {
    mobileNavBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            const sectionId = btn.dataset.section;
            showSection(sectionId);
        });
    });
}

function showSection(sectionId) {
    sections.forEach((section) => {
        section.classList.remove("active-section");
    });

    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add("active-section");
    }

    navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.dataset.section === sectionId) {
            link.classList.add("active");
        }
    });

    if (mobileNavBtns && mobileNavBtns.length > 0) {
        mobileNavBtns.forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.section === sectionId);
        });
    }

    if (sidebar) {
        sidebar.classList.remove("show");
    }
    if (sidebarOverlay) {
        sidebarOverlay.classList.remove("show");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

/* ================= DARK MODE ================= */
if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const icon = themeToggle.querySelector("i");
        if (document.body.classList.contains("dark-mode")) {
            icon.classList.remove("fa-moon");
            icon.classList.add("fa-sun");
            showToast("Dark mode enabled");
        } else {
            icon.classList.remove("fa-sun");
            icon.classList.add("fa-moon");
            showToast("Light mode enabled");
        }
    });
}

/* ================= TOAST ================= */
let toastTimer;
function showToast(message) {
    if (!toastText || !toastMessage) return;
    toastText.textContent = message;
    toastMessage.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toastMessage.classList.remove("show");
    }, 2500);
}

/* ================= MODAL CONTROLS ================= */
function openBookModal() {
    if (bookModal) bookModal.classList.add("show");
}

function closeBookModal() {
    if (bookModal) bookModal.classList.remove("show");
}

function openMemberModal() {
    if (memberModal) memberModal.classList.add("show");
}

function closeMemberModal() {
    if (memberModal) memberModal.classList.remove("show");
}

document.addEventListener("click", (event) => {
    if (event.target === bookModal) closeBookModal();
    if (event.target === memberModal) closeMemberModal();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeBookModal();
        closeMemberModal();
    }
});

/* ================= DATA SYNCHRONIZATION WITH BACKEND ================= */

// Cached data
let currentBooks = [];
let currentMembers = [];
let currentIssues = [];

// Fetch Stats & Database Status
async function loadStats() {
    try {
        const res = await fetch("/api/stats");
        if (res.ok) {
            const data = await res.json();
            if (statTotalBooks) statTotalBooks.textContent = data.totalBooks?.toLocaleString() || "0";
            if (statIssuedBooks) statIssuedBooks.textContent = data.issuedBooks?.toLocaleString() || "0";
            if (statStudentMembers) statStudentMembers.textContent = data.studentMembers?.toLocaleString() || "0";
            if (statOverdueBooks) statOverdueBooks.textContent = data.overdueBooks?.toLocaleString() || "0";
            if (dbStatusText) {
                dbStatusText.textContent = data.isSupabaseConnected ? "Supabase PostgreSQL" : "Local (Supabase Ready)";
            }

            // Update AI Grounding Panel Counters
            const aiGroundedBooks = document.getElementById("aiGroundedBooks");
            const aiGroundedIssues = document.getElementById("aiGroundedIssues");
            const aiGroundedOverdue = document.getElementById("aiGroundedOverdue");
            const aiGroundedMembers = document.getElementById("aiGroundedMembers");
            if (aiGroundedBooks) aiGroundedBooks.textContent = data.totalBookRecords || (currentBooks ? currentBooks.length : 5);
            if (aiGroundedIssues) aiGroundedIssues.textContent = data.issuedBooks || 0;
            if (aiGroundedOverdue) aiGroundedOverdue.textContent = data.overdueBooks || 0;
            if (aiGroundedMembers) aiGroundedMembers.textContent = data.studentMembers || 0;
        }
    } catch (err) {
        console.warn("Could not load stats from API:", err);
    }
}

// FR-01: Books Management
async function loadBooks() {
    const search = bookSearch ? bookSearch.value.trim() : "";
    const filter = bookFilter ? bookFilter.value : "all";

    try {
        const res = await fetch(`/api/books?search=${encodeURIComponent(search)}&filter=${encodeURIComponent(filter)}`);
        if (res.ok) {
            currentBooks = await res.json();
            renderBooks(currentBooks);
            updateBookDropdowns(currentBooks);
        }
    } catch (err) {
        console.warn("Error fetching books:", err);
    }
}

function renderBooks(books) {
    if (!booksGrid) return;
    if (books.length === 0) {
        booksGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--muted);">
                <i class="fa-solid fa-book-open" style="font-size: 36px; margin-bottom: 12px; display: block;"></i>
                <p>No books found matching your criteria.</p>
            </div>
        `;
        return;
    }

    booksGrid.innerHTML = books.map((book) => `
        <article class="book-card" data-status="${book.status}">
            <div class="book-cover">
                <img src="${book.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80'}" alt="${escapeHtml(book.title)}">
                <span class="${book.status === 'available' ? 'available-badge' : 'issued-badge'}">
                    ${book.status === 'available' ? 'Available' : 'Issued'}
                </span>
            </div>
            <div class="book-details">
                <h3>${escapeHtml(book.title)}</h3>
                <p>${escapeHtml(book.author)}</p>
                <div class="book-meta">
                    <span>${escapeHtml(book.category)}</span>
                    <strong>${book.copies} Copies</strong>
                </div>
                <button onclick="showToast('Selected: ${escapeHtml(book.title)}')">
                    View Book
                </button>
            </div>
        </article>
    `).join("");
}

function updateBookDropdowns(books) {
    // Populate issueBookSelect
    if (issueBookSelect) {
        const currentVal = issueBookSelect.value;
        issueBookSelect.innerHTML = '<option value="">Select book</option>' +
            books.map(b => `<option value="${b.id}" data-title="${escapeHtml(b.title)}">${escapeHtml(b.title)} (${b.status})</option>`).join("");
        if (currentVal) issueBookSelect.value = currentVal;
    }

    // Populate returnBookSelect
    if (returnBookSelect) {
        const issuedBooks = books.filter(b => b.status === 'issued');
        const currentVal = returnBookSelect.value;
        returnBookSelect.innerHTML = '<option value="">Select issued book</option>' +
            books.map(b => `<option value="${escapeHtml(b.title)}">${escapeHtml(b.title)}</option>`).join("");
        if (currentVal) returnBookSelect.value = currentVal;
    }
}

// FR-04: Student Members
async function loadMembers() {
    const search = memberSearch ? memberSearch.value.trim() : "";
    try {
        const res = await fetch(`/api/members?search=${encodeURIComponent(search)}`);
        if (res.ok) {
            currentMembers = await res.json();
            renderMembers(currentMembers);
            updateMemberDropdowns(currentMembers);
        }
    } catch (err) {
        console.warn("Error fetching members:", err);
    }
}

function renderMembers(members) {
    if (!memberTable) return;
    if (members.length === 0) {
        memberTable.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 30px; color: var(--muted);">
                    No member records found.
                </td>
            </tr>
        `;
        return;
    }

    memberTable.innerHTML = members.map((m) => {
        const initials = m.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "ST";
        return `
            <tr>
                <td>
                    <div class="table-user">
                        <div class="mini-avatar">${initials}</div>
                        <div>
                            <strong>${escapeHtml(m.name)}</strong>
                            <small>${escapeHtml(m.email || m.member_id + '@student.edu')}</small>
                        </div>
                    </div>
                </td>
                <td>${escapeHtml(m.member_id)}</td>
                <td>${escapeHtml(m.department)}</td>
                <td>${m.books_issued || 0}</td>
                <td>
                    <span class="status ${m.status === 'active' ? 'active' : 'warning'}">
                        ${escapeHtml(m.status || 'Active')}
                    </span>
                </td>
            </tr>
        `;
    }).join("");
}

function updateMemberDropdowns(members) {
    if (issueMemberSelect) {
        const currentVal = issueMemberSelect.value;
        issueMemberSelect.innerHTML = '<option value="">Select member</option>' +
            members.map(m => `<option value="${m.id}" data-name="${escapeHtml(m.name)}" data-code="${escapeHtml(m.member_id)}">${escapeHtml(m.name)} - ${escapeHtml(m.member_id)}</option>`).join("");
        if (currentVal) issueMemberSelect.value = currentVal;
    }
}

// FR-02, FR-03, FR-05: Issues and Due Dates
async function loadIssues() {
    const filter = dueDateFilter ? dueDateFilter.value : "all";
    try {
        const res = await fetch(`/api/issues?filter=${encodeURIComponent(filter)}`);
        if (res.ok) {
            currentIssues = await res.json();
            renderDueDates(currentIssues);
            renderRecentIssues(currentIssues);
        }
    } catch (err) {
        console.warn("Error fetching issues:", err);
    }
}

function renderDueDates(issues) {
    if (!dueDatesTableBody) return;
    if (issues.length === 0) {
        dueDatesTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 30px; color: var(--muted);">
                    No issue records found.
                </td>
            </tr>
        `;
        return;
    }

    dueDatesTableBody.innerHTML = issues.map((item) => {
        let badgeClass = "active";
        let statusLabel = "Active";
        if (item.status === "overdue") {
            badgeClass = "danger";
            statusLabel = "Overdue";
        } else if (item.status === "due-soon") {
            badgeClass = "warning";
            statusLabel = "Due Soon";
        } else if (item.status === "returned") {
            badgeClass = "active";
            statusLabel = "Returned";
        }

        return `
            <tr>
                <td>${escapeHtml(item.member_name || 'Member')}</td>
                <td>${escapeHtml(item.book_title || 'Book')}</td>
                <td>${formatDate(item.issue_date)}</td>
                <td>${formatDate(item.due_date)}</td>
                <td>
                    <span class="status ${badgeClass}">
                        ${statusLabel}
                    </span>
                </td>
            </tr>
        `;
    }).join("");
}

function renderRecentIssues(issues) {
    if (!recentIssuesList) return;
    const activeRecent = issues.slice(0, 3);
    if (activeRecent.length === 0) {
        recentIssuesList.innerHTML = `<p style="color: var(--muted); padding: 12px;">No recent transactions.</p>`;
        return;
    }

    recentIssuesList.innerHTML = activeRecent.map((item) => {
        const initials = (item.member_name || "ST").split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
        return `
            <div class="issue-item">
                <div class="mini-avatar">${initials}</div>
                <div class="issue-info">
                    <strong>${escapeHtml(item.member_name || 'Student')}</strong>
                    <span>${escapeHtml(item.book_title || 'Book')}</span>
                </div>
                <small>${formatRelativeDate(item.issue_date)}</small>
            </div>
        `;
    }).join("");
}

/* ================= FORM SUBMISSION HANDLERS ================= */

// Add Book (FR-01)
if (bookForm) {
    bookForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const title = document.getElementById("bookTitleInput")?.value || "";
        const author = document.getElementById("bookAuthorInput")?.value || "";
        const category = document.getElementById("bookCategoryInput")?.value || "";
        const copies = document.getElementById("bookCopiesInput")?.value || 1;

        if (!title || !author || !category) {
            showToast("Please fill all required book fields");
            return;
        }

        try {
            const res = await fetch("/api/books", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, author, category, copies: Number(copies) || 1 })
            });

            if (res.ok) {
                closeBookModal();
                bookForm.reset();
                showToast("Book record added to Supabase database");
                await Promise.all([loadBooks(), loadStats()]);
            } else {
                const err = await res.json();
                showToast(err.error || "Failed to add book");
            }
        } catch (err) {
            showToast("Network error while adding book");
        }
    });
}

// Add Member (FR-04)
if (memberForm) {
    memberForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const name = document.getElementById("memberNameInput")?.value || "";
        const member_id = document.getElementById("memberIdInput")?.value || "";
        const department = document.getElementById("memberDeptInput")?.value || "";
        const email = document.getElementById("memberEmailInput")?.value || "";

        if (!name || !member_id || !department) {
            showToast("Please fill all required member fields");
            return;
        }

        try {
            const res = await fetch("/api/members", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, member_id, department, email })
            });

            if (res.ok) {
                closeMemberModal();
                memberForm.reset();
                showToast("Student member added successfully");
                await Promise.all([loadMembers(), loadStats()]);
            } else {
                const err = await res.json();
                showToast(err.error || "Failed to add member");
            }
        } catch (err) {
            showToast("Network error while adding member");
        }
    });
}

// Issue Book (FR-02)
if (issueForm) {
    issueForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const selectedMemberOpt = issueMemberSelect?.selectedOptions[0];
        const selectedBookOpt = issueBookSelect?.selectedOptions[0];

        const member_id = issueMemberSelect?.value;
        const member_name = selectedMemberOpt?.getAttribute("data-name") || selectedMemberOpt?.textContent.split("-")[0].trim();
        const book_id = issueBookSelect?.value;
        const book_title = selectedBookOpt?.getAttribute("data-title") || selectedBookOpt?.textContent.split("(")[0].trim();

        const iDate = issueDate?.value;
        const dDate = dueDate?.value;

        if (!member_id || !book_id) {
            showToast("Please select a student member and a book");
            return;
        }

        try {
            const res = await fetch("/api/issues", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    member_id,
                    member_name,
                    book_id,
                    book_title,
                    issue_date: iDate,
                    due_date: dDate
                })
            });

            if (res.ok) {
                showToast("Book issue recorded successfully in database");
                issueForm.reset();
                setDefaultDates();
                await Promise.all([loadBooks(), loadMembers(), loadIssues(), loadStats()]);
            } else {
                const err = await res.json();
                showToast(err.error || "Failed to issue book");
            }
        } catch (err) {
            showToast("Error recording book issue");
        }
    });
}

// Return Book (FR-03)
async function returnBook() {
    const bookTitle = returnBookSelect ? returnBookSelect.value : "";
    const rDate = returnDate ? returnDate.value : "";

    if (!bookTitle) {
        showToast("Please select an issued book to return");
        return;
    }

    try {
        const res = await fetch("/api/returns", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                book_title: bookTitle,
                return_date: rDate
            })
        });

        if (res.ok) {
            showToast(`Book return recorded for ${bookTitle}`);
            await Promise.all([loadBooks(), loadMembers(), loadIssues(), loadStats()]);
        } else {
            const err = await res.json();
            showToast(err.error || "Failed to record return");
        }
    } catch (err) {
        showToast("Error recording book return");
    }
}
window.returnBook = returnBook;

// Calculate Fine (FR-06)
async function calculateFine() {
    const overdueDays = Number(document.getElementById("overdueDays")?.value);
    const finePerDay = Number(document.getElementById("finePerDay")?.value);

    if (isNaN(overdueDays) || overdueDays < 0 || isNaN(finePerDay) || finePerDay < 0) {
        showToast("Please enter valid positive values for days and rate");
        return;
    }

    try {
        const res = await fetch("/api/fines/calculate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                overdue_days: overdueDays,
                fine_per_day: finePerDay
            })
        });

        if (res.ok) {
            const data = await res.json();
            const fineResult = document.getElementById("fineResult");
            if (fineResult) {
                fineResult.textContent = data.formatted || `₹${data.total_fine}`;
            }
            showToast(`Fine calculated: ${data.formatted || '₹' + data.total_fine}`);
        } else {
            // Local calculation fallback
            const total = overdueDays * finePerDay;
            const fineResult = document.getElementById("fineResult");
            if (fineResult) fineResult.textContent = `₹${total}`;
            showToast("Fine calculated successfully");
        }
    } catch (err) {
        const total = overdueDays * finePerDay;
        const fineResult = document.getElementById("fineResult");
        if (fineResult) fineResult.textContent = `₹${total}`;
        showToast("Fine calculated successfully");
    }
}
window.calculateFine = calculateFine;

/* ================= SEARCH & FILTER LISTENERS ================= */
if (bookSearch) {
    let timeout;
    bookSearch.addEventListener("input", () => {
        clearTimeout(timeout);
        timeout = setTimeout(loadBooks, 200);
    });
}

if (bookFilter) {
    bookFilter.addEventListener("change", loadBooks);
}

if (memberSearch) {
    let timeout;
    memberSearch.addEventListener("input", () => {
        clearTimeout(timeout);
        timeout = setTimeout(loadMembers, 200);
    });
}

if (dueDateFilter) {
    dueDateFilter.addEventListener("change", loadIssues);
}

if (globalSearch) {
    globalSearch.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            const searchText = globalSearch.value.trim();
            if (!searchText) return;
            showSection("books");
            if (bookSearch) {
                bookSearch.value = searchText;
                loadBooks();
            }
        }
    });
}

/* ================= HELPER FUNCTIONS ================= */
function setDefaultDates() {
    const today = new Date();
    if (issueDate) issueDate.value = today.toISOString().split("T")[0];
    if (returnDate) returnDate.value = today.toISOString().split("T")[0];

    if (dueDate) {
        const due = new Date();
        due.setDate(due.getDate() + 14);
        dueDate.value = due.toISOString().split("T")[0];
    }
}

function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatRelativeDate(dateStr) {
    if (!dateStr) return "Recently";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* ================= AI ASSISTANT CONTROLLER ================= */
let aiConversationHistory = [];
let lastFailedPrompt = "";
let isAiGenerating = false;

const quickAiBtn = document.getElementById("quickAiBtn");
if (quickAiBtn) {
    quickAiBtn.addEventListener("click", () => {
        showSection("ai-assistant");
        const input = document.getElementById("aiPromptInput");
        if (input) input.focus();
    });
}

const aiChatForm = document.getElementById("aiChatForm");
const aiPromptInput = document.getElementById("aiPromptInput");
const aiSendBtn = document.getElementById("aiSendBtn");
const aiChatThread = document.getElementById("aiChatThread");
const aiTypingIndicator = document.getElementById("aiTypingIndicator");
const aiErrorBanner = document.getElementById("aiErrorBanner");
const aiErrorText = document.getElementById("aiErrorText");
const aiRetryBtn = document.getElementById("aiRetryBtn");
const aiClearChatBtn = document.getElementById("aiClearChatBtn");

if (aiChatForm) {
    aiChatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const prompt = aiPromptInput ? aiPromptInput.value.trim() : "";
        if (prompt && !isAiGenerating) {
            submitAiPrompt(prompt);
        }
    });
}

document.querySelectorAll(".ai-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
        const prompt = chip.getAttribute("data-prompt");
        if (prompt && !isAiGenerating) {
            if (aiPromptInput) aiPromptInput.value = prompt;
            submitAiPrompt(prompt);
        }
    });
});

if (aiClearChatBtn) {
    aiClearChatBtn.addEventListener("click", () => {
        aiConversationHistory = [];
        if (aiChatThread) {
            aiChatThread.innerHTML = `
                <div class="ai-message ai-message-model">
                    <div class="ai-message-avatar">
                        <i class="fa-solid fa-robot"></i>
                    </div>
                    <div class="ai-message-content">
                        <div class="ai-message-bubble">
                            <p>👋 <strong>Welcome to LibraX AI Assistant!</strong></p>
                            <p>Chat cleared! I am ready to answer any questions about books, students, loans, or fines using your live database.</p>
                        </div>
                        <span class="ai-message-time">Just now</span>
                    </div>
                </div>
            `;
        }
        hideAiError();
    });
}

if (aiRetryBtn) {
    aiRetryBtn.addEventListener("click", () => {
        if (lastFailedPrompt && !isAiGenerating) {
            submitAiPrompt(lastFailedPrompt);
        }
    });
}

async function submitAiPrompt(prompt) {
    if (!prompt || isAiGenerating) return;

    hideAiError();
    isAiGenerating = true;
    lastFailedPrompt = prompt;

    // Clear input & disable send
    if (aiPromptInput) aiPromptInput.value = "";
    if (aiSendBtn) aiSendBtn.disabled = true;

    // Render user message
    appendUserMessage(prompt);

    // Show typing indicator
    showAiTyping(true);

    try {
        const res = await fetch("/api/ai/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: prompt,
                conversationHistory: aiConversationHistory
            })
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Server error (${res.status})`);
        }

        const data = await res.json();
        const reply = data.reply || "No response received.";

        // Record in conversation history
        aiConversationHistory.push({ role: "user", text: prompt });
        aiConversationHistory.push({ role: "model", text: reply });

        // Keep last 6 history items
        if (aiConversationHistory.length > 6) {
            aiConversationHistory = aiConversationHistory.slice(-6);
        }

        showAiTyping(false);
        appendModelMessage(reply);
        lastFailedPrompt = "";

        // Also update grounding stats if provided
        if (data.liveDataIncluded) {
            const aiGroundedBooks = document.getElementById("aiGroundedBooks");
            const aiGroundedIssues = document.getElementById("aiGroundedIssues");
            const aiGroundedOverdue = document.getElementById("aiGroundedOverdue");
            const aiGroundedMembers = document.getElementById("aiGroundedMembers");
            if (aiGroundedBooks && currentBooks) aiGroundedBooks.textContent = currentBooks.length;
            if (aiGroundedIssues) aiGroundedIssues.textContent = data.liveDataIncluded.issuedBooks;
            if (aiGroundedOverdue) aiGroundedOverdue.textContent = data.liveDataIncluded.overdueBooks;
            if (aiGroundedMembers) aiGroundedMembers.textContent = data.liveDataIncluded.studentMembers;
        }

    } catch (err) {
        showAiTyping(false);
        showAiError(err.message || "Could not connect to the AI service. Please check your connection and try again.");
    } finally {
        isAiGenerating = false;
        if (aiSendBtn) aiSendBtn.disabled = false;
        if (aiPromptInput) aiPromptInput.focus();
    }
}

function appendUserMessage(text) {
    if (!aiChatThread) return;
    const msgEl = document.createElement("div");
    msgEl.className = "ai-message ai-message-user";
    msgEl.innerHTML = `
        <div class="ai-message-avatar">
            <i class="fa-solid fa-user"></i>
        </div>
        <div class="ai-message-content">
            <div class="ai-message-bubble">
                <p>${escapeHtml(text)}</p>
            </div>
            <span class="ai-message-time">${getCurrentTime()}</span>
        </div>
    `;
    aiChatThread.appendChild(msgEl);
    aiChatThread.scrollTop = aiChatThread.scrollHeight;
}

function appendModelMessage(text) {
    if (!aiChatThread) return;
    const msgEl = document.createElement("div");
    msgEl.className = "ai-message ai-message-model";

    const formattedHtml = formatAiMarkdown(text);
    const id = "ai-msg-" + Date.now();

    msgEl.innerHTML = `
        <div class="ai-message-avatar">
            <i class="fa-solid fa-robot"></i>
        </div>
        <div class="ai-message-content">
            <div class="ai-message-bubble" id="${id}">
                ${formattedHtml}
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <span class="ai-message-time">${getCurrentTime()}</span>
                <button class="ai-copy-btn" onclick="copyAiResponse('${id}')" title="Copy answer">
                    <i class="fa-regular fa-copy"></i>
                    <span>Copy</span>
                </button>
            </div>
        </div>
    `;
    aiChatThread.appendChild(msgEl);
    aiChatThread.scrollTop = aiChatThread.scrollHeight;
}

function showAiTyping(show) {
    if (!aiTypingIndicator) return;
    aiTypingIndicator.style.display = show ? "flex" : "none";
    if (show && aiChatThread) {
        aiChatThread.scrollTop = aiChatThread.scrollHeight;
    }
}

function showAiError(msg) {
    if (!aiErrorBanner) return;
    if (aiErrorText) aiErrorText.textContent = msg;
    aiErrorBanner.style.display = "flex";
}

function hideAiError() {
    if (aiErrorBanner) aiErrorBanner.style.display = "none";
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function copyAiResponse(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const text = el.innerText || el.textContent;
    navigator.clipboard.writeText(text).then(() => {
        showToast("Answer copied to clipboard!");
    }).catch(() => {
        showToast("Copied to clipboard");
    });
}
window.copyAiResponse = copyAiResponse;

/**
 * Clean and safe Markdown to HTML formatter for AI responses
 */
function formatAiMarkdown(markdown) {
    if (!markdown) return "";

    // Split into lines
    const lines = markdown.split("\n");
    let html = "";
    let inList = false;
    let listType = "ul";

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        if (!line) {
            if (inList) {
                html += `</${listType}>`;
                inList = false;
            }
            continue;
        }

        // Bullet point lines
        const bulletMatch = line.match(/^([•\-\*])\s+(.+)$/);
        if (bulletMatch) {
            if (!inList || listType !== "ul") {
                if (inList) html += `</${listType}>`;
                html += "<ul>";
                inList = true;
                listType = "ul";
            }
            const content = formatInlineMarkdown(bulletMatch[2]);
            html += `<li>${content}</li>`;
            continue;
        }

        // Numbered list lines
        const numMatch = line.match(/^(\d+)\.\s+(.+)$/);
        if (numMatch) {
            if (!inList || listType !== "ol") {
                if (inList) html += `</${listType}>`;
                html += "<ol>";
                inList = true;
                listType = "ol";
            }
            const content = formatInlineMarkdown(numMatch[2]);
            html += `<li>${content}</li>`;
            continue;
        }

        // Regular paragraph or heading
        if (inList) {
            html += `</${listType}>`;
            inList = false;
        }

        if (line.startsWith("### ")) {
            html += `<h5 style="margin: 8px 0 4px; font-weight: 600;">${formatInlineMarkdown(line.slice(4))}</h5>`;
        } else if (line.startsWith("## ")) {
            html += `<h4 style="margin: 10px 0 4px; font-weight: 600;">${formatInlineMarkdown(line.slice(3))}</h4>`;
        } else {
            html += `<p>${formatInlineMarkdown(line)}</p>`;
        }
    }

    if (inList) {
        html += `</${listType}>`;
    }

    return html;
}

function formatInlineMarkdown(text) {
    let out = escapeHtml(text);
    // Bold: **text**
    out = out.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Italic: *text*
    out = out.replace(/\*(.*?)\*/g, "<em>$1</em>");
    // Inline code: `code`
    out = out.replace(/`(.*?)`/g, "<code style='background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-family: monospace;'>$1</code>");
    return out;
}

/* ================= PWA & SERVICE WORKER LOGIC ================= */
let deferredPrompt = null;

function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker
                .register("/sw.js", { scope: "/" })
                .then((registration) => {
                    console.log("[PWA] Service Worker registered with scope:", registration.scope);

                    registration.onupdatefound = () => {
                        const installingWorker = registration.installing;
                        if (installingWorker) {
                            installingWorker.onstatechange = () => {
                                if (installingWorker.state === "installed") {
                                    if (navigator.serviceWorker.controller) {
                                        console.log("[PWA] New version available. Refresh to activate.");
                                        showToast("App updated! Refresh for the latest features.", "info");
                                    } else {
                                        console.log("[PWA] App is cached and ready for offline use.");
                                    }
                                }
                            };
                        }
                    };
                })
                .catch((error) => {
                    console.error("[PWA] Service Worker registration failed:", error);
                });
        });
    }
}

function initPWAInstallation() {
    const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;

    const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()) && !window.MSStream;

    // Hide install prompts if already running as an installed standalone PWA
    if (isStandalone) {
        hideInstallPrompts();
        return;
    }

    // Standard Chromium / Android / Desktop install trigger
    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallPrompts();
    });

    window.addEventListener("appinstalled", () => {
        console.log("[PWA] Application successfully installed.");
        deferredPrompt = null;
        hideInstallPrompts();
        showToast("LibraX installed successfully! Access it anytime from your home screen.", "success");
    });

    // On iOS Safari (which doesn't support beforeinstallprompt), show install trigger with guide modal
    if (isIOS && !isStandalone) {
        showInstallPrompts();
    }

    const handleInstallClick = async (e) => {
        if (e) e.preventDefault();

        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                console.log("[PWA] User accepted installation prompt");
                hideInstallPrompts();
            } else {
                console.log("[PWA] User dismissed installation prompt");
            }
            deferredPrompt = null;
        } else if (isIOS) {
            openIOSModal();
        } else {
            // General desktop / unsupported ambient browser prompt fallback
            showToast("To install LibraX, tap your browser's menu (⋮ or ⋯) and select 'Install app' or 'Add to Home Screen'.", "info");
        }
    };

    if (pwaInstallBtn) {
        pwaInstallBtn.addEventListener("click", handleInstallClick);
    }
    if (sidebarInstallBtn) {
        sidebarInstallBtn.addEventListener("click", handleInstallClick);
    }

    // iOS modal controls
    if (iosModalCloseBtn) {
        iosModalCloseBtn.addEventListener("click", closeIOSModal);
    }
    if (iosGuideOkBtn) {
        iosGuideOkBtn.addEventListener("click", closeIOSModal);
    }
    if (iosInstallModal) {
        iosInstallModal.addEventListener("click", (e) => {
            if (e.target === iosInstallModal) closeIOSModal();
        });
    }
}

function showInstallPrompts() {
    if (pwaInstallBtn) pwaInstallBtn.style.display = "inline-flex";
    if (sidebarPwaArea) sidebarPwaArea.style.display = "block";
}

function hideInstallPrompts() {
    if (pwaInstallBtn) pwaInstallBtn.style.display = "none";
    if (sidebarPwaArea) sidebarPwaArea.style.display = "none";
}

function openIOSModal() {
    if (iosInstallModal) iosInstallModal.style.display = "flex";
}

function closeIOSModal() {
    if (iosInstallModal) iosInstallModal.style.display = "none";
}

function initConnectivityHandler() {
    const handleOnline = () => {
        if (offlineIndicator) offlineIndicator.style.display = "none";
        loadStats();
        loadBooks();
        loadMembers();
        loadIssues();
        showToast("Connection restored. Library catalog synchronized.", "success");
    };

    const handleOffline = () => {
        if (offlineIndicator) offlineIndicator.style.display = "flex";
        showToast("You are offline. Showing cached library data.", "info");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (!navigator.onLine && offlineIndicator) {
        offlineIndicator.style.display = "flex";
    }

    if (dismissOfflineBtn && offlineIndicator) {
        dismissOfflineBtn.addEventListener("click", () => {
            offlineIndicator.style.display = "none";
        });
    }
}

function handlePWARouteShortcuts() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const requestedSection = urlParams.get("section");
        if (requestedSection) {
            showSection(requestedSection);
        }
    } catch (e) {
        console.warn("[PWA] Route shortcut parse error:", e);
    }
}

/* ================= INITIALIZATION ================= */
window.addEventListener("DOMContentLoaded", () => {
    setDefaultDates();
    loadStats();
    loadBooks();
    loadMembers();
    loadIssues();
    registerServiceWorker();
    initPWAInstallation();
    initConnectivityHandler();
    handlePWARouteShortcuts();
    document.body.classList.add("loaded");
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 992 && sidebar) {
        sidebar.classList.remove("show");
    }
});

