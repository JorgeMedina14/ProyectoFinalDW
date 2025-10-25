// Servicio para calcular información nutricional automáticamente
class NutritionCalculatorService {
  constructor() {
    // Base de datos nutricional básica por 100g de ingrediente
    this.nutritionDB = {
      // Proteínas animales
      'pollo': { calories: 165, proteins: 31, carbohydrates: 0, fats: 3.6, fiber: 0, sugars: 0 },
      'pechuga de pollo': { calories: 165, proteins: 31, carbohydrates: 0, fats: 3.6, fiber: 0, sugars: 0 },
      'carne de res': { calories: 250, proteins: 26, carbohydrates: 0, fats: 15, fiber: 0, sugars: 0 },
      'cerdo': { calories: 242, proteins: 27, carbohydrates: 0, fats: 14, fiber: 0, sugars: 0 },
      'pescado': { calories: 206, proteins: 22, carbohydrates: 0, fats: 12, fiber: 0, sugars: 0 },
      'salmón': { calories: 208, proteins: 20, carbohydrates: 0, fats: 13, fiber: 0, sugars: 0 },
      'atún': { calories: 144, proteins: 30, carbohydrates: 0, fats: 1, fiber: 0, sugars: 0 },
      'huevos': { calories: 155, proteins: 13, carbohydrates: 1.1, fats: 11, fiber: 0, sugars: 1.1 },
      'huevo': { calories: 155, proteins: 13, carbohydrates: 1.1, fats: 11, fiber: 0, sugars: 1.1 },

      // Lácteos
      'leche': { calories: 60, proteins: 3.2, carbohydrates: 4.8, fats: 3.3, fiber: 0, sugars: 4.8 },
      'queso': { calories: 113, proteins: 25, carbohydrates: 1, fats: 0.7, fiber: 0, sugars: 1 },
      'yogur': { calories: 59, proteins: 10, carbohydrates: 3.6, fats: 0.4, fiber: 0, sugars: 3.2 },
      'mantequilla': { calories: 717, proteins: 0.9, carbohydrates: 0.1, fats: 81, fiber: 0, sugars: 0.1 },

      // Cereales y granos
      'arroz': { calories: 130, proteins: 2.7, carbohydrates: 28, fats: 0.3, fiber: 0.4, sugars: 0.1 },
      'pasta': { calories: 131, proteins: 5, carbohydrates: 25, fats: 1.1, fiber: 1.8, sugars: 0.6 },
      'pan': { calories: 265, proteins: 9, carbohydrates: 49, fats: 3.2, fiber: 2.7, sugars: 5 },
      'avena': { calories: 68, proteins: 2.4, carbohydrates: 12, fats: 1.4, fiber: 1.7, sugars: 0.5 },
      'quinoa': { calories: 120, proteins: 4.4, carbohydrates: 22, fats: 1.9, fiber: 2.8, sugars: 0.9 },
      'trigo': { calories: 339, proteins: 13, carbohydrates: 72, fats: 2.5, fiber: 11, sugars: 0.4 },

      // Legumbres
      'frijoles': { calories: 127, proteins: 9, carbohydrates: 23, fats: 0.5, fiber: 9, sugars: 0.3 },
      'lentejas': { calories: 116, proteins: 9, carbohydrates: 20, fats: 0.4, fiber: 8, sugars: 1.8 },
      'garbanzos': { calories: 164, proteins: 8.9, carbohydrates: 27, fats: 2.6, fiber: 8, sugars: 4.8 },
      'habas': { calories: 341, proteins: 26, carbohydrates: 58, fats: 1.5, fiber: 25, sugars: 4.2 },

      // Verduras
      'tomate': { calories: 18, proteins: 0.9, carbohydrates: 3.9, fats: 0.2, fiber: 1.2, sugars: 2.6 },
      'cebolla': { calories: 40, proteins: 1.1, carbohydrates: 9.3, fats: 0.1, fiber: 1.7, sugars: 4.2 },
      'ajo': { calories: 149, proteins: 6.4, carbohydrates: 33, fats: 0.5, fiber: 2.1, sugars: 1 },
      'zanahoria': { calories: 41, proteins: 0.9, carbohydrates: 10, fats: 0.2, fiber: 2.8, sugars: 4.7 },
      'brócoli': { calories: 25, proteins: 3, carbohydrates: 5, fats: 0.4, fiber: 3, sugars: 1.5 },
      'espinacas': { calories: 23, proteins: 2.9, carbohydrates: 3.6, fats: 0.4, fiber: 2.2, sugars: 0.4 },
      'lechuga': { calories: 15, proteins: 1.4, carbohydrates: 2.9, fats: 0.2, fiber: 1.3, sugars: 0.8 },
      'pepino': { calories: 12, proteins: 0.7, carbohydrates: 2.2, fats: 0.2, fiber: 0.7, sugars: 1.9 },

      // Frutas
      'manzana': { calories: 52, proteins: 0.3, carbohydrates: 14, fats: 0.2, fiber: 2.4, sugars: 10 },
      'plátano': { calories: 89, proteins: 1.1, carbohydrates: 23, fats: 0.3, fiber: 2.6, sugars: 12 },
      'naranja': { calories: 43, proteins: 1, carbohydrates: 11, fats: 0.2, fiber: 2.4, sugars: 8.5 },
      'fresa': { calories: 32, proteins: 0.7, carbohydrates: 7.7, fats: 0.3, fiber: 2, sugars: 4.9 },
      'uva': { calories: 69, proteins: 0.7, carbohydrates: 18, fats: 0.2, fiber: 0.9, sugars: 16 },

      // Aceites y grasas
      'aceite de oliva': { calories: 884, proteins: 0, carbohydrates: 0, fats: 100, fiber: 0, sugars: 0 },
      'aceite': { calories: 884, proteins: 0, carbohydrates: 0, fats: 100, fiber: 0, sugars: 0 },
      'aguacate': { calories: 160, proteins: 2, carbohydrates: 9, fats: 15, fiber: 7, sugars: 0.7 },

      // Frutos secos
      'almendras': { calories: 579, proteins: 21, carbohydrates: 22, fats: 50, fiber: 12, sugars: 4.4 },
      'nueces': { calories: 654, proteins: 15, carbohydrates: 14, fats: 65, fiber: 7, sugars: 2.6 },

      // Condimentos y especias (valores mínimos por las pequeñas cantidades)
      'sal': { calories: 0, proteins: 0, carbohydrates: 0, fats: 0, fiber: 0, sugars: 0 },
      'pimienta': { calories: 1, proteins: 0, carbohydrates: 0.3, fats: 0, fiber: 0.1, sugars: 0 },
      'comino': { calories: 2, proteins: 0.1, carbohydrates: 0.3, fats: 0.1, fiber: 0.1, sugars: 0 },
      'orégano': { calories: 1, proteins: 0, carbohydrates: 0.2, fats: 0, fiber: 0.1, sugars: 0 },
      'perejil': { calories: 2, proteins: 0.2, carbohydrates: 0.4, fats: 0, fiber: 0.2, sugars: 0 },
    };

    // Base de datos de vitaminas y minerales (valores aproximados por 100g)
    this.vitaminsDB = {
      'pollo': { vitamin_a: 6, vitamin_c: 1.6, vitamin_d: 0.2, vitamin_b12: 0.3 },
      'carne de res': { vitamin_a: 0, vitamin_c: 0, vitamin_b12: 2.6, iron: 2.6 },
      'huevos': { vitamin_a: 140, vitamin_d: 2, vitamin_b12: 0.9 },
      'leche': { vitamin_a: 28, vitamin_d: 0.1, vitamin_c: 0, calcium: 113 },
      'queso': { vitamin_a: 95, calcium: 200, vitamin_b12: 0.8 },
      'brócoli': { vitamin_c: 89, vitamin_k: 102, folate: 63, vitamin_a: 31 },
      'espinacas': { vitamin_k: 483, vitamin_a: 469, folate: 194, iron: 2.7 },
      'zanahoria': { vitamin_a: 835, vitamin_k: 13, vitamin_c: 6 },
      'tomate': { vitamin_c: 14, vitamin_k: 8, folate: 15 },
      'naranja': { vitamin_c: 53, folate: 40, calcium: 40 },
      'plátano': { vitamin_c: 9, vitamin_b6: 0.4, potassium: 358 },
      'almendras': { vitamin_e: 25, magnesium: 268, calcium: 264 },
    };
  }

