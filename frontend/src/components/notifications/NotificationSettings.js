import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/api';
import './NotificationSettings.css';

const NotificationSettings = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testLoading, setTestLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [showPreview, setShowPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    loadPreferences();
    loadStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPreferences = async () => {
    try {
      const response = await notificationService.getUserPreferences();
      setPreferences(response.data.data);
    } catch (error) {
      console.error('Error cargando preferencias:', error);
      showNotification('Error al cargar preferencias', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStatus = async () => {
    try {
      const response = await notificationService.getNotificationStatus();
      setStatus(response.data.data);
    } catch (error) {
      console.error('Error cargando estado:', error);
    }
  };

  const showNotification = (message, type = 'success') => {
    setSaveStatus({ message, type });
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleToggleEmailNotifications = async () => {
    try {
      const newState = !preferences.emailNotifications.enabled;
      await notificationService.toggleEmailNotifications(newState);
      setPreferences(prev => ({
        ...prev,
        emailNotifications: {
          ...prev.emailNotifications,
          enabled: newState
        }
      }));
      showNotification(
        `Notificaciones por correo ${newState ? 'activadas' : 'desactivadas'}`,
        'success'
      );
    } catch (error) {
      console.error('Error actualizando notificaciones:', error);
      showNotification('Error al actualizar las notificaciones', 'error');
    }
  };

  const handleSendTestEmail = async () => {
    try {
      setTestLoading(true);
      await notificationService.sendTestEmail();
      showNotification('📧 Correo de prueba enviado! Revisa tu bandeja de entrada.', 'success');
    } catch (error) {
      console.error('Error enviando correo de prueba:', error);
      showNotification(
        `Error al enviar correo: ${error.response?.data?.message || error.message}`, 
        'error'
      );
    } finally {
      setTestLoading(false);
    }
  };

  const handleSendNextMealNotification = async () => {
    try {
      await notificationService.sendNextMealNotification();
      showNotification('🍽️ Notificación de próxima comida enviada!', 'success');
    } catch (error) {
      console.error('Error enviando notificación:', error);
      showNotification(
        `Error: ${error.response?.data?.message || error.message}`, 
        'error'
      );
    }
  };

  const updateMealTime = async (mealType, time) => {
    try {
      const mealTimes = {
        ...preferences.mealTimes,
        [mealType]: time
      };
      
      await notificationService.setMealTimes(mealTimes);
      setPreferences(prev => ({
        ...prev,
        mealTimes
      }));
      showNotification(`Horario de ${getMealDisplayName(mealType)} actualizado`, 'success');
    } catch (error) {
      console.error('Error actualizando horario:', error);
      showNotification('Error al actualizar el horario', 'error');
    }
  };

  const getMealDisplayName = (mealType) => {
    const names = {
      desayuno: 'Desayuno',
      almuerzo: 'Almuerzo', 
      cena: 'Cena',
      merienda: 'Merienda'
    };
    return names[mealType] || mealType;
  };

  const getMealIcon = (mealType) => {
    const icons = {
      desayuno: '🥐',
      almuerzo: '🍽️',
      cena: '🍱',
      merienda: '🍪'
    };
    return icons[mealType] || '🍽️';
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  if (loading) {
    return (
      <div className="notification-settings">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando configuración de notificaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-settings">
      {/* Header */}
      <div className="settings-header">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          ← Volver al Dashboard
        </button>
        <h1>🔔 Configuración de Notificaciones</h1>
        <p>Personaliza cuándo y cómo recibir recordatorios de tus comidas</p>
      </div>

      {/* Status de guardado */}
      {saveStatus && (
        <div className={`save-notification ${saveStatus.type}`}>
          {saveStatus.message}
        </div>
      )}

      {/* Navegación por pestañas */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          ⚙️ General
        </button>
        <button 
          className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          ⏰ Horarios
        </button>
        <button 
          className={`tab-button ${activeTab === 'test' ? 'active' : ''}`}
          onClick={() => setActiveTab('test')}
        >
          🧪 Pruebas
        </button>
      </div>

      {/* Contenido de pestañas */}
      <div className="tab-content">
        {/* Pestaña General */}
        {activeTab === 'general' && (
          <div className="tab-panel">
            {/* Estado del sistema */}
            <div className="status-card">
              <h3>📊 Estado del Sistema</h3>
              <div className="status-grid">
                <div className="status-item">
                  <span className="status-label">Servicio de Correo</span>
                  <span className={`status-badge ${status?.emailService ? 'success' : 'error'}`}>
                    {status?.emailService ? '✅ Conectado' : '❌ Desconectado'}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Programador</span>
                  <span className={`status-badge ${status?.schedulerRunning ? 'success' : 'error'}`}>
                    {status?.schedulerRunning ? '✅ Activo' : '❌ Inactivo'}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Último Check</span>
                  <span className="status-info">
                    {status?.lastCheck ? new Date(status.lastCheck).toLocaleString('es-ES') : 'Nunca'}
                  </span>
                </div>
              </div>
            </div>

            {/* Control principal de notificaciones */}
            <div className="main-toggle-card">
              <div className="toggle-header">
                <div>
                  <h3>📧 Notificaciones por Email</h3>
                  <p>Recibe recordatorios automáticos de tus comidas por correo electrónico</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences?.emailNotifications?.enabled || false}
                    onChange={handleToggleEmailNotifications}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              
              {preferences?.emailNotifications?.enabled && (
                <div className="email-info">
                  <div className="email-display">
                    <span className="email-icon">📧</span>
                    <span className="email-address">{preferences.emailNotifications.email}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Configuración de zona horaria */}
            <div className="timezone-card">
              <h3>🌍 Zona Horaria</h3>
              <p>Tu zona horaria actual: <strong>{preferences?.timezone || 'No configurada'}</strong></p>
              <p className="timezone-note">
                ℹ️ Las notificaciones se envían según esta zona horaria
              </p>
            </div>
          </div>
        )}

        {/* Pestaña Horarios */}
        {activeTab === 'schedule' && (
          <div className="tab-panel">
            <div className="schedule-header">
              <h3>⏰ Horarios de Comidas</h3>
              <p>Configura cuándo quieres recibir recordatorios para cada comida</p>
            </div>

            <div className="meal-times-grid">
              {preferences?.mealTimes && Object.entries(preferences.mealTimes).map(([mealType, time]) => (
                <div key={mealType} className="meal-time-card">
                  <div className="meal-header">
                    <span className="meal-icon">{getMealIcon(mealType)}</span>
                    <h4>{getMealDisplayName(mealType)}</h4>
                  </div>
                  
                  <div className="time-input-container">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => updateMealTime(mealType, e.target.value)}
                      className="time-input"
                    />
                    <span className="time-display">{formatTime(time)}</span>
                  </div>
                  
                  <div className="notification-preview">
                    <span className="preview-label">Recordatorio:</span>
                    <span className="preview-time">
                      {formatTime(time.split(':').map((part, index) => 
                        index === 1 ? String(parseInt(part) - 30).padStart(2, '0') : part
                      ).join(':'))} (30 min antes)
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="schedule-note">
              <div className="note-icon">💡</div>
              <div className="note-content">
                <strong>¿Cómo funcionan las notificaciones?</strong>
                <ul>
                  <li>Recibirás un recordatorio 30 minutos antes de cada comida</li>
                  <li>También recibirás una notificación a la hora exacta de la comida</li>
                  <li>Solo se envían si tienes recetas asignadas para ese momento</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Pestaña Pruebas */}
        {activeTab === 'test' && (
          <div className="tab-panel">
            <div className="test-header">
              <h3>🧪 Probar Notificaciones</h3>
              <p>Verifica que todo funcione correctamente antes de confiar en los recordatorios automáticos</p>
            </div>

            <div className="test-actions">
              <div className="test-card">
                <div className="test-icon">📧</div>
                <div className="test-content">
                  <h4>Prueba de Correo</h4>
                  <p>Envía un correo de prueba para verificar la configuración</p>
                  <button 
                    className="test-button primary"
                    onClick={handleSendTestEmail}
                    disabled={testLoading}
                  >
                    {testLoading ? 'Enviando...' : 'Enviar Correo de Prueba'}
                  </button>
                </div>
              </div>

              <div className="test-card">
                <div className="test-icon">🍽️</div>
                <div className="test-content">
                  <h4>Notificación de Comida</h4>
                  <p>Envía una notificación de la próxima comida programada</p>
                  <button 
                    className="test-button secondary"
                    onClick={handleSendNextMealNotification}
                  >
                    Enviar Notificación de Comida
                  </button>
                </div>
              </div>
            </div>

            {/* Preview de notificación */}
            <div className="preview-section">
              <div className="preview-header">
                <h4>📱 Vista Previa de Notificación</h4>
                <button 
                  className="preview-toggle"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? 'Ocultar' : 'Mostrar'} Preview
                </button>
              </div>

              {showPreview && (
                <div className="notification-preview-card">
                  <div className="email-preview">
                    <div className="email-header">
                      <strong>De:</strong> Menu Planner &lt;noreply@menuplanner.com&gt;<br/>
                      <strong>Para:</strong> {preferences?.emailNotifications?.email}<br/>
                      <strong>Asunto:</strong> 🍽️ Recordatorio: Es hora de tu almuerzo
                    </div>
                    <div className="email-body">
                      <h3>¡Es hora de almorzar! 🍽️</h3>
                      <p>Hola, este es tu recordatorio programado.</p>
                      <p><strong>Comida programada:</strong> Almuerzo</p>
                      <p><strong>Hora:</strong> {preferences?.mealTimes?.almuerzo && formatTime(preferences.mealTimes.almuerzo)}</p>
                      <p><strong>Receta sugerida:</strong> Pasta con vegetales</p>
                      <p>¡Que tengas una deliciosa comida! 😋</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSettings;