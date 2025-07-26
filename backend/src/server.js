const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const loanRoutes = require('./routes/loanRoutes');
const db = require('./db'); // Ensure database is initialized on server start

const app = express();
const PORT = process.env.PORT || 3001; // Using port 3001 for backend

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(bodyParser.json()); // Parse JSON request bodies

// API routes
app.use('/api/v1', loanRoutes);

// Basic health check route
app.get('/', (req, res) => {
  res.send('Bank Lending System Backend is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
