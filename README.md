# Tanuja AI Hub (AI Blog Platform)

An intelligent platform for automating blog content generation, curation, and publishing. The project consists of a Next.js frontend and a Node.js backend.

## 🌟 Features
- **Automated AI Writing:** Generate high-quality blog posts using Large Language Models (Groq / OpenAI).
- **Web Scraping:** Fetch relevant information from external sources using Puppeteer and Cheerio.
- **Background Jobs:** Automated task scheduling using `node-cron`.
- **User Authentication:** Secure access using `NextAuth.js` on the frontend and custom JWT on the backend.
- **Modern User Interface:** Responsive, animated, and beautifully designed using Tailwind CSS and Framer Motion.

## 💻 Tech Stack
**Frontend:**
- Next.js 14
- React 19
- Tailwind CSS
- Framer Motion
- NextAuth.js
- Lucide React

**Backend:**
- Node.js
- Express.js
- SQLite (`better-sqlite3`)
- Puppeteer & Cheerio
- JWT Authentication
- node-cron

## 📂 Folder Structure

```
tanuja-blogs/
├── ai-blog-front/       # Next.js Frontend application
│   ├── src/             # Source code (components, pages, styles)
│   ├── public/          # Static assets
│   ├── next.config.mjs  # Next.js configuration
│   └── package.json     # Frontend dependencies
├── ai-blog-backend/     # Node.js Express Backend application
│   ├── routes/          # Express API routes
│   ├── middleware/      # Custom middleware (auth, etc.)
│   ├── utils/           # Helper functions
│   ├── database/        # SQLite database files
│   ├── scrapers/        # Puppeteer and Cheerio scrapers
│   ├── jobs/            # Scheduled tasks using node-cron
│   ├── llm/             # LLM API clients (e.g., Groq, OpenAI)
│   ├── scripts/         # Utility scripts (seeders, etc.)
│   ├── app.js           # Express app configuration
│   ├── server.js        # Backend entry point
│   └── package.json     # Backend dependencies
├── .env.example         # Template for environment variables
├── .gitignore           # Root gitignore rules
└── README.md            # Project documentation
```

## 🚀 Installation & Local Setup

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd tanuja-blogs
```

### 2. Environment Variables
Copy the provided `.env.example` file to create the required `.env` files in their respective directories.

For the **backend**, create `ai-blog-backend/.env`:
```bash
cp .env.example ai-blog-backend/.env
# Edit ai-blog-backend/.env and add your actual API keys and secrets
```

For the **frontend**, create `ai-blog-front/.env.local`:
```bash
cp .env.example ai-blog-front/.env.local
# Edit ai-blog-front/.env.local and populate the frontend variables
```

*Note: The actual `.env` and `.env.local` files are ignored by git to keep your secrets secure.*

### 3. Setup the Backend
```bash
cd ai-blog-backend
npm install

# Run database seeders (if required)
npm run seed

# Start the backend server in development mode
npm run dev
```
The backend server will run on `http://localhost:4000`.

### 4. Setup the Frontend
Open a new terminal window:
```bash
cd ai-blog-front
npm install

# Start the Next.js development server
npm run dev
```
The frontend application will be available at `http://localhost:3000`.
