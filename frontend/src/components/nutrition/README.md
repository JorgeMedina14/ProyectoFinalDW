# 📊 Componentes Nutricionales

Esta carpeta contiene los componentes especializados en información nutricional de las recetas.

## Archivos:

### **NutritionalInfo.js + NutritionalInfo.css**
- **Propósito**: Visualizador de información nutricional
- **Funcionalidades**:
  - Vista organizada por pestañas (Macros, Vitaminas, Minerales)
  - Gráficos y barras de progreso
  - Indicadores visuales con colores
  - Información por porción
  - Diseño moderno y atractivo

### **NutritionalInfoEditor.js + NutritionalInfoEditor.css**
- **Propósito**: Editor de información nutricional
- **Funcionalidades**:
  - Edición manual de todos los valores
  - **🧮 Cálculo automático** basado en ingredientes
  - Auto-calcular valores típicos
  - Validación de datos
  - Interfaz tabular organizada

## Características Principales:

### **🤖 Cálculo Automático**
- Analiza los ingredientes de la receta
- Calcula automáticamente:
  - 🔥 Calorías
  - 💪 Proteínas
  - 🍞 Carbohidratos
  - 🥑 Grasas
  - 🌾 Fibra
  - 💊 Vitaminas (A, C, D, E, K, B1-B12, Folato)
  - ⚡ Minerales (Calcio, Hierro, Magnesio, etc.)

### **📊 Visualización Avanzada**
- Pestañas organizadas por tipo de nutriente
- Barras de progreso con colores
- Íconos descriptivos
- Valores formateados con unidades

## Base de Datos Nutricional:
- **40+ ingredientes** con valores precisos
- **Categorización inteligente** (proteínas, carbos, vegetales, frutas)
- **Estimación de cantidades** automática
- **Ajuste por porciones**

## Conexión con Backend:
- **API**: `/api/recipes/:id/recalculate-nutrition`
- **Servicio**: `nutritionCalculatorService`