  // Función principal para calcular nutrición de una receta
  calculateRecipeNutrition(ingredients, servings = 4) {
    try {
      console.log('🧮 Calculando información nutricional para ingredientes:', ingredients);
      
      let totalNutrition = {
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
      };

      for (const ingredient of ingredients) {
        const nutrition = this.getIngredientNutrition(ingredient);
        
        // Sumar macronutrientes
        totalNutrition.calories += nutrition.calories;
        totalNutrition.proteins += nutrition.proteins;
        totalNutrition.carbohydrates += nutrition.carbohydrates;
        totalNutrition.fats += nutrition.fats;
        totalNutrition.fiber += nutrition.fiber;
        totalNutrition.sugars += nutrition.sugars;

        // Sumar vitaminas y minerales
        Object.keys(nutrition.vitamins).forEach(vitamin => {
          totalNutrition.vitamins[vitamin] += nutrition.vitamins[vitamin];
        });
        
        Object.keys(nutrition.minerals).forEach(mineral => {
          totalNutrition.minerals[mineral] += nutrition.minerals[mineral];
        });
      }

      console.log('📊 Nutrición total calculada:', {
        calories: Math.round(totalNutrition.calories),
        proteins: Math.round(totalNutrition.proteins * 10) / 10,
        carbs: Math.round(totalNutrition.carbohydrates * 10) / 10,
        fats: Math.round(totalNutrition.fats * 10) / 10
      });

      return totalNutrition;
    } catch (error) {
      console.error('Error calculando nutrición:', error);
      return this.getDefaultNutrition();
    }
  }

