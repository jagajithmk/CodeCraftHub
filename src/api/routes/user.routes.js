const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validateUser, validateLogin } = require('../validators/user.validator');

// Public routes
router.post('/register', validateUser, userController.register);
router.post('/login', validateLogin, userController.login);

// Protected routes
router.get('/profile', authMiddleware.authenticate, userController.getProfile);
router.put('/profile', authMiddleware.authenticate, userController.updateProfile);
router.get('/progress', authMiddleware.authenticate, userController.getLearningProgress);
router.post('/progress', authMiddleware.authenticate, userController.updateLearningProgress);

// Admin routes
router.get('/', authMiddleware.authorize('admin'), userController.getAllUsers);
router.get('/:id', authMiddleware.authorize('admin'), userController.getUserById);
router.put('/:id', authMiddleware.authorize('admin'), userController.updateUser);
router.delete('/:id', authMiddleware.authorize('admin'), userController.deleteUser);

module.exports = router;