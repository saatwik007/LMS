const jwt = require('jsonwebtoken');

function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = req.cookies?.token || bearerToken;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized. Please login first.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired session.' });
  }
}

module.exports = {
  protect
};
