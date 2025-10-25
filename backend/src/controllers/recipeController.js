// =================================================================
// 📦 IMPORTS Y CONFIGURACIÓN
// =================================================================
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const Ingredient = require('../models/Ingredient');
const WeeklyMenu = require('../models/WeeklyMenu');
const OpenAI = require('openai');
const nutritionCalculator = require('../services/nutritionCalculatorService');

// Configurar OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// =================================================================
// 🤖 FUNCIONES DE GENERACIÓN CON IA
// =================================================================

// Generar múltiples recetas con IA basada en ingredientes
const generateRecipeWithAI = async (req, res) => {
    try {
        const { ingredients, preferences, count = 10 } = req.body;

        if (!ingredients || ingredients.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren ingredientes para generar las recetas'
            });
        }

        // Crear prompt para OpenAI para generar múltiples recetas
        const ingredientsList = ingredients.join(', ');
        const preferencesText = preferences ? ` Preferencias adicionales: ${preferences}` : '';
        
        const prompt = `Eres un chef experto. Crea ${count} recetas diferentes y variadas usando principalmente estos ingredientes: ${ingredientsList}.${preferencesText}

IMPORTANTE: Responde ÚNICAMENTE con un JSON válido, sin texto adicional, sin markdown, sin explicaciones. Solo el JSON.

Estructura requerida:
{
  "recipes": [
    {
      "name": "Nombre de la receta 1",
      "ingredients_needed": ["ingrediente 1 - cantidad", "ingrediente 2 - cantidad"],
      "instructions": ["paso 1", "paso 2", "paso 3"],
      "prep_time": "30 minutos",
      "servings": 4,
      "difficulty": "Fácil",
      "description": "Breve descripción de la receta",
      "cuisine_type": "Tipo de cocina (ej: mediterránea, asiática, mexicana)",
      "meal_type": "Tipo de comida (desayuno, almuerzo, cena, merienda)"
    }
  ]
}

Asegúrate de que:
1. Las ${count} recetas sean DIFERENTES entre sí
2. Varíen en tipo de cocina (mediterránea, asiática, mexicana, italiana, etc.)
3. Incluyan diferentes tipos de comida (desayuno, almuerzo, cena, merienda)
4. Tengan diferentes niveles de dificultad
5. Sean prácticas y deliciosas
6. Usen creativamente los ingredientes disponibles`;

        console.log('Generando', count, 'recetas con ingredientes:', ingredientsList);

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "Eres un chef experto que siempre responde con JSON válido sin ningún texto adicional. Generas múltiples recetas variadas y creativas."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 3000, // Aumentamos para múltiples recetas
            temperature: 0.8, // Un poco más de creatividad
            response_format: { type: "json_object" }
        });

        const aiResponse = completion.choices[0].message.content;
        console.log('Respuesta de OpenAI:', aiResponse);
        
        // Parsear la respuesta JSON
        let recipesData;
        try {
            // Intentar limpiar la respuesta si tiene caracteres extra
            let cleanResponse = aiResponse.trim();
            
            // Si la respuesta incluye markdown code blocks, removerlos
            if (cleanResponse.startsWith('```json')) {
                cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
            } else if (cleanResponse.startsWith('```')) {
                cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
            }
            
            recipesData = JSON.parse(cleanResponse);
        } catch (error) {
            console.error('Error parseando JSON:', error);
            console.error('Respuesta original:', aiResponse);
            throw new Error('Error al parsear la respuesta de la IA: ' + error.message);
        }

        // Validar que tenemos el array de recetas
        if (!recipesData.recipes || !Array.isArray(recipesData.recipes)) {
            throw new Error('Formato de respuesta inválido: se esperaba un array de recetas');
        }

        // Crear múltiples recetas en la base de datos
        const savedRecipes = [];
        
        for (const recipeData of recipesData.recipes) {
            try {
                // 🧮 Calcular información nutricional automáticamente
                console.log(`🧮 Calculando nutrición para: ${recipeData.name}`);
                const calculatedNutrition = nutritionCalculator.calculateRecipeNutrition(
                    recipeData.ingredients_needed || [], 
                    recipeData.servings || 4
                );

                const newRecipe = new Recipe({
                    user: req.user.id,
                    name: recipeData.name || 'Receta sin nombre',
                    ingredients_needed: recipeData.ingredients_needed || [],
                    instructions: recipeData.instructions || [],
                    prep_time: recipeData.prep_time || "30 minutos",
                    servings: recipeData.servings || 4,
                    difficulty: recipeData.difficulty || 'Fácil',
                    description: recipeData.description || '',
                    cuisine_type: recipeData.cuisine_type || 'General',
                    meal_type: recipeData.meal_type || 'Almuerzo',
                    nutritional_info: {
                        calories: Math.round(calculatedNutrition.calories),
                        proteins: Math.round(calculatedNutrition.proteins * 10) / 10,
                        carbohydrates: Math.round(calculatedNutrition.carbohydrates * 10) / 10,
                        fats: Math.round(calculatedNutrition.fats * 10) / 10,
                        fiber: Math.round(calculatedNutrition.fiber * 10) / 10,
                        sugars: Math.round(calculatedNutrition.sugars * 10) / 10,
                        vitamins: calculatedNutrition.vitamins,
                        minerals: calculatedNutrition.minerals
                    },
                    generated_from_ingredients: ingredients,
                    is_favorite: false
                });

                const savedRecipe = await newRecipe.save();
                savedRecipes.push(savedRecipe);
                console.log(`✅ Receta guardada: ${savedRecipe.name} (${Math.round(calculatedNutrition.calories)} cal, ${Math.round(calculatedNutrition.proteins)}g proteína)`);
            } catch (error) {
                console.error(`Error guardando receta ${recipeData.name}:`, error);
                // Continuamos con las demás recetas
            }
        }

        if (savedRecipes.length === 0) {
            throw new Error('No se pudieron guardar las recetas');
        }

        // Organizar automáticamente las recetas en el planificador semanal
        let weeklyMenuAssignment = null;
        try {
            weeklyMenuAssignment = await autoAssignRecipesToWeeklyMenu(req.user.id, savedRecipes.map(r => r._id));
            console.log(`✅ ${weeklyMenuAssignment.totalAssigned} recetas organizadas automáticamente en el planificador`);
        } catch (assignmentError) {
            console.error('Error en asignación automática:', assignmentError);
            // No falla la generación de recetas si hay error en la asignación
        }

        res.status(201).json({
            success: true,
            message: `${savedRecipes.length} recetas generadas y guardadas exitosamente`,
            data: {
                recipes: savedRecipes,
                count: savedRecipes.length,
                generated_from: ingredients,
                weeklyMenuAssignment: weeklyMenuAssignment ? {
                    totalAssigned: weeklyMenuAssignment.totalAssigned,
                    assignments: weeklyMenuAssignment.assignments
                } : null
            }
        });

    } catch (error) {
        console.error('Error generando recetas con IA:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar las recetas: ' + error.message
        });
    }
};

