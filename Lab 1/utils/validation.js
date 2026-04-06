export const formatDate = (date = new Date()) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const trimAndValidate = (str, fieldName) => {
  if (typeof str !== 'string') {
    throw { status: 400, message: `${fieldName} must be a string` };
  }
  const trimmed = str.trim();
  if (trimmed.length === 0) {
    throw { status: 400, message: `${fieldName} cannot be empty or just whitespace` };
  }
  return trimmed;
};

export const validateFirstName = (firstName) => {
  const trimmed = trimAndValidate(firstName, 'firstName');
  if (trimmed.length < 2 || trimmed.length > 25) {
    throw { status: 400, message: 'firstName must be between 2 and 25 characters' };
  }
  if (!/^[A-Za-z]+$/.test(trimmed)) {
    throw { status: 400, message: 'firstName must only contain letters A-Z or a-z' };
  }
  if (trimmed.includes(' ')) {
    throw { status: 400, message: 'firstName cannot contain spaces' };
  }
  return trimmed;
};

export const validateLastName = (lastName) => {
  const trimmed = trimAndValidate(lastName, 'lastName');
  if (trimmed.length < 2 || trimmed.length > 25) {
    throw { status: 400, message: 'lastName must be between 2 and 25 characters' };
  }
  if (!/^[A-Za-z\-'\.]+$/.test(trimmed)) {
    throw { status: 400, message: 'lastName can only contain letters and special characters normal for names (hyphens, apostrophes, periods)' };
  }
  if (trimmed.includes(' ')) {
    throw { status: 400, message: 'lastName cannot contain spaces' };
  }
  return trimmed;
};

export const validateUsername = (username) => {
  const trimmed = trimAndValidate(username, 'username');
  if (trimmed.length < 5) {
    throw { status: 400, message: 'username must be at least 5 characters long' };
  }
  if (!/^[A-Za-z0-9]+$/.test(trimmed)) {
    throw { status: 400, message: 'username must contain only letters and numbers, no special characters or spaces' };
  }
  const isOnlyNumbers = /^\d+$/.test(trimmed);
  if (isOnlyNumbers) {
    throw { status: 400, message: 'username cannot be just numbers, must contain at least one letter' };
  }
  return trimmed.toLowerCase();
};

export const validatePassword = (password) => {
  const trimmed = trimAndValidate(password, 'password');
  if (trimmed.length < 8) {
    throw { status: 400, message: 'password must be at least 8 characters long' };
  }
  if (trimmed.includes(' ')) {
    throw { status: 400, message: 'password cannot contain spaces' };
  }
  if (!/[a-z]/.test(trimmed)) {
    throw { status: 400, message: 'password must contain at least one lowercase letter' };
  }
  if (!/[A-Z]/.test(trimmed)) {
    throw { status: 400, message: 'password must contain at least one uppercase letter' };
  }
  if (!/[0-9]/.test(trimmed)) {
    throw { status: 400, message: 'password must contain at least one number' };
  }
  if (!/[^A-Za-z0-9]/.test(trimmed)) {
    throw { status: 400, message: 'password must contain at least one special character' };
  }
  return trimmed;
};

export const validateTitle = (title) => {
  const trimmed = trimAndValidate(title, 'title');
  if (trimmed.length < 10 || trimmed.length > 255) {
    throw { status: 400, message: 'title must be between 10 and 255 characters' };
  }
  return trimmed;
};

export const validateBody = (body) => {
  const trimmed = trimAndValidate(body, 'body');
  if (trimmed.length < 25) {
    throw { status: 400, message: 'body must be at least 25 characters long' };
  }
  return trimmed;
};

export const validateTags = (tags) => {
  if (tags === undefined || tags === null) {
    return undefined;
  }
  if (!Array.isArray(tags)) {
    throw { status: 400, message: 'tags must be an array' };
  }
  return tags.map((tag, index) => {
    const trimmed = trimAndValidate(tag, `tags[${index}]`);
    if (!/^[A-Za-z]+$/.test(trimmed)) {
      throw { status: 400, message: `tags[${index}] must only contain letters A-Z and a-z` };
    }
    return trimmed;
  });
};

export const validateComment = (comment) => {
  const trimmed = trimAndValidate(comment, 'comment');
  if (trimmed.length < 10 || trimmed.length > 500) {
    throw { status: 400, message: 'comment must be between 10 and 500 characters' };
  }
  return trimmed;
};

export const validateSkip = (skip) => {
  if (skip === undefined || skip === null) {
    return 0;
  }
  const num = Number(skip);
  if (isNaN(num) || !Number.isInteger(num) || num < 0) {
    throw { status: 400, message: 'skip must be a non-negative integer' };
  }
  return num;
};

export const validateTake = (take) => {
  if (take === undefined || take === null) {
    return 25;
  }
  const num = Number(take);
  if (isNaN(num) || !Number.isInteger(num) || num < 1) {
    throw { status: 400, message: 'take must be a positive integer' };
  }
  if (num > 100) {
    return 100;
  }
  return num;
};

