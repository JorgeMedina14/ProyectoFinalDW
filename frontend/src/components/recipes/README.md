# 🍽️ Componentes de Recetas

Esta carpeta contiene todos los componentes relacionados con la gestión y generación de recetas.

## Archivos:

### **RecipeGenerator.js + RecipeGenerator.css**
- **Propósito**: Generador de recetas con IA
- **Funcionalidades**:
  - Selección de ingredientes disponibles
  - Preferencias personalizadas
  - Generación múltiple con OpenAI
  - Interfaz moderna con loading states

### **Recipes.js + Recipes.css**
- **Propósito**: Lista y gestión de recetas guardadas
- **Funcionalidades**:
  - Vista de todas las recetas del usuario
  - Filtrado por favoritas
  - Búsqueda y ordenamiento
  - Gestión de recetas guardadas

### **RecipeCard.js + RecipeCard.css**
- **Propósito**: Tarjeta individual de receta
- **Funcionalidades**:
  - Visualización detallada de receta
  - Edición de información nutricional
  - Marcado como favorita
  - Botones de acción (guardar, eliminar)
  - Integración con sistema nutricional

## Flujo de Recetas:
1. **Generación** → RecipeGenerator → IA crea recetas
2. **Cálculo Automático** → Nutrición calculada por ingredientes
3. **Visualización** → RecipeCard muestra información completa
4. **Gestión** → Recipes permite organizar colección

## Integración con IA:
- **OpenAI GPT-4** para generación creativa
- **Análisis de ingredientes** automático
- **Cálculo nutricional** inteligente

## Conexión con Backend:
- **API**: `/api/recipes/*`
- **Servicio**: `recipeService` en `services/api.js`