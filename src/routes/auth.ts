import express from 'express';
import { loginUser, registerUser } from '@/controllers/auth';

export const authRoute = express.Router();

// Register
authRoute.post('/register', registerUser);

// Login
authRoute.post('/login', loginUser);
