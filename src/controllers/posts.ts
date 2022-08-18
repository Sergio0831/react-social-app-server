import { Post } from '@prisma/client';
import { RequestHandler } from 'express';
import prisma from '@/prisma/prisma';

// Create post
export const createPost: RequestHandler = async (req, res) => {
  const { description, image, userId } = req.body as Post;

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
    res.status(200).json({ message: 'Post created', newPost: post });
  } catch (error: unknown) {
    if (error instanceof Error)
      return res.status(500).json({ message: error.message });
  }
};

// Update post
export const updatePost: RequestHandler<{ id: string }> = async (req, res) => {
  const { description, image, userId } = req.body as Post;
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
      res
        .status(200)
        .json({ message: 'Post has been updated', updatedPost: post });
    } else {
      res.status(403).json({ message: 'You can update only your post' });
    }
  } catch (error: unknown) {
    if (error instanceof Error)
      return res.status(500).json({ message: error.message });
  }
};

// Delete post
export const deletePost: RequestHandler<{ id: string }> = async (req, res) => {
  const { userId } = req.body as { userId: string };
  const { id } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: {
        id
      }
    });

    if (post?.userId === userId) {
      await prisma.post.delete({
        where: {
          id
        }
      });
      res.status(200).json({ message: 'Post has been deleted!' });
    } else {
      res.status(403).json({ message: 'You can delete only your post' });
    }
  } catch (error: unknown) {
    if (error instanceof Error)
      return res.status(500).json({ message: error.message });
  }
};

// Like and dislike post
export const likeDislikePost: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  const { userId } = req.body as { userId: string };
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
  } catch (error: unknown) {
    if (error instanceof Error)
      return res.status(500).json({ message: error.message });
  }
};

// Get single post
export const getPost: RequestHandler<{ id: string }> = async (req, res) => {
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
  } catch (error: unknown) {
    if (error instanceof Error)
      return res.status(500).json({ message: error.message });
  }
};

// Get user posts
export const getUserPosts: RequestHandler = async (req, res) => {
  const { userId } = req.body as { userId: string };
  try {
    const post = await prisma.post.findMany({
      where: {
        userId
      }
    });
    res.status(200).json(post);
  } catch (error: unknown) {
    if (error instanceof Error)
      return res.status(500).json({ message: error.message });
  }
};
