const mongoose = require('mongoose');

const notificationPreferencesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  emailNotifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    mealReminders: {
      enabled: {
        type: Boolean,
        default: true
      },
      timeBefore: {
        type: Number,
        default: 30, // minutos antes de la comida
        min: 0,
        max: 120
      }
    },
    weeklyMenu: {
      enabled: {
        type: Boolean,
        default: true
      },
      day: {
        type: String,
        enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        default: 'sunday'
      },
      time: {
        type: String,
        default: '20:00'
      }
    },
    shoppingList: {
      enabled: {
        type: Boolean,
        default: true
      },
      day: {
        type: String,
        enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        default: 'saturday'
      },
      time: {
        type: String,
        default: '10:00'
      }
    }
  },
  mealTimes: {
    desayuno: {
      type: String,
      default: '08:00'  // Cambia aquí el horario que quieras
    },
    almuerzo: {
      type: String,
      default: '13:00'  // Cambia aquí el horario que quieras
    },
    merienda: {
      type: String,
      default: '17:00'  // Cambia aquí el horario que quieras
    },
    cena: {
      type: String,
      default: '20:00'  // Cambia aquí el horario que quieras
    }
  },
  timezone: {
    type: String,
    default: 'America/Guatemala'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar updatedAt
notificationPreferencesSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Método estático para obtener o crear preferencias del usuario
notificationPreferencesSchema.statics.getOrCreateUserPreferences = async function(userId) {
  let preferences = await this.findOne({ user: userId });
  
  if (!preferences) {
    preferences = new this({ user: userId });
    await preferences.save();
  }
  
  return preferences;
};

// Método estático para actualizar preferencias del usuario
notificationPreferencesSchema.statics.updateUserPreferences = async function(userId, updates) {
  try {
    let preferences = await this.findOne({ user: userId });
    
    if (!preferences) {
      preferences = new this({ user: userId });
    }
    
    // Actualizar los campos que se enviaron
    if (updates.emailNotifications) {
      preferences.emailNotifications = { ...preferences.emailNotifications, ...updates.emailNotifications };
    }
    
    if (updates.mealTimes) {
      preferences.mealTimes = { ...preferences.mealTimes, ...updates.mealTimes };
    }
    
    if (updates.timezone) {
      preferences.timezone = updates.timezone;
    }
    
    await preferences.save();
    return preferences;
  } catch (error) {
    console.error('Error actualizando preferencias:', error);
    throw error;
  }
};

// Método para obtener el próximo horario de notificación para una comida
notificationPreferencesSchema.methods.getNextMealNotificationTime = function(mealType, date) {
  const mealTime = this.mealTimes[mealType];
  if (!mealTime) return null;
  
  const [hours, minutes] = mealTime.split(':').map(Number);
  const notificationTime = new Date(date);
  notificationTime.setHours(hours, minutes - this.emailNotifications.mealReminders.timeBefore, 0, 0);
  
  return notificationTime;
};

// Método para verificar si las notificaciones están habilitadas
notificationPreferencesSchema.methods.shouldSendMealReminder = function() {
  return this.emailNotifications.enabled && this.emailNotifications.mealReminders.enabled;
};

notificationPreferencesSchema.methods.shouldSendWeeklyMenu = function() {
  return this.emailNotifications.enabled && this.emailNotifications.weeklyMenu.enabled;
};

notificationPreferencesSchema.methods.shouldSendShoppingList = function() {
  return this.emailNotifications.enabled && this.emailNotifications.shoppingList.enabled;
};

module.exports = mongoose.model('NotificationPreferences', notificationPreferencesSchema);