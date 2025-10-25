import React, { useState } from 'react';
import { recipeService } from '../../services/api';
import { formatNutrientValue, getNutrientName, getDefaultNutrition } from '../../utils/helpers';
import { MESSAGES } from '../../config/constants';
import './NutritionalInfoEditor.css';

const NutritionalInfoEditor = ({ nutritionalInfo = {}, onChange, recipeId, recipe }) => {
  const [activeSection, setActiveSection] = useState('macros');
  const [isRecalculating, setIsRecalculating] = useState(false);
  
  // Valores por defecto usando la utilidad
  const [nutrition, setNutrition] = useState({ 
    ...getDefaultNutrition(), 
    ...nutritionalInfo 
  });

  const handleChange = (section, field, value) => {
    const numValue = parseFloat(value) || 0;
    let updatedNutrition;
    
    if (section === 'main') {
      updatedNutrition = {
        ...nutrition,
        [field]: numValue
      };
    } else {
      updatedNutrition = {
        ...nutrition,
        [section]: {
          ...nutrition[section],
          [field]: numValue
        }
      };
    }
    
    setNutrition(updatedNutrition);
    if (onChange) {
      onChange(updatedNutrition);
    }
  };

  // Usar la utilidad para formatear nombres de nutrientes
  const formatNutrientName = (key, section = null) => {
    return getNutrientName(key, section);
  };

  const autoCalculateNutrition = () => {
    // Esta función podría hacer estimaciones basadas en ingredientes comunes
    // Por ahora, asignaremos valores de ejemplo razonables
    const estimatedNutrition = {
      calories: 250,
      proteins: 15,
      carbohydrates: 30,
      fats: 8,
      fiber: 5,
      sugars: 12,
      vitamins: {
        vitamin_a: 200,
        vitamin_c: 25,
        vitamin_d: 2,
        vitamin_e: 3,
        vitamin_k: 50,
        vitamin_b1: 0.5,
        vitamin_b2: 0.6,
        vitamin_b3: 8,
        vitamin_b6: 0.8,
        vitamin_b12: 1.5,
        folate: 80
      },
      minerals: {
        calcium: 150,
        iron: 3,
        magnesium: 50,
        phosphorus: 200,
        potassium: 400,
        sodium: 300,
        zinc: 2,
        copper: 0.3,
        manganese: 1,
        selenium: 20
      }
    };
    
    setNutrition(estimatedNutrition);
    if (onChange) {
      onChange(estimatedNutrition);
    }
  };

  // Función para recalcular automáticamente basado en ingredientes
  const handleAutoRecalculate = async () => {
    if (!recipeId) {
      alert('❌ No se puede recalcular: ID de receta no disponible');
      return;
    }

    setIsRecalculating(true);
    try {
      console.log('🧮 Recalculando nutrición automáticamente para receta:', recipeId);
      
      const response = await recipeService.recalculateNutrition(recipeId);
      
      if (response.data.success && response.data.nutrition) {
        const newNutrition = response.data.nutrition;
        setNutrition(newNutrition);
        
        if (onChange) {
          onChange(newNutrition);
        }
        
        alert(`${MESSAGES.SUCCESS.NUTRITION_RECALCULATED}\n\n🔥 Calorías: ${newNutrition.calories}\n💪 Proteínas: ${newNutrition.proteins}g\n🍞 Carbohidratos: ${newNutrition.carbohydrates}g\n🥑 Grasas: ${newNutrition.fats}g`);
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('Error recalculando nutrición:', error);
      alert(`${MESSAGES.ERROR.NUTRITION_CALC_FAILED} Por favor, intenta de nuevo.`);
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <div className="nutritional-editor">
      <div className="editor-header">
        <h3>📊 Información Nutricional</h3>
        <div className="header-buttons">
          <button 
            className="auto-calculate-btn"
            onClick={autoCalculateNutrition}
            type="button"
          >
            🔮 Auto-calcular Valores Típicos
          </button>
          {recipeId && (
            <button 
              className={`auto-recalculate-btn ${isRecalculating ? 'loading' : ''}`}
              onClick={handleAutoRecalculate}
              disabled={isRecalculating}
              type="button"
            >
              {isRecalculating ? '🧮 Calculando...' : '🧮 Calcular Automático'}
            </button>
          )}
        </div>
      </div>

      <div className="editor-tabs">
        <button
          className={`editor-tab ${activeSection === 'macros' ? 'active' : ''}`}
          onClick={() => setActiveSection('macros')}
          type="button"
        >
          🍽️ Macros
        </button>
        <button
          className={`editor-tab ${activeSection === 'vitamins' ? 'active' : ''}`}
          onClick={() => setActiveSection('vitamins')}
          type="button"
        >
          🍊 Vitaminas
        </button>
        <button
          className={`editor-tab ${activeSection === 'minerals' ? 'active' : ''}`}
          onClick={() => setActiveSection('minerals')}
          type="button"
        >
          ⚡ Minerales
        </button>
      </div>

      <div className="editor-content">
        {activeSection === 'macros' && (
          <div className="macros-section">
            <div className="input-grid">
              <div className="input-group">
                <label>🔥 Calorías</label>
                <input
                  type="number"
                  value={nutrition.calories}
                  onChange={(e) => handleChange('main', 'calories', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="1"
                />
              </div>
              
              <div className="input-group">
                <label>🥩 Proteínas (g)</label>
                <input
                  type="number"
                  value={nutrition.proteins}
                  onChange={(e) => handleChange('main', 'proteins', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div className="input-group">
                <label>🍞 Carbohidratos (g)</label>
                <input
                  type="number"
                  value={nutrition.carbohydrates}
                  onChange={(e) => handleChange('main', 'carbohydrates', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div className="input-group">
                <label>🥑 Grasas (g)</label>
                <input
                  type="number"
                  value={nutrition.fats}
                  onChange={(e) => handleChange('main', 'fats', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div className="input-group">
                <label>🌾 Fibra (g)</label>
                <input
                  type="number"
                  value={nutrition.fiber}
                  onChange={(e) => handleChange('main', 'fiber', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div className="input-group">
                <label>🍯 Azúcares (g)</label>
                <input
                  type="number"
                  value={nutrition.sugars}
                  onChange={(e) => handleChange('main', 'sugars', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'vitamins' && (
          <div className="vitamins-section">
            <div className="input-grid">
              {Object.entries(nutrition.vitamins).map(([key, value]) => (
                <div key={key} className="input-group">
                  <label>{formatNutrientName(key)}</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleChange('vitamins', key, e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'minerals' && (
          <div className="minerals-section">
            <div className="input-grid">
              {Object.entries(nutrition.minerals).map(([key, value]) => (
                <div key={key} className="input-group">
                  <label>{formatNutrientName(key)}</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleChange('minerals', key, e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="editor-note">
        <div className="note-icon">💡</div>
        <div className="note-text">
          <strong>Tip:</strong> Puedes usar herramientas como FoodData Central de USDA o tablas nutricionales para obtener valores precisos de tus ingredientes.
        </div>
      </div>
    </div>
  );
};

export default NutritionalInfoEditor;