// =================================================================
// 📖 FUNCIONES DE CONSULTA Y GESTIÓN DE RECETAS
// =================================================================

// Obtener todas las recetas del usuario
const getRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find({ user: req.user.id })
            .sort({ created_at: -1 });

        res.status(200).json({
            success: true,
            message: 'Recetas obtenidas exitosamente',
            data: recipes,
            count: recipes.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las recetas',
            error: error.message
        });
    }
};

// Obtener recetas favoritas del usuario
const getFavoriteRecipes = async (req, res) => {
    try {
        const favoriteRecipes = await Recipe.find({ 
            user: req.user.id, 
            is_favorite: true 
        }).sort({ created_at: -1 });

        res.status(200).json({
            success: true,
            message: 'Recetas favoritas obtenidas exitosamente',
            data: favoriteRecipes,
            count: favoriteRecipes.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las recetas favoritas',
            error: error.message
        });
    }
};

// Guardar una receta como favorita
const saveRecipe = async (req, res) => {
    try {
        const {
            name,
            ingredients_needed,
            ingredients_to_buy,
            instructions,
            prep_time,
            servings,
            difficulty,
            nutritional_info,
            generated_from_ingredients
        } = req.body;

        const newRecipe = new Recipe({
            user: req.user.id,
            name,
            ingredients_needed,
            ingredients_to_buy: ingredients_to_buy || [],
            instructions,
            prep_time,
            servings: servings || 4,
            difficulty: difficulty || 'Fácil',
            nutritional_info: nutritional_info || {
                calories: 0,
                proteins: 0,
                carbohydrates: 0,
                fats: 0,
                fiber: 0,
                sugars: 0,
                vitamins: {},
                minerals: {}
            },
            generated_from_ingredients: generated_from_ingredients || [],
            is_favorite: true
        });

        const savedRecipe = await newRecipe.save();

        res.status(201).json({
            success: true,
            message: 'Receta guardada como favorita exitosamente',
            data: savedRecipe
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al guardar la receta',
            error: error.message
        });
    }
};

