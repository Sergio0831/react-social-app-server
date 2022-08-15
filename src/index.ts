import { usersRoute, authRoute } from './routes';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

app.use(express.json());
app.use(helmet());
app.use(morgan('common'));

app.use('/api/users', usersRoute);
app.use('/api/auth', authRoute);

const server = app.listen(4000, () => {
  console.log(`🚀 Server ready at: http://localhost:4000`);
});
