import express from 'express';

export const usersRoute = express.Router();

usersRoute.get('/', (req, res) => {
  res.send("hey it's user router");
});
