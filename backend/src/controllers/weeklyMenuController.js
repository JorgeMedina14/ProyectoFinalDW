const WeeklyMenu = require('../models/WeeklyMenu');
const Recipe = require('../models/Recipe');

// Obtener menú semanal actual o crear uno nuevo
const getCurrentWeeklyMenu = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Buscar menú semanal activo
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
    
    // Poblar con información de recetas
    await weeklyMenu.populate('days.meals.recipeId');
    
    res.json({
      success: true,
      data: weeklyMenu
    });
    
  } catch (error) {
    console.error('Error al obtener menú semanal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el menú semanal',
      error: error.message
    });
  }
};

// Obtener menú de una semana específica
const getWeeklyMenuByDate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate } = req.params;
    
    const monday = new Date(startDate);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    
    monday.setHours(0, 0, 0, 0);
    sunday.setHours(23, 59, 59, 999);
    
    let weeklyMenu = await WeeklyMenu.findOne({
      user: userId,
      weekStartDate: { $lte: monday },
      weekEndDate: { $gte: sunday }
    }).populate('days.meals.recipeId');
    
    if (!weeklyMenu) {
      // Crear nuevo menú para la semana solicitada
      weeklyMenu = new WeeklyMenu({
        user: userId,
        title: `Menú semanal ${monday.toLocaleDateString('es-ES')} - ${sunday.toLocaleDateString('es-ES')}`,
        weekStartDate: monday,
        weekEndDate: sunday
      });
      
      weeklyMenu.initializeWeek();
      await weeklyMenu.save();
      await weeklyMenu.populate('days.meals.recipeId');
    }
    
    res.json({
      success: true,
      data: weeklyMenu
    });
    
  } catch (error) {
    console.error('Error al obtener menú por fecha:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el menú semanal',
      error: error.message
    });
  }
};

// Obtener todos los menús semanales del usuario
const getAllUserMenus = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const menus = await WeeklyMenu.find({ user: userId })
      .select('title description weekStartDate weekEndDate isFavorite isTemplate templateName tags createdAt')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: menus
    });
    
  } catch (error) {
    console.error('Error al obtener menús del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los menús',
      error: error.message
    });
  }
};

// Crear nuevo menú semanal
const createWeeklyMenu = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, weekStartDate, isTemplate, templateName, tags } = req.body;
    
    console.log('Datos recibidos para crear menú:', req.body);
    
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El título es requerido'
      });
    }
    
    const startDate = weekStartDate ? new Date(weekStartDate) : new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    const weeklyMenu = new WeeklyMenu({
      user: userId,
      title: title.trim(),
      description: description || '',
      weekStartDate: startDate,
      weekEndDate: endDate,
      isTemplate: isTemplate || false,
      templateName: templateName || '',
      tags: tags || []
    });
    
    weeklyMenu.initializeWeek();
    await weeklyMenu.save();
    
    res.json({
      success: true,
      message: 'Menú semanal creado exitosamente',
      data: weeklyMenu
    });
    
  } catch (error) {
    console.error('Error al crear menú semanal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el menú semanal',
      error: error.message
    });
  }
};

