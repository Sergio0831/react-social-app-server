import { PrismaClient } from '@prisma/client';
import express from 'express';
import bcrypt from 'bcrypt';
import { withExclude } from 'prisma-exclude';
export const usersRoute = express.Router();

const prisma = withExclude(new PrismaClient());

// Update user
usersRoute.put('/:id', async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: {
      id
    }
  });

  if (userId === id || user?.role === 'ADMIN') {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (error) {
        return res.status(500).json(error);
      }
    }
    try {
      const user = await prisma.user.update({
        where: {
          id
        },
        data: {
          username: req.body.username || undefined,
          email: req.body.email || undefined,
          password: req.body.password || undefined,
          profilePicture: req.body.profilePicture || undefined,
          coverPicture: req.body.coverPicture || undefined,
          info: {
            city: req.body.city || undefined,
            description: req.body.description || undefined,
            from: req.body.from || undefined,
            relationship: req.body.relationship || undefined
          }
        }
      });
      res.status(200).json('Account has been updated!');
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    return res
      .status(403)
      .json({ message: 'You can update only your account!' });
  }
});

// Delete user
usersRoute.delete('/:id', async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: {
      id
    }
  });

  if (userId === id || user?.role === 'ADMIN') {
    try {
      const user = await prisma.user.delete({
        where: {
          id
        }
      });
      res.status(200).json('Account has been deleted!');
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    return res
      .status(403)
      .json({ message: 'You can delete only your account!' });
  }
});

// Get user
usersRoute.get('/:id', async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;

  if (userId === id) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id
        },
        select: prisma.$exclude('user', ['password', 'updatedAt'])
      });
      res.status(200).json(user);
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    return res.status(403).json({ message: 'User not found!' });
  }
});
