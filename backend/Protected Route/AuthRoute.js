import jwt from 'jsonwebtoken';
import {user} from '../Schema/user.schema.js'; // Ensure correct model import

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - No token provided',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - Invalid token',
      });
    }

    // Find user from decoded ID
    const currentUser = await user.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - User not found',
      });
    }

    // Attach user to request object
    req.user = currentUser;

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.log('Error in auth middleware: ', error);

    // Handle token verification errors
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - Invalid token',
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
};
