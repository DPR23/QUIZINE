require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const Quiz = require('./models/Quiz');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(__dirname));

// Environment Variables
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("❌ Missing GEMINI_API_KEY in .env file");
}

const MONGO_URI = process.env.MONGO_URI;
if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));
}

// Socket.io for Multiplayer
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_room', (roomCode) => {
    socket.join(roomCode);
    console.log(`User ${socket.id} joined room ${roomCode}`);
    io.to(roomCode).emit('player_joined', { id: socket.id, message: 'A new player joined!' });
  });

  socket.on('submit_score', (data) => {
    const { roomCode, score } = data;
    io.to(roomCode).emit('opponent_score', { id: socket.id, score });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// API Endpoint to Generate Quiz
app.post("/generate-quiz", async (req, res) => {
  const { topic, numQuestions = 5, difficulty = "easy" } = req.body;

  if (!topic || !numQuestions) {
    return res.status(400).json({ error: "Missing topic or numQuestions" });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate exactly ${numQuestions} multiple-choice questions about "${topic}" with ${difficulty} difficulty.
Return only a JSON array in this format:
[{"question":"...","options":["..."],"correctAnswer":"..."}]`
            }]
          }]
        })
      }
    );

    const data = await response.json();

    if (data.candidates?.length > 0) {
      let quizText = data.candidates[0].content.parts[0].text.trim();
      quizText = quizText.replace(/```json|```/g, '').trim();

      try {
        const quizData = JSON.parse(quizText);
        if (Array.isArray(quizData)) {
          // Save to MongoDB
          if (mongoose.connection.readyState === 1) {
            const newQuiz = new Quiz({ topic, difficulty, questions: quizData });
            await newQuiz.save();
          }
          return res.json(quizData);
        }
      } catch (parseError) {
        console.error("❌ Failed to parse AI JSON:", parseError.message);
      }
    }

    return res.json(getFallbackQuiz(numQuestions));
  } catch (err) {
    console.error("❌ Error generating quiz:", err.message);
    return res.json(getFallbackQuiz(numQuestions));
  }
});

// SPA fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fallback Quiz Generator
function getFallbackQuiz(num) {
  return Array.from({ length: num }, (_, i) => ({
    question: `Sample Question ${i + 1}?`,
    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
    correctAnswer: "Option 1"
  }));
}

// Start Server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
