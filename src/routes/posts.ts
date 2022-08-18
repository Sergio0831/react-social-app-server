import {
  createPost,
  deletePost,
  updatePost,
  likeDislikePost,
  getPost,
  getUserPosts
} from '@/controllers/posts';
import express from 'express';

export const postsRoute = express.Router();

// Create post
postsRoute.post('/', createPost);

// Update post
postsRoute.put('/:id', updatePost);

// Delete post
postsRoute.delete('/:id', deletePost);

// Like and dislike post
postsRoute.put('/:id/like', likeDislikePost);

// Get a post
postsRoute.get('/:id', getPost);

// Get user posts
postsRoute.get('/timeline/all', getUserPosts);
