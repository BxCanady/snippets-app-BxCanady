import 'dotenv/config';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';
import multer from 'multer'; // Import multer
import keys from './config/keys';
import router from './routes';
import { requestLogger, errorHandler } from './middleware';
import seedDatabase from './seedDatabase';

const createError = require('http-errors');

mongoose.connect(keys.database.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

mongoose.connection.on('connected', async () => {
  console.log('Connected to MongoDB');
  await seedDatabase();
});

mongoose.connection.on('error', (err) => {
  console.log('Error connecting to MongoDB', err);
});

const app = express(); // Define the app object

// Configure Multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the upload directory
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage });

// Create an endpoint to handle file uploads
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // Handle the uploaded file
    // Save file metadata to MongoDB, if needed
    res.status(201).json({ message: 'File uploaded successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error uploading file' });
  }
});

// Middleware
app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(requestLogger);

// API router
app.use('/uploads', express.static('uploads'));
app.use(keys.app.apiEndpoint, router);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404, 'NotFound'));
});

// Error handler
app.use(errorHandler);

module.exports = app;
