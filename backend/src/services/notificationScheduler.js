const cron = require('node-cron');
const WeeklyMenu = require('../models/WeeklyMenu');
const User = require('../models/User');
const NotificationPreferences = require('../models/NotificationPreferences');
const emailService = require('./emailService');

class NotificationScheduler {
  constructor() {
    this.jobs = new Map();
    this.isInitialized = false;
    this.sentNotifications = new Set(); // Para evitar duplicados
  }

  // Inicializar el sistema de notificaciones
  async initialize() {
    try {
      console.log('🔔 Inicializando sistema de notificaciones...');
      
      // Verificar conexión del servicio de correo
      await emailService.verifyConnection();
      
      // Programar notificaciones cada minuto (para comidas)
      this.scheduleMealReminders();
      
      // Programar notificaciones semanales
      this.scheduleWeeklyMenuReminders();
      
      // Programar limpieza de notificaciones diarias
      this.scheduleDailyCleanup();
      
      this.isInitialized = true;
      console.log('✅ Sistema de notificaciones activo');
    } catch (error) {
      console.error('❌ Error al inicializar notificaciones:', error);
    }
  }

  // Programar recordatorios de comidas
  scheduleMealReminders() {
    // Ejecutar cada minuto para verificar comidas próximas (necesario para precisión)
    const mealReminderJob = cron.schedule('* * * * *', async () => {
      try {
        await this.checkPendingMealReminders();
      } catch (error) {
        console.error('Error en recordatorios de comidas:', error);
      }
    }, {
      scheduled: false
    });

    this.jobs.set('mealReminders', mealReminderJob);
    mealReminderJob.start();
  }

  // Programar recordatorios semanales
  scheduleWeeklyMenuReminders() {
    // Ejecutar cada hora para verificar envíos semanales
    const weeklyReminderJob = cron.schedule('0 * * * *', async () => {
      try {
        await this.checkPendingWeeklyReminders();
      } catch (error) {
        console.error('Error en recordatorios semanales:', error);
      }
    }, {
      scheduled: false
    });

    this.jobs.set('weeklyReminders', weeklyReminderJob);
    weeklyReminderJob.start();
  }
  // Programar limpieza diaria de notificaciones enviadas
  scheduleDailyCleanup() {
    // Ejecutar a medianoche para limpiar el registro de notificaciones enviadas
    const cleanupJob = cron.schedule('0 0 * * *', () => {
      try {
        this.sentNotifications.clear();
      } catch (error) {
        console.error('Error en limpieza diaria:', error);
      }
    }, {
      scheduled: false
    });

    this.jobs.set('dailyCleanup', cleanupJob);
    cleanupJob.start();
  }

