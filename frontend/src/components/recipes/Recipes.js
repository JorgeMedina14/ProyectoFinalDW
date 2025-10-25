import React, { useState, useEffect } from 'react';
import { authService, recipeService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import RecipeCard from './RecipeCard';
import './Recipes.css';

const Recipes = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'favorites'
  const navigate = useNavigate();

  useEffect(() => {
    const initializeRecipes = async () => {
      try {
        // Verificar autenticación
        const token = localStorage.getItem('token');
        if (!token || token === 'undefined' || token === 'null') {
          navigate('/login');
          return;
        }

        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
          navigate('/login');
          return;
        }

        setUser(currentUser);
        await loadRecipes();
        await loadFavoriteRecipes();
        setLoading(false);
      } catch (error) {
        console.error('Error al inicializar recetas:', error);
        navigate('/login');
      }
    };

    initializeRecipes();
  }, [navigate]);

  const loadRecipes = async () => {
    try {
      const response = await recipeService.getRecipes();
      setRecipes(response.data.data);
    } catch (error) {
      console.error('Error al cargar recetas:', error);
    }
  };

  const loadFavoriteRecipes = async () => {
    try {
      const response = await recipeService.getFavoriteRecipes();
      setFavoriteRecipes(response.data.data);
    } catch (error) {
      console.error('Error al cargar recetas favoritas:', error);
    }
  };

  const handleToggleFavorite = async (recipeId) => {
    try {
      await recipeService.toggleFavorite(recipeId);
      await loadRecipes();
      await loadFavoriteRecipes();
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
      alert('Error al actualizar la receta favorita');
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta receta?')) {
      try {
        await recipeService.deleteRecipe(recipeId);
        await loadRecipes();
        await loadFavoriteRecipes();
        alert('Receta eliminada exitosamente');
      } catch (error) {
        console.error('Error al eliminar receta:', error);
        alert('Error al eliminar la receta');
      }
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return <div className="loading">Cargando recetas...</div>;
  }

  const currentRecipes = activeTab === 'all' ? recipes : favoriteRecipes;

  return (
    <div className="recipes-page">
      <header className="recipes-header">
        <div className="header-content">
          <h1>📖 Mis Recetas</h1>
          <div className="header-actions">
            <button onClick={goToDashboard} className="btn-dashboard">
              🏠 Dashboard
            </button>
            <span className="user-welcome">¡Hola, {user?.name}!</span>
            <button onClick={handleLogout} className="btn-logout">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="recipes-main">
        <div className="recipes-tabs">
          <button 
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            📝 Todas las Recetas ({recipes.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            💖 Favoritas ({favoriteRecipes.length})
          </button>
        </div>

        <div className="recipes-content">
          {currentRecipes.length === 0 ? (
            <div className="no-recipes">
              <p>
                {activeTab === 'all' 
                  ? 'No tienes recetas guardadas aún. ¡Ve al dashboard y genera algunas recetas!'
                  : 'No tienes recetas favoritas aún. ¡Marca algunas como favoritas!'
                }
              </p>
              {activeTab === 'all' && (
                <button onClick={goToDashboard} className="btn-go-dashboard">
                  🧑‍🍳 Ir al Dashboard
                </button>
              )}
            </div>
          ) : (
            <div className="recipes-grid">
              {currentRecipes.map((recipe) => (
                <div key={recipe._id} className="recipe-container">
                  <RecipeCard
                    recipe={recipe}
                    onToggleFavorite={handleToggleFavorite}
                    showSaveButton={false}
                  />
                  <div className="recipe-management">
                    <button 
                      onClick={() => handleDeleteRecipe(recipe._id)}
                      className="btn-delete-recipe"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Recipes;