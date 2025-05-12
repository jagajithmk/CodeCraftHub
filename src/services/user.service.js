const User = require('../models/user.model');
const { AppError } = require('../utils/errors');
const { logger } = require('../config/logger');

exports.createUser = async (userData) => {
  // Check if user with email already exists
  const existingUser = await User.findOne({ 
    $or: [{ email: userData.email }, { username: userData.username }] 
  });
  
  if (existingUser) {
    if (existingUser.email === userData.email) {
      throw new AppError('Email already in use', 400);
    } else {
      throw new AppError('Username already taken', 400);
    }
  }
  
  // Create new user
  const user = new User(userData);
  await user.save();
  return user;
};

exports.authenticateUser = async (email, password) => {
  // Find user by email
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }
  
  // Check if user is active
  if (!user.isActive) {
    throw new AppError('Account is inactive', 403);
  }
  
  // Check if password is valid
  const isValid = await user.isValidPassword(password);
  
  if (!isValid) {
    throw new AppError('Invalid email or password', 401);
  }
  
  return user;
};

exports.getUserById = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  return user;
};

exports.updateUser = async (userId, updateData) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Update user data
  Object.keys(updateData).forEach(key => {
    user[key] = updateData[key];
  });
  
  await user.save();
  return user;
};

exports.getAllUsers = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const users = await User.find()
    .skip(skip)
    .limit(limit)
    .select('-password');
  
  return users;
};

exports.deleteUser = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Instead of deleting, mark as inactive
  user.isActive = false;
  await user.save();
  
  return true;
};

exports.getLearningProgress = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  return user.progressHistory || [];
};

exports.updateLearningProgress = async (userId, courseId, progress) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Find if course progress already exists
  const existingProgressIndex = user.progressHistory.findIndex(
    p => p.courseId.toString() === courseId
  );
  
  if (existingProgressIndex !== -1) {
    // Update existing progress
    user.progressHistory[existingProgressIndex].progress = progress;
    user.progressHistory[existingProgressIndex].lastAccessed = new Date();
  } else {
    // Add new progress entry
    user.progressHistory.push({
      courseId,
      progress,
      lastAccessed: new Date()
    });
  }
  
  await user.save();
  return user.progressHistory;
};