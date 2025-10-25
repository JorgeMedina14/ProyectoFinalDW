const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    generateRecipeWithAI,
    getUserIngredients,
    getRecipes,
    getFavoriteRecipes,
    saveRecipe,
    toggleFavorite,
    deleteRecipe,
    updateNutritionalInfo,
    recalculateNutrition
} = require('../controllers/recipeController');

// =================================================================
// 🔐 MIDDLEWARE DE AUTENTICACIÓN
// =================================================================
router.use(protect);

// =================================================================
// 🔍 MIDDLEWARE DE LOGGING PARA DEBUGGING
// =================================================================
router.use((req, res, next) => {
  console.log(`🛣️  [RECIPE ROUTES] ${req.method} ${req.originalUrl}`);
  console.log(`📋 Params:`, req.params);
  console.log(`📝 Body:`, Object.keys(req.body));
  next();
});

// =================================================================
// 🤖 RUTAS DE GENERACIÓN CON IA
// =================================================================
router.post('/generate', generateRecipeWithAI);  // Generar recetas con IA

// =================================================================
// 📊 RUTAS DE INFORMACIÓN NUTRICIONAL
// =================================================================
router.post('/:recipeId/recalculate-nutrition', recalculateNutrition); // Recálculo automático
router.put('/:recipeId/nutrition', updateNutritionalInfo);             // Actualización manual

// =================================================================
// 🍽️ RUTAS DE GESTIÓN DE RECETAS
// =================================================================
// Rutas específicas (sin parámetros)
router.get('/ingredients', getUserIngredients);  // Obtener ingredientes del usuario
router.get('/favorites', getFavoriteRecipes);    // Obtener recetas favoritas
router.get('/', getRecipes);                     // Obtener todas las recetas

// Rutas con parámetros ID
router.post('/', saveRecipe);                   // Guardar nueva receta
router.put('/:id/favorite', toggleFavorite);    // Toggle estado favorito  
router.delete('/:id', deleteRecipe);            // Eliminar receta

module.exports = router;