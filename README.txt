# My Gutenberg Library - Project Viewer

A simple, responsive web application built with vanilla HTML, CSS, and JavaScript to browse popular books from Project Gutenberg. It features a two-column layout, search functionality, sort filters, PDF download links, and a Dark Mode toggle based on the modern **Velmora** theme.

## 🚀 Features

* **Responsive Layout:** Two-column design for settings and book list that adapts to mobile screens.
* **Dynamic Theming:** Supports both **Light Mode** (default) and a themed **Dark Mode** (inspired by Velmora).
* **Search & Filter:** Search by title/author and sort books by ID (date approximation).
* **Dynamic Content:** Fetches book data directly from the Gutendex API.
* **PDF Download:** Provides direct links to the best available format (prioritizing PDF, then EPUB, then TXT).
* **Custom Font:** Uses the elegant **Lora** font via Google Fonts.





## 📁 Project Structure

The project uses a standard web setup with three main files:

/gutenberg-library/
├── index.html    # The main structure and content
├── style.css     # The styling, layout, and theme variables (Light/Dark Mode)
└── script.js     # The application logic, API fetching, search, and dynamic card generation




## 🛠️ Setup and Running the Project

This is a static web application and **does not require a backend server** or Node.js to run locally.

### Prerequisites

You only need a modern web browser (Chrome, Firefox, Edge, Safari, etc.).

### 1. Download Files

Ensure you have saved the following three files into the same folder (e.g., `gutenberg-library`):

1.  `index.html`
2.  `style.css`
3.  `script.js`

### 2. Run Locally

Open the project directly in your web browser using one of these methods:

#### Option A: Simplest Method (Recommended)

1.  Navigate to the project folder (`gutenberg-library`) on your computer.
2.  **Double-click** the `index.html` file.

The file will open in your default browser, and the application will load the book data immediately.

#### Option B: Using a Local Web Server

If you prefer using a local server (e.g., for development or testing):

1.  Install a simple local server (like the Python SimpleHTTPServer or VS Code's Live Server extension).
2.  Start the server in the project directory.
3.  Navigate to the server address (usually `http://localhost:8080/` or `http://127.0.0.1:5500/`) in your browser.

## ⚙️ Usage

1.  **Browse:** The application loads popular books by default.
2.  **Search:** Use the input box and the **Search** button to filter results by title or author.
3.  **Sort:** Use the **Sort By Date** dropdown in the left panel to change the order of the books.
4.  **Theme:** Click the **Switch to Dark Mode 🌙** button in the left panel to toggle the Velmora-inspired theme.
5.  **Download:** Click the **Download Book 💾** button on any card to download the best available e-book file (PDF prioritized).

## 🔗 External API

This project relies on the free, public **Gutendex API** for all book data:
`https://gutendex.com/`