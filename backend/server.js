// 1. Load environment variables
require('dotenv').config();

// 2. Import dependencies
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const contestRoutes = require('./routes/contestRoutes');
const quizGenerationRoutes = require('./routes/quizGenerationRoutes');

// 3. Initialize Express app
const app = express();

// 4. Use Middleware
app.use(cors());
app.use(express.json());

// 5. Define API Routes
app.use('/api/auth', authRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/quiz', quizGenerationRoutes);

// 6. Define the port
const PORT = process.env.PORT || 5000;

// 7. Connect to Database and Start Server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// 8. Run the server
startServer();