  // Obtener nutrición de un ingrediente específico
  getIngredientNutrition(ingredient) {
    const cleanIngredient = this.cleanIngredientName(ingredient);
    const quantity = this.extractQuantity(ingredient);
    
    // Buscar en la base de datos
    const baseNutrition = this.findNutritionMatch(cleanIngredient);
    const vitamins = this.vitaminsDB[cleanIngredient] || {};
    
    // Calcular según la cantidad estimada
    const factor = quantity / 100; // Base de datos es por 100g
    
    return {
      calories: baseNutrition.calories * factor,
      proteins: baseNutrition.proteins * factor,
      carbohydrates: baseNutrition.carbohydrates * factor,
      fats: baseNutrition.fats * factor,
      fiber: baseNutrition.fiber * factor,
      sugars: baseNutrition.sugars * factor,
      vitamins: {
        vitamin_a: (vitamins.vitamin_a || 0) * factor,
        vitamin_c: (vitamins.vitamin_c || 0) * factor,
        vitamin_d: (vitamins.vitamin_d || 0) * factor,
        vitamin_e: (vitamins.vitamin_e || 0) * factor,
        vitamin_k: (vitamins.vitamin_k || 0) * factor,
        vitamin_b1: (vitamins.vitamin_b1 || 0) * factor,
        vitamin_b2: (vitamins.vitamin_b2 || 0) * factor,
        vitamin_b3: (vitamins.vitamin_b3 || 0) * factor,
        vitamin_b6: (vitamins.vitamin_b6 || 0) * factor,
        vitamin_b12: (vitamins.vitamin_b12 || 0) * factor,
        folate: (vitamins.folate || 0) * factor
      },
      minerals: {
        calcium: (vitamins.calcium || 0) * factor,
        iron: (vitamins.iron || 0) * factor,
        magnesium: (vitamins.magnesium || 0) * factor,
        phosphorus: (vitamins.phosphorus || 0) * factor,
        potassium: (vitamins.potassium || 0) * factor,
        sodium: (vitamins.sodium || 0) * factor,
        zinc: (vitamins.zinc || 0) * factor,
        copper: (vitamins.copper || 0) * factor,
        manganese: (vitamins.manganese || 0) * factor,
        selenium: (vitamins.selenium || 0) * factor
      }
    };
  }

