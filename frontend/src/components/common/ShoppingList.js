import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { shoppingListService, weeklyMenuService } from '../../services/api';
import './ShoppingList.css';

const ShoppingList = () => {
  const navigate = useNavigate();
  const { listId } = useParams();
  
  const [shoppingLists, setShoppingLists] = useState([]);
  const [currentList, setCurrentList] = useState(null);
  const [weeklyMenus, setWeeklyMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [selectedMenuForGeneration, setSelectedMenuForGeneration] = useState('');
  const [newListTitle, setNewListTitle] = useState('');
  const [newItem, setNewItem] = useState({
    ingredient: '',
    quantity: '',
    category: 'otros',
    estimatedPrice: 0,
    notes: ''
  });
  const [filter, setFilter] = useState('all'); // all, pending, purchased
  const [sortBy, setSortBy] = useState('category'); // category, name, price
  
  // Estados para análisis nutricional
  const [nutritionalAnalysis, setNutritionalAnalysis] = useState(null);
  const [showNutritionalModal, setShowNutritionalModal] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);

  // Categorías para el dropdown
  const categories = [
    { value: 'carnes', label: '🥩 Carnes', color: '#e74c3c' },
    { value: 'verduras', label: '🥬 Verduras', color: '#27ae60' },
    { value: 'frutas', label: '🍎 Frutas', color: '#f39c12' },
    { value: 'lacteos', label: '🥛 Lácteos', color: '#3498db' },
    { value: 'granos', label: '🌾 Granos', color: '#d35400' },
    { value: 'condimentos', label: '🧂 Condimentos', color: '#9b59b6' },
    { value: 'otros', label: '📦 Otros', color: '#95a5a6' }
  ];

  useEffect(() => {
    loadShoppingLists();
    loadWeeklyMenus();
    if (listId) {
      loadShoppingList(listId);
    }
  }, [listId]);

  const loadShoppingLists = async () => {
    try {
      const response = await shoppingListService.getUserShoppingLists();
      setShoppingLists(response.data.data);
    } catch (error) {
      console.error('Error al cargar listas:', error);
    }
  };

  const loadWeeklyMenus = async () => {
    try {
      const response = await weeklyMenuService.getAllUserMenus();
      setWeeklyMenus(response.data.data);
    } catch (error) {
      console.error('Error al cargar menús:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadShoppingList = async (id) => {
    try {
      setLoading(true);
      const response = await shoppingListService.getShoppingListById(id);
      setCurrentList(response.data.data);
    } catch (error) {
      console.error('Error al cargar lista:', error);
      alert('Error al cargar la lista de compras');
    } finally {
      setLoading(false);
    }
  };

  const generateFromMenu = async () => {
    if (!selectedMenuForGeneration) {
      alert('Por favor selecciona un menú semanal');
      return;
    }

    try {
      setActionLoading(true);
      const response = await shoppingListService.generateFromWeeklyMenu(selectedMenuForGeneration);
      setCurrentList(response.data.data);
      setShowCreateModal(false);
      setSelectedMenuForGeneration('');
      await loadShoppingLists();
      
      alert(`Lista generada con ${response.data.data.items.length} ingredientes`);
    } catch (error) {
      console.error('Error al generar lista:', error);
      alert(error.response?.data?.message || 'Error al generar la lista');
    } finally {
      setActionLoading(false);
    }
  };

  const analyzeMenuNutrition = async () => {
    if (!selectedMenuForGeneration) {
      alert('Por favor selecciona un menú semanal para analizar');
      return;
    }

    try {
      setAnalysisLoading(true);
      const response = await shoppingListService.analyzeMenuNutrition(selectedMenuForGeneration);
      setNutritionalAnalysis(response.data.data);
      setShowNutritionalModal(true);
      setSelectedSuggestions([]); // Reset selections
    } catch (error) {
      console.error('Error al analizar nutrición:', error);
      alert(error.response?.data?.message || 'Error al analizar el menú');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const toggleSuggestionSelection = (suggestion) => {
    setSelectedSuggestions(prev => {
      const isSelected = prev.find(s => s.ingredient === suggestion.ingredient);
      if (isSelected) {
        return prev.filter(s => s.ingredient !== suggestion.ingredient);
      } else {
        return [...prev, suggestion];
      }
    });
  };

  const addSuggestionsToList = async () => {
    if (selectedSuggestions.length === 0) {
      alert('Por favor selecciona al menos una sugerencia');
      return;
    }

    try {
      setActionLoading(true);
      
      // Generar la lista primero
      const listResponse = await shoppingListService.generateFromWeeklyMenu(selectedMenuForGeneration);
      const listId = listResponse.data.data._id;

      // Agregar las sugerencias seleccionadas
      for (const suggestion of selectedSuggestions) {
        await shoppingListService.addItemToList(listId, {
          ingredient: suggestion.ingredient,
          quantity: 1,
          unit: 'unidad',
          category: suggestion.category,
          estimatedPrice: 0,
          notes: `💡 Sugerencia nutricional: ${suggestion.reason}`
        });
      }

      // Cargar la lista actualizada
      const updatedResponse = await shoppingListService.getShoppingListById(listId);
      setCurrentList(updatedResponse.data.data);
      
      setShowNutritionalModal(false);
      setShowCreateModal(false);
      setSelectedMenuForGeneration('');
      await loadShoppingLists();
      
      alert(`Lista generada con sugerencias nutricionales! Se agregaron ${selectedSuggestions.length} ingredientes sugeridos.`);
    } catch (error) {
      console.error('Error al agregar sugerencias:', error);
      alert(error.response?.data?.message || 'Error al agregar las sugerencias');
    } finally {
      setActionLoading(false);
    }
  };

  const createManualList = async () => {
    if (!newListTitle.trim()) {
      alert('Por favor ingresa un título para la lista');
      return;
    }

    try {
      setActionLoading(true);
      const response = await shoppingListService.createManualShoppingList(newListTitle);
      setCurrentList(response.data.data);
      setShowCreateModal(false);
      setNewListTitle('');
      await loadShoppingLists();
    } catch (error) {
      console.error('Error al crear lista:', error);
      alert('Error al crear la lista manual');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleItemPurchased = async (itemId, isPurchased) => {
    try {
      const response = await shoppingListService.updateShoppingItem(
        currentList._id, 
        itemId, 
        { isPurchased: !isPurchased }
      );
      setCurrentList(response.data.data);
    } catch (error) {
      console.error('Error al actualizar item:', error);
      alert('Error al actualizar el item');
    }
  };

  const updateItemQuantity = async (itemId, quantity) => {
    try {
      const response = await shoppingListService.updateShoppingItem(
        currentList._id, 
        itemId, 
        { quantity }
      );
      setCurrentList(response.data.data);
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
    }
  };

  const updateItemPrice = async (itemId, estimatedPrice) => {
    try {
      const response = await shoppingListService.updateShoppingItem(
        currentList._id, 
        itemId, 
        { estimatedPrice: parseFloat(estimatedPrice) || 0 }
      );
      setCurrentList(response.data.data);
    } catch (error) {
      console.error('Error al actualizar precio:', error);
    }
  };

  const addNewItem = async () => {
    if (!newItem.ingredient.trim()) {
      alert('Por favor ingresa un ingrediente');
      return;
    }

    try {
      const response = await shoppingListService.addItemToList(currentList._id, newItem);
      setCurrentList(response.data.data);
      setNewItem({
        ingredient: '',
        quantity: '',
        category: 'otros',
        estimatedPrice: 0,
        notes: ''
      });
      setShowAddItemModal(false);
    } catch (error) {
      console.error('Error al agregar item:', error);
      alert('Error al agregar el item');
    }
  };

  const removeItem = async (itemId) => {
    if (!window.confirm('¿Estás seguro de eliminar este item?')) return;

    try {
      const response = await shoppingListService.removeItemFromList(currentList._id, itemId);
      setCurrentList(response.data.data);
    } catch (error) {
      console.error('Error al eliminar item:', error);
      alert('Error al eliminar el item');
    }
  };

  const markListCompleted = async () => {
    if (!window.confirm('¿Marcar toda la lista como completada?')) return;

    try {
      const response = await shoppingListService.markListAsCompleted(currentList._id);
      setCurrentList(response.data.data);
      await loadShoppingLists();
    } catch (error) {
      console.error('Error al completar lista:', error);
      alert('Error al completar la lista');
    }
  };

  const deleteList = async (listIdToDelete) => {
    if (!window.confirm('¿Estás seguro de eliminar esta lista?')) return;

    try {
      await shoppingListService.deleteShoppingList(listIdToDelete);
      await loadShoppingLists();
      if (currentList && currentList._id === listIdToDelete) {
        setCurrentList(null);
      }
    } catch (error) {
      console.error('Error al eliminar lista:', error);
      alert('Error al eliminar la lista');
    }
  };

  // Filtrar y ordenar items
  const getFilteredAndSortedItems = () => {
    if (!currentList || !currentList.items) return [];

    let filtered = currentList.items.filter(item => {
      if (filter === 'pending') return !item.isPurchased;
      if (filter === 'purchased') return item.isPurchased;
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'category') {
        return a.category.localeCompare(b.category);
      }
      if (sortBy === 'name') {
        return a.ingredient.localeCompare(b.ingredient);
      }
      if (sortBy === 'price') {
        return (b.estimatedPrice || 0) - (a.estimatedPrice || 0);
      }
      return 0;
    });
  };

  const getCategoryInfo = (categoryValue) => {
    return categories.find(cat => cat.value === categoryValue) || categories[categories.length - 1];
  };

  const calculateStats = () => {
    if (!currentList || !currentList.items) return { total: 0, purchased: 0, pending: 0, totalCost: 0 };

    const total = currentList.items.length;
    const purchased = currentList.items.filter(item => item.isPurchased).length;
    const pending = total - purchased;
    const totalCost = currentList.items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);

    return { total, purchased, pending, totalCost };
  };

  if (loading) {
    return (
      <div className="shopping-list-loading">
        <div className="loading-spinner"></div>
        <p>Cargando listas de compras...</p>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="shopping-list-container">
      {/* Header */}
      <div className="shopping-header">
        <div className="header-content">
          <button onClick={() => navigate('/dashboard')} className="back-button">
            ← Dashboard
          </button>
          <h1>🛒 Lista de Compras</h1>
          <button onClick={() => setShowCreateModal(true)} className="create-list-button">
            ➕ Nueva Lista
          </button>
        </div>
      </div>

      <div className="shopping-content">
        {/* Sidebar con listas */}
        <div className="lists-sidebar">
          <h3>📋 Mis Listas ({shoppingLists.length})</h3>
          <div className="lists-container">
            {shoppingLists.length === 0 ? (
              <p className="no-lists">No tienes listas de compras aún</p>
            ) : (
              shoppingLists.map(list => (
                <div
                  key={list._id}
                  className={`list-item ${currentList && currentList._id === list._id ? 'active' : ''}`}
                  onClick={() => loadShoppingList(list._id)}
                >
                  <div className="list-info">
                    <h4>{list.title}</h4>
                    <div className="list-meta">
                      <span>{list.items.length} items</span>
                      {list.isCompleted && <span className="completed-badge">✅ Completada</span>}
                      {list.weeklyMenu && <span className="menu-badge">📅 Del menú</span>}
                    </div>
                    <div className="list-date">
                      {new Date(list.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteList(list._id);
                    }}
                    className="delete-list-button"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="main-content">
          {currentList ? (
            <>
              {/* Info de la lista actual */}
              <div className="current-list-header">
                <div className="list-title-section">
                  <h2>{currentList.title}</h2>
                  {currentList.weeklyMenu && (
                    <span className="menu-reference">
                      📅 Generada desde: {currentList.weeklyMenu.title}
                    </span>
                  )}
                </div>
                
                {/* Estadísticas */}
                <div className="list-stats">
                  <div className="stat-item">
                    <span className="stat-number">{stats.total}</span>
                    <span className="stat-label">Total</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{stats.purchased}</span>
                    <span className="stat-label">Comprados</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{stats.pending}</span>
                    <span className="stat-label">Pendientes</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">${stats.totalCost.toFixed(2)}</span>
                    <span className="stat-label">Total Est.</span>
                  </div>
                </div>

                {/* Acciones de lista */}
                <div className="list-actions">
                  <button 
                    onClick={() => setShowAddItemModal(true)}
                    className="add-item-button"
                  >
                    ➕ Agregar Item
                  </button>
                  {!currentList.isCompleted && (
                    <button 
                      onClick={markListCompleted}
                      className="complete-list-button"
                    >
                      ✅ Marcar Completada
                    </button>
                  )}
                </div>
              </div>

              {/* Filtros y ordenamiento */}
              <div className="list-controls">
                <div className="filters">
                  <label>Filtrar:</label>
                  <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="all">Todos</option>
                    <option value="pending">Pendientes</option>
                    <option value="purchased">Comprados</option>
                  </select>
                </div>
                <div className="sorting">
                  <label>Ordenar:</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="category">Por Categoría</option>
                    <option value="name">Por Nombre</option>
                    <option value="price">Por Precio</option>
                  </select>
                </div>
              </div>

              {/* Lista de items */}
              <div className="items-list">
                {getFilteredAndSortedItems().length === 0 ? (
                  <div className="no-items">
                    <p>No hay items en esta lista</p>
                    <button onClick={() => setShowAddItemModal(true)}>
                      Agregar primer item
                    </button>
                  </div>
                ) : (
                  getFilteredAndSortedItems().map(item => {
                    const categoryInfo = getCategoryInfo(item.category);
                    return (
                      <div 
                        key={item._id} 
                        className={`shopping-item ${item.isPurchased ? 'purchased' : ''}`}
                      >
                        <div className="item-checkbox">
                          <input
                            type="checkbox"
                            checked={item.isPurchased}
                            onChange={() => toggleItemPurchased(item._id, item.isPurchased)}
                          />
                        </div>
                        
                        <div className="item-info">
                          <div className="item-name">
                            <span className="category-icon" style={{ color: categoryInfo.color }}>
                              {categoryInfo.label.split(' ')[0]}
                            </span>
                            {item.ingredient}
                          </div>
                          
                          {item.fromRecipes && item.fromRecipes.length > 0 && (
                            <div className="item-recipes">
                              Para: {item.fromRecipes.map(recipe => recipe.recipeName).join(', ')}
                            </div>
                          )}
                          
                          {item.notes && (
                            <div className="item-notes">
                              💬 {item.notes}
                            </div>
                          )}
                        </div>

                        <div className="item-controls">
                          <input
                            type="text"
                            placeholder="Cantidad"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(item._id, e.target.value)}
                            className="quantity-input"
                          />
                          <input
                            type="number"
                            placeholder="$0.00"
                            value={item.estimatedPrice}
                            onChange={(e) => updateItemPrice(item._id, e.target.value)}
                            className="price-input"
                            step="0.01"
                            min="0"
                          />
                          <button
                            onClick={() => removeItem(item._id)}
                            className="remove-item-button"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="no-list-selected">
              <h2>👈 Selecciona una lista de compras</h2>
              <p>O crea una nueva lista para comenzar</p>
              <button onClick={() => setShowCreateModal(true)} className="create-first-list">
                ➕ Crear Primera Lista
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal para crear nueva lista */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>➕ Nueva Lista de Compras</h3>
              <button onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="option-section">
                <h4>📅 Generar desde Menú Semanal</h4>
                <select 
                  value={selectedMenuForGeneration} 
                  onChange={(e) => setSelectedMenuForGeneration(e.target.value)}
                >
                  <option value="">Selecciona un menú...</option>
                  {weeklyMenus.map(menu => (
                    <option key={menu._id} value={menu._id}>
                      {menu.title}
                    </option>
                  ))}
                </select>
                <button 
                  onClick={generateFromMenu} 
                  disabled={!selectedMenuForGeneration || actionLoading}
                  className="generate-button"
                >
                  {actionLoading ? 'Generando...' : 'Generar Lista'}
                </button>
                
                <button 
                  onClick={analyzeMenuNutrition} 
                  disabled={!selectedMenuForGeneration || analysisLoading}
                  className="analyze-nutrition-button"
                >
                  {analysisLoading ? 'Analizando...' : '🧠 Analizar Nutrición + Generar'}
                </button>
              </div>

              <div className="option-divider">
                <span>O</span>
              </div>

              <div className="option-section">
                <h4>📝 Crear Lista Manual</h4>
                <input
                  type="text"
                  placeholder="Título de la lista..."
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                />
                <button 
                  onClick={createManualList} 
                  disabled={!newListTitle.trim() || actionLoading}
                  className="create-manual-button"
                >
                  {actionLoading ? 'Creando...' : 'Crear Lista Manual'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de análisis nutricional */}
      {showNutritionalModal && nutritionalAnalysis && (
        <div className="modal-overlay">
          <div className="modal-content nutritional-modal">
            <div className="modal-header">
              <h3>🧠 Análisis Nutricional del Menú</h3>
              <button onClick={() => setShowNutritionalModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              {/* Análisis general */}
              <div className="analysis-section">
                <h4>📊 Evaluación Nutricional</h4>
                <div className="analysis-score">
                  <span className="score-label">Puntuación General:</span>
                  <span className="score-value">{nutritionalAnalysis.nutritionalSuggestions.analysis.overallScore}/10</span>
                </div>
                
                <div className="analysis-details">
                  <div className="strengths">
                    <h5>✅ Fortalezas</h5>
                    <ul>
                      {nutritionalAnalysis.nutritionalSuggestions.analysis.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="gaps">
                    <h5>⚠️ Áreas de Mejora</h5>
                    <ul>
                      {nutritionalAnalysis.nutritionalSuggestions.analysis.gaps.map((gap, index) => (
                        <li key={index}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Sugerencias de ingredientes */}
              <div className="suggestions-section">
                <h4>💡 Ingredientes Sugeridos para Mejorar la Nutrición</h4>
                <p className="suggestions-intro">
                  Selecciona los ingredientes que quieres agregar a tu lista de compras:
                </p>
                
                <div className="suggestions-grid">
                  {nutritionalAnalysis.nutritionalSuggestions.suggestions.map((suggestion, index) => (
                    <div 
                      key={index} 
                      className={`suggestion-card ${selectedSuggestions.find(s => s.ingredient === suggestion.ingredient) ? 'selected' : ''}`}
                      onClick={() => toggleSuggestionSelection(suggestion)}
                    >
                      <div className="suggestion-header">
                        <div className="ingredient-info">
                          <span className="category-icon">
                            {categories.find(c => c.value === suggestion.category)?.label.split(' ')[0] || '📦'}
                          </span>
                          <h5>{suggestion.ingredient}</h5>
                        </div>
                        <div className={`priority-badge ${suggestion.priority}`}>
                          {suggestion.priority}
                        </div>
                      </div>
                      
                      <p className="suggestion-reason">{suggestion.reason}</p>
                      
                      <div className="benefits">
                        <span className="benefits-label">Beneficios:</span>
                        <div className="benefits-list">
                          {suggestion.benefits.map((benefit, bIndex) => (
                            <span key={bIndex} className="benefit-tag">{benefit}</span>
                          ))}
                        </div>
                      </div>
                      
                      <p className="usage-tip">
                        <strong>Uso sugerido:</strong> {suggestion.usage}
                      </p>
                      
                      <div className="selection-indicator">
                        {selectedSuggestions.find(s => s.ingredient === suggestion.ingredient) ? '✅' : '➕'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metas semanales */}
              <div className="goals-section">
                <h4>🎯 Metas Nutricionales para la Semana</h4>
                <ul className="weekly-goals">
                  {nutritionalAnalysis.nutritionalSuggestions.weeklyGoals.map((goal, index) => (
                    <li key={index}>{goal}</li>
                  ))}
                </ul>
              </div>

              {/* Acciones */}
              <div className="modal-actions">
                <div className="selected-count">
                  {selectedSuggestions.length > 0 && (
                    <span>{selectedSuggestions.length} ingredientes seleccionados</span>
                  )}
                </div>
                <div className="action-buttons">
                  <button 
                    onClick={() => setShowNutritionalModal(false)} 
                    className="cancel-button"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={addSuggestionsToList} 
                    disabled={selectedSuggestions.length === 0 || actionLoading}
                    className="add-suggestions-button"
                  >
                    {actionLoading ? 'Generando...' : `Generar Lista + ${selectedSuggestions.length} Sugerencias`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para agregar item */}
      {showAddItemModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>➕ Agregar Item</h3>
              <button onClick={() => setShowAddItemModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Ingrediente *</label>
                <input
                  type="text"
                  placeholder="Ej: Tomates, Pollo, Arroz..."
                  value={newItem.ingredient}
                  onChange={(e) => setNewItem(prev => ({ ...prev, ingredient: e.target.value }))}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cantidad</label>
                  <input
                    type="text"
                    placeholder="Ej: 2 kg, 1 litro..."
                    value={newItem.quantity}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Precio Estimado</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={newItem.estimatedPrice}
                    onChange={(e) => setNewItem(prev => ({ ...prev, estimatedPrice: parseFloat(e.target.value) || 0 }))}
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Categoría</label>
                <select 
                  value={newItem.category} 
                  onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Notas</label>
                <textarea
                  placeholder="Notas adicionales..."
                  value={newItem.notes}
                  onChange={(e) => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
                  rows="2"
                />
              </div>

              <div className="modal-actions">
                <button onClick={() => setShowAddItemModal(false)} className="cancel-button">
                  Cancelar
                </button>
                <button onClick={addNewItem} className="add-button">
                  Agregar Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;