// Duplicar menú existente
const duplicateWeeklyMenu = async (req, res) => {
  try {
    const userId = req.user.id;
    const { menuId, newTitle, newWeekStartDate } = req.body;
    
    const originalMenu = await WeeklyMenu.findOne({
      _id: menuId,
      user: userId
    });
    
    if (!originalMenu) {
      return res.status(404).json({
        success: false,
        message: 'Menú no encontrado'
      });
    }
    
    const startDate = new Date(newWeekStartDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    const duplicatedMenu = new WeeklyMenu({
      user: userId,
      title: newTitle || `${originalMenu.title} (Copia)`,
      description: originalMenu.description,
      weekStartDate: startDate,
      weekEndDate: endDate,
      days: originalMenu.days.map(day => ({
        ...day.toObject(),
        date: new Date(startDate.getTime() + (originalMenu.days.indexOf(day) * 24 * 60 * 60 * 1000))
      })),
      tags: originalMenu.tags
    });
    
    await duplicatedMenu.save();
    await duplicatedMenu.populate('days.meals.recipeId');
    
    res.json({
      success: true,
      message: 'Menú duplicado exitosamente',
      data: duplicatedMenu
    });
    
  } catch (error) {
    console.error('Error al duplicar menú:', error);
    res.status(500).json({
      success: false,
      message: 'Error al duplicar el menú',
      error: error.message
    });
  }
};

// Actualizar información del menú
const updateMenuInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { menuId } = req.params;
    const { title, description, isFavorite, tags } = req.body;
    
    const weeklyMenu = await WeeklyMenu.findOne({
      _id: menuId,
      user: userId
    });
    
    if (!weeklyMenu) {
      return res.status(404).json({
        success: false,
        message: 'Menú no encontrado'
      });
    }
    
    if (title) weeklyMenu.title = title;
    if (description !== undefined) weeklyMenu.description = description;
    if (isFavorite !== undefined) weeklyMenu.isFavorite = isFavorite;
    if (tags) weeklyMenu.tags = tags;
    
    await weeklyMenu.save();
    
    res.json({
      success: true,
      message: 'Menú actualizado exitosamente',
      data: weeklyMenu
    });
    
  } catch (error) {
    console.error('Error al actualizar menú:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el menú',
      error: error.message
    });
  }
};

// Eliminar menú
const deleteWeeklyMenu = async (req, res) => {
  try {
    const userId = req.user.id;
    const { menuId } = req.params;
    
    const weeklyMenu = await WeeklyMenu.findOne({
      _id: menuId,
      user: userId
    });
    
    if (!weeklyMenu) {
      return res.status(404).json({
        success: false,
        message: 'Menú no encontrado'
      });
    }
    
    await WeeklyMenu.deleteOne({ _id: menuId });
    
    res.json({
      success: true,
      message: 'Menú eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('Error al eliminar menú:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el menú',
      error: error.message
    });
  }
};

// Obtener menú por ID
const getMenuById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { menuId } = req.params;
    
    const weeklyMenu = await WeeklyMenu.findOne({
      _id: menuId,
      user: userId
    }).populate('days.meals.recipeId');
    
    if (!weeklyMenu) {
      return res.status(404).json({
        success: false,
        message: 'Menú no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: weeklyMenu
    });
    
  } catch (error) {
    console.error('Error al obtener menú:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el menú',
      error: error.message
    });
  }
};

// Asignar receta a un slot de comida
const assignRecipeToSlot = async (req, res) => {
  try {
    const userId = req.user.id;
    const { menuId, dayIndex, mealIndex, recipeId } = req.body;
    
    const weeklyMenu = await WeeklyMenu.findOne({
      _id: menuId,
      user: userId
    });
    
    if (!weeklyMenu) {
      return res.status(404).json({
        success: false,
        message: 'Menú semanal no encontrado'
      });
    }
    
    if (dayIndex >= weeklyMenu.days.length || mealIndex >= weeklyMenu.days[dayIndex].meals.length) {
      return res.status(400).json({
        success: false,
        message: 'Índices de día o comida inválidos'
      });
    }
    
    let recipeName = '';
    if (recipeId) {
      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        return res.status(404).json({
          success: false,
          message: 'Receta no encontrada'
        });
      }
      recipeName = recipe.name;
    }
    
    // Actualizar el slot de comida
    weeklyMenu.days[dayIndex].meals[mealIndex].recipeId = recipeId || null;
    weeklyMenu.days[dayIndex].meals[mealIndex].recipeName = recipeName;
    
    await weeklyMenu.save();
    await weeklyMenu.populate('days.meals.recipeId');
    
    res.json({
      success: true,
      message: 'Receta asignada correctamente',
      data: weeklyMenu
    });
    
  } catch (error) {
    console.error('Error al asignar receta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar la receta',
      error: error.message
    });
  }
};

