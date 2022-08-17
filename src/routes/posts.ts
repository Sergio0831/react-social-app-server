import express from 'express';
import prisma from '../../prisma/prisma';

export const postsRoute = express.Router();

// Create a post
postsRoute.post('/', async (req, res) => {
  const { description, image, userId } = req.body;

  try {
    const post = await prisma.post.create({
      data: {
        description,
        image: image || undefined,
        author: {
          connect: {
            id: userId
          }
        }
      }
    });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Update post
postsRoute.put('/:id', async (req, res) => {
  const { description, image, userId } = req.body;
  const { id } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: {
        id
      }
    });

    if (post?.userId === userId) {
      const post = await prisma.post.update({
        where: {
          id
        },
        data: {
          description: description || undefined,
          image: image || undefined
        }
      });
      res.status(200).json('Post has been updated');
    } else {
      res.status(403).json({ message: 'You can update only your post' });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// Delete post
postsRoute.delete('/:id', async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: {
        id
      }
    });

    if (post?.userId === userId) {
      const post = await prisma.post.delete({
        where: {
          id
        }
      });
      res.status(200).json('Post has been deleted!');
    } else {
      res.status(403).json({ message: 'You can delete only your post' });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// Like and dislike post
postsRoute.put('/:id/like', async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: {
        id
      }
    });

    if (!post?.likes.includes(userId)) {
      await prisma.post.update({
        where: {
          id
        },
        data: {
          likes: {
            push: userId
          }
        }
      });
    } else {
      await prisma.post.update({
        where: {
          id
        },
        data: {
          likes: post.likes.filter((like) => like !== userId)
        }
      });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get a post
postsRoute.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: {
        id
      },
      include: {
        author: true
      }
    });

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get user posts
postsRoute.get('/timeline/all', async (req, res) => {
  const { userId } = req.body;
  try {
    const post = await prisma.post.findMany({
      where: {
        userId
      }
    });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
});
