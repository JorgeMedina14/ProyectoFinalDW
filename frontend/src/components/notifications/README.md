# 🔔 Componentes de Notificaciones

Esta carpeta contiene los componentes del sistema avanzado de notificaciones por email.

## Archivos:

### **NotificationSettings.js + NotificationSettings.css** (LEGACY)
- **Propósito**: Versión anterior del sistema de notificaciones
- **Estado**: Mantenido para referencia

### **NotificationSettings_new.js + NotificationSettings_new.css** (ACTUAL)
- **Propósito**: Sistema avanzado de notificaciones
- **Funcionalidades**:
  - **Interfaz moderna con pestañas**:
    - 🔧 **General**: Configuración básica
    - ⏰ **Horarios**: Configuración de tiempos de comida
    - 🧪 **Pruebas**: Testing del sistema
  
  - **Configuración Avanzada**:
    - Toggle para activar/desactivar notificaciones
    - Selector de horarios personalizados
    - Configuración de zona horaria
    - Estado en tiempo real del sistema

  - **Sistema de Pruebas**:
    - Envío de emails de prueba
    - Notificación manual de próxima comida
    - Diagnóstico de conectividad
    - Feedback inmediato

## Características del Sistema:

### **⏰ Recordatorios Inteligentes**
- **Horarios personalizables** para cada comida
- **Verificación cada minuto** para precisión
- **Programación automática** basada en menú semanal

### **📧 Notificaciones por Email**
- **Templates HTML** personalizados
- **Contenido dinámico** con recetas del día
- **Configuración de Gmail** integrada
- **Manejo de errores** robusto

### **🔄 Estado en Tiempo Real**
- Indicadores visuales de estado
- Logs del sistema
- Feedback inmediato de acciones
- Diagnóstico automático

## Integración con Backend:
- **Scheduler automático** cada minuto
- **Base de datos** de preferencias
- **Sistema de colas** para envíos
- **Logging detallado**

## Conexión con Backend:
- **API**: `/api/notifications/*`
- **Servicio**: `notificationService`
- **Scheduler**: `notificationScheduler`