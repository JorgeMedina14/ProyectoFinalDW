# 🍽️ Sistema de Planificación de Menús Semanales con IA

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.x-green.svg)](https://www.mongodb.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-orange.svg)](https://openai.com/)

Una aplicación web completa que utiliza **Inteligencia Artificial** para automatizar la planificación de menús semanales, detectar ingredientes por imagen y calcular información nutricional automáticamente.

![Demo del Sistema](https://img.shields.io/badge/Estado-Completamente%20Funcional-brightgreen)

## 🚀 **Características Principales**

- 🤖 **Generación de Recetas con IA** - OpenAI GPT-4 crea múltiples recetas personalizadas
- 📸 **Detección de Ingredientes** - Google Vision API identifica ingredientes en imágenes
- 📅 **Planificación Semanal** - Organiza menús por días y tipos de comida
- 🛒 **Listas de Compras Automáticas** - Genera listas basadas en menús planificados
- 📧 **Notificaciones Inteligentes** - Recordatorios por email programables
- 📊 **Información Nutricional** - Cálculo automático de macronutrientes
- 📱 **Diseño Responsive** - Funciona perfectamente en móviles y tablets

## 🛠️ **Stack Tecnológico**

### Frontend
```bash
• React.js 18       # Framework de interfaz moderna
• CSS3             # Estilos responsivos 
• Axios            # Cliente HTTP para APIs
• React Router     # Navegación SPA
```

### Backend
```bash
• Node.js + Express    # Servidor web robusto
• MongoDB + Mongoose   # Base de datos NoSQL
• JWT + Bcrypt        # Autenticación segura
• Multer              # Manejo de archivos
```

### Integraciones de IA
```bash
• OpenAI GPT-4        # Generación inteligente de recetas
• Google Vision API   # Reconocimiento de ingredientes
• Gmail SMTP          # Notificaciones automáticas
• Node-Cron           # Programación de tareas
```

## 📋 **Requisitos del Sistema**

- **Node.js** v18.x o superior
- **MongoDB** v5.x o superior  
- **Cuenta OpenAI** (para generación de recetas)
- **Cuenta Gmail** (para notificaciones por email)

## 🔧 **Instalación Rápida**

### 1️⃣ Clonar Repositorio
```bash
git clone https://github.com/JorgeMedina14/ProyectoFinalDW.git
cd ProyectoFinalDW
```

### 2️⃣ Configurar Backend
```bash
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

### 3️⃣ Configurar Frontend
```bash
cd ../frontend
npm install
```

### 4️⃣ Configurar Credenciales
Editar `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/menu-planner
JWT_SECRET=tu-clave-secreta-muy-segura
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion
OPENAI_API_KEY=sk-proj-tu-api-key-de-openai
```

## 🚀 **Ejecución**

### Iniciar Backend (Terminal 1)
```bash
cd backend
npm start
# Servidor: http://localhost:5000
```

### Iniciar Frontend (Terminal 2)
```bash
cd frontend  
npm start
# Aplicación: http://localhost:3000
```

## 📱 **Guía de Uso**

### 1. **🔐 Autenticación**
- Registrarse con email y contraseña
- Iniciar sesión seguro con JWT

### 2. **📸 Detección de Ingredientes**
- Subir foto de refrigerador/despensa
- IA detecta ingredientes automáticamente
- Revisar y editar lista generada

### 3. **🤖 Generación de Recetas**
- Seleccionar ingredientes disponibles
- Agregar preferencias (ej: "vegetariano", "sin gluten")
- Generar 10 recetas automáticamente con GPT-4
- Obtener información nutricional calculada

### 4. **📅 Planificación de Menús**
- Vista de calendario semanal intuitiva
- Asignar recetas por día y comida
- Navegación entre semanas
- Organización automática

### 5. **🛒 Lista de Compras**
- Generación automática desde menú semanal
- Productos agrupados por categorías
- Marcar elementos como comprados
- Acceso desde móvil

### 6. **📧 Notificaciones**
- Configurar horarios personalizados
- Recibir recordatorios por email
- Templates HTML con instrucciones completas

## 🏗️ **Arquitectura del Sistema**

```
📁 ProyectoFinalDW/
├── 📁 frontend/                    # Aplicación React
│   ├── 📁 src/
│   │   ├── 📁 components/          # Componentes organizados
│   │   │   ├── 📁 auth/           # Autenticación
│   │   │   ├── 📁 dashboard/       # Panel principal
│   │   │   ├── 📁 recipes/         # Gestión de recetas
│   │   │   ├── 📁 nutrition/       # Info nutricional
│   │   │   ├── 📁 menu/           # Planificador
│   │   │   └── 📁 notifications/   # Configuración
│   │   ├── 📁 services/           # API cliente
│   │   └── 📁 config/             # Configuración
├── 📁 backend/                     # API REST Node.js
│   ├── 📁 src/
│   │   ├── 📁 controllers/        # Lógica de negocio
│   │   ├── 📁 models/             # Esquemas MongoDB
│   │   ├── 📁 routes/             # Endpoints API
│   │   ├── 📁 services/           # Servicios IA/Email
│   │   └── 📁 middleware/         # Autenticación
└── 📁 docs/                       # Documentación completa
```

## 📊 **Métricas del Proyecto**

| Métrica | Valor |
|---------|-------|
| 📁 **Archivos de código** | 114 archivos |
| 📝 **Líneas de código** | +38,000 líneas |
| 🎯 **Funcionalidades** | 100% completadas |
| 🧪 **APIs integradas** | 3 servicios externos |
| 📱 **Responsive** | Totalmente adaptado |
| 🚀 **Tiempo de desarrollo** | 8 semanas |

## 🔒 **Seguridad Implementada**

- ✅ **Autenticación JWT** con tokens seguros
- ✅ **Encriptación Bcrypt** para contraseñas  
- ✅ **Validación de inputs** en frontend y backend
- ✅ **CORS configurado** para acceso controlado
- ✅ **Variables de entorno** para credenciales
- ✅ **Middleware de autenticación** en rutas protegidas

## 🎓 **Contexto Académico**

### **Universidad Mariano Gálvez de Guatemala**
**Proyecto Final - Desarrollo Web**

#### Objetivos Académicos Alcanzados:
- ✅ **Frontend Moderno**: React con componentes reutilizables
- ✅ **Backend Robusto**: Node.js con arquitectura escalable  
- ✅ **Base de Datos**: MongoDB con esquemas complejos
- ✅ **APIs RESTful**: 25+ endpoints bien documentados
- ✅ **Integración IA**: OpenAI y Google Vision APIs
- ✅ **Seguridad**: JWT, validaciones y encriptación
- ✅ **Documentación**: Técnica y de usuario completa

#### Competencias Demostradas:
- 🎨 **Diseño de Interfaces** responsivas y modernas
- ⚙️ **Desarrollo Backend** con mejores prácticas
- 🗄️ **Modelado de Datos** para aplicaciones complejas
- 🤖 **Integración de IA** en aplicaciones web
- 📧 **Sistemas de Notificación** automatizados
- 🛡️ **Implementación de Seguridad** web

## 📄 **Licencia**

Este proyecto fue desarrollado con **fines académicos** para la Universidad Mariano Gálvez de Guatemala. El código está disponible para **revisión educativa** y **mejoras colaborativas**.

## 🤝 **Contribuciones**

¡Las contribuciones son bienvenidas! Por favor:

1. **Fork** el repositorio
2. **Crear branch** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add AmazingFeature'`)
4. **Push** al branch (`git push origin feature/AmazingFeature`)
5. **Abrir Pull Request**