// Mover receta entre slots
const moveRecipe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      menuId, 
      fromDayIndex, 
      fromMealIndex, 
      toDayIndex, 
      toMealIndex 
    } = req.body;
    
    const weeklyMenu = await WeeklyMenu.findOne({
      _id: menuId,
      user: userId
    });
    
    if (!weeklyMenu) {
      return res.status(404).json({
        success: false,
        message: 'Menú semanal no encontrado'
      });
    }
    
    // Validar índices
    const fromDay = weeklyMenu.days[fromDayIndex];
    const toDay = weeklyMenu.days[toDayIndex];
    
    if (!fromDay || !toDay || 
        !fromDay.meals[fromMealIndex] || 
        !toDay.meals[toMealIndex]) {
      return res.status(400).json({
        success: false,
        message: 'Índices inválidos'
      });
    }
    
    // Intercambiar recetas
    const fromRecipeId = fromDay.meals[fromMealIndex].recipeId;
    const fromRecipeName = fromDay.meals[fromMealIndex].recipeName;
    const fromNotes = fromDay.meals[fromMealIndex].notes;
    
    const toRecipeId = toDay.meals[toMealIndex].recipeId;
    const toRecipeName = toDay.meals[toMealIndex].recipeName;
    const toNotes = toDay.meals[toMealIndex].notes;
    
    // Realizar el intercambio
    fromDay.meals[fromMealIndex].recipeId = toRecipeId;
    fromDay.meals[fromMealIndex].recipeName = toRecipeName;
    fromDay.meals[fromMealIndex].notes = toNotes;
    
    toDay.meals[toMealIndex].recipeId = fromRecipeId;
    toDay.meals[toMealIndex].recipeName = fromRecipeName;
    toDay.meals[toMealIndex].notes = fromNotes;
    
    await weeklyMenu.save();
    await weeklyMenu.populate('days.meals.recipeId');
    
    res.json({
      success: true,
      message: 'Recetas intercambiadas correctamente',
      data: weeklyMenu
    });
    
  } catch (error) {
    console.error('Error al mover receta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al mover la receta',
      error: error.message
    });
  }
};

// Actualizar notas de una comida
const updateMealNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { menuId, dayIndex, mealIndex, notes } = req.body;
    
    const weeklyMenu = await WeeklyMenu.findOne({
      _id: menuId,
      user: userId
    });
    
    if (!weeklyMenu) {
      return res.status(404).json({
        success: false,
        message: 'Menú semanal no encontrado'
      });
    }
    
    if (dayIndex >= weeklyMenu.days.length || mealIndex >= weeklyMenu.days[dayIndex].meals.length) {
      return res.status(400).json({
        success: false,
        message: 'Índices de día o comida inválidos'
      });
    }
    
    weeklyMenu.days[dayIndex].meals[mealIndex].notes = notes || '';
    await weeklyMenu.save();
    
    res.json({
      success: true,
      message: 'Notas actualizadas correctamente',
      data: weeklyMenu
    });
    
  } catch (error) {
    console.error('Error al actualizar notas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar las notas',
      error: error.message
    });
  }
};

// Eliminar receta de un slot
const removeRecipeFromSlot = async (req, res) => {
  try {
    const userId = req.user.id;
    const { menuId, dayIndex, mealIndex } = req.body;
    
    const weeklyMenu = await WeeklyMenu.findOne({
      _id: menuId,
      user: userId
    });
    
    if (!weeklyMenu) {
      return res.status(404).json({
        success: false,
        message: 'Menú semanal no encontrado'
      });
    }
    
    if (dayIndex >= weeklyMenu.days.length || mealIndex >= weeklyMenu.days[dayIndex].meals.length) {
      return res.status(400).json({
        success: false,
        message: 'Índices de día o comida inválidos'
      });
    }
    
    // Limpiar el slot
    weeklyMenu.days[dayIndex].meals[mealIndex].recipeId = null;
    weeklyMenu.days[dayIndex].meals[mealIndex].recipeName = '';
    
    await weeklyMenu.save();
    await weeklyMenu.populate('days.meals.recipeId');
    
    res.json({
      success: true,
      message: 'Receta eliminada del slot',
      data: weeklyMenu
    });
    
  } catch (error) {
    console.error('Error al eliminar receta del slot:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la receta',
      error: error.message
    });
  }
};