  // Verificar comidas próximas que requieren notificación
  async checkPendingMealReminders() {
    try {
      const now = new Date();
      
      const users = await User.find({});
      
      for (const user of users) {
        const preferences = await NotificationPreferences.getOrCreateUserPreferences(user._id);
        
        if (!preferences.shouldSendMealReminder()) {
          continue;
        }

        // Obtener menú activo del usuario
        const activeMenu = await WeeklyMenu.getCurrentWeek(user._id);
        if (!activeMenu) {
          continue;
        }

        // Verificar cada día del menú
        for (const day of activeMenu.days) {
          const dayDate = new Date(day.date);
          
          // Solo verificar el día actual
          if (dayDate.toDateString() !== now.toDateString()) {
            continue;
          }

          // Verificar cada comida del día
          for (const meal of day.meals) {
            if (!meal.recipeId) {
              continue;
            }

            const notificationTime = preferences.getNextMealNotificationTime(meal.mealType, dayDate);
            
            if (!notificationTime) {
              continue;
            }

            // Crear identificador único para evitar duplicados
            const notificationId = `${user._id}-${meal.mealType}-${dayDate.toDateString()}-${notificationTime.getTime()}`;
            
            if (this.sentNotifications.has(notificationId)) {
              continue;
            }
            
            const timeDiff = Math.abs(now.getTime() - notificationTime.getTime());
            
            // Verificar si es el momento adecuado para enviar (30 minutos antes ± 5 minutos)
            if (timeDiff <= 300000) { // 5 minutos de margen (300000ms)
              console.log(`📧 Recordatorio enviado: ${meal.mealType} para ${user.email}`);
              await this.sendMealReminder(user, meal, day, preferences);
              this.sentNotifications.add(notificationId);
            } else {
              // También verificar si ya es la hora de la comida (para recordatorios tardíos)
              const mealTime = new Date(dayDate);
              const [hours, minutes] = preferences.mealTimes[meal.mealType].split(':').map(Number);
              mealTime.setHours(hours, minutes, 0, 0);
              
              const mealTimeDiff = Math.abs(now.getTime() - mealTime.getTime());
              
              if (mealTimeDiff <= 300000) { // 5 minutos de margen para la hora exacta
                console.log(`⚡ Recordatorio urgente: ${meal.mealType} para ${user.email}`);
                await this.sendMealReminder(user, meal, day, preferences);
                this.sentNotifications.add(notificationId);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error verificando recordatorios de comidas:', error);
    }
  }

  // Verificar recordatorios semanales pendientes
  async checkPendingWeeklyReminders() {
    try {
      const now = new Date();
      const daysOfWeek = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      const currentDay = daysOfWeek[now.getDay()].toLowerCase();
      const currentTime = now.toTimeString().substring(0, 5);

      const users = await User.find({});

      for (const user of users) {
        const preferences = await NotificationPreferences.getOrCreateUserPreferences(user._id);
        
        if (!preferences.shouldSendWeeklyMenu()) {
          continue;
        }

        // Verificar si es el día y hora correcta para el resumen semanal
        if (preferences.emailNotifications.weeklyMenu.day === currentDay &&
            preferences.emailNotifications.weeklyMenu.time === currentTime) {
          
          const activeMenu = await WeeklyMenu.getCurrentWeek(user._id);
          if (activeMenu) {
            await this.sendWeeklyMenuSummary(user, activeMenu);
          }
        }
      }
    } catch (error) {
      console.error('Error verificando recordatorios semanales:', error);
    }
  }

  // Enviar recordatorio de comida específica
  async sendMealReminder(user, meal, day, preferences) {
    try {
      console.log(`📤 Preparando recordatorio para ${user.email}: ${meal.mealType}`);
      
      // Crear clave única para evitar duplicados
      const today = new Date().toDateString();
      const notificationKey = `${user.email}-${meal.mealType}-${today}`;
      
      if (this.sentNotifications.has(notificationKey)) {
        console.log(`⚠️ Recordatorio ya enviado hoy para ${user.email}: ${meal.mealType}`);
        return;
      }
      
      // Obtener información de la receta directamente
      const Recipe = require('../models/Recipe');
      let recipe = null;
      
      if (meal.recipeId) {
        recipe = await Recipe.findById(meal.recipeId);
      }
      
      if (!recipe) {
        console.log(`⚠️ No se encontró receta para ${meal.mealType} (ID: ${meal.recipeId})`);
        return;
      }

      const mealData = {
        mealType: meal.mealType,
        recipeName: meal.recipeName || recipe.name,
        recipeDescription: recipe.description,
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions,
        mealTime: preferences.mealTimes[meal.mealType],
        dayName: day.dayOfWeek
      };

      console.log(`📬 Enviando correo de recordatorio...`);
      await emailService.sendMealReminder(user.email, user.name, mealData);
      
      // Marcar como enviado
      this.sentNotifications.add(notificationKey);
      
      console.log(`✅ Recordatorio enviado exitosamente: ${user.email} - ${meal.mealType} - ${recipe.name}`);
    } catch (error) {
      console.error(`❌ Error enviando recordatorio de comida para ${user.email}:`, error);
      // No re-lanzar el error para evitar que se detenga el procesamiento de otros usuarios
    }
  }

  // Enviar resumen semanal del menú
  async sendWeeklyMenuSummary(user, weeklyMenu) {
    try {
      const menuData = {
        title: weeklyMenu.title,
        weekStartDate: weeklyMenu.weekStartDate,
        weekEndDate: weeklyMenu.weekEndDate,
        days: weeklyMenu.days
      };

      await emailService.sendWeeklyMenuSummary(user.email, user.name, menuData);
      console.log(`📧 Resumen semanal enviado: ${user.email} - ${weeklyMenu.title}`);
    } catch (error) {
      console.error('Error enviando resumen semanal:', error);
    }
  }

  // Enviar notificación de prueba inmediata
  async sendTestNotification(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      await emailService.sendTestEmail(user.email, user.name);
      console.log(`📧 Notificación de prueba enviada a ${user.email}`);
      return true;
    } catch (error) {
      console.error('Error enviando notificación de prueba:', error);
      throw error;
    }
  }

  // Programar notificación inmediata para próxima comida
  async sendNextMealNotification(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const preferences = await NotificationPreferences.getOrCreateUserPreferences(userId);
      const activeMenu = await WeeklyMenu.getCurrentWeek(userId);
      
      if (!activeMenu) {
        throw new Error('No hay menú activo');
      }

      const now = new Date();
      let nextMeal = null;
      let nextDay = null;

      // Buscar la próxima comida programada
      for (const day of activeMenu.days) {
        const dayDate = new Date(day.date);
        
        if (dayDate.toDateString() === now.toDateString() || dayDate > now) {
          for (const meal of day.meals) {
            if (meal.recipeId) {
              const mealTime = preferences.mealTimes[meal.mealType];
              if (mealTime) {
                const [hours, minutes] = mealTime.split(':').map(Number);
                const mealDateTime = new Date(dayDate);
                mealDateTime.setHours(hours, minutes, 0, 0);
                
                if (mealDateTime > now) {
                  nextMeal = meal;
                  nextDay = day;
                  break;
                }
              }
            }
          }
          if (nextMeal) break;
        }
      }

      if (nextMeal) {
        await this.sendMealReminder(user, nextMeal, nextDay, preferences);
        return true;
      } else {
        throw new Error('No hay próximas comidas programadas');
      }
    } catch (error) {
      console.error('Error enviando próxima comida:', error);
      throw error;
    }
  }

  // Detener todas las tareas programadas
  stop() {
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`⏹️ Tarea ${name} detenida`);
    });
    this.jobs.clear();
    this.isInitialized = false;
  }

  // Obtener estado del sistema
  getStatus() {
    return {
      initialized: this.isInitialized,
      activeJobs: Array.from(this.jobs.keys()),
      totalJobs: this.jobs.size
    };
  }
}

module.exports = new NotificationScheduler();