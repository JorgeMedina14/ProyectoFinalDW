const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getCurrentWeeklyMenu,
  getWeeklyMenuByDate,
  assignRecipeToSlot,
  moveRecipe,
  updateMealNotes,
  removeRecipeFromSlot,
  getUserRecipesForMenu,
  getAllUserMenus,
  createWeeklyMenu,
  duplicateWeeklyMenu,
  updateMenuInfo,
  deleteWeeklyMenu,
  getMenuById,
  autoAssignRecipesToWeek,
  fillMissingMeals
} = require('../controllers/weeklyMenuController');

// Todas las rutas requieren autenticación
router.use(protect);

// Obtener menú semanal actual
router.get('/current', getCurrentWeeklyMenu);

// Obtener menú de una semana específica
router.get('/week/:startDate', getWeeklyMenuByDate);

// Obtener recetas del usuario para el selector
router.get('/recipes', getUserRecipesForMenu);

// Gestión de menús
router.get('/all', getAllUserMenus);
router.post('/create', createWeeklyMenu);
router.post('/duplicate', duplicateWeeklyMenu);

// Asignar receta a un slot de comida
router.post('/assign', assignRecipeToSlot);

// Asignación automática de recetas al planificador
router.post('/auto-assign', autoAssignRecipesToWeek);

// Completar comidas faltantes en cada día
router.post('/fill-missing', fillMissingMeals);

// Mover/intercambiar recetas entre slots
router.post('/move', moveRecipe);

// Actualizar notas de una comida
router.put('/notes', updateMealNotes);

// Eliminar receta de un slot
router.delete('/remove', removeRecipeFromSlot);

// Rutas con parámetros dinámicos al final
router.get('/:menuId', getMenuById);
router.put('/:menuId/info', updateMenuInfo);
router.delete('/:menuId', deleteWeeklyMenu);

module.exports = router;