// Marcar/desmarcar receta como favorita
const toggleFavorite = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Receta no encontrada'
            });
        }

        // Verificar que la receta pertenece al usuario
        if (recipe.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado para modificar esta receta'
            });
        }

        recipe.is_favorite = !recipe.is_favorite;
        await recipe.save();

        res.status(200).json({
            success: true,
            message: `Receta ${recipe.is_favorite ? 'marcada como favorita' : 'removida de favoritos'}`,
            data: recipe
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la receta',
            error: error.message
        });
    }
};

// Eliminar una receta
const deleteRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Receta no encontrada'
            });
        }

        // Verificar que la receta pertenece al usuario
        if (recipe.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado para eliminar esta receta'
            });
        }

        await Recipe.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Receta eliminada exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la receta',
            error: error.message
        });
    }
};

// Obtener ingredientes del usuario para generar recetas
const getUserIngredients = async (req, res) => {
    try {
        const ingredients = await Ingredient.find({ user: req.user.id })
            .sort({ detectedAt: -1 });

        const ingredientNames = ingredients.map(ing => ing.name);

        res.status(200).json({
            success: true,
            message: 'Ingredientes obtenidos exitosamente',
            data: ingredientNames,
            count: ingredientNames.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los ingredientes',
            error: error.message
        });
    }
};

