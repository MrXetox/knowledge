# Knowledge - IT Support Knowledge Base

## 📖 About the Project

This application, named Knowledge, was developed to centralize technical resolution sheets for IT support team.

Developed during a 3-month L3 Informatique internship, this project addresses the need to replace scattered information (such as OneNote documents and post-its) with a single, structured web application. The architecture is divided into three distinct layers: a Single Page Application (SPA) frontend built with **Angular**, a Backend for Frontend (BFF) built with **PHP (Slim framework)**, and a **PostgreSQL** database. This application is fully operational and used daily by the department's technicians.

💡 **Note regarding language:** The application's interface and content are exclusively in French. It does not include localization features or support for other languages.

## ✨ Key Features

### 🛠 For IT Technicians

* **Centralized Knowledge Base:** Create, view, update, delete, and archive technical sheets.
* **Rich Content Editing:** Format problems and notes using the integrated Tiptap rich text editor.
* **Media Management:** Upload files and images to accompany resolution steps.
* **Import/Export:** Easily export and import individual sheets using ZIP archives.

### 📂 Organization & Navigation

* **Dynamic Arborescence:** Organize knowledge in a freely reorganizable two-level category tree.
* **Drag-and-Drop:** Move categories and sub-categories easily using an intuitive drag-and-drop interface.
* **Advanced Search:** Find sheets quickly using a robust search engine (insensitive to case) that filters by title, problem, tags, and categories, powered by PostgreSQL's `tsvector` and GIN indexing.

### 🔒 Security & Administration

* **Transparent SSO Authentication:** Secure access delegated entirely to Microsoft Entra ID (Single Sign-On) using JWT tokens, providing a seamless login experience for authenticated agents.
* **History & Versioning:** Built-in tracking of all sheet modifications, including the date, author, type of change, and a summary of the modification.

---

## 🛠 1. Prerequisites and Recommended Versions

To ensure the project functions properly across both the frontend and backend, the following technologies are required:

* **Node.js & npm**: For building and running the Angular frontend.
* **Angular CLI**: To serve and compile the client interface.


* **PHP**: v8.0+ (Required for the Slim micro-framework and Doctrine DBAL).
* **Composer**: For managing PHP dependencies in the backend.


* **PostgreSQL**: Relational database engine for data storage.

## 🚀 2. Launch Commands (Scripts)

### Frontend (Angular)
Navigate to the `frontend` directory:

* **`npm install`**: Installs all required dependencies.
* **`npm run dev`**: Launches the Angular application in development mode. The app will automatically reload if you change any of the source files.

### Backend (PHP/Slim)
Navigate to the `backend` directory:

* **`composer install`**: Installs all necessary PHP packages (Slim, Doctrine, Firebase JWT, etc.).
* **`php -S localhost:8000 -t public`**: Starts PHP's built-in development server pointing to the `public` directory (where `index.php` is located).

## ⚙️ 3. Preparing the Project for Production
The application is designed to be hosted on isolated production servers (e.g., Red Hat Enterprise Linux 9) using Nginx as a reverse proxy.

### Step 1: Environment Configuration
1. Configure your web server (Nginx/Apache) to serve the compiled Angular static files and proxy `/api` requests to the PHP backend.
2. Set up the backend environment variables (Database credentials, Entra ID public keys for JWT validation).

### Step 2: Database Initialization
Ensure PostgreSQL is running. Initialize the database schema and apply all versioned updates using Doctrine Migrations:

```bash
backend/vendor/bin/doctrine-migrations migrate
```

### Step 3: Client Build
Build the Angular application for production:

```bash
npm run build
```

Move the contents of the `dist/` directory to your web server's public html folder.