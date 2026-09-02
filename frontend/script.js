/* =====================================================
   LIBRARY MANAGEMENT SYSTEM
   FRONTEND JAVASCRIPT
===================================================== */


/* ================= DOM ELEMENTS ================= */

const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");

const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".page-section");

const themeToggle = document.getElementById("themeToggle");

const toastMessage = document.getElementById("toastMessage");
const toastText = document.getElementById("toastText");


/* ================= SIDEBAR ================= */

menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("show");
});


/* ================= NAVIGATION ================= */

navLinks.forEach((link) => {

    link.addEventListener("click", (event) => {

        event.preventDefault();

        const sectionId = link.dataset.section;

        showSection(sectionId);

    });

});


function showSection(sectionId) {

    /* Hide all sections */

    sections.forEach((section) => {
        section.classList.remove("active-section");
    });


    /* Show selected section */

    const selectedSection = document.getElementById(sectionId);

    if (selectedSection) {
        selectedSection.classList.add("active-section");
    }


    /* Update active navigation */

    navLinks.forEach((link) => {

        link.classList.remove("active");

        if (link.dataset.section === sectionId) {
            link.classList.add("active");
        }

    });


    /* Close mobile sidebar */

    if (window.innerWidth <= 992) {
        sidebar.classList.remove("show");
    }


    /* Scroll to top */

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* ================= DARK MODE ================= */

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


/* ================= BOOK SEARCH ================= */

const bookSearch = document.getElementById("bookSearch");
const bookFilter = document.getElementById("bookFilter");

if (bookSearch) {

    bookSearch.addEventListener("input", filterBooks);

}

if (bookFilter) {

    bookFilter.addEventListener("change", filterBooks);

}


function filterBooks() {

    const searchValue = bookSearch.value.toLowerCase();

    const filterValue = bookFilter.value;

    const books = document.querySelectorAll(".book-card");


    books.forEach((book) => {

        const title =
            book.querySelector("h3").textContent.toLowerCase();

        const author =
            book.querySelector("p").textContent.toLowerCase();

        const status = book.dataset.status;


        const matchesSearch =
            title.includes(searchValue) ||
            author.includes(searchValue);

        const matchesFilter =
            filterValue === "all" ||
            filterValue === status;


        if (matchesSearch && matchesFilter) {

            book.style.display = "";

        } else {

            book.style.display = "none";

        }

    });

}


/* ================= MEMBER SEARCH ================= */

const memberSearch = document.getElementById("memberSearch");

if (memberSearch) {

    memberSearch.addEventListener("input", () => {

        const searchValue =
            memberSearch.value.toLowerCase();

        const rows =
            document.querySelectorAll("#memberTable tr");


        rows.forEach((row) => {

            const text =
                row.textContent.toLowerCase();

            row.style.display =
                text.includes(searchValue) ? "" : "none";

        });

    });

}


/* ================= BOOK MODAL ================= */

const bookModal = document.getElementById("bookModal");

function openBookModal() {

    bookModal.classList.add("show");

}

function closeBookModal() {

    bookModal.classList.remove("show");

}


/* ================= ADD BOOK ================= */

const bookForm = document.getElementById("bookForm");

if (bookForm) {

    bookForm.addEventListener("submit", (event) => {

        event.preventDefault();

        closeBookModal();

        bookForm.reset();

        showToast("Book record added successfully");

    });

}


/* ================= MEMBER MODAL ================= */

const memberModal = document.getElementById("memberModal");

function openMemberModal() {

    memberModal.classList.add("show");

}

function closeMemberModal() {

    memberModal.classList.remove("show");

}


/* ================= ADD MEMBER ================= */

const memberForm = document.getElementById("memberForm");

if (memberForm) {

    memberForm.addEventListener("submit", (event) => {

        event.preventDefault();

        closeMemberModal();

        memberForm.reset();

        showToast("Student member added successfully");

    });

}


/* ================= ISSUE BOOK ================= */

const issueForm = document.getElementById("issueForm");

if (issueForm) {

    issueForm.addEventListener("submit", (event) => {

        event.preventDefault();

        showToast("Book issue recorded successfully");

        issueForm.reset();

    });

}


/* ================= RETURN BOOK ================= */

function returnBook() {

    const book =
        document.getElementById("returnBookSelect").value;

    const date =
        document.getElementById("returnDate").value;


    if (!book || !date) {

        showToast("Please select a book and return date");

        return;

    }


    showToast("Book return recorded successfully");

}


/* ================= FINE CALCULATION ================= */

function calculateFine() {

    const overdueDays =
        Number(document.getElementById("overdueDays").value);

    const finePerDay =
        Number(document.getElementById("finePerDay").value);


    if (overdueDays < 0 || finePerDay < 0) {

        showToast("Please enter valid values");

        return;

    }


    const totalFine =
        overdueDays * finePerDay;


    document.getElementById("fineResult").textContent =
        "₹" + totalFine;


    showToast("Fine calculated successfully");

}


/* ================= TOAST ================= */

let toastTimer;

function showToast(message) {

    toastText.textContent = message;

    toastMessage.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer = setTimeout(() => {

        toastMessage.classList.remove("show");

    }, 2500);

}


/* ================= CLOSE MODAL ================= */

document.addEventListener("click", (event) => {

    if (event.target === bookModal) {
        closeBookModal();
    }

    if (event.target === memberModal) {
        closeMemberModal();
    }

});


/* ================= ESCAPE KEY ================= */

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        closeBookModal();

        closeMemberModal();

    }

});


/* ================= GLOBAL SEARCH ================= */

const globalSearch =
    document.getElementById("globalSearch");


if (globalSearch) {

    globalSearch.addEventListener("keypress", (event) => {

        if (event.key !== "Enter") {
            return;
        }


        const searchText =
            globalSearch.value.trim().toLowerCase();


        if (!searchText) {
            return;
        }


        /* Search books first */

        showSection("books");

        if (bookSearch) {

            bookSearch.value = searchText;

            filterBooks();

        }

    });

}


/* ================= DEFAULT DATES ================= */

const issueDate =
    document.getElementById("issueDate");

const dueDate =
    document.getElementById("dueDate");


if (issueDate) {

    const today = new Date();

    issueDate.value =
        today.toISOString().split("T")[0];

}


if (dueDate) {

    const due = new Date();

    due.setDate(due.getDate() + 14);

    dueDate.value =
        due.toISOString().split("T")[0];

}


/* ================= RETURN DATE ================= */

const returnDate =
    document.getElementById("returnDate");


if (returnDate) {

    const today = new Date();

    returnDate.value =
        today.toISOString().split("T")[0];

}


/* ================= PAGE LOAD ANIMATION ================= */

window.addEventListener("load", () => {

    document.body.classList.add("loaded");

});


/* ================= RESIZE ================= */

window.addEventListener("resize", () => {

    if (window.innerWidth > 992) {

        sidebar.classList.remove("show");

    }

});