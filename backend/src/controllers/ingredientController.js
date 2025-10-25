const OpenAI = require('openai');
const path = require('path');
const fs = require('fs');
const Ingredient = require('../models/Ingredient');
const User = require('../models/User');
const Recipe = require('../models/Recipe');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const analyzeImage = async (imagePath) => {
    try {
        // Leer la imagen como base64
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        { 
                            type: "text", 
                            text: "Analiza esta imagen de una alacena o cocina y lista todos los ingredientes o alimentos que veas. Proporciona solo los nombres de los ingredientes separados por comas, sin descripciones adicionales. Si no ves ingredientes claros, responde 'No se detectaron ingredientes específicos'." 
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`,
                                detail: "high"
                            }
                        }
                    ]
                }
            ],
            max_tokens: 300
        });

        // Procesar la respuesta
        const responseText = response.choices[0].message.content;
        
        if (responseText.includes('No se detectaron ingredientes')) {
            return [];
        }
        
        const ingredients = responseText
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0 && !item.toLowerCase().includes('no se'));

        return ingredients;
    } catch (error) {
        console.error('Error analizando la imagen:', error);
        throw error;
    }
};

// Subir imagen y detectar ingredientes
exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se ha subido ninguna imagen'
            });
        }

        const imagePath = path.join(__dirname, '../../', req.file.path);
        
        // Eliminar ingredientes anteriores del usuario
        await Ingredient.deleteMany({ user: req.user.id });
        console.log('Ingredientes anteriores eliminados para el usuario:', req.user.id);
        
        // Analizar la imagen con IA
        const detectedIngredients = await analyzeImage(imagePath);

        // Guardar cada ingrediente en la base de datos
        const savedIngredients = await Promise.all(
            detectedIngredients.map(async (name) => {
                return await Ingredient.create({
                    user: req.user.id,
                    name,
                    verified: false,
                    imageUrl: req.file.path
                });
            })
        );

        res.status(200).json({
            success: true,
            data: {
                imageUrl: req.file.path,
                ingredients: savedIngredients,
                message: 'Imagen procesada y ingredientes detectados exitosamente'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al procesar la imagen',
            error: error.message
        });
    }
};

// Obtener todos los ingredientes del usuario
exports.getIngredients = async (req, res) => {
    try {
        const ingredients = await Ingredient.find({ user: req.user.id });
        
        res.status(200).json({
            success: true,
            data: ingredients
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los ingredientes',
            error: error.message
        });
    }
};

// Agregar ingrediente manualmente
exports.addIngredient = async (req, res) => {
    try {
        const { name, quantity, unit } = req.body;

        const ingredient = await Ingredient.create({
            user: req.user.id,
            name,
            quantity,
            unit,
            verified: true
        });

        res.status(201).json({
            success: true,
            data: ingredient
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al agregar el ingrediente',
            error: error.message
        });
    }
};

// Actualizar ingrediente
exports.updateIngredient = async (req, res) => {
    try {
        const ingredient = await Ingredient.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!ingredient) {
            return res.status(404).json({
                success: false,
                message: 'Ingrediente no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: ingredient
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el ingrediente',
            error: error.message
        });
    }
};

// Eliminar ingrediente
exports.deleteIngredient = async (req, res) => {
    try {
        const ingredient = await Ingredient.findById(req.params.id);

        if (!ingredient) {
            return res.status(404).json({
                success: false,
                message: 'Ingrediente no encontrado'
            });
        }

        // Verificar que el ingrediente pertenece al usuario
        if (ingredient.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado para eliminar este ingrediente'
            });
        }

        await Ingredient.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Ingrediente eliminado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el ingrediente',
            error: error.message
        });
    }
};

// Generar recetas basadas en ingredientes del usuario
const generateRecipes = async (req, res) => {
    try {
        // Obtener todos los ingredientes del usuario
        const userIngredients = await Ingredient.find({ user: req.user.id });
        
        if (userIngredients.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No tienes ingredientes disponibles para generar recetas'
            });
        }

        // Crear lista de ingredientes para enviar a OpenAI
        const ingredientsList = userIngredients.map(ing => ing.name).join(', ');
        
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "Eres un chef experto que crea recetas deliciosas y balanceadas. Siempre responde en español."
                },
                {
                    role: "user",
                    content: `Tengo estos ingredientes disponibles: ${ingredientsList}. 
                    
                    Por favor, genera 3 recetas diferentes que pueda hacer con estos ingredientes. Para cada receta incluye:
                    1. Nombre de la receta
                    2. Lista de ingredientes necesarios (indica cuáles tengo y cuáles necesitaría comprar)
                    3. Instrucciones paso a paso
                    4. Tiempo de preparación aproximado
                    5. Número de porciones
                    
                    Formato la respuesta como JSON con esta estructura:
                    {
                        "recipes": [
                            {
                                "name": "Nombre de la receta",
                                "ingredients_needed": ["ingrediente1", "ingrediente2"],
                                "ingredients_to_buy": ["ingrediente3", "ingrediente4"],
                                "instructions": ["paso 1", "paso 2", "paso 3"],
                                "prep_time": "30 minutos",
                                "servings": 4,
                                "difficulty": "Fácil"
                            }
                        ]
                    }`
                }
            ],
            max_tokens: 1500,
            temperature: 0.7
        });

        const responseText = response.choices[0].message.content;
        
        // Intentar parsear la respuesta JSON
        let recipes;
        try {
            recipes = JSON.parse(responseText);
        } catch (parseError) {
            // Si no es JSON válido, crear una respuesta estructurada
            recipes = {
                recipes: [{
                    name: "Receta Sugerida",
                    ingredients_needed: userIngredients.map(ing => ing.name),
                    ingredients_to_buy: [],
                    instructions: responseText.split('\n').filter(line => line.trim().length > 0),
                    prep_time: "30 minutos",
                    servings: 4,
                    difficulty: "Fácil"
                }]
            };
        }

        // Opcionalmente guardar las recetas en la base de datos
        const { saveToDatabase } = req.body;
        let savedRecipes = [];
        
        if (saveToDatabase) {
            try {
                for (const recipe of recipes.recipes) {
                    const newRecipe = new Recipe({
                        user: req.user.id,
                        name: recipe.name,
                        ingredients_needed: recipe.ingredients_needed,
                        ingredients_to_buy: recipe.ingredients_to_buy || [],
                        instructions: recipe.instructions,
                        prep_time: recipe.prep_time,
                        servings: recipe.servings,
                        difficulty: recipe.difficulty,
                        generated_from_ingredients: ingredientsList.split(', '),
                        is_favorite: false
                    });
                    
                    const savedRecipe = await newRecipe.save();
                    savedRecipes.push(savedRecipe);
                }
            } catch (saveError) {
                console.error('Error al guardar recetas:', saveError);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Recetas generadas exitosamente',
            data: recipes,
            saved_recipes: savedRecipes,
            user_ingredients: ingredientsList
        });

    } catch (error) {
        console.error('Error al generar recetas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar recetas',
            error: error.message
        });
    }
};

exports.generateRecipes = generateRecipes;