// Obtener todas las recetas del usuario para el selector
const getUserRecipesForMenu = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const recipes = await Recipe.find({ user: userId })
      .select('name description image ingredients preparationTime difficulty')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: recipes
    });
    
  } catch (error) {
    console.error('Error al obtener recetas del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las recetas',
      error: error.message
    });
  }
};

// Asignar automáticamente recetas al planificador semanal
const autoAssignRecipesToWeek = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipeIds } = req.body; // Array de IDs de recetas

    if (!recipeIds || !Array.isArray(recipeIds) || recipeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de IDs de recetas'
      });
    }

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
      return res.status(404).json({
        success: false,
        message: 'No se encontraron recetas válidas'
      });
    }

    // Algoritmo de distribución inteligente mejorado
    const assignmentSummary = [];
    const mealTypeMapping = {
      'Desayuno': 0,
      'Almuerzo': 1, 
      'Cena': 2,
      'Merienda': 3
    };

    // Separar recetas por tipo de comida
    const recipesByMealType = {
      desayuno: recipes.filter(r => r.meal_type === 'Desayuno'),
      almuerzo: recipes.filter(r => r.meal_type === 'Almuerzo'),
      cena: recipes.filter(r => r.meal_type === 'Cena'),
      merienda: recipes.filter(r => r.meal_type === 'Merienda'),
      general: recipes.filter(r => !r.meal_type || r.meal_type === 'General')
    };

    console.log(`Distribuyendo ${recipes.length} recetas...`);
    console.log('Recetas por tipo:', {
      desayuno: recipesByMealType.desayuno.length,
      almuerzo: recipesByMealType.almuerzo.length,
      cena: recipesByMealType.cena.length,
      merienda: recipesByMealType.merienda.length,
      general: recipesByMealType.general.length
    });

    // Estrategia de distribución basada en el número de recetas
    if (recipes.length === 7) {
      // Distribución perfecta: una receta por día
      console.log('Aplicando distribución perfecta: 1 receta por día');
      
      // Prioridades de comidas por día para distribución equilibrada
      const dailyMealPriorities = [
        [1, 2, 0, 3], // Lunes: Almuerzo, Cena, Desayuno, Merienda
        [2, 1, 3, 0], // Martes: Cena, Almuerzo, Merienda, Desayuno
        [1, 0, 2, 3], // Miércoles: Almuerzo, Desayuno, Cena, Merienda
        [2, 1, 0, 3], // Jueves: Cena, Almuerzo, Desayuno, Merienda
        [1, 2, 3, 0], // Viernes: Almuerzo, Cena, Merienda, Desayuno
        [2, 0, 1, 3], // Sábado: Cena, Desayuno, Almuerzo, Merienda
        [0, 1, 2, 3]  // Domingo: Desayuno, Almuerzo, Cena, Merienda
      ];

      const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
      const mealNames = ['Desayuno', 'Almuerzo', 'Cena', 'Merienda'];

      // Asignar una receta por día
      for (let dayIndex = 0; dayIndex < 7 && dayIndex < recipes.length; dayIndex++) {
        const recipe = recipes[dayIndex];
        const mealPriorities = dailyMealPriorities[dayIndex];
        
        // Determinar el mejor slot para esta receta
        let bestMealIndex = 1; // Por defecto almuerzo
        
        // Si la receta tiene un tipo específico, usar ese primero
        if (recipe.meal_type && mealTypeMapping[recipe.meal_type] !== undefined) {
          bestMealIndex = mealTypeMapping[recipe.meal_type];
        } else {
          // Usar la prioridad del día para recetas generales
          bestMealIndex = mealPriorities[0];
        }
        
        // Verificar que el slot esté disponible, si no, buscar alternativa
        if (weeklyMenu.days[dayIndex].meals[bestMealIndex].recipeId) {
          // Buscar slot alternativo en el mismo día
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
      
    } else if (recipes.length < 7) {
      // Menos de 7 recetas: distribuir espaciadamente
      console.log(`Distribuyendo ${recipes.length} recetas espaciadamente`);
      
      const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
      const mealNames = ['Desayuno', 'Almuerzo', 'Cena', 'Merienda'];
      
      // Calcular espaciado entre días
      const spacing = Math.floor(7 / recipes.length);
      let currentDay = 0;
      
      for (let i = 0; i < recipes.length; i++) {
        const recipe = recipes[i];
        const dayIndex = Math.min(currentDay, 6);
        
        // Determinar mejor horario de comida
        let mealIndex = 1; // Por defecto almuerzo
        if (recipe.meal_type && mealTypeMapping[recipe.meal_type] !== undefined) {
          mealIndex = mealTypeMapping[recipe.meal_type];
        }
        
        // Buscar slot disponible en el día
        let finalMealIndex = mealIndex;
        if (weeklyMenu.days[dayIndex].meals[mealIndex].recipeId) {
          // Buscar slot alternativo
          const alternativeMeals = [1, 2, 0, 3]; // Almuerzo, Cena, Desayuno, Merienda
          for (const altMeal of alternativeMeals) {
            if (!weeklyMenu.days[dayIndex].meals[altMeal].recipeId) {
              finalMealIndex = altMeal;
              break;
            }
          }
        }
        
        weeklyMenu.days[dayIndex].meals[finalMealIndex].recipeId = recipe._id;
        weeklyMenu.days[dayIndex].meals[finalMealIndex].recipeName = recipe.name;
        
        assignmentSummary.push({
          recipe: recipe.name,
          day: dayNames[dayIndex],
          meal: mealNames[finalMealIndex],
          dayIndex: dayIndex + 1,
          type: recipe.meal_type || 'General'
        });
        
        console.log(`✅ ${recipe.name} → ${dayNames[dayIndex]} - ${mealNames[finalMealIndex]}`);
        
        currentDay += spacing + 1;
      }
      
    } else {
      // Más de 7 recetas: distribuir múltiples por día
      console.log(`Distribuyendo ${recipes.length} recetas en múltiples comidas`);
      
      const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
      const mealNames = ['Desayuno', 'Almuerzo', 'Cena', 'Merienda'];
      
      let recipeIndex = 0;
      
      // Primero asignar por tipo específico
      for (const [mealType, recipeList] of Object.entries(recipesByMealType)) {
        if (mealType === 'general') continue;
        
        const mealIndex = mealTypeMapping[mealType.charAt(0).toUpperCase() + mealType.slice(1)];
        
        for (let i = 0; i < recipeList.length && i < 7; i++) {
          const recipe = recipeList[i];
          const dayIndex = i;
          
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
            console.log(`✅ ${recipe.name} → ${dayNames[dayIndex]} - ${mealNames[mealIndex]}`);
          }
        }
      }
      
      // Luego asignar recetas generales en slots disponibles
      for (const recipe of recipesByMealType.general) {
        let assigned = false;
        
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
              console.log(`✅ ${recipe.name} → ${dayNames[dayIndex]} - ${mealNames[mealIndex]}`);
              assigned = true;
            }
          }
        }
      }
    }

    await weeklyMenu.save();

    // Poblar con información de recetas para mostrar los nombres
    await weeklyMenu.populate('days.meals.recipeId');

    // Crear un resumen detallado para mostrar al usuario
    const detailedSummary = assignmentSummary.map(assignment => 
      `📅 ${assignment.day}: ${assignment.recipe} (${assignment.meal})`
    ).join('\n');

    console.log('\n🎯 RESUMEN DE ASIGNACIONES:');
    console.log(detailedSummary);

    res.json({
      success: true,
      message: `${assignmentSummary.length} recetas asignadas automáticamente al planificador`,
      data: {
        weeklyMenu,
        assignments: assignmentSummary,
        totalAssigned: assignmentSummary.length,
        summary: detailedSummary,
        distribution: `Se distribuyeron ${assignmentSummary.length} recetas de ${recipes.length} disponibles`
      }
    });

  } catch (error) {
    console.error('Error en asignación automática:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar recetas automáticamente',
      error: error.message
    });
  }
};

