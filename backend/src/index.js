const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const ingredientRoutes = require('./routes/ingredientRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const weeklyMenuRoutes = require('./routes/weeklyMenuRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Importar el programador de notificaciones
const notificationScheduler = require('./services/notificationScheduler');

const app = express();

// Configuración de CORS para acceso móvil
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.1.142:3000', // Tu IP local para acceso móvil
    'http://192.168.56.1:3000', // IP específica del error
    /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:3000$/, // Cualquier IP de red local
    /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:3000$/, // Red 10.x.x.x
    /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}:3000$/ // Red 172.16-31.x.x
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // Para compatibilidad con navegadores móviles
};

// Middleware
app.use(cors(corsOptions));

// Middleware de logging para debug móvil
app.use((req, res, next) => {
  console.log(`📱 ${req.method} ${req.path} - Origin: ${req.get('Origin')} - User-Agent: ${req.get('User-Agent')?.slice(0, 50)}...`);
  next();
});

app.use(express.json({ limit: '50mb' })); // Aumentar limite para imágenes
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos de la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    // Inicializar sistema de notificaciones después de conectar a la base de datos
    setTimeout(() => {
      notificationScheduler.initialize();
    }, 2000);
  })
  .catch((error) => {
    console.error('Error conectando a MongoDB:', error);
  });

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/weekly-menus', weeklyMenuRoutes);
app.use('/api/notifications', notificationRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de Menu Planner' });
});

// Endpoint específico para testing de conectividad móvil
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Conexión exitosa desde móvil', 
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    origin: req.get('Origin')
  });
});

// Middleware de manejo de errores 404
app.use('*', (req, res) => {
  console.log(`❌ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  console.log(`📍 Rutas disponibles para /api/recipes:`);
  console.log(`   POST /api/recipes/generate`);
  console.log(`   GET  /api/recipes/ingredients`);
  console.log(`   GET  /api/recipes/favorites`);
  console.log(`   POST /api/recipes/:recipeId/recalculate-nutrition`);
  console.log(`   PUT  /api/recipes/:recipeId/nutrition`);
  console.log(`   GET  /api/recipes`);
  console.log(`   POST /api/recipes`);
  console.log(`   PUT  /api/recipes/:id/favorite`);
  console.log(`   DELETE /api/recipes/:id`);
  
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error('🚨 Error no manejado:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Puerto
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Permitir acceso desde cualquier IP

// Iniciar servidor
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📱 Acceso local: http://localhost:${PORT}`);
  console.log(`📱 Acceso desde red: http://[TU_IP]:${PORT}`);
  console.log('💡 Para encontrar tu IP ejecuta: ipconfig (Windows) o ifconfig (Mac/Linux)');
});

// Configurar timeout del servidor para operaciones pesadas como generación de IA
server.timeout = 180000; // 3 minutos
server.keepAliveTimeout = 180000; // 3 minutos
server.headersTimeout = 190000; // Ligeramente mayor que keepAliveTimeout

// Manejar cierre del servidor
process.on('SIGINT', () => {
  console.log('\n🔄 Cerrando servidor...');
  notificationScheduler.stop();
  mongoose.connection.close();
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Cerrando servidor...');
  notificationScheduler.stop();
  mongoose.connection.close();
  server.close(() => {
    process.exit(0);
  });
});