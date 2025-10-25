# 🔧 Backend - Estructura Organizada

Esta carpeta contiene todo el código del servidor Node.js con Express, organizado por responsabilidades.

## 📁 Estructura del Backend:

### **⚙️ `/config`** - Configuración
Archivos de configuración de la aplicación.
- `db.js` - Configuración de MongoDB

### **🎮 `/controllers`** - Controladores
Lógica de negocio y manejo de peticiones HTTP.
- `authController.js` - Autenticación (login, register)
- `recipeController.js` - **Gestión de recetas y IA**
- `ingredientController.js` - Gestión de ingredientes
- `weeklyMenuController.js` - Planificador semanal
- `notificationController.js` - Sistema de notificaciones

### **🛡️ `/middleware`** - Middleware
Funciones intermedias para procesar peticiones.
- `authMiddleware.js` - Verificación de JWT tokens
- `uploadMiddleware.js` - Manejo de archivos

### **📊 `/models`** - Modelos de Datos
Esquemas de MongoDB con Mongoose.
- `User.js` - Modelo de usuario
- `Recipe.js` - **Modelo de receta con información nutricional**
- `Ingredient.js` - Modelo de ingredientes
- `WeeklyMenu.js` - Modelo de menú semanal
- `NotificationPreferences.js` - Preferencias de notificaciones

### **🛣️ `/routes`** - Rutas
Definición de endpoints de la API REST.
- `authRoutes.js` - Rutas de autenticación
- `recipeRoutes.js` - **Rutas de recetas (incluye IA y nutrición)**
- `ingredientRoutes.js` - Rutas de ingredientes
- `weeklyMenuRoutes.js` - Rutas del planificador
- `notificationRoutes.js` - Rutas de notificaciones

### **🔧 `/services`** - Servicios
Lógica de negocio compleja y servicios externos.
- `emailService.js` - **Envío de emails con Gmail**
- `notificationScheduler.js` - **Programador automático de notificaciones**
- `nutritionCalculatorService.js` - **🧮 Calculadora automática de nutrición**

### **📄 `index.js`** - Punto de Entrada
Configuración principal del servidor Express.

## 🎯 Servicios Destacados para tu Exposición:

### **🤖 Sistema de IA (`recipeController.js`)**
- Integración con OpenAI GPT-4
- Generación múltiple de recetas
- Parsing inteligente de respuestas
- Cálculo automático de nutrición

### **🧮 Calculadora Nutricional (`nutritionCalculatorService.js`)**
- Base de datos de 40+ ingredientes
- Análisis inteligente de cantidades
- Cálculo de macros, vitaminas y minerales
- Categorización automática de alimentos

### **📧 Sistema de Notificaciones (`notificationScheduler.js` + `emailService.js`)**
- Programador que verifica cada minuto
- Templates HTML dinámicos
- Integración con Gmail API
- Manejo robusto de errores

### **🗄️ Base de Datos (`models/`)**
- Esquemas bien estructurados
- Relaciones entre entidades
- Información nutricional completa
- Menús semanales organizados

## 🔗 Tecnologías Backend:
- **Node.js + Express** - Servidor web
- **MongoDB + Mongoose** - Base de datos
- **JWT** - Autenticación segura
- **OpenAI API** - Inteligencia artificial
- **Nodemailer + Gmail** - Envío de emails
- **Node-cron** - Programación de tareas