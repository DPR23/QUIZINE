require('dotenv').config();  // Load environment variables from .env
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(cors({ origin: '*' }));  // Allow all origins, adjust if needed
app.use(express.json());
app.use(express.static(__dirname));

// Environment Variables
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("❌ Missing GEMINI_API_KEY in .env file");
  process.exit(1);
}

// API Endpoint to Generate Quiz
app.post("/generate-quiz", async (req, res) => {
  const { topic, numQuestions = 5, difficulty = "easy" } = req.body;

  // Basic validation
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
    console.log("AI API Response:", JSON.stringify(data, null, 2));

    // Check AI response
    if (data.candidates?.length > 0) {
      let quizText = data.candidates[0].content.parts[0].text.trim();
      quizText = quizText.replace(/```json|```/g, '').trim();

      try {
        const quiz = JSON.parse(quizText);
        if (Array.isArray(quiz)) {
          return res.json(quiz);
        }
      } catch (parseError) {
        console.error("❌ Failed to parse AI JSON:", parseError.message);
      }
    }

    // Fallback questions if AI fails
    console.warn("⚠️ Using fallback quiz questions");
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
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
