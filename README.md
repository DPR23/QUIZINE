# Quizine: AI-Powered Quiz Generator

Quizine is a full-stack web application that leverages generative artificial intelligence to dynamically create customized multiple-choice quizzes. Designed with an interactive and responsive user interface, the application allows users to generate educational content instantly based on user-defined topics and difficulty levels.

## Architecture and Technology Stack

### Frontend
- **Interface:** Built with responsive HTML5 and CSS3, featuring a high-contrast monochrome design.
- **Interactivity:** Vanilla JavaScript handles asynchronous API requests, DOM manipulation, automated scoring algorithms, and theme toggling.
- **Engagement:** Integrated custom canvas-based particle animations for successful quiz completions.

### Backend
- **Server:** Engineered using Node.js and Express.js to process incoming client requests and serve static assets.
- **API Integration:** Utilizes the native Node.js Fetch API to communicate with the Google Gemini API (gemini-3.6-flash model).
- **Data Processing:** Implements robust JSON parsing and error handling to gracefully fall back to default datasets in the event of API rate-limiting or network latency.

## Getting Started

### Prerequisites
- Node.js (v18.0 or higher required for native Fetch API support)
- Google Gemini API Key

### Local Installation
1. Clone the repository and navigate into the project directory.
2. Install the necessary backend dependencies:
   ```bash
   npm install
   ```
3. Create a .env file in the root directory and add your secret API key:
   ```
   GEMINI_API_KEY=your_secure_api_key_here
   ```
4. Start the Express server:
   ```bash
   npm start
   ```
5. Open your browser and navigate to http://localhost:5001.

## Deployment

This application is designed to be deployed as a single Web Service. Platforms like Render or Heroku can host both the Node.js backend API and the static frontend files concurrently. Ensure that the GEMINI_API_KEY is securely injected into the deployment platform's environment variables rather than hardcoded in the repository.

## Future Improvements

- **Database Integration:** Implement MongoDB to save generated quizzes, user profiles, and historical scoring data.
- **Advanced Gamification:** Introduce global leaderboards, timed quizzes, and category-based achievement badges.
- **Export Functionality:** Allow educators to export AI-generated quizzes into PDF or CSV formats for offline classroom use.
- **Multiplayer Mode:** Utilize WebSockets (Socket.io) to enable real-time, peer-to-peer quiz competitions.
