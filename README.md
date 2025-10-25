# 🍽️ Menu Planner - Proyecto Final

**Sistema Inteligente de Planificación de Menús con IA y Notificaciones Automáticas**

## 🎯 Descripción del Proyecto

Aplicación web completa que permite a los usuarios generar recetas utilizando Inteligencia Artificial, planificar menús semanales y recibir notificaciones automáticas por email. El sistema calcula automáticamente la información nutricional completa de cada receta.

## ✨ Características Principales

### **🤖 Generación de Recetas con IA**
- Integración con OpenAI GPT-4
- Generación múltiple de recetas basada en ingredientes disponibles
- Cálculo automático de información nutricional completa
- Recetas creativas y variadas

### **🧮 Calculadora Nutricional Automática**
- **Base de datos** con 40+ ingredientes
- **Cálculo inteligente** de macronutrientes, vitaminas y minerales
- **Análisis automático** de cantidades en ingredientes
- **Información por porción** precisa

### **📅 Planificador Semanal Visual**
- Grid interactivo de 7 días x 3 comidas
- Asignación automática de recetas generadas
- Drag & Drop para reorganizar menú
- Lista de compras automática

### **🔔 Sistema de Notificaciones Avanzado**
- Recordatorios automáticos por email
- Horarios personalizables para cada comida
- Templates HTML dinámicos con recetas del día
- Sistema de pruebas integrado

### **📊 Información Nutricional Completa**
- Visualización organizada por pestañas
- Editor con cálculo automático
- Gráficos y barras de progreso
- 21 nutrientes diferentes (macros, vitaminas, minerales)

## 🛠️ Tecnologías Utilizadas

### **Frontend (React)**
- React.js con componentes funcionales
- CSS moderno con diseño responsive
- Axios para comunicación con API
- Interfaz intuitiva y moderna

### **Backend (Node.js)**
- Express.js para API REST
- MongoDB con Mongoose
- JWT para autenticación segura
- Node-cron para tareas programadas

### **Integraciones Externas**
- **OpenAI GPT-4** - Generación de recetas
- **Gmail API** - Envío de notificaciones
- **Base de datos nutricional** - Cálculos automáticos

## 📁 Estructura del Proyecto

```
📂 ProyectoFinaal/
├── 📂 frontend/
│   └── 📂 src/
│       ├── 📂 components/
│       │   ├── 📂 auth/           # Login, Register
│       │   ├── 📂 dashboard/      # Pantalla principal
│       │   ├── 📂 recipes/        # Generación y gestión
│       │   ├── 📂 nutrition/      # Sistema nutricional
│       │   ├── 📂 notifications/  # Configuración de alertas
│       │   ├── 📂 menu/           # Planificador semanal
│       │   └── 📂 common/         # Componentes utilitarios
│       ├── 📂 config/             # Constantes y configuración
│       ├── 📂 services/           # Comunicación con API
│       └── 📂 utils/              # Utilidades y helpers
│
├── 📂 backend/
│   └── 📂 src/
│       ├── 📂 controllers/        # Lógica de negocio
│       ├── 📂 models/             # Esquemas de datos
│       ├── 📂 routes/             # Endpoints de API
│       ├── 📂 services/           # Servicios especializados
│       ├── 📂 middleware/         # Autenticación y validación
│       └── 📂 config/             # Configuración de DB
│
└── 📄 README.md (este archivo)
```

## 🚀 Funcionalidades Destacadas

### **1. Flujo Principal de Usuario**
1. **Registro/Login** → Autenticación segura
2. **Generación de Recetas** → IA crea recetas personalizadas
3. **Cálculo Automático** → Sistema calcula nutrición
4. **Planificación Semanal** → Organiza menú visual
5. **Notificaciones** → Recordatorios automáticos por email

### **2. Innovaciones Técnicas**
- **IA Integrada** para creatividad culinaria
- **Cálculo nutricional automático** sin intervención manual
- **Sistema de notificaciones inteligente** basado en planificación
- **Interfaz moderna** responsive y accesible

### **3. Características Avanzadas**
- **Análisis de ingredientes** con procesamiento de lenguaje natural
- **Base de datos nutricional** completa y precisa
- **Templates de email** dinámicos y personalizados
- **Sistema de pruebas** integrado para debugging

## 🎓 Para la Exposición

### **Puntos Clave a Destacar:**

1. **🤖 Inteligencia Artificial** - Integración real con OpenAI
2. **🧮 Automatización** - Cálculo nutricional sin intervención manual
3. **📧 Notificaciones Inteligentes** - Sistema completo automatizado
4. **📱 UX Moderna** - Interfaz responsive y accesible
5. **🔧 Arquitectura Robusta** - Código bien organizado y escalable

### **Demostraciones Sugeridas:**
1. **Generar recetas** con ingredientes específicos
2. **Mostrar cálculo automático** de nutrición
3. **Planificar menú semanal** con drag & drop
4. **Configurar notificaciones** y enviar prueba
5. **Mostrar email recibido** con template dinámico

## 🏆 Logros del Proyecto

- ✅ **Sistema completo end-to-end** funcional
- ✅ **Integración exitosa** con APIs externas (OpenAI, Gmail)
- ✅ **Base de datos nutricional** implementada
- ✅ **Interfaz moderna** y responsive
- ✅ **Arquitectura escalable** y mantenible
- ✅ **Sistema de notificaciones** completamente automatizado

---

**Desarrollado con ❤️ para el curso de Desarrollo Web**  
**Universidad:** UMG  
**Fecha:** Octubre 2025