// app.js

import express from 'express';
import connectDB from './config/db.js';
import path from 'path';
import bodyParser from 'body-parser';
import dotenv from "dotenv"
import userRoutes from './routes/userRoutes.js';
import courseRoutes from "./routes/courseRoutes.js"
import morgan from 'morgan';
import cors from 'cors';
import { fileURLToPath } from 'url';
import chapterRoutes from "./routes/chapterRoutes.js"
import videoRoutes from "./routes/videoRoutes.js"
import enrollmentRoutes from "./routes/enrollmentRoutes.js"
import videoProgressRoutes from "./routes/videoprogressRoutes.js"
import statsRoutes from "./routes/statsRoutes.js";







dotenv.config(); // Load environment variables

// Initialize the Express app
const app = express();

// Enable CORS for all routes
app.use(cors({
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true
  }));

// Use morgan to log requests to the console
app.use(morgan('dev')); // 'dev' is a predefined log format

// Middleware to parse JSON data
app.use(bodyParser.urlencoded({extended:true}))

app.use(express.json());


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use('/media', express.static(path.join(__dirname, 'media')));

// Connect to the database
connectDB();

// Define your routes here (example)
app.use('/api/users', userRoutes);
// Use course routes
app.use('/api', courseRoutes);
// chapter routes 
app.use('/api', chapterRoutes); // Register chapter routes
// video routes 
app.use('/api', videoRoutes); // Register video routes
// videoprogess routes 
app.use('/api', videoProgressRoutes); // Register video routes
// enrollment routes 
app.use('/api', enrollmentRoutes); // Register video routes
// stats and count
app.use('/api', statsRoutes); 

export default app;  // Export the app instance
