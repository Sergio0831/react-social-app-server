import express from 'express';

const app = express();

const server = app.listen(4000, () => {
  console.log(`🚀 Server ready at: http://localhost:4000`);
});
