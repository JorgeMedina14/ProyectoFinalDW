const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getUserPreferences,
  updateUserPreferences,
  sendTestEmail,
  sendNextMealNotification,
  getNotificationStatus,
  toggleEmailNotifications,
  setMealTimes,
  setTimezone
} = require('../controllers/notificationController');

// Obtener preferencias de notificación del usuario autenticado
router.get('/preferences', protect, getUserPreferences);

// Actualizar preferencias de notificación
router.put('/preferences', protect, updateUserPreferences);

// Configuración rápida de horarios de comidas
router.put('/meal-times', protect, setMealTimes);

// Configurar zona horaria
router.put('/timezone', protect, setTimezone);

// Habilitar/deshabilitar notificaciones por correo
router.put('/toggle-email', protect, toggleEmailNotifications);

// Enviar correo de prueba
router.post('/test-email', protect, sendTestEmail);

// Enviar notificación de próxima comida inmediatamente
router.post('/send-next-meal', protect, sendNextMealNotification);

// Obtener estado del sistema de notificaciones (para administradores)
router.get('/status', protect, getNotificationStatus);

module.exports = router;