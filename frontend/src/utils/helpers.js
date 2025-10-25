// =================================================================
// 🔧 UTILIDADES PARA INFORMACIÓN NUTRICIONAL
// =================================================================

import { NUTRITION_CONFIG, UTILS } from '../config/constants';

/**
 * Formatea el valor nutricional con la unidad correspondiente
 * @param {string} nutrient - Nombre del nutriente
 * @param {number} value - Valor numérico
 * @param {object} section - Sección (vitamins, minerals, o null para macros)
 * @returns {string} Valor formateado con unidad
 */
export const formatNutrientValue = (nutrient, value, section = null) => {
  const formattedValue = UTILS.formatNumber(value);
  
  if (section === 'vitamins') {
    const unit = NUTRITION_CONFIG.UNITS.vitamins[nutrient] || '';
    return `${formattedValue}${unit}`;
  }
  
  if (section === 'minerals') {
    const unit = NUTRITION_CONFIG.UNITS.minerals[nutrient] || '';
    return `${formattedValue}${unit}`;
  }
  
  // Para macronutrientes
  const unit = NUTRITION_CONFIG.UNITS[nutrient] || '';
  return `${formattedValue}${unit}`;
};

/**
 * Obtiene el nombre descriptivo de un nutriente
 * @param {string} nutrient - Nombre del nutriente
 * @param {string} section - Sección (vitamins, minerals, o null)
 * @returns {string} Nombre descriptivo
 */
export const getNutrientName = (nutrient, section = null) => {
  if (section === 'vitamins') {
    return NUTRITION_CONFIG.VITAMIN_NAMES[nutrient] || nutrient;
  }
  
  if (section === 'minerals') {
    return NUTRITION_CONFIG.MINERAL_NAMES[nutrient] || nutrient;
  }
  
  // Para macronutrientes, capitalizar la primera letra
  return nutrient.charAt(0).toUpperCase() + nutrient.slice(1);
};

/**
 * Obtiene el icono para un macronutriente
 * @param {string} nutrient - Nombre del nutriente
 * @returns {string} Emoji del icono
 */
export const getNutrientIcon = (nutrient) => {
  return NUTRITION_CONFIG.ICONS[nutrient] || '📊';
};

/**
 * Calcula el porcentaje de cada macronutriente del total de calorías
 * @param {object} nutrition - Objeto con información nutricional
 * @returns {object} Porcentajes calculados
 */
export const calculateMacroPercentages = (nutrition) => {
  const calories = nutrition.calories || 0;
  
  if (calories === 0) {
    return { proteins: 0, carbohydrates: 0, fats: 0 };
  }
  
  // Calorías por gramo: Proteínas = 4, Carbohidratos = 4, Grasas = 9
  const proteinCalories = (nutrition.proteins || 0) * 4;
  const carbCalories = (nutrition.carbohydrates || 0) * 4;
  const fatCalories = (nutrition.fats || 0) * 9;
  
  return {
    proteins: Math.round((proteinCalories / calories) * 100),
    carbohydrates: Math.round((carbCalories / calories) * 100),
    fats: Math.round((fatCalories / calories) * 100)
  };
};

/**
 * Valida si un objeto de información nutricional es válido
 * @param {object} nutrition - Objeto con información nutricional
 * @returns {boolean} True si es válido
 */
export const validateNutritionData = (nutrition) => {
  if (!nutrition || typeof nutrition !== 'object') {
    return false;
  }
  
  // Verificar que tenga al menos calorías
  if (typeof nutrition.calories !== 'number' || nutrition.calories < 0) {
    return false;
  }
  
  // Verificar macronutrientes principales
  const macros = ['proteins', 'carbohydrates', 'fats'];
  for (const macro of macros) {
    if (typeof nutrition[macro] !== 'number' || nutrition[macro] < 0) {
      return false;
    }
  }
  
  return true;
};

/**
 * Obtiene valores por defecto para información nutricional
 * @returns {object} Objeto con valores nutricionales por defecto
 */
export const getDefaultNutrition = () => ({
  calories: 0,
  proteins: 0,
  carbohydrates: 0,
  fats: 0,
  fiber: 0,
  sugars: 0,
  vitamins: {
    vitamin_a: 0,
    vitamin_c: 0,
    vitamin_d: 0,
    vitamin_e: 0,
    vitamin_k: 0,
    vitamin_b1: 0,
    vitamin_b2: 0,
    vitamin_b3: 0,
    vitamin_b6: 0,
    vitamin_b12: 0,
    folate: 0
  },
  minerals: {
    calcium: 0,
    iron: 0,
    magnesium: 0,
    phosphorus: 0,
    potassium: 0,
    sodium: 0,
    zinc: 0,
    copper: 0,
    manganese: 0,
    selenium: 0
  }
});

// =================================================================
// 🔧 UTILIDADES PARA RECETAS
// =================================================================

/**
 * Formatea el tiempo de preparación
 * @param {string} prepTime - Tiempo en formato string
 * @returns {string} Tiempo formateado
 */
