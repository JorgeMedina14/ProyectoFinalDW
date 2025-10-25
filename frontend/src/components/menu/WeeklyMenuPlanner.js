import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { weeklyMenuService } from '../../services/api';
import './WeeklyMenuPlanner.css';

const WeeklyMenuPlanner = () => {
  const navigate = useNavigate();
  const [weeklyMenu, setWeeklyMenu] = useState(null);
  const [userRecipes, setUserRecipes] = useState([]);
  const [allMenus, setAllMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);
  const [showMenuManager, setShowMenuManager] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [draggedRecipe, setDraggedRecipe] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [newMenuData, setNewMenuData] = useState({
    title: '',
    description: '',
    weekStartDate: ''
  });

  const mealTypes = [
    { key: 'desayuno', label: '🥐 Desayuno', time: '7:00 AM' },
    { key: 'almuerzo', label: '🍽️ Almuerzo', time: '12:00 PM' },
    { key: 'cena', label: '🍱 Cena', time: '7:00 PM' },
    { key: 'merienda', label: '🍪 Merienda', time: '4:00 PM' }
  ];

  useEffect(() => {
    loadCurrentWeeklyMenu();
    loadUserRecipes();
    loadAllMenus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeekStart]);

  const loadCurrentWeeklyMenu = async () => {
    try {
      setLoading(true);
      console.log('🔄 Iniciando carga de menú semanal...');
      
      // Verificar token
      const token = localStorage.getItem('token');
      console.log('🔑 Token presente:', !!token);
      
      // Verificar usuario autenticado
      const user = localStorage.getItem('user');
      if (!token || !user) {
        console.error('❌ Usuario no autenticado');
        navigate('/login');
        return;
      }
      
      const response = await weeklyMenuService.getCurrentWeeklyMenu();
      console.log('✅ Respuesta del servidor:', response);
      console.log('📊 Datos del menú:', response.data);
      
      if (response.data && response.data.success) {
        setWeeklyMenu(response.data.data);
      } else {
        console.warn('⚠️ Respuesta inesperada del servidor:', response.data);
        setWeeklyMenu(null);
      }
    } catch (error) {
      console.error('❌ Error al cargar menú semanal:', error);
      console.error('📋 Detalles del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Manejar errores específicos
      if (error.response?.status === 401) {
        console.warn('🔒 Token expirado, redirigiendo al login...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else if (error.response?.status === 404) {
        console.info('ℹ️ No hay menú activo, se creará uno nuevo automáticamente');
        setWeeklyMenu(null);
      } else {
        console.error('🚨 Error de servidor o red:', error.message);
        setWeeklyMenu(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAllMenus = async () => {
    try {
      console.log('📚 Cargando todos los menús...');
      const response = await weeklyMenuService.getAllUserMenus();
      console.log('✅ Menús cargados:', response.data);
      
      if (response.data && response.data.success) {
        setAllMenus(response.data.data || []);
      } else {
        console.warn('⚠️ Respuesta inesperada al cargar menús:', response.data);
        setAllMenus([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar menús:', error);
      console.error('📋 Detalles del error de menús:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        console.warn('🔒 Token expirado al cargar menús');
        navigate('/login');
      } else {
        setAllMenus([]);
      }
    }
  };

  const handleCreateMenu = async () => {
    try {
      if (!newMenuData.title.trim()) {
        alert('Por favor ingresa un título para el menú');
        return;
      }

      const menuData = {
        title: newMenuData.title,
        description: newMenuData.description,
        weekStartDate: newMenuData.weekStartDate || new Date().toISOString().split('T')[0]
      };

      const response = await weeklyMenuService.createWeeklyMenu(menuData);
      setWeeklyMenu(response.data.data);
      setShowCreateMenu(false);
      setNewMenuData({ title: '', description: '', weekStartDate: '' });
      loadAllMenus();
      alert('Menú creado exitosamente');
    } catch (error) {
      console.error('Error al crear menú:', error);
      alert('Error al crear el menú');
    }
  };

  const handleLoadMenu = async (menuId) => {
    try {
      const response = await weeklyMenuService.getMenuById(menuId);
      setWeeklyMenu(response.data.data);
      setShowMenuManager(false);
    } catch (error) {
      console.error('Error al cargar menú:', error);
      alert('Error al cargar el menú');
    }
  };

  const handleDuplicateMenu = async (menuId) => {
    try {
      const title = prompt('Nombre para el menú duplicado:');
      if (!title) return;

      const weekStartDate = prompt('Fecha de inicio de semana (YYYY-MM-DD):', 
        new Date().toISOString().split('T')[0]);
      if (!weekStartDate) return;

      const response = await weeklyMenuService.duplicateWeeklyMenu(menuId, title, weekStartDate);
      setWeeklyMenu(response.data.data);
      loadAllMenus();
      alert('Menú duplicado exitosamente');
    } catch (error) {
      console.error('Error al duplicar menú:', error);
      alert('Error al duplicar el menú');
    }
  };

  const handleDeleteMenu = async (menuId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este menú?')) return;

    try {
      await weeklyMenuService.deleteWeeklyMenu(menuId);
      loadAllMenus();
      if (weeklyMenu && weeklyMenu._id === menuId) {
        setWeeklyMenu(null);
        loadCurrentWeeklyMenu();
      }
      alert('Menú eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar menú:', error);
      alert('Error al eliminar el menú');
    }
  };

  const handleToggleFavorite = async (menuId) => {
    try {
      const menu = allMenus.find(m => m._id === menuId);
      await weeklyMenuService.updateMenuInfo(menuId, { isFavorite: !menu.isFavorite });
      loadAllMenus();
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
      alert('Error al actualizar favorito');
    }
  };

  const loadUserRecipes = async () => {
    try {
      console.log('🍳 Cargando recetas de usuario...');
      const response = await weeklyMenuService.getUserRecipesForMenu();
      console.log('✅ Recetas cargadas:', response.data);
      
      if (response.data && response.data.success) {
        setUserRecipes(response.data.data || []);
      } else {
        console.warn('⚠️ Respuesta inesperada al cargar recetas:', response.data);
        setUserRecipes([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar recetas:', error);
      console.error('📋 Detalles del error de recetas:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        console.warn('🔒 Token expirado al cargar recetas');
        navigate('/login');
      } else {
        setUserRecipes([]);
      }
    }
  };

  const generateAutomaticWeeklyPlan = async () => {
    if (!weeklyMenu || !weeklyMenu._id) {
      alert('No hay un menú semanal activo. Crea uno primero.');
      return;
    }

    if (userRecipes.length === 0) {
      alert('No tienes recetas guardadas. Ve al Generador de Recetas para crear algunas primero.');
      return;
    }

    const confirmGenerate = window.confirm(
      '¿Quieres generar automáticamente un plan semanal con tus recetas? Esto reemplazará las asignaciones actuales.'
    );

    if (!confirmGenerate) return;

    try {
      setLoading(true);
      const recipeIds = userRecipes.map(recipe => recipe._id);
      
      const response = await weeklyMenuService.autoAssignRecipesToWeek(recipeIds);
      
      if (response.data.success) {
        setWeeklyMenu(response.data.data.weeklyMenu);
        
        // Crear mensaje detallado con las asignaciones
        const assignments = response.data.data.assignments || [];
        let message = `🎯 ¡Plan semanal generado exitosamente!\n\n`;
        message += `✅ Se asignaron ${response.data.data.totalAssigned} recetas automáticamente:\n\n`;
        
        assignments.forEach(assignment => {
          message += `📅 ${assignment.day}: ${assignment.recipe}\n   ⏰ ${assignment.meal}\n\n`;
        });
        
        message += `\n🍽️ Distribución: ${response.data.data.distribution || 'Distribución completada'}`;
        
        alert(message);
      } else {
        alert('Error al generar el plan automático');
      }
    } catch (error) {
      console.error('Error al generar plan automático:', error);
      alert('Error al generar el plan automático: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fillMissingMeals = async () => {
    if (!weeklyMenu || !weeklyMenu._id) {
      alert('No hay un menú semanal activo. Crea uno primero.');
      return;
    }

    if (userRecipes.length === 0) {
      alert('No tienes recetas guardadas. Ve al Generador de Recetas para crear algunas primero.');
      return;
    }

    const confirmFill = window.confirm(
      '¿Quieres completar automáticamente las comidas faltantes en cada día? Se asignarán recetas apropiadas a los slots vacíos.'
    );

    if (!confirmFill) return;

    try {
      setLoading(true);
      
      const response = await weeklyMenuService.fillMissingMeals();
      
      if (response.data.success) {
        setWeeklyMenu(response.data.data.weeklyMenu);
        
        const message = `🎯 ¡Comidas completadas exitosamente!\n\n✅ Se asignaron ${response.data.data.assignedMeals} comidas automáticamente.\n\nAhora todos los días tienen comidas asignadas para las notificaciones.`;
        
        alert(message);
        
        // Recargar el menú para mostrar los cambios
        await loadCurrentWeeklyMenu();
      } else {
        alert('Error al completar las comidas faltantes');
      }
    } catch (error) {
      console.error('Error al completar comidas faltantes:', error);
      alert('Error al completar las comidas: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (dayIndex, mealIndex) => {
    setSelectedSlot({ dayIndex, mealIndex });
    setShowRecipeSelector(true);
  };

  const handleRecipeSelect = async (recipeId) => {
    if (!selectedSlot || !weeklyMenu) return;

    try {
      const response = await weeklyMenuService.assignRecipeToSlot(
        weeklyMenu._id,
        selectedSlot.dayIndex,
        selectedSlot.mealIndex,
        recipeId
      );
      setWeeklyMenu(response.data.data);
      setShowRecipeSelector(false);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Error al asignar receta:', error);
      alert('Error al asignar la receta');
    }
  };

  const handleRemoveRecipe = async (dayIndex, mealIndex) => {
    if (!weeklyMenu) return;

    try {
      const response = await weeklyMenuService.removeRecipeFromSlot(
        weeklyMenu._id,
        dayIndex,
        mealIndex
      );
      setWeeklyMenu(response.data.data);
    } catch (error) {
      console.error('Error al eliminar receta:', error);
      alert('Error al eliminar la receta');
    }
  };

  // Funciones para Drag & Drop
  const handleDragStart = (e, recipeId) => {
    setDraggedRecipe(recipeId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, dayIndex, mealIndex) => {
    e.preventDefault();
    
    if (!draggedRecipe || !weeklyMenu) return;

    try {
      const response = await weeklyMenuService.assignRecipeToSlot(
        weeklyMenu._id,
        dayIndex,
        mealIndex,
        draggedRecipe
      );
      setWeeklyMenu(response.data.data);
    } catch (error) {
      console.error('Error al arrastrar receta:', error);
      alert('Error al asignar la receta');
    } finally {
      setDraggedRecipe(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeekStart(newDate);
  };

  if (loading) {
    return (
      <div className="weekly-menu-loading">
        <div className="loading-spinner"></div>
        <p>Cargando planificador de menús...</p>
      </div>
    );
  }

  return (
    <div className="weekly-menu-planner">
      <div className="menu-header">
        <div className="week-navigation">
          <button onClick={() => navigateWeek(-1)} className="nav-button">
            ← Semana Anterior
          </button>
          <h2 className="week-title">
            {weeklyMenu?.title || 'Planificador de Menús Semanal'}
          </h2>
          <button onClick={() => navigateWeek(1)} className="nav-button">
            Siguiente Semana →
          </button>
        </div>
        
        <div className="menu-actions">
          <button onClick={() => navigate('/dashboard')} className="dashboard-button">
            🏠 Dashboard
          </button>
          <button onClick={() => setShowMenuManager(true)} className="menu-manager-button">
            📚 Gestionar Menús
          </button>
          <button onClick={() => setShowCreateMenu(true)} className="create-menu-button">
            ➕ Crear Menú
          </button>
          <button onClick={generateAutomaticWeeklyPlan} className="auto-generate-button" disabled={loading}>
            🤖 Generar Plan Automático
          </button>
          <button onClick={fillMissingMeals} className="fill-missing-button" disabled={loading}>
            🍽️ Completar Comidas
          </button>
          <button onClick={loadCurrentWeeklyMenu} className="refresh-button">
            🔄 Actualizar
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="time-column">
          <div className="time-header">Horarios</div>
          {mealTypes.map(meal => (
            <div key={meal.key} className="time-slot">
              <span className="meal-label">{meal.label}</span>
              <span className="meal-time">{meal.time}</span>
            </div>
          ))}
        </div>

        {weeklyMenu?.days?.map((day, dayIndex) => (
          <div key={dayIndex} className="day-column">
            <div className="day-header">
              <span className="day-name">{day.dayOfWeek}</span>
              <span className="day-date">{formatDate(day.date)}</span>
            </div>
            
            {day.meals.map((meal, mealIndex) => (
              <div
                key={mealIndex}
                className={`meal-slot ${meal.recipeId ? 'has-recipe' : 'empty'}`}
                onClick={() => handleSlotClick(dayIndex, mealIndex)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, dayIndex, mealIndex)}
              >
                {meal.recipeId ? (
                  <div className="recipe-card">
                    <div className="recipe-name">{meal.recipeName}</div>
                    {meal.notes && (
                      <div className="recipe-notes">{meal.notes}</div>
                    )}
                    <button
                      className="remove-recipe"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveRecipe(dayIndex, mealIndex);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="empty-slot">
                    <span>+ Agregar receta</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Gestor de menús */}
      {showMenuManager && (
        <div className="recipe-selector-modal">
          <div className="modal-content large-modal">
            <div className="modal-header">
              <h3>📚 Gestión de Menús Semanales</h3>
              <button
                className="close-button"
                onClick={() => setShowMenuManager(false)}
              >
                ×
              </button>
            </div>
            
            <div className="menus-list">
              {allMenus.map(menu => (
                <div key={menu._id} className="menu-item">
                  <div className="menu-info">
                    <h4>
                      {menu.isFavorite && '⭐'} {menu.title}
                    </h4>
                    <p className="menu-description">{menu.description}</p>
                    <div className="menu-meta">
                      <span className="menu-date">
                        📅 {new Date(menu.weekStartDate).toLocaleDateString('es-ES')} - 
                        {new Date(menu.weekEndDate).toLocaleDateString('es-ES')}
                      </span>
                      <span className="menu-created">
                        🕒 {new Date(menu.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="menu-actions-list">
                    <button
                      onClick={() => handleLoadMenu(menu._id)}
                      className="load-menu-btn"
                    >
                      📖 Cargar
                    </button>
                    <button
                      onClick={() => handleDuplicateMenu(menu._id)}
                      className="duplicate-menu-btn"
                    >
                      📋 Duplicar
                    </button>
                    <button
                      onClick={() => handleToggleFavorite(menu._id)}
                      className="favorite-menu-btn"
                    >
                      {menu.isFavorite ? '💔' : '💖'}
                    </button>
                    <button
                      onClick={() => handleDeleteMenu(menu._id)}
                      className="delete-menu-btn"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
              
              {allMenus.length === 0 && (
                <div className="no-menus">
                  <p>No tienes menús guardados aún.</p>
                  <p>¡Crea tu primer menú personalizado!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear nuevo menú */}
      {showCreateMenu && (
        <div className="recipe-selector-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>➕ Crear Nuevo Menú Semanal</h3>
              <button
                className="close-button"
                onClick={() => setShowCreateMenu(false)}
              >
                ×
              </button>
            </div>
            
            <div className="create-menu-form">
              <div className="form-group">
                <label>Título del Menú *</label>
                <input
                  type="text"
                  value={newMenuData.title}
                  onChange={(e) => setNewMenuData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Menú Navideño, Menú Verano 2024..."
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={newMenuData.description}
                  onChange={(e) => setNewMenuData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe este menú..."
                  className="form-textarea"
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Fecha de Inicio de Semana</label>
                <input
                  type="date"
                  value={newMenuData.weekStartDate}
                  onChange={(e) => setNewMenuData(prev => ({ ...prev, weekStartDate: e.target.value }))}
                  className="form-input"
                />
              </div>
              
              <div className="form-actions">
                <button
                  onClick={() => setShowCreateMenu(false)}
                  className="cancel-btn"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateMenu}
                  className="create-btn"
                >
                  ✅ Crear Menú
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selector de recetas */}
      {showRecipeSelector && (
        <div className="recipe-selector-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Seleccionar Receta</h3>
              <button
                className="close-button"
                onClick={() => setShowRecipeSelector(false)}
              >
                ×
              </button>
            </div>
            
            <div className="recipes-grid">
              <div
                className="recipe-option empty-option"
                onClick={() => handleRecipeSelect(null)}
              >
                <span>🚫 Quitar receta</span>
              </div>
              
              {userRecipes.map(recipe => (
                <div
                  key={recipe._id}
                  className="recipe-option"
                  onClick={() => handleRecipeSelect(recipe._id)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, recipe._id)}
                >
                  {recipe.image && (
                    <img 
                      src={`http://localhost:5000${recipe.image}`} 
                      alt={recipe.name}
                      className="recipe-image"
                    />
                  )}
                  <div className="recipe-info">
                    <h4>{recipe.name}</h4>
                    <p className="recipe-description">{recipe.description}</p>
                    <div className="recipe-meta">
                      <span className="prep-time">⏱️ {recipe.preparationTime}</span>
                      <span className="difficulty">📊 {recipe.difficulty}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lista de recetas disponibles para arrastrar */}
      <div className="available-recipes">
        <h3>📚 Mis Recetas (arrastra para agregar)</h3>
        <div className="recipes-sidebar">
          {userRecipes.map(recipe => (
            <div
              key={recipe._id}
              className="sidebar-recipe"
              draggable
              onDragStart={(e) => handleDragStart(e, recipe._id)}
            >
              {recipe.image && (
                <img 
                  src={`http://localhost:5000${recipe.image}`} 
                  alt={recipe.name}
                  className="sidebar-recipe-image"
                />
              )}
              <div className="sidebar-recipe-info">
                <span className="sidebar-recipe-name">{recipe.name}</span>
                <span className="sidebar-recipe-time">⏱️ {recipe.preparationTime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyMenuPlanner;