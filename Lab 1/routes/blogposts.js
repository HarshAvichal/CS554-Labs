import express from 'express';
import {ObjectId} from 'mongodb';
import * as blogData from '../data/blogs.js';
import * as userData from '../data/users.js';
import {requireAuth, requireAuthAndCommentOwner} from '../middleware/auth.js';
import {validateSkip, validateTake} from '../utils/validation.js';

const router = express.Router();

const trimRequestBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    }
  }
  next();
};

router.use(trimRequestBody);

router.get('/', async (req, res) => {
  try {
    const skip = validateSkip(req.query.skip);
    const take = validateTake(req.query.take);
    const blogList = await blogData.getAllBlogs(skip, take);
    return res.json(blogList);
  } catch (err) {
    const statusCode = err.status || 500;
    return res.status(statusCode).json({ error: err.message || 'Internal server error' });
  }
});

router.get('/bytag/:tag', async (req, res) => {
  try {
    const blogList = await blogData.getBlogsByTag(req.params.tag);
    return res.json(blogList);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
  }
});

router.get('/logout', async (req, res) => {
  try {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: 'Could not log out, please try again' });
        }
        return res.json({ message: 'You have been logged out' });
      });
    } else {
      return res.json({ message: 'You have been logged out' });
    }
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message || 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const blog = await blogData.getBlogById(req.params.id);
    return res.json(blog);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Request body must be a JSON object' });
    }

    const {title, body, tags} = req.body;

    const user = await userData.getUserById(req.session.user._id);
    const postedBy = {
      _id: user._id.toString(),
      username: user.username,
      name: `${user.firstName} ${user.lastName}`
    };

    const newBlog = await blogData.createBlog(title, body, tags, postedBy);
    return res.json(newBlog);
  } catch (error) {
    const statusCode = error.status || 500;
    return res.status(statusCode).json({ error: error.message || 'Internal server error' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Request body must be a JSON object' });
    }

    const {title, body} = req.body;

    const updatedBlog = await blogData.updateBlog(
      req.params.id,
      title,
      body,
      req.session.user._id.toString(),
      false
    );
    return res.json(updatedBlog);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  }
});

router.patch('/:id', requireAuth, async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Request body must be a JSON object' });
    }

    const {title, body} = req.body;

    const updatedBlog = await blogData.updateBlog(
      req.params.id,
      title,
      body,
      req.session.user._id.toString(),
      true
    );
    return res.json(updatedBlog);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
  }
});

router.post('/:id/reactions', requireAuth, async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Request body must be a JSON object' });
    }

    const {comment} = req.body;

    const user = await userData.getUserById(req.session.user._id);
    const postedBy = {
      _id: user._id.toString(),
      username: user.username,
      name: `${user.firstName} ${user.lastName}`
    };

    const updatedBlog = await blogData.addComment(req.params.id, comment, postedBy);
    return res.json(updatedBlog);
  } catch (err) {
    const statusCode = err.status || 500;
    return res.status(statusCode).json({ error: err.message || 'Internal server error' });
  }
});

router.delete('/:blogId/:commentId', requireAuthAndCommentOwner, async (req, res) => {
  try {
    const updatedBlog = await blogData.deleteComment(
      req.params.blogId,
      req.params.commentId,
      req.session.user._id.toString()
    );
    return res.json(updatedBlog);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
  }
});

router.post('/signup', async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Request body must be a JSON object' });
    }

    const {firstName, lastName, username, password} = req.body;

    const newUser = await userData.createUser(firstName, lastName, username, password);
    return res.json(newUser);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Request body must be a JSON object' });
    }

    const {username, password} = req.body;

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return res.status(400).json({ error: 'Username must be provided' });
    }
    if (!password || typeof password !== 'string' || password.trim().length === 0) {
      return res.status(400).json({ error: 'Password must be provided' });
    }

    const user = await userData.verifyUser(username.trim(), password.trim());

    req.session.user = {
      _id: user._id.toString(),
      username: user.username
    };

    return res.json(user);
  } catch (error) {
    const statusCode = error.status || 500;
    return res.status(statusCode).json({ error: error.message || 'Internal server error' });
  }
});

export default router;

