import axios from 'axios';
import { API_CONFIG, MESSAGES } from '../config/constants';

// =================================================================
// 🌐 CONFIGURACIÓN DE API
// =================================================================
const API_URL = API_CONFIG.getApiUrl();
console.log('🔗 API URL configurada:', API_URL);

// =================================================================
// ⚙️ CONFIGURACIÓN DE AXIOS
// =================================================================
const api = axios.create({
  baseURL: API_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

// =================================================================
// 🔄 INTERCEPTORS PARA LOGGING Y MANEJO DE ERRORES
// =================================================================

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🚀 [API REQUEST] ${config.method?.toUpperCase()} ${config.url}`, {
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('❌ [REQUEST ERROR]:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });

    // Manejar errores específicos
    if (error.response?.status === 401) {
      console.warn('🔒 Token expirado o inválido. Redirigiendo al login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    if (error.response?.status === 404) {
      console.warn('🔍 Recurso no encontrado:', error.config?.url);
    }

    if (error.response?.status >= 500) {
      console.error('🚨 Error del servidor:', error.response?.data?.message || 'Error interno del servidor');
    }

    return Promise.reject(error);
  }
);

// =================================================================
// 🔐 SERVICIOS DE AUTENTICACIÓN
// =================================================================
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      if (!user || user === 'undefined' || user === 'null') {
        return null;
      }
      return JSON.parse(user);
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      localStorage.removeItem('user'); // Limpiar datos corruptos
      return null;
    }
  }
};

// Servicios de ingredientes
export const ingredientService = {
  uploadImage: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return api.post('/ingredients/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getIngredients: () => api.get('/ingredients'),
  updateIngredient: (id, data) => api.put(`/ingredients/${id}`, data),
  deleteIngredient: (id) => api.delete(`/ingredients/${id}`),
};

// =================================================================
// 🍽️ SERVICIOS DE RECETAS
// =================================================================
export const recipeService = {
  // 📖 Consulta de recetas
  getRecipes: () => api.get('/recipes'),
  getFavoriteRecipes: () => api.get('/recipes/favorites'),
  getUserIngredients: () => api.get('/recipes/ingredients'),
  
  // 💾 Gestión de recetas
  saveRecipe: (recipeData) => api.post('/recipes', recipeData),
  deleteRecipe: (id) => api.delete(`/recipes/${id}`),
  toggleFavorite: (id) => api.put(`/recipes/${id}/favorite`),
  
  // 🤖 Generación con IA (con timeout extendido)
  generateRecipeWithAI: (ingredients, preferences) => api.post('/recipes/generate', { 
    ingredients, 
    preferences 
  }, {
    timeout: 120000, // 2 minutos para generación con IA
    headers: {
      'Content-Type': 'application/json'
    }
  }),
  
  // 📊 Información nutricional
  updateNutritionalInfo: (recipeId, nutritionalInfo) => api.put(`/recipes/${recipeId}/nutrition`, { nutritional_info: nutritionalInfo }),
  recalculateNutrition: (recipeId) => api.post(`/recipes/${recipeId}/recalculate-nutrition`),
};

// =================================================================
// 📅 SERVICIOS DE MENÚ SEMANAL
// =================================================================
export const weeklyMenuService = {
  // Gestión de menús
  getAllUserMenus: () => api.get('/weekly-menus/all'),
  createWeeklyMenu: (menuData) => api.post('/weekly-menus/create', menuData),
  duplicateWeeklyMenu: (menuId, newTitle, newWeekStartDate) => 
    api.post('/weekly-menus/duplicate', { menuId, newTitle, newWeekStartDate }),
  getMenuById: (menuId) => api.get(`/weekly-menus/${menuId}`),
  updateMenuInfo: (menuId, menuData) => api.put(`/weekly-menus/${menuId}/info`, menuData),
  deleteWeeklyMenu: (menuId) => api.delete(`/weekly-menus/${menuId}`),
  
  // 📅 Gestión de menús por fecha
  getCurrentWeeklyMenu: () => api.get('/weekly-menus/current'),
  getWeeklyMenuByDate: (startDate) => api.get(`/weekly-menus/week/${startDate}`),
  getUserRecipesForMenu: () => api.get('/weekly-menus/recipes'),
  
  // 🎯 Asignación de recetas
  assignRecipeToSlot: (menuId, dayIndex, mealIndex, recipeId) => 
    api.post('/weekly-menus/assign', { menuId, dayIndex, mealIndex, recipeId }),
  autoAssignRecipesToWeek: (recipeIds) =>
    api.post('/weekly-menus/auto-assign', { recipeIds }),
  fillMissingMeals: () =>
    api.post('/weekly-menus/fill-missing'),
    
  // 🔄 Manipulación de menú
  moveRecipe: (menuId, fromDayIndex, fromMealIndex, toDayIndex, toMealIndex) =>
    api.post('/weekly-menus/move', { menuId, fromDayIndex, fromMealIndex, toDayIndex, toMealIndex }),
  updateMealNotes: (menuId, dayIndex, mealIndex, notes) =>
    api.put('/weekly-menus/notes', { menuId, dayIndex, mealIndex, notes }),
  removeRecipeFromSlot: (menuId, dayIndex, mealIndex) =>
    api.delete('/weekly-menus/remove', { data: { menuId, dayIndex, mealIndex } }),
};

// =================================================================
// 🔔 SERVICIOS DE NOTIFICACIONES
// =================================================================
export const notificationService = {
  getUserPreferences: () => api.get('/notifications/preferences'),
  updateUserPreferences: (preferences) => api.put('/notifications/preferences', preferences),
  sendTestEmail: () => api.post('/notifications/test-email'),
  sendNextMealNotification: () => api.post('/notifications/send-next-meal'),
  getNotificationStatus: () => api.get('/notifications/status'),
  toggleEmailNotifications: (enabled) => api.put('/notifications/toggle-email', { enabled }),
  setMealTimes: (mealTimes) => api.put('/notifications/meal-times', { mealTimes }),
  setTimezone: (timezone) => api.put('/notifications/timezone', { timezone })
};

export default api;