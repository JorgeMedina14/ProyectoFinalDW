const mongoose = require('mongoose');

const mealSlotSchema = new mongoose.Schema({
  recipeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    default: null
  },
  recipeName: {
    type: String,
    default: ''
  },
  mealType: {
    type: String,
    enum: ['desayuno', 'almuerzo', 'cena', 'merienda'],
    required: true
  },
  notes: {
    type: String,
    default: ''
  }
});

const dayMenuSchema = new mongoose.Schema({
  dayOfWeek: {
    type: String,
    enum: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  meals: [mealSlotSchema]
});

const weeklyMenuSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weekStartDate: {
    type: Date,
    required: true
  },
  weekEndDate: {
    type: Date,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateName: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  days: [dayMenuSchema],
  isActive: {
    type: Boolean,
    default: true
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
weeklyMenuSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Método para inicializar días de la semana
weeklyMenuSchema.methods.initializeWeek = function() {
  const daysOfWeek = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  const mealTypes = ['desayuno', 'almuerzo', 'cena', 'merienda'];
  
  this.days = [];
  
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(this.weekStartDate);
    currentDate.setDate(currentDate.getDate() + i);
    
    const dayMenu = {
      dayOfWeek: daysOfWeek[i],
      date: currentDate,
      meals: mealTypes.map(mealType => ({
        mealType,
        recipeId: null,
        recipeName: '',
        notes: ''
      }))
    };
    
    this.days.push(dayMenu);
  }
};

// Método para obtener la semana actual
weeklyMenuSchema.statics.getCurrentWeek = function(userId) {
  const today = new Date();
  const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1));
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  
  monday.setHours(0, 0, 0, 0);
  sunday.setHours(23, 59, 59, 999);
  
  return this.findOne({
    user: userId,
    weekStartDate: { $lte: monday },
    weekEndDate: { $gte: sunday },
    isActive: true
  });
};

module.exports = mongoose.model('WeeklyMenu', weeklyMenuSchema);