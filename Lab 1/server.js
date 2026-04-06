import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import blogpostsRoutes from './routes/blogposts.js';
import {mongoConfig} from './settings.js';

const app = express();
const port = 3000;

app.use(
  session({
    name: 'AuthCookie',
    secret: 'some secret string!',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoConfig.serverUrl + mongoConfig.database,
      ttl: 14 * 24 * 60 * 60
    }),
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 14 * 24 * 60 * 60 * 1000
    }
  })
);

app.use(express.json());

app.use('/blogposts', blogpostsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'CS-554 Lab 1 API Server' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

