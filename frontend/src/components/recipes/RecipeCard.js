import React, { useState } from 'react';
import NutritionalInfo from '../nutrition/NutritionalInfo';
import NutritionalInfoEditor from '../nutrition/NutritionalInfoEditor';
import { recipeService } from '../../services/api';
import './RecipeCard.css';

const RecipeCard = ({ recipe, onSave, onToggleFavorite, showSaveButton = true, onRecipeUpdate }) => {
  const [isEditingNutrition, setIsEditingNutrition] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState(recipe);
  const [savingNutrition, setSavingNutrition] = useState(false);
  const handleSave = () => {
    if (onSave) {
      onSave(currentRecipe);
    }
  };

  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(currentRecipe._id);
    }
  };

  const handleNutritionUpdate = async (nutritionalInfo) => {
    if (!currentRecipe._id) {
      // Si la receta no tiene ID (recién generada), solo actualizar localmente
      const updatedRecipe = {
        ...currentRecipe,
        nutritional_info: nutritionalInfo
      };
      setCurrentRecipe(updatedRecipe);
      if (onRecipeUpdate) {
        onRecipeUpdate(updatedRecipe);
      }
      return;
    }

    try {
      setSavingNutrition(true);
      console.log('🔄 Actualizando información nutricional de la receta...');
      
      const response = await recipeService.updateNutritionalInfo(currentRecipe._id, nutritionalInfo);
      
      if (response.data.success) {
        const updatedRecipe = {
          ...currentRecipe,
          nutritional_info: nutritionalInfo
        };
        setCurrentRecipe(updatedRecipe);
        
        if (onRecipeUpdate) {
          onRecipeUpdate(updatedRecipe);
        }
        
        console.log('✅ Información nutricional actualizada exitosamente');
        // No cerrar el editor automáticamente para permitir más cambios
      } else {
        throw new Error('Error actualizando información nutricional');
      }
    } catch (error) {
      console.error('Error actualizando información nutricional:', error);
      alert('Error actualizando información nutricional. Por favor, intenta de nuevo.');
    } finally {
      setSavingNutrition(false);
    }
  };

  const handleSaveNutrition = (nutritionalInfo) => {
    handleNutritionUpdate(nutritionalInfo);
    setIsEditingNutrition(false);
  };

  return (
    <div className="recipe-card">
      <h3>{currentRecipe.name}</h3>
      
      <div className="recipe-info">
        <span className="prep-time">⏱️ {currentRecipe.prep_time}</span>
        <span className="servings">👥 {currentRecipe.servings} porciones</span>
        <span className="difficulty">🔥 {currentRecipe.difficulty}</span>
      </div>

      <div className="recipe-ingredients">
        <h4>Ingredientes que tienes:</h4>
        <ul>
          {currentRecipe.ingredients_needed && currentRecipe.ingredients_needed.map((ing, idx) => (
            <li key={idx} className="ingredient-have">{ing}</li>
          ))}
        </ul>
        
        {currentRecipe.ingredients_to_buy && currentRecipe.ingredients_to_buy.length > 0 && (
          <>
            <h4>Necesitas comprar:</h4>
            <ul>
              {currentRecipe.ingredients_to_buy.map((ing, idx) => (
                <li key={idx} className="ingredient-buy">{ing}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="recipe-instructions">
        <h4>Instrucciones:</h4>
        <ol>
          {currentRecipe.instructions && currentRecipe.instructions.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </div>

      {/* Información Nutricional */}
      {isEditingNutrition ? (
        <div className="nutrition-editor-container">
          <NutritionalInfoEditor 
            nutritionalInfo={currentRecipe.nutritional_info} 
            onChange={handleSaveNutrition}
            recipeId={recipe._id}
            recipe={currentRecipe}
          />
          <div className="nutrition-editor-actions">
            <button 
              className="btn-cancel-nutrition"
              onClick={() => setIsEditingNutrition(false)}
              disabled={savingNutrition}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <NutritionalInfo 
            nutritionalInfo={currentRecipe.nutritional_info} 
            servings={currentRecipe.servings} 
          />
          <div className="nutrition-actions">
            <button 
              className="btn-edit-nutrition"
              onClick={() => setIsEditingNutrition(true)}
            >
              📊 Editar Información Nutricional
            </button>
          </div>
        </>
      )}

      <div className="recipe-actions">
        {showSaveButton && (
          <button 
            className="btn-save-recipe"
            onClick={handleSave}
          >
            💖 Guardar como Favorita
          </button>
        )}
        
        {currentRecipe._id && (
          <button 
            className={`btn-favorite ${currentRecipe.is_favorite ? 'favorited' : ''}`}
            onClick={handleToggleFavorite}
          >
            {currentRecipe.is_favorite ? '💖 Favorita' : '🤍 Marcar Favorita'}
          </button>
        )}
      </div>

      {currentRecipe.created_at && (
        <div className="recipe-meta">
          <small>Creada: {new Date(currentRecipe.created_at).toLocaleDateString()}</small>
        </div>
      )}
    </div>
  );
};

export default RecipeCard;