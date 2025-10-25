import React, { useState } from 'react';
import './NutritionalInfo.css';

const NutritionalInfo = ({ nutritionalInfo = {}, servings = 4 }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Valores por defecto si no hay información nutricional
  const defaultNutrition = {
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

  const nutrition = { ...defaultNutrition, ...nutritionalInfo };

  // Calcular valor por porción
  const getPerServing = (value) => {
    return servings > 0 ? (value / servings).toFixed(1) : 0;
  };

  // Obtener color basado en el valor nutricional
  const getNutrientColor = (value, type) => {
    if (type === 'protein' && value >= 20) return '#10b981'; // Verde para buena proteína
    if (type === 'carbs' && value >= 30) return '#f59e0b'; // Amarillo para carbohidratos
    if (type === 'fat' && value >= 10) return '#ef4444'; // Rojo para grasas
    if (type === 'fiber' && value >= 5) return '#8b5cf6'; // Púrpura para fibra
    return '#6b7280'; // Gris por defecto
  };

  // Formatear nombres de vitaminas y minerales
  const formatNutrientName = (key) => {
    const names = {
      vitamin_a: 'Vitamina A',
      vitamin_c: 'Vitamina C',
      vitamin_d: 'Vitamina D',
      vitamin_e: 'Vitamina E',
      vitamin_k: 'Vitamina K',
      vitamin_b1: 'Vitamina B1 (Tiamina)',
      vitamin_b2: 'Vitamina B2 (Riboflavina)',
      vitamin_b3: 'Vitamina B3 (Niacina)',
      vitamin_b6: 'Vitamina B6',
      vitamin_b12: 'Vitamina B12',
      folate: 'Folato',
      calcium: 'Calcio',
      iron: 'Hierro',
      magnesium: 'Magnesio',
      phosphorus: 'Fósforo',
      potassium: 'Potasio',
      sodium: 'Sodio',
      zinc: 'Zinc',
      copper: 'Cobre',
      manganese: 'Manganeso',
      selenium: 'Selenio'
    };
    return names[key] || key;
  };

  // Obtener unidades apropiadas
  const getUnit = (key) => {
    const vitaminsMicrograms = ['vitamin_a', 'vitamin_d', 'vitamin_k', 'vitamin_b12', 'folate', 'selenium'];
    if (vitaminsMicrograms.includes(key)) return 'μg';
    return 'mg';
  };

  return (
    <div className="nutritional-info">
      <div className="nutrition-header">
        <h3>📊 Información Nutricional</h3>
        <div className="serving-info">
          <span>Por porción ({servings} porciones totales)</span>
        </div>
      </div>

      {/* Navegación por pestañas */}
      <div className="nutrition-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          🍽️ General
        </button>
        <button 
          className={`tab-btn ${activeTab === 'vitamins' ? 'active' : ''}`}
          onClick={() => setActiveTab('vitamins')}
        >
          🍊 Vitaminas
        </button>
        <button 
          className={`tab-btn ${activeTab === 'minerals' ? 'active' : ''}`}
          onClick={() => setActiveTab('minerals')}
        >
          ⚡ Minerales
        </button>
      </div>

      {/* Contenido de pestañas */}
      <div className="nutrition-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Calorías destacadas */}
            <div className="calories-card">
              <div className="calories-value">
                {getPerServing(nutrition.calories)}
              </div>
              <div className="calories-label">Calorías por porción</div>
            </div>

            {/* Macronutrientes */}
            <div className="macronutrients">
              <h4>Macronutrientes por porción</h4>
              <div className="macro-grid">
                <div className="macro-item">
                  <div className="macro-icon">🥩</div>
                  <div className="macro-info">
                    <span className="macro-name">Proteínas</span>
                    <span 
                      className="macro-value"
                      style={{ color: getNutrientColor(getPerServing(nutrition.proteins), 'protein') }}
                    >
                      {getPerServing(nutrition.proteins)}g
                    </span>
                  </div>
                  <div className="macro-bar">
                    <div 
                      className="macro-fill"
                      style={{ 
                        width: `${Math.min((getPerServing(nutrition.proteins) / 50) * 100, 100)}%`,
                        backgroundColor: getNutrientColor(getPerServing(nutrition.proteins), 'protein')
                      }}
                    ></div>
                  </div>
                </div>

                <div className="macro-item">
                  <div className="macro-icon">🍞</div>
                  <div className="macro-info">
                    <span className="macro-name">Carbohidratos</span>
                    <span 
                      className="macro-value"
                      style={{ color: getNutrientColor(getPerServing(nutrition.carbohydrates), 'carbs') }}
                    >
                      {getPerServing(nutrition.carbohydrates)}g
                    </span>
                  </div>
                  <div className="macro-bar">
                    <div 
                      className="macro-fill"
                      style={{ 
                        width: `${Math.min((getPerServing(nutrition.carbohydrates) / 60) * 100, 100)}%`,
                        backgroundColor: getNutrientColor(getPerServing(nutrition.carbohydrates), 'carbs')
                      }}
                    ></div>
                  </div>
                </div>

                <div className="macro-item">
                  <div className="macro-icon">🥑</div>
                  <div className="macro-info">
                    <span className="macro-name">Grasas</span>
                    <span 
                      className="macro-value"
                      style={{ color: getNutrientColor(getPerServing(nutrition.fats), 'fat') }}
                    >
                      {getPerServing(nutrition.fats)}g
                    </span>
                  </div>
                  <div className="macro-bar">
                    <div 
                      className="macro-fill"
                      style={{ 
                        width: `${Math.min((getPerServing(nutrition.fats) / 30) * 100, 100)}%`,
                        backgroundColor: getNutrientColor(getPerServing(nutrition.fats), 'fat')
                      }}
                    ></div>
                  </div>
                </div>

                <div className="macro-item">
                  <div className="macro-icon">🌾</div>
                  <div className="macro-info">
                    <span className="macro-name">Fibra</span>
                    <span 
                      className="macro-value"
                      style={{ color: getNutrientColor(getPerServing(nutrition.fiber), 'fiber') }}
                    >
                      {getPerServing(nutrition.fiber)}g
                    </span>
                  </div>
                  <div className="macro-bar">
                    <div 
                      className="macro-fill"
                      style={{ 
                        width: `${Math.min((getPerServing(nutrition.fiber) / 15) * 100, 100)}%`,
                        backgroundColor: getNutrientColor(getPerServing(nutrition.fiber), 'fiber')
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Azúcares */}
            <div className="sugars-info">
              <div className="sugar-item">
                <span className="sugar-icon">🍯</span>
                <span className="sugar-label">Azúcares:</span>
                <span className="sugar-value">{getPerServing(nutrition.sugars)}g</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vitamins' && (
          <div className="vitamins-tab">
            <h4>🍊 Vitaminas por porción</h4>
            <div className="nutrients-grid">
              {Object.entries(nutrition.vitamins).map(([key, value]) => (
                <div key={key} className="nutrient-item">
                  <span className="nutrient-name">{formatNutrientName(key)}</span>
                  <span className="nutrient-value">
                    {getPerServing(value)} {getUnit(key)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'minerals' && (
          <div className="minerals-tab">
            <h4>⚡ Minerales por porción</h4>
            <div className="nutrients-grid">
              {Object.entries(nutrition.minerals).map(([key, value]) => (
                <div key={key} className="nutrient-item">
                  <span className="nutrient-name">{formatNutrientName(key)}</span>
                  <span className="nutrient-value">
                    {getPerServing(value)} {getUnit(key)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Nota informativa */}
      <div className="nutrition-note">
        <div className="note-icon">ℹ️</div>
        <div className="note-text">
          <strong>Nota:</strong> Los valores nutricionales son aproximados y pueden variar según los ingredientes específicos utilizados.
        </div>
      </div>
    </div>
  );
};

export default NutritionalInfo;