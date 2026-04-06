import {ObjectId} from 'mongodb';
import {blogs} from '../mongoCollections.js';
import {
  validateTitle,
  validateBody,
  validateTags,
  validateComment,
  formatDate
} from '../utils/validation.js';
import {getUserById} from './users.js';

export const createBlog = async (title, body, tags, postedBy) => {
  const validatedTitle = validateTitle(title);
  const validatedBody = validateBody(body);
  const validatedTags = validateTags(tags);

  if (!postedBy || !postedBy._id || !postedBy.username || !postedBy.name) {
    throw { status: 400, message: 'postedBy must be provided with _id, username, and name' };
  }
  if (!ObjectId.isValid(postedBy._id)) {
    throw { status: 400, message: 'Invalid postedBy._id' };
  }
  if (typeof postedBy.username !== 'string' || typeof postedBy.name !== 'string') {
    throw { status: 400, message: 'postedBy.username and postedBy.name must be strings' };
  }

  const newBlog = {
    _id: new ObjectId(),
    title: validatedTitle,
    body: validatedBody,
    postedBy: {
      _id: new ObjectId(postedBy._id),
      username: postedBy.username.trim(),
      name: postedBy.name.trim()
    },
    postedDate: formatDate(),
    comments: []
  };

  if (validatedTags !== undefined) {
    newBlog.tags = validatedTags;
  }

  const blogCollection = await blogs();
  const insertInfo = await blogCollection.insertOne(newBlog);
  if (insertInfo.insertedCount === 0) {
    throw { status: 500, message: 'Could not add blog post' };
  }

  return await getBlogById(insertInfo.insertedId.toString());
};

export const getBlogById = async (id) => {
  if (!id) {
    throw { status: 400, message: 'Blog ID must be provided' };
  }
  if (typeof id !== 'string') {
    throw { status: 400, message: 'Blog ID must be a string' };
  }
  if (id.trim().length === 0) {
    throw { status: 400, message: 'Blog ID cannot be empty' };
  }
  if (!ObjectId.isValid(id)) {
    throw { status: 400, message: 'Invalid blog ID' };
  }

  const blogCollection = await blogs();
  const blog = await blogCollection.findOne({ _id: new ObjectId(id) });

  if (!blog) {
    throw { status: 404, message: 'Blog post not found' };
  }

  return blog;
};

export const getAllBlogs = async (skip = 0, take = 25) => {
  if (typeof skip !== 'number' || skip < 0 || !Number.isInteger(skip)) {
    throw { status: 400, message: 'skip must be a non-negative integer' };
  }
  if (typeof take !== 'number' || take < 1 || !Number.isInteger(take)) {
    throw { status: 400, message: 'take must be a positive integer' };
  }
  if (take > 100) {
    take = 100;
  }

  const blogCollection = await blogs();
  const blogList = await blogCollection
    .find({})
    .sort({ postedDate: -1 })
    .skip(skip)
    .limit(take)
    .toArray();

  return blogList;
};

export const getBlogsByTag = async (tag) => {
  if (!tag) {
    throw { status: 400, message: 'Tag must be provided' };
  }
  if (typeof tag !== 'string') {
    throw { status: 400, message: 'Tag must be a string' };
  }
  if (tag.trim().length === 0) {
    throw { status: 400, message: 'Tag cannot be empty' };
  }

  const trimmedTag = tag.trim();
  const blogCollection = await blogs();
  const blogList = await blogCollection
    .find({
      tags: { $regex: new RegExp(`^${trimmedTag}$`, 'i') }
    })
    .sort({ postedDate: -1 })
    .toArray();

  return blogList;
};

export const updateBlog = async (id, title, body, userId, isPatch = false) => {
  if (!id) {
    throw { status: 400, message: 'Blog ID must be provided' };
  }
  if (typeof id !== 'string') {
    throw { status: 400, message: 'Blog ID must be a string' };
  }
  if (id.trim().length === 0) {
    throw { status: 400, message: 'Blog ID cannot be empty' };
  }
  if (!ObjectId.isValid(id)) {
    throw { status: 400, message: 'Invalid blog ID' };
  }

  if (!userId) {
    throw { status: 400, message: 'User ID must be provided' };
  }
  if (!ObjectId.isValid(userId)) {
    throw { status: 400, message: 'Invalid user ID' };
  }

  const blog = await getBlogById(id);

  if (blog.postedBy._id.toString() !== userId) {
    throw { status: 403, message: 'You can only update your own blog posts' };
  }

  const updateObj = {};
  
  if (isPatch) {
    if (title !== undefined) {
      updateObj.title = validateTitle(title);
    }
    if (body !== undefined) {
      updateObj.body = validateBody(body);
    }
    if (Object.keys(updateObj).length === 0) {
      throw { status: 400, message: 'At least one field (title or body) must be provided for PATCH' };
    }
  } else {
    updateObj.title = validateTitle(title);
    updateObj.body = validateBody(body);
  }

  updateObj.updatedDate = formatDate();

  const blogCollection = await blogs();
  const updateInfo = await blogCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateObj }
  );

  if (updateInfo.modifiedCount === 0) {
    throw { status: 500, message: 'Could not update blog post' };
  }

  return await getBlogById(id);
};

export const addComment = async (blogId, comment, postedBy) => {
  if (!blogId) {
    throw { status: 400, message: 'Blog ID must be provided' };
  }
  if (typeof blogId !== 'string') {
    throw { status: 400, message: 'Blog ID must be a string' };
  }
  if (!ObjectId.isValid(blogId)) {
    throw { status: 400, message: 'Invalid blog ID' };
  }

  const validatedComment = validateComment(comment);

  if (!postedBy || !postedBy._id || !postedBy.username || !postedBy.name) {
    throw { status: 400, message: 'postedBy must be provided with _id, username, and name' };
  }
  if (!ObjectId.isValid(postedBy._id)) {
    throw { status: 400, message: 'Invalid postedBy._id' };
  }

  const blog = await getBlogById(blogId);

  const newComment = {
    _id: new ObjectId(),
    postedBy: {
      _id: new ObjectId(postedBy._id),
      username: postedBy.username.trim(),
      name: postedBy.name.trim()
    },
    postedDate: formatDate(),
    comment: validatedComment
  };

  const blogCollection = await blogs();
  const result = await blogCollection.updateOne(
    { _id: new ObjectId(blogId) },
    { $push: { comments: newComment } }
  );

  if (result.modifiedCount === 0) {
    throw { status: 500, message: 'Could not add comment' };
  }

  return await getBlogById(blogId);
};

export const deleteComment = async (blogId, commentId, userId) => {
  if (!blogId) {
    throw { status: 400, message: 'Blog ID must be provided' };
  }
  if (typeof blogId !== 'string') {
    throw { status: 400, message: 'Blog ID must be a string' };
  }
  if (!ObjectId.isValid(blogId)) {
    throw { status: 400, message: 'Invalid blog ID' };
  }

  if (!commentId) {
    throw { status: 400, message: 'Comment ID must be provided' };
  }
  if (typeof commentId !== 'string') {
    throw { status: 400, message: 'Comment ID must be a string' };
  }
  if (!ObjectId.isValid(commentId)) {
    throw { status: 400, message: 'Invalid comment ID' };
  }

  if (!userId) {
    throw { status: 400, message: 'User ID must be provided' };
  }
  if (!ObjectId.isValid(userId)) {
    throw { status: 400, message: 'Invalid user ID' };
  }

  const blog = await getBlogById(blogId);
  const comment = blog.comments.find(c => c._id.toString() === commentId);

  if (!comment) {
    throw { status: 404, message: 'Comment not found' };
  }

  if (comment.postedBy._id.toString() !== userId) {
    throw { status: 403, message: 'You can only delete your own comments' };
  }

  const blogCollection = await blogs();
  const result = await blogCollection.updateOne(
    { _id: new ObjectId(blogId) },
    { $pull: { comments: { _id: new ObjectId(commentId) } } }
  );

  if (result.modifiedCount === 0) {
    throw { status: 500, message: 'Could not delete comment' };
  }

  return await getBlogById(blogId);
};

