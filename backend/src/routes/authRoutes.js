const express = require('express');
const router = express.Router();
const { register, login, getProfile, getAllUsers } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Rutas públicas
router.post('/register', register);
router.post('/login', login);
router.get('/users', getAllUsers); // TEMPORAL PARA DESARROLLO

// Rutas protegidas
router.get('/profile', protect, getProfile);

module.exports = router;