  // Limpiar nombre de ingrediente
  cleanIngredientName(ingredient) {
    return ingredient
      .toLowerCase()
      .replace(/\d+/g, '') // Remover números
      .replace(/g|gr|gramos|kg|kilogramos|ml|litros|l|taza|tazas|cucharada|cucharadas|pizca|pizcas/g, '')
      .replace(/de |del |la |el |un |una |dos |tres /g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Extraer cantidad estimada en gramos
  extractQuantity(ingredient) {
    const ingredientLower = ingredient.toLowerCase();
    
    // Buscar números seguidos de unidades
    const grMatch = ingredientLower.match(/(\d+)\s*(g|gr|gramos)/);
    if (grMatch) return parseInt(grMatch[1]);
    
    const kgMatch = ingredientLower.match(/(\d+)\s*(kg|kilogramos)/);
    if (kgMatch) return parseInt(kgMatch[1]) * 1000;
    
    const cupMatch = ingredientLower.match(/(\d+)\s*(taza|tazas)/);
    if (cupMatch) return parseInt(cupMatch[1]) * 240; // 1 taza ≈ 240g
    
    const spoonMatch = ingredientLower.match(/(\d+)\s*(cucharada|cucharadas)/);
    if (spoonMatch) return parseInt(spoonMatch[1]) * 15; // 1 cucharada ≈ 15g
    
    // Si no hay cantidad específica, asumir cantidad media según tipo
    const cleanName = this.cleanIngredientName(ingredient);
    
    if (this.isProtein(cleanName)) return 150; // 150g proteína
    if (this.isCarb(cleanName)) return 100; // 100g carbohidratos
    if (this.isVegetable(cleanName)) return 80; // 80g vegetales
    if (this.isFruit(cleanName)) return 120; // 120g frutas
    if (this.isOil(cleanName)) return 15; // 15ml aceite
    if (this.isSpice(cleanName)) return 2; // 2g especias
    
    return 50; // Cantidad por defecto
  }

  // Encontrar coincidencia nutricional
  findNutritionMatch(ingredient) {
    // Buscar coincidencia exacta
    if (this.nutritionDB[ingredient]) {
      return this.nutritionDB[ingredient];
    }
    
    // Buscar coincidencia parcial
    for (const [key, nutrition] of Object.entries(this.nutritionDB)) {
      if (ingredient.includes(key) || key.includes(ingredient)) {
        return nutrition;
      }
    }
    
    // Si no encuentra coincidencia, asignar valores por categoría
    if (this.isProtein(ingredient)) {
      return { calories: 165, proteins: 25, carbohydrates: 0, fats: 5, fiber: 0, sugars: 0 };
    }
    if (this.isCarb(ingredient)) {
      return { calories: 130, proteins: 3, carbohydrates: 28, fats: 0.5, fiber: 2, sugars: 1 };
    }
    if (this.isVegetable(ingredient)) {
      return { calories: 25, proteins: 2, carbohydrates: 5, fats: 0.2, fiber: 2, sugars: 2 };
    }
    if (this.isFruit(ingredient)) {
      return { calories: 50, proteins: 0.5, carbohydrates: 12, fats: 0.2, fiber: 2, sugars: 10 };
    }
    
    return { calories: 50, proteins: 2, carbohydrates: 8, fats: 1, fiber: 1, sugars: 2 };
  }

  // Funciones de categorización
  isProtein(ingredient) {
    const proteins = ['pollo', 'carne', 'pescado', 'huevo', 'atún', 'salmón', 'cerdo', 'res'];
    return proteins.some(protein => ingredient.includes(protein));
  }

  isCarb(ingredient) {
    const carbs = ['arroz', 'pasta', 'pan', 'avena', 'quinoa', 'papa', 'trigo'];
    return carbs.some(carb => ingredient.includes(carb));
  }

  isVegetable(ingredient) {
    const vegetables = ['tomate', 'cebolla', 'ajo', 'zanahoria', 'brócoli', 'espinaca', 'lechuga', 'pepino'];
    return vegetables.some(veg => ingredient.includes(veg));
  }

  isFruit(ingredient) {
    const fruits = ['manzana', 'plátano', 'naranja', 'fresa', 'uva', 'limón'];
    return fruits.some(fruit => ingredient.includes(fruit));
  }

  isOil(ingredient) {
    return ingredient.includes('aceite') || ingredient.includes('mantequilla');
  }

  isSpice(ingredient) {
    const spices = ['sal', 'pimienta', 'comino', 'orégano', 'perejil'];
    return spices.some(spice => ingredient.includes(spice));
  }

  // Nutrición por defecto si no se puede calcular
  getDefaultNutrition() {
    return {
      calories: 250,
      proteins: 15,
      carbohydrates: 30,
      fats: 8,
      fiber: 5,
      sugars: 8,
      vitamins: {
        vitamin_a: 100,
        vitamin_c: 20,
        vitamin_d: 1,
        vitamin_e: 2,
        vitamin_k: 25,
        vitamin_b1: 0.3,
        vitamin_b2: 0.4,
        vitamin_b3: 5,
        vitamin_b6: 0.5,
        vitamin_b12: 1,
        folate: 50
      },
      minerals: {
        calcium: 100,
        iron: 2,
        magnesium: 30,
        phosphorus: 150,
        potassium: 300,
        sodium: 200,
        zinc: 1.5,
        copper: 0.2,
        manganese: 0.5,
        selenium: 15
      }
    };
  }
}

module.exports = new NutritionCalculatorService();