// Función auxiliar para asignar automáticamente recetas al planificador semanal
const autoAssignRecipesToWeeklyMenu = async (userId, recipeIds) => {
    try {
        // Obtener menú semanal actual o crear uno nuevo
        let weeklyMenu = await WeeklyMenu.getCurrentWeek(userId);
        
        if (!weeklyMenu) {
            // Crear nuevo menú semanal para la semana actual
            const today = new Date();
            const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1));
            const sunday = new Date(monday);
            sunday.setDate(sunday.getDate() + 6);
            
            monday.setHours(0, 0, 0, 0);
            sunday.setHours(23, 59, 59, 999);
            
            weeklyMenu = new WeeklyMenu({
                user: userId,
                title: `Menú semanal ${monday.toLocaleDateString('es-ES')} - ${sunday.toLocaleDateString('es-ES')}`,
                weekStartDate: monday,
                weekEndDate: sunday
            });
            
            weeklyMenu.initializeWeek();
            await weeklyMenu.save();
        }

        // Obtener las recetas con información de tipo de comida
        const recipes = await Recipe.find({ 
            _id: { $in: recipeIds }, 
            user: userId 
        });

        if (recipes.length === 0) {
            throw new Error('No se encontraron recetas válidas');
        }

        // Algoritmo de distribución inteligente mejorado
        const assignmentSummary = [];
        const mealTypeMapping = {
            'Desayuno': 0,
            'Almuerzo': 1, 
            'Cena': 2,
            'Merienda': 3
        };

        console.log(`🤖 Distribuyendo ${recipes.length} recetas automáticamente...`);

        // Distribución lógica para 7 o menos recetas: una por día
        if (recipes.length <= 7) {
            const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
            const mealNames = ['Desayuno', 'Almuerzo', 'Cena', 'Merienda'];
            
            // Prioridades de comidas balanceadas para cada día
            const dailyMealPriorities = [
                [1, 2, 0, 3], // Lunes: Almuerzo, Cena, Desayuno, Merienda
                [2, 1, 3, 0], // Martes: Cena, Almuerzo, Merienda, Desayuno
                [1, 0, 2, 3], // Miércoles: Almuerzo, Desayuno, Cena, Merienda
                [2, 1, 0, 3], // Jueves: Cena, Almuerzo, Desayuno, Merienda
                [1, 2, 3, 0], // Viernes: Almuerzo, Cena, Merienda, Desayuno
                [0, 1, 2, 3], // Sábado: Desayuno, Almuerzo, Cena, Merienda
                [1, 0, 2, 3]  // Domingo: Almuerzo, Desayuno, Cena, Merienda
            ];

            for (let i = 0; i < recipes.length && i < 7; i++) {
                const recipe = recipes[i];
                const dayIndex = i;
                const mealPriorities = dailyMealPriorities[dayIndex];
                
                // Determinar el mejor slot para esta receta
                let bestMealIndex = 1; // Por defecto almuerzo
                
                // Si la receta tiene un tipo específico, intentar usarlo primero
                if (recipe.meal_type && mealTypeMapping[recipe.meal_type] !== undefined) {
                    bestMealIndex = mealTypeMapping[recipe.meal_type];
                } else {
                    // Usar la prioridad del día para recetas generales
                    bestMealIndex = mealPriorities[0];
                }
                
                // Verificar disponibilidad y buscar alternativa si es necesario
                if (weeklyMenu.days[dayIndex].meals[bestMealIndex].recipeId) {
                    for (const altMealIndex of mealPriorities) {
                        if (!weeklyMenu.days[dayIndex].meals[altMealIndex].recipeId) {
                            bestMealIndex = altMealIndex;
                            break;
                        }
                    }
                }
                
                // Asignar la receta
                weeklyMenu.days[dayIndex].meals[bestMealIndex].recipeId = recipe._id;
                weeklyMenu.days[dayIndex].meals[bestMealIndex].recipeName = recipe.name;
                
                assignmentSummary.push({
                    recipe: recipe.name,
                    day: dayNames[dayIndex],
                    meal: mealNames[bestMealIndex],
                    dayIndex: dayIndex + 1,
                    type: recipe.meal_type || 'General'
                });
                
                console.log(`✅ ${recipe.name} → ${dayNames[dayIndex]} - ${mealNames[bestMealIndex]}`);
            }
        } else {
            // Más de 7 recetas: usar distribución por tipo de comida
            const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
            const mealNames = ['Desayuno', 'Almuerzo', 'Cena', 'Merienda'];
            
            for (const recipe of recipes) {
                let assigned = false;
                
                // Intentar asignar por tipo de comida primero
                if (recipe.meal_type && mealTypeMapping[recipe.meal_type] !== undefined) {
                    const preferredMealIndex = mealTypeMapping[recipe.meal_type];
                    
                    for (let dayIndex = 0; dayIndex < 7 && !assigned; dayIndex++) {
                        if (!weeklyMenu.days[dayIndex].meals[preferredMealIndex].recipeId) {
                            weeklyMenu.days[dayIndex].meals[preferredMealIndex].recipeId = recipe._id;
                            weeklyMenu.days[dayIndex].meals[preferredMealIndex].recipeName = recipe.name;
                            assignmentSummary.push({
                                recipe: recipe.name,
                                day: dayNames[dayIndex],
                                meal: mealNames[preferredMealIndex],
                                dayIndex: dayIndex + 1,
                                type: recipe.meal_type || 'General'
                            });
                            assigned = true;
                            console.log(`✅ ${recipe.name} → ${dayNames[dayIndex]} - ${mealNames[preferredMealIndex]}`);
                        }
                    }
                }
                
                // Si no se asignó por tipo, buscar cualquier slot disponible
                if (!assigned) {
                    for (let dayIndex = 0; dayIndex < 7 && !assigned; dayIndex++) {
                        for (let mealIndex = 0; mealIndex < 4 && !assigned; mealIndex++) {
                            if (!weeklyMenu.days[dayIndex].meals[mealIndex].recipeId) {
                                weeklyMenu.days[dayIndex].meals[mealIndex].recipeId = recipe._id;
                                weeklyMenu.days[dayIndex].meals[mealIndex].recipeName = recipe.name;
                                assignmentSummary.push({
                                    recipe: recipe.name,
                                    day: dayNames[dayIndex],
                                    meal: mealNames[mealIndex],
                                    dayIndex: dayIndex + 1,
                                    type: recipe.meal_type || 'General'
                                });
                                assigned = true;
                                console.log(`✅ ${recipe.name} → ${dayNames[dayIndex]} - ${mealNames[mealIndex]}`);
                            }
                        }
                    }
                }
            }
        }

        await weeklyMenu.save();

        console.log(`🎯 Distribución completada: ${assignmentSummary.length} recetas asignadas`);

        return {
            weeklyMenu,
            assignments: assignmentSummary,
            totalAssigned: assignmentSummary.length
        };

    } catch (error) {
        console.error('Error en asignación automática:', error);
        throw error;
    }
};

