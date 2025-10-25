import React, { useState, useEffect } from 'react';
import { authService, ingredientService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ingredients, setIngredients] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        console.log('Iniciando Dashboard...');
        
        // Verificar token
        const token = localStorage.getItem('token');
        console.log('Token encontrado:', token ? 'Sí' : 'No');
        
        if (!token || token === 'undefined' || token === 'null') {
          console.log('No hay token válido, redirigiendo a login');
          navigate('/login');
          return;
        }

        // Obtener usuario
        const currentUser = authService.getCurrentUser();
        console.log('Usuario obtenido:', currentUser);
        
        if (!currentUser) {
          console.log('No hay usuario válido, redirigiendo a login');
          navigate('/login');
          return;
        }

        console.log('Usuario cargado correctamente:', currentUser);
        setUser(currentUser);
        setLoading(false);
        
        // Cargar ingredientes
        try {
          await loadIngredients();
        } catch (ingredientError) {
          console.error('Error al cargar ingredientes (no crítico):', ingredientError);
          // No redirigir por error de ingredientes, solo loggear
        }
      } catch (error) {
        console.error('Error crítico al cargar usuario:', error);
        // Limpiar localStorage en caso de error
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    };

    initializeDashboard();
  }, [navigate]);

  const loadIngredients = async () => {
    try {
      const response = await ingredientService.getIngredients();
      if (response && response.data) {
        setIngredients(response.data.data || []);
      }
    } catch (error) {
      console.error('Error al cargar ingredientes:', error);
      setIngredients([]);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Por favor selecciona una imagen');
      return;
    }

    setUploadLoading(true);
    try {
      const response = await ingredientService.uploadImage(selectedFile);
      const ingredientsCount = response.data?.data?.ingredients?.length || 0;
      alert(`¡Imagen procesada exitosamente! Se detectaron ${ingredientsCount} ingredientes.`);
      setSelectedFile(null);
      document.getElementById('imageInput').value = '';
      loadIngredients();
    } catch (error) {
      console.error('Error al procesar imagen:', error);
      alert('Error al procesar la imagen: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploadLoading(false);
    }
  };

  const deleteIngredient = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este ingrediente?')) {
      try {
        console.log('Eliminando ingrediente con ID:', id);
        const response = await ingredientService.deleteIngredient(id);
        console.log('Respuesta de eliminación:', response);
        alert('Ingrediente eliminado exitosamente');
        loadIngredients();
      } catch (error) {
        console.error('Error al eliminar ingrediente:', error);
        alert('Error al eliminar ingrediente: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🍽️ Planificador de Menús</h1>
        <div className="user-info">
          <button 
            onClick={() => navigate('/recipe-generator')}
            className="btn-generator"
          >
            🍳 Generador de Recetas
          </button>
          <button 
            onClick={() => navigate('/recipes')}
            className="btn-recipes"
          >
            📖 Mis Recetas
          </button>
          <button 
            onClick={() => navigate('/weekly-menu')}
            className="btn-weekly-menu"
          >
            📅 Planificador Semanal
          </button>
          <button 
            onClick={() => navigate('/notifications')}
            className="btn-notifications"
          >
            🔔 Notificaciones
          </button>
          <span>¡Hola, {user?.name}!</span>
          <button onClick={handleLogout} className="btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="upload-section">
          <h2>📸 Subir Imagen de tu Alacena</h2>
          <div className="upload-area">
            <input
              type="file"
              id="imageInput"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="imageInput" className="file-label">
              {selectedFile ? selectedFile.name : 'Seleccionar imagen...'}
            </label>
            <button 
              onClick={handleUpload} 
              className="btn-upload"
              disabled={!selectedFile || uploadLoading}
            >
              {uploadLoading ? 'Procesando...' : 'Analizar Imagen'}
            </button>
          </div>
        </section>

        <section className="ingredients-section">
          <div className="ingredients-header">
            <h2>🥬 Mis Ingredientes ({ingredients.length})</h2>
          </div>
          
          {ingredients.length === 0 ? (
            <p className="no-ingredients">
              No tienes ingredientes aún. ¡Sube una imagen de tu alacena para empezar!
            </p>
          ) : (
            <div className="ingredients-grid">
              {ingredients.map((ingredient) => (
                <div key={ingredient._id} className="ingredient-card">
                  <h3>{ingredient.name}</h3>
                  <p>Cantidad: {ingredient.quantity} {ingredient.unit}</p>
                  <p className="detected-date">
                    Detectado: {new Date(ingredient.detectedAt).toLocaleDateString()}
                  </p>
                  <div className="ingredient-actions">
                    <button 
                      onClick={() => deleteIngredient(ingredient._id)}
                      className="btn-delete"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;