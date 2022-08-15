import express from 'express';

export const authRoute = express.Router();

authRoute.get('/', (req, res) => {
  res.send("hey it's auth router");
});
