import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY;

// Middleware to check token
function checkToken(req, res, next) {
  // Extract the JWT from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // If no token is provided, return an unauthorized response
  if (!token) {
    return res.status(401).json({ auth: false, msg: 'Token not provided.' });
  }

  // Verify the JWT
  jwt.verify(token, AUTH_SECRET_KEY, function (err, decoded) {
    if (err) {
      // If the token is invalid or expired, return an error response
      return res.status(500).json({ auth: false, msg: 'Failed to authenticate token.' });
    }

    // If the token is valid, save the authenticated user ID in the request object
    req.auth = { _id: decoded._id };
    next();
  });
}

export default checkToken;
