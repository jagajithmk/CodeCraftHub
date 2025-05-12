const userService = require('../../services/user.service');
const { logger } = require('../../config/logger');
const jwt = require('jsonwebtoken');
const { AppError } = require('../../utils/errors');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

exports.register = async (req, res, next) => {
  try {
    const userData = req.body;
    const user = await userService.createUser(userData);
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        },
        token
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userService.authenticateUser(email, password);
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        },
        token
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await userService.getUserById(userId);
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          skills: user.skills,
          learningPreferences: user.learningPreferences
        }
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    
    // Prevent updating sensitive fields
    delete updateData.password;
    delete updateData.email;
    delete updateData.role;
    
    const updatedUser = await userService.updateUser(userId, updateData);
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          skills: updatedUser.skills,
          learningPreferences: updatedUser.learningPreferences
        }
      }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    next(error);
  }
};

exports.getLearningProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const progress = await userService.getLearningProgress(userId);
    
    res.status(200).json({
      status: 'success',
      data: {
        progress
      }
    });
  } catch (error) {
    logger.error('Get learning progress error:', error);
    next(error);
  }
};

exports.updateLearningProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { courseId, progress } = req.body;
    
    if (!courseId || progress === undefined) {
      throw new AppError('Course ID and progress are required', 400);
    }
    
    const updatedProgress = await userService.updateLearningProgress(userId, courseId, progress);
    
    res.status(200).json({
      status: 'success',
      data: {
        progress: updatedProgress
      }
    });
  } catch (error) {
    logger.error('Update learning progress error:', error);
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const users = await userService.getAllUsers(parseInt(page), parseInt(limit));
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users: users.map(user => ({
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive
        }))
      }
    });
  } catch (error) {
    logger.error('Get all users error:', error);
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          skills: user.skills,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    logger.error('Get user by ID error:', error);
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedUser = await userService.updateUser(id, updateData);
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
          isActive: updatedUser.isActive
        }
      }
    });
  } catch (error) {
    logger.error('Update user error:', error);
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    
    res.status(204).send();
  } catch (error) {
    logger.error('Delete user error:', error);
    next(error);
  }
};