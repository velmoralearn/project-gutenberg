// Global elements
const bookList = document.getElementById('book-list');
const loadingStatus = document.getElementById('status-message');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const sortSelect = document.getElementById('sort-select');
const darkModeToggle = document.getElementById('dark-mode-toggle');
// NEW: Source Selector
const sourceSelect = document.getElementById('source-select');

// Constants
const NCERT_DATA_FILE = 'ncert_books.json';

// --- HELPER FUNCTIONS ---

// Ensures we get the most stable HTTPS link for various formats
const findFormat = (formats, mimeTypePart) => {
    for (const key in formats) {
        if (key.includes(mimeTypePart)) {
            const url = formats[key];
            return url.replace('http://', 'https://');
        }
    }
    return null;
};

// --- DATA NORMALIZATION FUNCTIONS ---

// Converts Gutendex API format into a standard internal format
const normalizeGutenbergBook = (book) => {
    const bookId = book.id;
    const authorName = book.authors && book.authors.length > 0
        ? book.authors[0].name
        : 'Unknown Author';

    const bookHtmlLink = book.formats['text/html'] || `https://www.gutenberg.org/ebooks/${bookId}`;
    const coverUrl = findFormat(book.formats, 'image/jpeg') || findFormat(book.formats, 'image/png') || 'https://via.placeholder.com/200x300?text=No+Cover';
    
    // Prioritize EPUB, then PDF, then TXT for download
    let downloadUrl = findFormat(book.formats, 'application/epub+zip'); 
    let suggestedFileName = `${book.title.replace(/[^\w\s]/gi, '')} - ${authorName}.epub`;
    let downloadText = 'Download EPUB 💾';

    if (!downloadUrl) {
        downloadUrl = findFormat(book.formats, 'application/pdf'); 
        suggestedFileName = `${book.title.replace(/[^\w\s]/gi, '')} - ${authorName}.pdf`;
        downloadText = 'Download PDF 📄';
    }
    
    if (!downloadUrl) {
        downloadUrl = findFormat(book.formats, 'text/plain');
        suggestedFileName = `${book.title.replace(/[^\w\s]/gi, '')} - ${authorName}.txt`;
        downloadText = 'Download Text 💾';
    }
    
    // Final fallback to HTML link if no download link found
    if (!downloadUrl) {
         downloadUrl = bookHtmlLink; 
         downloadText = 'View Web Page 🔗';
         suggestedFileName = null;
    }

    return {
        id: bookId,
        title: book.title,
        author: `Author: ${authorName}`,
        meta: `Gutenberg ID: ${bookId}`, 
        coverUrl: coverUrl,
        viewLink: bookHtmlLink,
        downloadLink: downloadUrl,
        downloadText: downloadText,
        suggestedFileName: suggestedFileName,
        source: 'gutenberg'
    };
};

// Converts NCERT JSON format into a standard internal format
const normalizeNCERTBook = (book) => {
    const suggestedFileName = `${book.title.replace(/[^\w\s]/gi, '')} - ${book.class}.zip`;

    return {
        id: book.id,
        title: book.title,
        author: `Subject: ${book.subject}`, // Display Subject as the main context line
        meta: `Class: ${book.class}`, // Display Class as the metadata line
        coverUrl: book.cover_url || 'https://via.placeholder.com/200x300?text=NCERT',
        viewLink: book.html_link,
        downloadLink: book.epub_link,
        downloadText: 'Download EPUB 💾',
        suggestedFileName: suggestedFileName,
        source: 'ncert'
    };
};

// --- DATA FETCHING FUNCTIONS ---