// Completar automáticamente las comidas faltantes en cada día
const fillMissingMeals = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Obtener menú semanal activo
    const weeklyMenu = await WeeklyMenu.getCurrentWeek(userId);
    if (!weeklyMenu) {
      return res.status(404).json({
        success: false,
        message: 'No hay menú semanal activo'
      });
    }

    // Obtener todas las recetas del usuario
    const userRecipes = await Recipe.find({ user: userId });
    if (userRecipes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No tienes recetas creadas. Crea algunas recetas primero.'
      });
    }

    let assignedCount = 0;

    // Iterar por cada día del menú
    for (const day of weeklyMenu.days) {
      // Tipos de comida en orden de prioridad
      const mealTypes = ['desayuno', 'almuerzo', 'cena', 'merienda'];
      
      for (const mealType of mealTypes) {
        // Buscar si ya existe esta comida en el día
        const existingMeal = day.meals.find(meal => meal.mealType === mealType);
        
        // Si no existe o no tiene receta asignada
        if (!existingMeal || !existingMeal.recipeId) {
          // Filtrar recetas apropiadas para este tipo de comida
          let suitableRecipes = userRecipes.filter(recipe => {
            const categories = recipe.category ? recipe.category.toLowerCase() : '';
            const name = recipe.name ? recipe.name.toLowerCase() : '';
            
            switch (mealType) {
              case 'desayuno':
                return categories.includes('desayuno') || 
                       name.includes('desayuno') || 
                       name.includes('pancake') || 
                       name.includes('cereal') ||
                       name.includes('huevo') ||
                       name.includes('sandwich');
              case 'almuerzo':
              case 'cena':
                return categories.includes('almuerzo') || 
                       categories.includes('cena') || 
                       categories.includes('principal') ||
                       name.includes('pasta') ||
                       name.includes('pollo') ||
                       name.includes('carne') ||
                       name.includes('pescado') ||
                       name.includes('arroz');
              case 'merienda':
                return categories.includes('merienda') || 
                       categories.includes('postre') ||
                       categories.includes('snack') ||
                       name.includes('galleta') ||
                       name.includes('fruta') ||
                       name.includes('yogur');
              default:
                return true;
            }
          });

          // Si no hay recetas específicas, usar cualquiera
          if (suitableRecipes.length === 0) {
            suitableRecipes = userRecipes;
          }

          // Seleccionar una receta aleatoria
          const randomRecipe = suitableRecipes[Math.floor(Math.random() * suitableRecipes.length)];

          if (existingMeal) {
            // Actualizar comida existente
            existingMeal.recipeId = randomRecipe._id;
            existingMeal.recipeName = randomRecipe.name;
          } else {
            // Agregar nueva comida
            day.meals.push({
              recipeId: randomRecipe._id,
              recipeName: randomRecipe.name,
              mealType: mealType,
              notes: ''
            });
          }
          
          assignedCount++;
        }
      }
    }

    // Guardar cambios
    await weeklyMenu.save();

    res.json({
      success: true,
      message: `Se asignaron ${assignedCount} comidas automáticamente`,
      data: {
        assignedMeals: assignedCount,
        weeklyMenu: weeklyMenu
      }
    });

  } catch (error) {
    console.error('Error al completar comidas faltantes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al completar las comidas faltantes',
      error: error.message
    });
  }
};

module.exports = {
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
};