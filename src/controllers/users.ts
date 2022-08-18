import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import prisma from '@/prisma/prisma';
import { User } from '@prisma/client';
import { prismaExclude } from 'prisma-exclude';

const exclude = prismaExclude(prisma);

//Update user
export const updateUser: RequestHandler<{ id: string }> = async (req, res) => {
  const userData = req.body as User;
  const userId = userData.id;
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
          username: userData.username || undefined,
          email: userData.email || undefined,
          password: userData.password || undefined,
          profilePicture: userData.profilePicture || undefined,
          coverPicture: userData.coverPicture || undefined,
          info: {
            city: userData.info?.city || undefined,
            description: userData.info?.description || undefined,
            from: userData.info?.from || undefined,
            relationship: userData.info?.relationship || undefined
          }
        }
      });
      res
        .status(200)
        .json({ message: 'Account has been updated!', newUser: user });
    } catch (error: unknown) {
      if (error instanceof Error)
        return res.status(500).json({ message: error.message });
    }
  } else {
    return res
      .status(403)
      .json({ message: 'You can update only your account!' });
  }
};

// Delete user
export const deleteUser: RequestHandler<{ id: string }> = async (req, res) => {
  const { userId } = req.body as { userId: string };
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
      res
        .status(200)
        .json({ message: 'Account has been deleted!', deletedUser: user });
    } catch (error: unknown) {
      if (error instanceof Error)
        return res.status(500).json({ message: error.message });
    }
  } else {
    return res
      .status(403)
      .json({ message: 'You can delete only your account!' });
  }
};

// Get user
export const getUser: RequestHandler<{ id: string }> = async (req, res) => {
  const { userId } = req.body as { userId: string };
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
    } catch (error: unknown) {
      if (error instanceof Error)
        return res.status(500).json({ message: error.message });
    }
  } else {
    return res.status(403).json({ message: 'User not found!' });
  }
};

// Follow to user
export const followUser: RequestHandler<{ id: string }> = async (req, res) => {
  const { userId } = req.body as { userId: string };
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
    } catch (error: unknown) {
      if (error instanceof Error)
        return res.status(500).json({ message: error.message });
    }
  } else {
    return res.status(403).json({ message: 'You cannot follow yourself!' });
  }
};

// Unfollow user
export const unfollowUser: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  const { userId } = req.body as { userId: string };
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
    } catch (error: unknown) {
      if (error instanceof Error)
        return res.status(500).json({ message: error.message });
    }
  } else {
    return res.status(403).json({ message: 'You cannot unfollow yourself!' });
  }
};