async function fetchGutenbergBooks(searchTerm, sortOrder) {
    let apiUrl = 'https://gutendex.com/books/?';

    if (searchTerm) {
        apiUrl += `search=${encodeURIComponent(searchTerm)}&`;
    }
    
    // The Gutendex API uses sort=popular, sort=id, or sort=-id
    let gutendexSort = sortOrder === 'ascending' ? 'id' : (sortOrder === 'descending' ? '-id' : 'popular');
    apiUrl += `sort=${gutendexSort}&`;


    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error(`Gutendex API error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.results.map(normalizeGutenbergBook);
}

async function fetchNCERTBooks(searchTerm, sortOrder) {
    const response = await fetch(NCERT_DATA_FILE);
    if (!response.ok) {
        // Specifically throw an error that tells the user the file is missing/failed to fetch
        throw new Error(`Failed to fetch ${NCERT_DATA_FILE}. Please ensure the file exists and is accessible.`);
    }
    const data = await response.json();

    let filteredBooks = data.filter(book => {
        const searchPool = `${book.title} ${book.class} ${book.subject} ${book.id}`.toLowerCase();
        return searchPool.includes(searchTerm.toLowerCase());
    });
    
    // NCERT Sorting: Sort by Class ascending by default, then Title
    filteredBooks.sort((a, b) => {
        // Extract numeric class for proper ascending/descending sorting
        const classA = parseInt(a.class.replace('Class ', '')) || 0;
        const classB = parseInt(b.class.replace('Class ', '')) || 0;
        
        if (sortOrder === 'descending' || sortOrder === 'popular') {
            // Sort Highest to Lowest (descending) or Alphabetical (popular default)
            if (classB !== classA) return classB - classA; // Sort by class first
            return b.title.localeCompare(a.title); // Then by title
        } else {
            // Sort Lowest to Highest (ascending)
            if (classA !== classB) return classA - classB; // Sort by class first
            return a.title.localeCompare(b.title); // Then by title
        }
    });


    return filteredBooks.map(normalizeNCERTBook);
}


// --- RENDERING FUNCTION (Unified for both sources) ---

function renderBookCard(book) {
    
    // 1. Book Container
    const bookElement = document.createElement('div');
    bookElement.classList.add('book');

    // 2. Cover Image and Link
    const cover = document.createElement('img');
    cover.src = book.coverUrl; 
    cover.alt = `Cover of ${book.title}`;
    
    const coverLink = document.createElement('a');
    coverLink.href = book.viewLink;
    coverLink.target = '_blank';
    coverLink.appendChild(cover);

    // 3. Details Container
    const detailsDiv = document.createElement('div');
    detailsDiv.classList.add('book-details');

    // 4. Title Link
    const title = document.createElement('h2');
    const titleLink = document.createElement('a');
    titleLink.href = book.viewLink;
    titleLink.target = '_blank';
    titleLink.textContent = book.title;
    title.appendChild(titleLink);

    // 5. Author/Subject and Meta
    const author = document.createElement('p');
    author.textContent = book.author;
    
    const meta = document.createElement('p');
    meta.textContent = book.meta;

    // --- View Book Button (Opens the HTML/Web Page Link) ---
    const viewBookBtn = document.createElement('a');
    viewBookBtn.classList.add('view-book-btn'); 
    viewBookBtn.textContent = (book.source === 'ncert') ? 'View NCERT Page 🔗' : 'View Book Page 🔗';
    viewBookBtn.href = book.viewLink;
    viewBookBtn.target = '_blank';
    
    // --- Download Button (EPUB/PDF/TXT) ---
    const downloadBtn = document.createElement('a');
    downloadBtn.classList.add('download-btn'); 
    downloadBtn.textContent = book.downloadText; 
    downloadBtn.href = book.downloadLink; 
    downloadBtn.target = '_blank';
    
    if (book.suggestedFileName) {
        downloadBtn.setAttribute('download', book.suggestedFileName);
    }
    
    // Disable download button if link is missing or it's just the web page link (fallback)
    const isDisabled = !book.downloadLink || book.downloadText.includes('View Web Page');
    if (isDisabled) {
        downloadBtn.textContent = 'Download N/A';
        downloadBtn.classList.add('disabled-btn');
        downloadBtn.removeAttribute('href');
        downloadBtn.removeAttribute('download');
        // Add a click handler to prevent navigation on disabled buttons
        downloadBtn.addEventListener('click', (e) => e.preventDefault());
    }

    // 9. Button Container 
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-group-container-two'); // Use the 2-button container style
    buttonContainer.appendChild(viewBookBtn); 
    buttonContainer.appendChild(downloadBtn);

    // --- 10. Append Everything ---
    detailsDiv.appendChild(title);
    detailsDiv.appendChild(author);
    detailsDiv.appendChild(meta);
    
    bookElement.appendChild(coverLink);
    bookElement.appendChild(detailsDiv);
    bookElement.appendChild(buttonContainer); 
    bookList.appendChild(bookElement);
}

// --- MASTER LOADING FUNCTION ---
async function loadBooks() {
    // 1. Get current settings
    const currentSource = sourceSelect.value;
    const searchTerm = searchInput.value;
    const sortOrder = sortSelect.value;
    
    // 2. Clear view and show loading status
    bookList.innerHTML = '';
    loadingStatus.textContent = `Loading books from ${currentSource === 'gutenberg' ? 'Project Gutenberg' : 'NCERT India'}...`;
    loadingStatus.style.display = 'block';
    loadingStatus.style.color = ''; 
    
    // 3. Update search placeholder and sort options based on source
    // This must reset the options fully each time the source changes
    if (currentSource === 'ncert') {
        searchInput.placeholder = "Search by Class, Subject, or Title...";
        sortSelect.innerHTML = `
            <option value="popular">Alphabetical (Default)</option>
            <option value="ascending">Class: Lowest to Highest</option>
            <option value="descending">Class: Highest to Lowest</option>
        `;
    } else {
        searchInput.placeholder = "Search by title or author...";
        sortSelect.innerHTML = `
            <option value="popular">Popularity (Default)</option>
            <option value="ascending">Date: Oldest to Newest</option>
            <option value="descending">Date: Newest to Oldest</option>
        `;
    }

    try {
        let books = [];
        if (currentSource === 'gutenberg') {
            books = await fetchGutenbergBooks(searchTerm, sortOrder);
        } else { // ncert
            books = await fetchNCERTBooks(searchTerm, sortOrder);
        }

        loadingStatus.style.display = 'none';

        if (books.length === 0) {
            loadingStatus.textContent = `No results found for "${searchTerm}" in the selected source.`;
            loadingStatus.style.display = 'block';
            return;
        }

        books.forEach(renderBookCard);

    } catch (error) {
        console.error('Master Load Error:', error);
        loadingStatus.textContent = `🚨 Failed to load data: ${error.message}. Please try again.`;
        loadingStatus.style.color = 'red';
        loadingStatus.style.display = 'block';
    }
}

// --- 2. Event Listeners for Search, Filters, and Source Change ---
searchButton.addEventListener('click', loadBooks);
sortSelect.addEventListener('change', loadBooks);
sourceSelect.addEventListener('change', loadBooks); // New listener for source change

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loadBooks();
    }
});


// --- 3. Dark/Light Mode Toggle Functionality ---
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    const isDarkMode = document.body.classList.contains('dark-mode');
    darkModeToggle.textContent = isDarkMode 
        ? 'Switch to Light Mode 💡' 
        : 'Switch to Dark Mode 🌙';
});


// Initial call to load books
loadBooks();