import {
  getUser,
  deleteUser,
  updateUser,
  followUser,
  unfollowUser
} from '@/controllers/users';
import express from 'express';
export const usersRoute = express.Router();

// Update user
usersRoute.put('/:id', updateUser);

// Delete user
usersRoute.delete('/:id', deleteUser);

// Get user
usersRoute.get('/:id', getUser);

// Follow to user
usersRoute.put('/:id/follow', followUser);

// Unfollow user
usersRoute.put('/:id/unfollow', unfollowUser);
