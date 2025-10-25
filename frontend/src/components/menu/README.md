# 📅 Componentes de Menú Semanal

Esta carpeta contiene el componente del planificador de menús semanales.

## Archivos:

### **WeeklyMenuPlanner.js + WeeklyMenuPlanner.css**
- **Propósito**: Planificador visual de menús semanales
- **Funcionalidades**:
  - **Vista semanal** completa (7 días)
  - **3 comidas por día** (Desayuno, Almuerzo, Cena)
  - **Drag & Drop** para mover recetas
  - **Asignación automática** de recetas generadas
  - **Navegación por semanas**
  - **Notas personalizadas** por comida
  - **Lista de compras** automática

## Características Principales:

### **🗓️ Interfaz Visual**
- Grid de 7 días x 3 comidas = 21 slots
- Código de colores por tipo de comida
- Vista responsive y moderna
- Navegación fluida entre semanas

### **🎯 Gestión Inteligente**
- **Auto-asignación** cuando generas recetas
- **Llenado automático** de comidas faltantes
- **Detección de slots vacíos**
- **Sugerencias inteligentes**

### **📝 Funcionalidades Avanzadas**
- **Mover recetas** entre días/comidas
- **Eliminar** recetas de slots
- **Agregar notas** a cada comida
- **Generar lista de compras** automática

### **🔄 Sincronización**
- **Actualización en tiempo real**
- **Persistencia** en base de datos
- **Recuperación automática** del menú actual
- **Historial** de menús anteriores

## Flujo de Uso:
1. **Generación** → Recetas se asignan automáticamente
2. **Organización** → Usuario mueve/ajusta según preferencias
3. **Completado** → Sistema llena slots vacíos
4. **Ejecución** → Notificaciones basadas en menú planificado

## Integración:
- **Recetas** → Usa recetas guardadas del usuario
- **Notificaciones** → Programa recordatorios basados en menú
- **Lista de Compras** → Genera automáticamente ingredientes

## Conexión con Backend:
- **API**: `/api/weekly-menus/*`
- **Servicio**: `weeklyMenuService`