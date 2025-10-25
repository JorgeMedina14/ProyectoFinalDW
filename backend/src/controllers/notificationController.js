const NotificationPreferences = require('../models/NotificationPreferences');
const notificationScheduler = require('../services/notificationScheduler');
const emailService = require('../services/emailService');

// Obtener preferencias de notificación del usuario
const getUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = await NotificationPreferences.getOrCreateUserPreferences(userId);
    
    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error obteniendo preferencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener preferencias de notificación'
    });
  }
};

// Actualizar preferencias de notificación
const updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;
    
    // Validar datos de entrada
    if (updates.mealTimes) {
      const validMealTypes = ['desayuno', 'almuerzo', 'merienda', 'cena'];
      for (const [mealType, time] of Object.entries(updates.mealTimes)) {
        if (!validMealTypes.includes(mealType)) {
          return res.status(400).json({
            success: false,
            message: `Tipo de comida inválido: ${mealType}`
          });
        }
        
        // Validar formato de hora (HH:MM)
        if (time && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
          return res.status(400).json({
            success: false,
            message: `Formato de hora inválido para ${mealType}: ${time}`
          });
        }
      }
    }
    
    // Validar configuración de notificaciones por correo
    if (updates.emailNotifications) {
      if (updates.emailNotifications.weeklyMenu && updates.emailNotifications.weeklyMenu.day) {
        const validDays = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
        if (!validDays.includes(updates.emailNotifications.weeklyMenu.day)) {
          return res.status(400).json({
            success: false,
            message: 'Día de la semana inválido'
          });
        }
      }
    }

    const preferences = await NotificationPreferences.updateUserPreferences(userId, updates);
    
    res.json({
      success: true,
      message: 'Preferencias actualizadas correctamente',
      data: preferences
    });
  } catch (error) {
    console.error('Error actualizando preferencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar preferencias de notificación'
    });
  }
};

// Enviar correo de prueba
const sendTestEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await notificationScheduler.sendTestNotification(userId);
    
    res.json({
      success: true,
      message: 'Correo de prueba enviado correctamente'
    });
  } catch (error) {
    console.error('Error enviando correo de prueba:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar correo de prueba'
    });
  }
};

// Enviar notificación de próxima comida
const sendNextMealNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await notificationScheduler.sendNextMealNotification(userId);
    
    res.json({
      success: true,
      message: 'Notificación de próxima comida enviada'
    });
  } catch (error) {
    console.error('Error enviando notificación de próxima comida:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al enviar notificación de próxima comida'
    });
  }
};

// Obtener estado del sistema de notificaciones
const getNotificationStatus = async (req, res) => {
  try {
    const status = notificationScheduler.getStatus();
    const emailStatus = await emailService.verifyConnection();
    
    res.json({
      success: true,
      data: {
        scheduler: status,
        emailService: {
          connected: emailStatus,
          configured: !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS
        }
      }
    });
  } catch (error) {
    console.error('Error obteniendo estado de notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado del sistema de notificaciones'
    });
  }
};

// Habilitar/deshabilitar notificaciones por correo
const toggleEmailNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { enabled } = req.body;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'El valor "enabled" debe ser true o false'
      });
    }
    
    const preferences = await NotificationPreferences.updateUserPreferences(userId, {
      'emailNotifications.enabled': enabled
    });
    
    res.json({
      success: true,
      message: `Notificaciones por correo ${enabled ? 'habilitadas' : 'deshabilitadas'}`,
      data: preferences
    });
  } catch (error) {
    console.error('Error cambiando estado de notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado de notificaciones'
    });
  }
};

// Configurar horarios de comidas rápidamente
const setMealTimes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mealTimes } = req.body;
    
    if (!mealTimes || typeof mealTimes !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Horarios de comidas requeridos'
      });
    }
    
    const preferences = await NotificationPreferences.updateUserPreferences(userId, {
      mealTimes
    });
    
    res.json({
      success: true,
      message: 'Horarios de comidas actualizados',
      data: preferences
    });
  } catch (error) {
    console.error('Error actualizando horarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar horarios de comidas'
    });
  }
};

// Configurar zona horaria
const setTimezone = async (req, res) => {
  try {
    const userId = req.user.id;
    const { timezone } = req.body;
    
    if (!timezone) {
      return res.status(400).json({
        success: false,
        message: 'Zona horaria requerida'
      });
    }
    
    const preferences = await NotificationPreferences.updateUserPreferences(userId, {
      timezone
    });
    
    res.json({
      success: true,
      message: 'Zona horaria actualizada',
      data: preferences
    });
  } catch (error) {
    console.error('Error actualizando zona horaria:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar zona horaria'
    });
  }
};

module.exports = {
  getUserPreferences,
  updateUserPreferences,
  sendTestEmail,
  sendNextMealNotification,
  getNotificationStatus,
  toggleEmailNotifications,
  setMealTimes,
  setTimezone
};