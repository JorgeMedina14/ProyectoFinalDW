// =================================================================
// 🎯 CONFIGURACIÓN Y CONSTANTES DEL PROYECTO
// =================================================================

// =================================================================
// 🌐 CONFIGURACIÓN DE API
// =================================================================
export const API_CONFIG = {
  // Detectar automáticamente la URL base según el entorno
  getApiUrl: () => {
    const hostname = window.location.hostname;
    
    // Si se accede desde localhost o 127.0.0.1, usar localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    
    // Si se accede desde una IP de red local, usar esa misma IP para el backend
    return `http://${hostname}:5000/api`;
  },
  
  // Configuración de timeouts
  TIMEOUT: 10000,
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  }
};

// =================================================================
// 🎨 CONFIGURACIÓN DE COLORES Y ESTILOS
// =================================================================
export const COLORS = {
  // Colores principales
  primary: '#0ea5e9',
  primaryDark: '#0284c7',
  secondary: '#059669',
  secondaryDark: '#047857',
  
  // Colores de estado
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Colores de macronutrientes
  proteins: '#ef4444',
  carbohydrates: '#f59e0b',
  fats: '#10b981',
  fiber: '#3b82f6',
  calories: '#8b5cf6',
  
  // Colores de fondo
  background: '#f8fafc',
  backgroundSecondary: '#f1f5f9',
  surface: '#ffffff',
  
  // Colores de texto
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textMuted: '#94a3b8'
};

// =================================================================
// 📊 CONFIGURACIÓN NUTRICIONAL
// =================================================================
export const NUTRITION_CONFIG = {
  // Unidades de medida
  UNITS: {
    calories: 'kcal',
    proteins: 'g',
    carbohydrates: 'g',
    fats: 'g',
    fiber: 'g',
    sugars: 'g',
    vitamins: {
      vitamin_a: 'μg',
      vitamin_c: 'mg',
      vitamin_d: 'μg',
      vitamin_e: 'mg',
      vitamin_k: 'μg',
      vitamin_b1: 'mg',
      vitamin_b2: 'mg',
      vitamin_b3: 'mg',
      vitamin_b6: 'mg',
      vitamin_b12: 'μg',
      folate: 'μg'
    },
    minerals: {
      calcium: 'mg',
      iron: 'mg',
      magnesium: 'mg',
      phosphorus: 'mg',
      potassium: 'mg',
      sodium: 'mg',
      zinc: 'mg',
      copper: 'mg',
      manganese: 'mg',
      selenium: 'μg'
    }
  },

  // Nombres descriptivos para vitaminas
  VITAMIN_NAMES: {
    vitamin_a: 'Vitamina A',
    vitamin_c: 'Vitamina C',
    vitamin_d: 'Vitamina D',
    vitamin_e: 'Vitamina E',
    vitamin_k: 'Vitamina K',
    vitamin_b1: 'Vitamina B1 (Tiamina)',
    vitamin_b2: 'Vitamina B2 (Riboflavina)',
    vitamin_b3: 'Vitamina B3 (Niacina)',
    vitamin_b6: 'Vitamina B6',
    vitamin_b12: 'Vitamina B12',
    folate: 'Folato (B9)'
  },

  // Nombres descriptivos para minerales
  MINERAL_NAMES: {
    calcium: 'Calcio',
    iron: 'Hierro',
    magnesium: 'Magnesio',
    phosphorus: 'Fósforo',
    potassium: 'Potasio',
    sodium: 'Sodio',
    zinc: 'Zinc',
    copper: 'Cobre',
    manganese: 'Manganeso',
    selenium: 'Selenio'
  },

  // Iconos para cada macronutriente
  ICONS: {
    calories: '🔥',
    proteins: '💪',
    carbohydrates: '🍞',
    fats: '🥑',
    fiber: '🌾',
    sugars: '🍯',
    vitamins: '💊',
    minerals: '⚡'
  }
};

// =================================================================
// 🍽️ CONFIGURACIÓN DE RECETAS
// =================================================================
export const RECIPE_CONFIG = {
  // Tipos de dificultad
  DIFFICULTY_LEVELS: ['Fácil', 'Intermedio', 'Avanzado'],
  
  // Tipos de comida
  MEAL_TYPES: ['Desayuno', 'Almuerzo', 'Cena', 'Merienda', 'Snack'],
  
  // Tipos de cocina
  CUISINE_TYPES: [
    'Mediterránea', 'Asiática', 'Mexicana', 'Italiana', 
    'Francesa', 'Estadounidense', 'Vegetariana', 'Vegana', 
    'Sin gluten', 'Baja en carbohidratos', 'General'
  ],
  
  // Configuración de generación
  GENERATION: {
    DEFAULT_COUNT: 10,
    MIN_COUNT: 1,
    MAX_COUNT: 20,
    DEFAULT_SERVINGS: 4
  }
};

// =================================================================
// 🔔 CONFIGURACIÓN DE NOTIFICACIONES
// =================================================================
export const NOTIFICATION_CONFIG = {
  // Tipos de notificación
  TYPES: {
    EMAIL: 'email',
    PUSH: 'push',
    SMS: 'sms'
  },
  
  // Horarios por defecto
  DEFAULT_MEAL_TIMES: {
    breakfast: '08:00',
    lunch: '13:00',
    dinner: '19:00'
  },
  
  // Frecuencias disponibles
  FREQUENCIES: {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    CUSTOM: 'custom'
  }
};

// =================================================================
// 📱 CONFIGURACIÓN DE UI/UX
// =================================================================
export const UI_CONFIG = {
  // Breakpoints responsivos
  BREAKPOINTS: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    widescreen: '1200px'
  },
  
  // Animaciones
  ANIMATIONS: {
    fast: '0.2s',
    normal: '0.3s',
    slow: '0.5s'
  },
  
  // Espaciados
  SPACING: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  }
};

// =================================================================
// 🔧 UTILIDADES GENERALES
// =================================================================
export const UTILS = {
  // Formatear números
  formatNumber: (num, decimals = 1) => {
    return Number(num).toFixed(decimals);
  },
  
  // Formatear fecha
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('es-ES');
  },
  
  // Generar ID único
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },
  
  // Debounce para optimizar performance
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// =================================================================
// 📋 MENSAJES Y TEXTOS
// =================================================================
export const MESSAGES = {
  // Mensajes de éxito
  SUCCESS: {
    RECIPE_SAVED: '✅ Receta guardada exitosamente',
    NUTRITION_UPDATED: '✅ Información nutricional actualizada',
    NUTRITION_RECALCULATED: '✅ Nutrición recalculada automáticamente',
    NOTIFICATION_SENT: '✅ Notificación enviada correctamente'
  },
  
  // Mensajes de error
  ERROR: {
    GENERIC: '❌ Ha ocurrido un error. Por favor, intenta de nuevo.',
    NETWORK: '❌ Error de conexión. Verifica tu conexión a internet.',
    RECIPE_NOT_FOUND: '❌ Receta no encontrada',
    INVALID_DATA: '❌ Datos inválidos. Verifica la información ingresada.',
    NUTRITION_CALC_FAILED: '❌ Error al calcular información nutricional'
  },
  
  // Mensajes informativos
  INFO: {
    LOADING: '⏳ Cargando...',
    GENERATING_RECIPES: '🤖 Generando recetas con IA...',
    CALCULATING_NUTRITION: '🧮 Calculando información nutricional...',
    SAVING: '💾 Guardando...',
    NO_RECIPES: '📝 No tienes recetas guardadas aún'
  }
};

export default {
  API_CONFIG,
  COLORS,
  NUTRITION_CONFIG,
  RECIPE_CONFIG,
  NOTIFICATION_CONFIG,
  UI_CONFIG,
  UTILS,
  MESSAGES
};