# 🧩 Componentes de Frontend - Organizados

Esta carpeta contiene todos los componentes React organizados por funcionalidad para facilitar el mantenimiento y comprensión del proyecto.

## 📁 Estructura Organizacional:

### **🔐 `/auth`** - Autenticación
Componentes relacionados con login y registro de usuarios.
- `Login.js` - Formulario de inicio de sesión
- `Register.js` - Formulario de registro

### **📊 `/dashboard`** - Dashboard Principal
Componente principal de navegación de la aplicación.
- `Dashboard.js` - Pantalla principal con menú y navegación

### **🍽️ `/recipes`** - Gestión de Recetas
Todos los componentes relacionados con recetas y su generación.
- `RecipeGenerator.js` - Generador con IA
- `Recipes.js` - Lista de recetas guardadas
- `RecipeCard.js` - Tarjeta individual de receta

### **📊 `/nutrition`** - Información Nutricional
Componentes especializados en datos nutricionales.
- `NutritionalInfo.js` - Visualizador de nutrición
- `NutritionalInfoEditor.js` - Editor con cálculo automático

### **🔔 `/notifications`** - Sistema de Notificaciones
Componentes del sistema avanzado de notificaciones.
- `NotificationSettings_new.js` - **Sistema principal** (usar este)
- `NotificationSettings.js` - Versión legacy

### **📅 `/menu`** - Planificador Semanal
Componente del planificador de menús semanales.
- `WeeklyMenuPlanner.js` - Planificador visual con drag & drop

### **🔧 `/common`** - Componentes Comunes
Utilidades y componentes de uso general.
- `ShoppingList.js` - Lista de compras automática
- `NetworkDiagnostic.js` - Diagnóstico de conectividad

## 🎯 Para tu Exposición:

### **Flujo Principal de la Aplicación:**
1. **Auth** → Usuario se registra/logea
2. **Dashboard** → Pantalla principal de navegación
3. **Recipes** → Genera recetas con IA y calcula nutrición automáticamente
4. **Menu** → Planifica menú semanal
5. **Notifications** → Configura recordatorios automáticos

### **Características Técnicas Destacadas:**
- **🤖 IA Integrada** - OpenAI para generación de recetas
- **🧮 Cálculo Automático** - Sistema inteligente de nutrición
- **📧 Notificaciones** - Sistema avanzado de emails
- **📱 Responsive** - Adaptable a móviles
- **🎨 UI Moderna** - Interfaz atractiva y funcional

### **Cada carpeta tiene su README.md** con detalles específicos para profundizar en cualquier funcionalidad durante la exposición.

## 🚀 Tecnologías Utilizadas:
- **React** - Framework frontend
- **CSS Modules** - Estilos organizados
- **Axios** - Comunicación con API
- **OpenAI API** - Generación de recetas
- **Gmail API** - Envío de notificaciones