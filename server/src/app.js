// File used to create server

const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const learningRoutes = require('./routes/learning.routes');
const challengeRoutes = require('./routes/challenge.routes');
const badgeRoutes = require('./routes/badge.routes');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors({
	origin: process.env.CLIENT_URL || 'http://localhost:5173',
	credentials: true
}));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/badges', badgeRoutes);


module.exports = app;