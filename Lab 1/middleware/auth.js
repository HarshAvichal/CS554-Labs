export const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'You must be logged in to perform this action' });
  }
  next();
};

export const requireAuthAndCommentOwner = async (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'You must be logged in to perform this action' });
  }

  next();
};

