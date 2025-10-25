# 🔧 Servicios del Backend

Esta carpeta contiene los servicios especializados que dan vida a las funcionalidades avanzadas del proyecto.

## 📄 Archivos:

### **🧮 `nutritionCalculatorService.js`** - ⭐ DESTACADO
**Calculadora Automática de Nutrición**

**Propósito**: Calcula automáticamente la información nutricional completa de las recetas basándose en sus ingredientes.

**Características Principales**:
- **Base de datos nutricional** con 40+ ingredientes comunes
- **Análisis inteligente** de cantidades (200g pollo, 1 taza arroz, etc.)
- **Cálculo automático** de:
  - 🔥 Calorías
  - 💪 Proteínas, 🍞 Carbohidratos, 🥑 Grasas
  - 🌾 Fibra, 🍯 Azúcares
  - 💊 11 Vitaminas (A, C, D, E, K, B1-B12, Folato)
  - ⚡ 10 Minerales (Calcio, Hierro, Magnesio, etc.)

**Cómo Funciona**:
1. Recibe lista de ingredientes de la receta
2. Limpia y analiza cada ingrediente
3. Extrae cantidades y categoriza alimentos
4. Busca en base de datos nutricional
5. Calcula totales por porción
6. Retorna información nutricional completa

### **📧 `emailService.js`** - Sistema de Emails
**Propósito**: Envío de notificaciones por email con templates HTML dinámicos.

**Funcionalidades**:
- Configuración automática con Gmail
- Templates HTML personalizados
- Contenido dinámico con recetas del día
- Manejo robusto de errores

### **⏰ `notificationScheduler.js`** - Programador Automático
**Propósito**: Sistema que verifica cada minuto si debe enviar notificaciones.

**Funcionalidades**:
- Verificación cada minuto (cron: `* * * * *`)
- Cálculo de próxima comida basado en horarios
- Integración con menú semanal planificado
- Logging detallado para debugging

## 🎯 Para tu Exposición - Puntos Clave:

### **🧮 Calculadora Nutricional**:
```javascript
// Ejemplo de uso:
const nutrition = nutritionCalculator.calculateRecipeNutrition([
  "200g pechuga de pollo",
  "1 taza de arroz",
  "1 tomate grande"
], 4); // 4 porciones

// Resultado automático:
// { calories: 520, proteins: 35.2g, carbohydrates: 45.8g, ... }
```

### **📧 Sistema de Notificaciones**:
- **Automático**: Se ejecuta sin intervención
- **Inteligente**: Calcula próxima comida
- **Personalizado**: Usa recetas del usuario
- **Confiable**: Manejo de errores robusto

### **🔧 Beneficios**:
- **Ahorra tiempo** al usuario (cálculo automático)
- **Precisión** en información nutricional
- **Experiencia fluida** con notificaciones automáticas
- **Escalable** y mantenible