// =================================================================
// 📊 FUNCIONES DE INFORMACIÓN NUTRICIONAL
// =================================================================

// Actualizar información nutricional de una receta (manual)
const updateNutritionalInfo = async (req, res) => {
    try {
        const { recipeId } = req.params;
        const { nutritional_info } = req.body;

        const recipe = await Recipe.findOne({ 
            _id: recipeId, 
            user: req.user.id 
        });

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Receta no encontrada'
            });
        }

        recipe.nutritional_info = nutritional_info;
        await recipe.save();

        res.json({
            success: true,
            message: 'Información nutricional actualizada exitosamente',
            data: recipe
        });
    } catch (error) {
        console.error('Error actualizando información nutricional:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Recalcular automáticamente la información nutricional basada en ingredientes
const recalculateNutrition = async (req, res) => {
    try {
        console.log('🧮 [RECALCULATE] Iniciando recálculo automático de nutrición');
        const { recipeId } = req.params;
        console.log('🔍 [RECALCULATE] Recipe ID recibido:', recipeId);

        // Buscar la receta
        const recipe = await Recipe.findOne({ _id: recipeId, user: req.user.id });
        
        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Receta no encontrada'
            });
        }

        console.log(`🧮 Recalculando nutrición para: ${recipe.name}`);
        
        // Calcular nueva información nutricional
        const calculatedNutrition = nutritionCalculator.calculateRecipeNutrition(
            recipe.ingredients_needed || [], 
            recipe.servings || 4
        );

        // Actualizar la receta
        recipe.nutritional_info = {
            calories: Math.round(calculatedNutrition.calories),
            proteins: Math.round(calculatedNutrition.proteins * 10) / 10,
            carbohydrates: Math.round(calculatedNutrition.carbohydrates * 10) / 10,
            fats: Math.round(calculatedNutrition.fats * 10) / 10,
            fiber: Math.round(calculatedNutrition.fiber * 10) / 10,
            sugars: Math.round(calculatedNutrition.sugars * 10) / 10,
            vitamins: calculatedNutrition.vitamins,
            minerals: calculatedNutrition.minerals
        };

        await recipe.save();

        console.log(`✅ Nutrición recalculada: ${recipe.name} (${recipe.nutritional_info.calories} cal, ${recipe.nutritional_info.proteins}g proteína)`);

        res.json({
            success: true,
            message: 'Información nutricional recalculada automáticamente',
            recipe: recipe,
            nutrition: recipe.nutritional_info
        });

    } catch (error) {
        console.error('Error recalculando información nutricional:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

module.exports = {
    generateRecipeWithAI,
    getUserIngredients,
    getRecipes,
    getFavoriteRecipes,
    saveRecipe,
    toggleFavorite,
    deleteRecipe,
    updateNutritionalInfo,
    recalculateNutrition
};