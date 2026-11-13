# Humanizer — AI-Powered Writing Assistant

Humanizer is a full-stack AI writing application that helps users transform AI-generated or robotic-sounding text into more natural, human-like writing. It also provides tools for analyzing writing, managing previous work, and maintaining a personalized writing experience.

**Live Demo:** https://humanizer-mu-eight.vercel.app

**Backend API:** https://humanizer-i49p.onrender.com

**GitHub:** https://github.com/sylvanusanang45-afk/humanizer

---

## Features

- **AI Text Humanization** — Transform robotic or AI-generated text into more natural, conversational writing.
- **Writing Analysis** — Analyze text to better understand its writing characteristics.
- **User Authentication** — Secure account registration and login powered by Supabase.
- **History Management** — Access previously generated writing and saved work.
- **User Settings** — Manage application preferences.
- **Password Recovery** — Reset account passwords through email verification.
- **Responsive Interface** — Designed to work across desktop, tablet, and mobile devices.
- **AI Integration** — Uses Google's Gemini API to power AI writing functionality.

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- Tailwind CSS
- React Router
- Framer Motion

### Backend
- Node.js
- Express.js
- REST API
- Helmet
- Express Rate Limit
- Zod

### Database & Authentication
- Supabase

### AI Integration
- Google Gemini API

### Deployment
- Vercel — Frontend
- Render — Backend

## Project Architecture

Humanizer uses a full-stack architecture:

1. The React frontend provides the user interface.
2. The Express backend handles API requests and server-side operations.
3. Supabase manages authentication and application data.
4. Google Gemini powers AI-assisted text processing.
5. The frontend communicates with the backend through REST API endpoints.

## Getting Started

Follow these instructions to run Humanizer locally.

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- Git

You will also need:
- A Supabase project.
- A Google Gemini API key.

### 1. Clone the repository

```bash
git clone https://github.com/sylvanusanang45-afk/humanizer.git
```

```bash
cd humanizer
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Configure frontend environment variables

Create a `.env` file in the project root and add the environment variables required by the frontend.

Typical Supabase configuration:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000
```

Use the actual variable names expected by your frontend source code if they differ.

### 4. Install backend dependencies

Navigate into the server directory:

```bash
cd server
npm install
```

### 5. Configure backend environment variables

Create a `.env` file inside the `server` directory.

Add the variables required by your backend, including your Gemini API key and Supabase configuration. Use the exact names referenced by your server code.

Never commit real API keys, passwords, or private credentials.

### 6. Start the backend

From the server directory, run:

```bash
npm run dev
```

If your backend does not define a development script, use its configured start command.

### 7. Start the frontend

Open another terminal in the project root and run:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Environment Variables

Humanizer uses environment variables to keep sensitive configuration outside the source code.

Examples of configuration include:

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase public client key |
| `VITE_API_URL` | Backend API URL |
| Gemini API key | Server-side AI authentication |
| Supabase server credentials | Backend database access |

The exact variable names should match the application's implementation.

**Important:** Never expose your Gemini API key or Supabase service-role key in frontend code or commit real environment files to GitHub.

## Deployment

Humanizer is deployed using:

- **Vercel:** React frontend
- **Render:** Express backend

The deployed frontend communicates with the backend API, while Supabase handles authentication and application data.

## Future Improvements

Potential improvements include:

- Additional writing styles and customization options.
- Enhanced writing analytics.
- More advanced AI-powered writing assistance.
- Expanded user productivity features.
- Improved testing and performance optimization.

## Author

**Sylvanus Anang**

Full-Stack Developer

- GitHub: https://github.com/sylvanusanang45-afk
- LinkedIn: https://www.linkedin.com/in/sylvanus-anang-623185417

---

Built with React, Node.js, Supabase, and Google Gemini.
