import express from 'express';
import bcrypt from 'bcrypt';
import { prismaExclude } from 'prisma-exclude';
import prisma from '../../prisma/prisma';
export const usersRoute = express.Router();

const exclude = prismaExclude(prisma);

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
        select: exclude('user', ['password', 'updatedAt'])
      });
      res.status(200).json(user);
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    return res.status(403).json({ message: 'User not found!' });
  }
});

// Follow to user
usersRoute.put('/:id/follow', async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;

  if (userId !== id) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id
        }
      });
      const currentUser = await prisma.user.findUnique({
        where: {
          id: userId
        }
      });
      if (!user?.followedByIds.includes(userId)) {
        await prisma.user.update({
          where: {
            id
          },
          data: {
            followedByIds: {
              push: userId
            }
          }
        });
        await prisma.user.update({
          where: {
            id: userId
          },
          data: {
            followingIDs: {
              push: id
            }
          }
        });
        res
          .status(200)
          .json({ message: `You follow to ${currentUser?.username}` });
      } else {
        res
          .status(403)
          .json({ message: `You already follow to ${currentUser?.username}` });
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    return res.status(403).json({ message: 'You cannot follow yourself!' });
  }
});

// Unfollow user
usersRoute.put('/:id/unfollow', async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;

  if (userId !== id) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id
        }
      });
      const currentUser = await prisma.user.findUnique({
        where: {
          id: userId
        }
      });
      if (user?.followedByIds.includes(userId)) {
        await prisma.user.update({
          where: {
            id
          },
          data: {
            followedByIds: user?.followingIDs.filter((id) => id !== userId)
          }
        });
        await prisma.user.update({
          where: {
            id: userId
          },
          data: {
            followingIDs: currentUser?.followedByIds.filter((id) => id !== id)
          }
        });
        res
          .status(200)
          .json({ message: `You unfollow from ${currentUser?.username}` });
      } else {
        res
          .status(403)
          .json({ message: `You don't follow to ${currentUser?.username}` });
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    return res.status(403).json({ message: 'You cannot unfollow yourself!' });
  }
});
