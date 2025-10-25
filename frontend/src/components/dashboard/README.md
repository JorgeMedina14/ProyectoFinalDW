# 📊 Componentes del Dashboard

Esta carpeta contiene el componente principal del dashboard donde los usuarios navegan por la aplicación.

## Archivos:

### **Dashboard.js + Dashboard.css**
- **Propósito**: Pantalla principal de la aplicación
- **Funcionalidades**:
  - Navegación entre diferentes secciones
  - Menú lateral responsive
  - Vista de perfil del usuario
  - Indicadores de estado de notificaciones
  - Acceso rápido a todas las funcionalidades

## Secciones del Dashboard:
1. **🍽️ Generador de Recetas** → `RecipeGenerator`
2. **📚 Mis Recetas** → `Recipes`
3. **📅 Planificador Semanal** → `WeeklyMenuPlanner`
4. **🔔 Configuración de Notificaciones** → `NotificationSettings`

## Navegación:
- Utiliza estado local para cambiar entre vistas
- Renderiza componentes dinámicamente
- Mantiene contexto del usuario logueado

## Conexión:
- **Punto de entrada** principal después del login
- **Enrutador interno** para diferentes funcionalidades