export const formatPrepTime = (prepTime) => {
  if (!prepTime) return 'No especificado';
  
  // Si ya incluye "minutos" o "horas", devolverlo tal como está
  if (prepTime.includes('minuto') || prepTime.includes('hora')) {
    return prepTime;
  }
  
  // Si es solo un número, agregar "minutos"
  const timeMatch = prepTime.match(/\d+/);
  if (timeMatch) {
    const minutes = parseInt(timeMatch[0]);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours}h ${remainingMinutes}min`
        : `${hours}h`;
    }
    return `${minutes} minutos`;
  }
  
  return prepTime;
};

/**
 * Obtiene el color para el nivel de dificultad
 * @param {string} difficulty - Nivel de dificultad
 * @returns {string} Código de color
 */
export const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'fácil':
    case 'facil':
      return '#10b981'; // Verde
    case 'intermedio':
    case 'medio':
      return '#f59e0b'; // Amarillo
    case 'avanzado':
    case 'difícil':
    case 'dificil':
      return '#ef4444'; // Rojo
    default:
      return '#6b7280'; // Gris
  }
};

/**
 * Limpia y formatea una lista de ingredientes
 * @param {Array} ingredients - Lista de ingredientes
 * @returns {Array} Lista de ingredientes limpia
 */
export const cleanIngredientsList = (ingredients) => {
  if (!Array.isArray(ingredients)) return [];
  
  return ingredients
    .filter(ingredient => ingredient && typeof ingredient === 'string')
    .map(ingredient => ingredient.trim())
    .filter(ingredient => ingredient.length > 0);
};

/**
 * Limpia y formatea una lista de instrucciones
 * @param {Array} instructions - Lista de instrucciones
 * @returns {Array} Lista de instrucciones limpia
 */
export const cleanInstructionsList = (instructions) => {
  if (!Array.isArray(instructions)) return [];
  
  return instructions
    .filter(instruction => instruction && typeof instruction === 'string')
    .map(instruction => instruction.trim())
    .filter(instruction => instruction.length > 0);
};

// =================================================================
// 🔧 UTILIDADES GENERALES DE UI
// =================================================================

/**
 * Trunca un texto a una longitud máxima
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || typeof text !== 'string') return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Capitaliza la primera letra de cada palabra
 * @param {string} text - Texto a capitalizar
 * @returns {string} Texto capitalizado
 */
export const capitalizeWords = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Genera un ID único para elementos
 * @param {string} prefix - Prefijo opcional
 * @returns {string} ID único
 */
export const generateUniqueId = (prefix = 'id') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Copia texto al portapapeles
 * @param {string} text - Texto a copiar
 * @returns {Promise<boolean>} True si se copió exitosamente
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copiando al portapapeles:', error);
    return false;
  }
};

/**
 * Maneja errores de API de forma consistente
 * @param {Error} error - Error de la API
 * @returns {string} Mensaje de error amigable
 */
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Error de respuesta del servidor
    const status = error.response.status;
    const message = error.response.data?.message || 'Error del servidor';
    
    switch (status) {
      case 400:
        return `Datos inválidos: ${message}`;
      case 401:
        return 'No autorizado. Por favor, inicia sesión nuevamente.';
      case 403:
        return 'No tienes permisos para realizar esta acción.';
      case 404:
        return 'Recurso no encontrado.';
      case 500:
        return 'Error interno del servidor. Por favor, intenta más tarde.';
      default:
        return `Error ${status}: ${message}`;
    }
  } else if (error.request) {
    // Error de red
    return 'Error de conexión. Verifica tu conexión a internet.';
  } else {
    // Error de configuración
    return 'Error inesperado. Por favor, intenta nuevamente.';
  }
};

// =================================================================
// 🔧 UTILIDADES DE VALIDACIÓN
// =================================================================

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida una contraseña
 * @param {string} password - Contraseña a validar
 * @returns {object} Resultado de validación con detalles
 */
export const validatePassword = (password) => {
  const result = {
    isValid: true,
    errors: []
  };
  
  if (!password || password.length < 6) {
    result.isValid = false;
    result.errors.push('La contraseña debe tener al menos 6 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    result.isValid = false;
    result.errors.push('La contraseña debe contener al menos una mayúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    result.isValid = false;
    result.errors.push('La contraseña debe contener al menos una minúscula');
  }
  
  if (!/\d/.test(password)) {
    result.isValid = false;
    result.errors.push('La contraseña debe contener al menos un número');
  }
  
  return result;
};

export default {
  // Nutricionales
  formatNutrientValue,
  getNutrientName,
  getNutrientIcon,
  calculateMacroPercentages,
  validateNutritionData,
  getDefaultNutrition,
  
  // Recetas
  formatPrepTime,
  getDifficultyColor,
  cleanIngredientsList,
  cleanInstructionsList,
  
  // UI
  truncateText,
  capitalizeWords,
  generateUniqueId,
  copyToClipboard,
  handleApiError,
  
  // Validación
  validateEmail,
  validatePassword
};