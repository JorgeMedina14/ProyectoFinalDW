const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
    uploadImage,
    getIngredients,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    generateRecipes
} = require('../controllers/ingredientController');

// Todas las rutas requieren autenticación
router.use(protect);

// Rutas para imágenes e ingredientes
router.post('/upload', upload.single('image'), uploadImage);
router.get('/', getIngredients);
router.post('/', addIngredient);
router.put('/:id', updateIngredient);
router.delete('/:id', deleteIngredient);
router.post('/generate-recipes', generateRecipes);

module.exports = router;