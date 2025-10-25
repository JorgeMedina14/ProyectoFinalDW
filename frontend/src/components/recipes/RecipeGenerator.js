import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipeService, authService, weeklyMenuService } from '../../services/api';
import './RecipeGenerator.css';

const RecipeGenerator = () => {
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [preferences, setPreferences] = useState('');
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [autoOrganized, setAutoOrganized] = useState(false); // Nuevo estado
  const navigate = useNavigate();

  // Cargar ingredientes del usuario al montar el componente
  useEffect(() => {
    loadUserIngredients();
  }, []);

  const loadUserIngredients = async () => {
    try {
      const response = await recipeService.getUserIngredients();
      if (response.data.success) {
        setAvailableIngredients(response.data.data);
      }
    } catch (error) {
      console.error('Error cargando ingredientes:', error);
      setError('Error al cargar tus ingredientes');
    }
  };

  const generateRecipe = async () => {
    if (availableIngredients.length === 0) {
      setError('No tienes ingredientes disponibles. Ve al Dashboard para subir una imagen primero.');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedRecipes([]);
    setSuccessMessage('');
    setAutoOrganized(false); // Reset del estado

    try {
      console.log('Generando recetas con ingredientes:', availableIngredients);
      
      const response = await recipeService.generateRecipeWithAI(
        availableIngredients,
        preferences
      );

      console.log('Respuesta del backend:', response);

      if (response.data && response.data.success) {
        // La estructura correcta es response.data.data.recipes
        let recipes = response.data.data?.recipes || response.data.recipes || response.data.data || [];
        
        // Asegurar que tenemos un array
        if (!Array.isArray(recipes)) {
          recipes = recipes ? [recipes] : [];
        }

        // Filtrar recetas válidas
        const validRecipes = recipes.filter(recipe => recipe && recipe.name);

        if (validRecipes.length > 0) {
          setGeneratedRecipes(validRecipes);
          
          // Verificar si hubo organización automática
          const weeklyMenuAssignment = response.data.data?.weeklyMenuAssignment;
          let message = `¡Se generaron ${validRecipes.length} recetas exitosamente!`;
          
          if (weeklyMenuAssignment && weeklyMenuAssignment.totalAssigned > 0) {
            message += ` 📅 ${weeklyMenuAssignment.totalAssigned} recetas organizadas automáticamente en tu planificador semanal.`;
            setAutoOrganized(true); // Marcar que se organizaron automáticamente
          } else {
            setAutoOrganized(false);
          }
          
          setSuccessMessage(message);
        } else {
          setError('No se pudieron generar recetas válidas. Intenta con diferentes ingredientes.');
        }
      } else {
        setError(response.data?.message || 'Error al generar las recetas');
      }
    } catch (error) {
      console.error('Error generando recetas:', error);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error al generar las recetas con IA';
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = '⏰ La generación está tomando más tiempo del esperado. Esto es normal para recetas complejas. Por favor, inténtalo de nuevo en unos momentos.';
      } else if (error.response?.status === 429) {
        errorMessage = '🚫 Demasiadas solicitudes. Espera un momento antes de generar más recetas.';
      } else if (error.response?.status >= 500) {
        errorMessage = '🔧 Error del servidor. Nuestro chef IA está tomando un descanso. Inténtalo en unos minutos.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const saveRecipeAsFavorite = async (recipeId) => {
    try {
      const response = await recipeService.toggleFavorite(recipeId);
      if (response.data.success) {
        setGeneratedRecipes(prevRecipes => 
          prevRecipes.map(recipe => 
            recipe._id === recipeId 
              ? { ...recipe, is_favorite: !recipe.is_favorite }
              : recipe
          )
        );
        setSuccessMessage('Estado de favorito actualizado');
      }
    } catch (error) {
      console.error('Error guardando receta:', error);
      setError('Error al guardar la receta como favorita');
    }
  };

  const assignSingleRecipe = async (recipeId) => {
    try {
      setLoading(true);
      const response = await weeklyMenuService.autoAssignRecipesToWeek([recipeId]);
      
      if (response.data.success) {
        setSuccessMessage(
          `¡Receta organizada automáticamente en tu planificador semanal! ` +
          `Ve al planificador para ver su ubicación.`
        );
      } else {
        setError('Error al organizar la receta en el planificador');
      }
    } catch (error) {
      console.error('Error en asignación individual:', error);
      setError(error.response?.data?.message || 'Error al organizar la receta automáticamente');
    } finally {
      setLoading(false);
    }
  };

  const autoAssignToWeeklyMenu = async () => {
    if (generatedRecipes.length === 0) {
      setError('No hay recetas generadas para asignar');
      return;
    }

    try {
      setLoading(true);
      const recipeIds = generatedRecipes.map(recipe => recipe._id).filter(id => id);
      
      if (recipeIds.length === 0) {
        setError('Las recetas no tienen IDs válidos para asignar');
        return;
      }

      const response = await weeklyMenuService.autoAssignRecipesToWeek(recipeIds);
      
      if (response.data.success) {
        setSuccessMessage(
          `¡${response.data.data.totalAssigned} recetas organizadas automáticamente en tu planificador semanal! ` +
          `Ve al planificador para ver la distribución.`
        );
      } else {
        setError('Error al organizar las recetas en el planificador');
      }
    } catch (error) {
      console.error('Error en asignación automática:', error);
      setError(error.response?.data?.message || 'Error al organizar las recetas automáticamente');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="recipe-generator">
      {/* Header de navegación */}
      <header className="generator-nav">
        <div className="nav-left">
          <button 
            onClick={() => navigate('/dashboard')}
            className="nav-btn back-btn"
          >
            ← Dashboard
          </button>
        </div>
        <h1 className="nav-title">🍳 Generador de Recetas</h1>
        <div className="nav-right">
          <button 
            onClick={() => navigate('/recipes')}
            className="nav-btn"
          >
            📖 Mis Recetas
          </button>
          <button 
            onClick={handleLogout}
            className="nav-btn logout-btn"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="generator-header">
        <h2>🍳 Generador de Recetas con IA</h2>
        <p>Selecciona tus ingredientes y genera múltiples recetas personalizadas</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      <div className="generator-content">
        {/* Sección de ingredientes */}
        <div className="ingredients-section">
          <h3>Tus Ingredientes Disponibles ({availableIngredients.length})</h3>
          
          {availableIngredients.length === 0 ? (
            <div className="no-ingredients">
              <p>No tienes ingredientes disponibles.</p>
              <p>Ve a la sección de Dashboard para subir una imagen y detectar ingredientes.</p>
            </div>
          ) : (
            <div className="ingredients-display">
              <p className="ingredients-intro">
                Se generarán múltiples recetas usando estos ingredientes detectados:
              </p>
              <div className="ingredients-list-display">
                {availableIngredients.map((ingredient, index) => (
                  <span key={index} className="ingredient-tag">
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sección de preferencias */}
        <div className="preferences-section">
          <h3>Preferencias Adicionales (Opcional)</h3>
          <textarea
            className="preferences-input"
            placeholder="Ejemplo: Sin gluten, vegetariano, picante, comida italiana, tiempo de cocción corto..."
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            rows={3}
          />
        </div>

        {/* Botones de acción */}
        <div className="action-buttons">
          <button 
            className="generate-btn"
            onClick={generateRecipe}
            disabled={loading || availableIngredients.length === 0}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                🧠 Chef IA creando recetas... (puede tardar 1-2 minutos)
              </>
            ) : (
              <>
                <span>🤖</span>
                Generar 10 Recetas con IA
              </>
            )}
          </button>

          {generatedRecipes.length > 0 && (
            <>
              <button 
                className="auto-assign-btn"
                onClick={autoAssignToWeeklyMenu}
                disabled={loading}
              >
                📅 Organizar en Planificador
              </button>
              <button 
                className="clear-btn"
                onClick={() => {
                  setGeneratedRecipes([]);
                  setSuccessMessage('');
                }}
                disabled={loading}
              >
                Nuevas Recetas
              </button>
            </>
          )}
        </div>

        {/* Recetas generadas */}
        {generatedRecipes.length > 0 && (
          <div className="generated-recipes">
            <div className="recipes-header">
              <h3>🍽️ Recetas Generadas ({generatedRecipes.length})</h3>
              <p>Explora estas deliciosas opciones y guarda tus favoritas</p>
            </div>

            <div className="recipes-grid">
              {generatedRecipes.map((recipe, index) => (
                <div key={index} className="recipe-card">
                  <div className="recipe-card-header">
                    <h4>{recipe.name || 'Receta sin nombre'}</h4>
                    <div className="recipe-actions">
                      <button 
                        className={`favorite-btn ${recipe.is_favorite ? 'favorited' : ''}`}
                        onClick={() => saveRecipeAsFavorite(recipe._id)}
                        disabled={!recipe._id}
                      >
                        {recipe.is_favorite ? '💖' : '🤍'}
                      </button>
                    </div>
                  </div>

                  <div className="recipe-meta">
                    <span className="meta-item">⏱️ {recipe.prep_time || 'N/A'}</span>
                    <span className="meta-item">👥 {recipe.servings || 'N/A'} porciones</span>
                    <span className="meta-item">📊 {recipe.difficulty || 'N/A'}</span>
                  </div>

                  {recipe.description && (
                    <div className="recipe-description">
                      <p>{recipe.description}</p>
                    </div>
                  )}

                  {recipe.cuisine_type && (
                    <div className="recipe-cuisine">
                      <span className="cuisine-tag">🍽️ {recipe.cuisine_type}</span>
                    </div>
                  )}

                  <div className="recipe-ingredients">
                    <h5>🛒 Ingredientes:</h5>
                    <ul>
                      {recipe.ingredients_needed && recipe.ingredients_needed.length > 0 ? (
                        <>
                          {recipe.ingredients_needed.slice(0, 5).map((ingredient, idx) => (
                            <li key={idx}>{ingredient}</li>
                          ))}
                          {recipe.ingredients_needed.length > 5 && (
                            <li className="more-items">... y {recipe.ingredients_needed.length - 5} más</li>
                          )}
                        </>
                      ) : (
                        <li>No hay ingredientes disponibles</li>
                      )}
                    </ul>
                  </div>

                  <div className="recipe-instructions">
                    <h5>👨‍🍳 Instrucciones:</h5>
                    <ol>
                      {recipe.instructions && recipe.instructions.length > 0 ? (
                        <>
                          {recipe.instructions.slice(0, 3).map((instruction, idx) => (
                            <li key={idx}>{instruction}</li>
                          ))}
                          {recipe.instructions.length > 3 && (
                            <li className="more-items">... {recipe.instructions.length - 3} pasos más</li>
                          )}
                        </>
                      ) : (
                        <li>No hay instrucciones disponibles</li>
                      )}
                    </ol>
                  </div>

                  <div className="recipe-card-footer">
                    <div className="recipe-actions-row">
                      <button 
                        className="view-full-btn"
                        onClick={() => {
                          // Aquí podrías abrir un modal o navegar a una vista detallada
                          console.log('Ver receta completa:', recipe);
                        }}
                      >
                        Ver Completa
                      </button>
                      <button 
                        className="assign-single-btn"
                        onClick={() => assignSingleRecipe(recipe._id)}
                        disabled={loading || !recipe._id}
                      >
                        📅 Organizar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="recipes-footer">
              <p className="generated-from">
                <span>🌟 Generado usando tus ingredientes:</span> {availableIngredients.join(', ')}
              </p>
              
              {/* Botón para ir al planificador semanal - solo si se organizaron automáticamente */}
              {autoOrganized && (
                <div className="weekly-planner-navigation">
                  <button 
                    className="go-to-planner-btn"
                    onClick={() => navigate('/weekly-menu')}
                  >
                    📅 Ver Mi Planificador Semanal
                  </button>
                  <p className="planner-info">
                    Tus recetas se organizaron automáticamente. ¡Ve a tu planificador para revisarlas!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeGenerator;
