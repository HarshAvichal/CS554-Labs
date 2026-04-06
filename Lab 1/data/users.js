import {ObjectId} from 'mongodb';
import {users} from '../mongoCollections.js';
import {
  validateFirstName,
  validateLastName,
  validateUsername,
  validatePassword
} from '../utils/validation.js';
import bcrypt from 'bcrypt';

export const createUser = async (firstName, lastName, username, password) => {
  const validatedFirstName = validateFirstName(firstName);
  const validatedLastName = validateLastName(lastName);
  const validatedUsername = validateUsername(username);
  const validatedPassword = validatePassword(password);

  const userCollection = await users();
  const existingUser = await userCollection.findOne({
    username: { $regex: new RegExp(`^${validatedUsername}$`, 'i') }
  });

  if (existingUser) {
    throw { status: 400, message: 'Username already exists' };
  }

  const saltRounds = 16;
  const hashedPassword = await bcrypt.hash(validatedPassword, saltRounds);

  const newUser = {
    _id: new ObjectId(),
    firstName: validatedFirstName,
    lastName: validatedLastName,
    username: validatedUsername,
    password: hashedPassword
  };

  const insertInfo = await userCollection.insertOne(newUser);
  if (insertInfo.insertedCount === 0) {
    throw { status: 500, message: 'Could not add user' };
  }

  const user = await getUserById(insertInfo.insertedId.toString());
  return user;
};

export const getUserById = async (id) => {
  if (!id) {
    throw { status: 400, message: 'User ID must be provided' };
  }
  if (typeof id !== 'string') {
    throw { status: 400, message: 'User ID must be a string' };
  }
  if (id.trim().length === 0) {
    throw { status: 400, message: 'User ID cannot be empty' };
  }
  if (!ObjectId.isValid(id)) {
    throw { status: 400, message: 'Invalid user ID' };
  }

  const userCollection = await users();
  const user = await userCollection.findOne({ _id: new ObjectId(id) });

  if (!user) {
    throw { status: 404, message: 'User not found' };
  }

  delete user.password;
  return user;
};

export const getUserByUsername = async (username) => {
  const validatedUsername = validateUsername(username);

  const userCollection = await users();
  const user = await userCollection.findOne({
    username: { $regex: new RegExp(`^${validatedUsername}$`, 'i') }
  });

  if (!user) {
    throw { status: 404, message: 'User not found' };
  }

  return user;
};

export const verifyUser = async (username, password) => {
  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    throw { status: 400, message: 'Username must be provided' };
  }
  if (!password || typeof password !== 'string' || password.trim().length === 0) {
    throw { status: 400, message: 'Password must be provided' };
  }

  const user = await getUserByUsername(username);
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw { status: 401, message: 'Invalid username or password' };
  }

  delete user.password;
  return user;
};

