import express from 'express';
import bcrypt from 'bcrypt';
import prisma from '../../prisma/prisma';

export const authRoute = express.Router();

// Register
authRoute.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Generate password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      }
    });
    res.status(200).json(newUser);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Login
authRoute.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });
    !user && res.status(404).send({ message: 'User not found!' });

    const validPassword = await bcrypt.compare(password, user!.password);
    !validPassword && res.status(400).send({ message: 'Wrong password!' });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});
