import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import prisma from '@/prisma/prisma';

// Register user
export const registerUser: RequestHandler = async (req, res) => {
  const { username, email, password } = req.body as {
    username: string;
    email: string;
    password: string;
  };

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
    res
      .status(200)
      .json({ message: `${username} has been registered`, newUser });
  } catch (error: unknown) {
    if (error instanceof Error)
      return res.status(500).json({ message: error.message });
  }
};

// Login
export const loginUser: RequestHandler = async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  try {
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });
    !user && res.status(404).send({ message: 'User not found!' });

    const validPassword = await bcrypt.compare(password, user!.password);
    !validPassword && res.status(400).send({ message: 'Wrong password!' });

    res.status(200).json({ message: `Welcome ${user?.username}`, user });
  } catch (error: unknown) {
    if (error instanceof Error)
      return res.status(500).json({ message: error.message });
  }
};
