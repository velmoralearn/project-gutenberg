// Global elements
const bookList = document.getElementById('book-list');
const loadingStatus = document.getElementById('status-message');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const sortSelect = document.getElementById('sort-select');
const darkModeToggle = document.getElementById('dark-mode-toggle');

// --- Helper Function to Find Specific Format ---
const findFormat = (formats, mimeTypePart) => {
    for (const key in formats) {
        if (key.includes(mimeTypePart)) {
            return formats[key];
        }
    }
    return null;
};

// --- 1. Core Data Fetching Function ---
function loadGutenbergBooks() {
    // Clear previous results and show loading status
    bookList.innerHTML = '';
    loadingStatus.textContent = 'Loading books...';
    loadingStatus.style.display = 'block';
    loadingStatus.style.color = ''; 

    // Build the API URL with search and sort parameters
    const searchTerm = searchInput.value;
    const sortOrder = sortSelect.value;
    
    let apiUrl = 'https://gutendex.com/books/?';

    if (searchTerm) {
        apiUrl += `search=${encodeURIComponent(searchTerm)}&`;
    }
    
    if (sortOrder) {
        apiUrl += `sort=${sortOrder}&`;
    }

    fetch(apiUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Hide status message if loading was successful
        loadingStatus.style.display = 'none';

        if (data.results.length === 0) {
            // No Results Found Logic
            loadingStatus.textContent = `No results found for "${searchTerm}". Please try a different search or filter.`;
            loadingStatus.style.display = 'block';
            return;
        }

        data.results.forEach(book => {
            // --- Data Extraction with Fallbacks ---
            
            const bookId = book.id;
            const bookHtmlLink = book.formats['text/html'] || `https://www.gutenberg.org/ebooks/${bookId}`;
            const coverUrl = book.formats['image/jpeg'] || book.formats['image/png'];
            
            const authorName = book.authors && book.authors.length > 0
                ? book.authors[0].name
                : 'Unknown Author';
            
            // --- Determine the best download link (PDF priority) ---
            let downloadUrl = findFormat(book.formats, 'application/pdf'); 
            let suggestedFileName = `${book.title.replace(/[^\w\s]/gi, '')} - ${authorName}.pdf`;

            if (!downloadUrl) {
                downloadUrl = findFormat(book.formats, 'application/epub+zip'); 
                suggestedFileName = `${book.title.replace(/[^\w\s]/gi, '')} - ${authorName}.epub`;
            }
            
            if (!downloadUrl) {
                downloadUrl = findFormat(book.formats, 'text/plain'); 
                suggestedFileName = `${book.title.replace(/[^\w\s]/gi, '')} - ${authorName}.txt`;
            }
            
            if (!downloadUrl) {
                downloadUrl = bookHtmlLink; // Fallback: HTML book page
                suggestedFileName = null; 
            }
            
            // 1. Book Container
            const bookElement = document.createElement('div');
            bookElement.classList.add('book');

            // 2. Cover Image and Link
            const cover = document.createElement('img');
            cover.src = coverUrl || 'https://via.placeholder.com/200x300?text=No+Cover'; 
            cover.alt = `Cover of ${book.title}`;
            
            const coverLink = document.createElement('a');
            coverLink.href = bookHtmlLink;
            coverLink.target = '_blank';
            coverLink.appendChild(cover);

            // 3. Details Container
            const detailsDiv = document.createElement('div');
            detailsDiv.classList.add('book-details');

            // 4. Title Link
            const title = document.createElement('h2');
            const titleLink = document.createElement('a');
            titleLink.href = bookHtmlLink;
            titleLink.target = '_blank';
            titleLink.textContent = book.title;
            title.appendChild(titleLink);

            // 5. Author and Date
            const author = document.createElement('p');
            author.textContent = `Author: ${authorName}`;
            
            const date = document.createElement('p');
            date.textContent = `Gutenberg ID: ${bookId}`;

            // 6. Download Button
            const downloadBtn = document.createElement('a');
            downloadBtn.classList.add('download-btn');
            downloadBtn.textContent = 'Download Book 💾';
            downloadBtn.href = downloadUrl; 
            downloadBtn.target = '_blank';
            
            // Add the 'download' attribute to force download (key for PDF)
            if (suggestedFileName) {
                downloadBtn.setAttribute('download', suggestedFileName);
            }

            // 7. Download Container (NEW FOR ALIGNMENT)
            const downloadContainer = document.createElement('div');
            downloadContainer.classList.add('download-container');
            downloadContainer.appendChild(downloadBtn);

            // --- 8. Append Everything ---
            detailsDiv.appendChild(title);
            detailsDiv.appendChild(author);
            detailsDiv.appendChild(date);

            bookElement.appendChild(coverLink);
            bookElement.appendChild(detailsDiv);
            bookElement.appendChild(downloadContainer); // Append the new container
            bookList.appendChild(bookElement);
        });
    })
    .catch(error => {
        console.error('Error fetching books:', error);
        // Show error message
        loadingStatus.textContent = `🚨 Failed to load books: ${error.message}. Please try again.`;
        loadingStatus.style.color = 'red';
        loadingStatus.style.display = 'block';
    });
}

// --- 2. Event Listeners for Search and Filters ---
searchButton.addEventListener('click', loadGutenbergBooks);
sortSelect.addEventListener('change', loadGutenbergBooks);

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loadGutenbergBooks();
    }
});


// --- 3. Dark/Light Mode Toggle Functionality ---
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    // Update the button text based on the current mode
    const isDarkMode = document.body.classList.contains('dark-mode');
    darkModeToggle.textContent = isDarkMode 
        ? 'Switch to Light Mode 💡' 
        : 'Switch to Dark Mode 🌙';
});


// Initial call to load the popular books when the page loads
loadGutenbergBooks();