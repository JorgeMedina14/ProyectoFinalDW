const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    console.log('🔒 Middleware de autenticación ejecutándose...');
    console.log('📋 Headers de autorización:', req.headers.authorization);

    // Verificar si hay token en el header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Obtener token del header
            token = req.headers.authorization.split(' ')[1];
            console.log('🔑 Token extraído:', token ? 'Presente' : 'Ausente');

            // Verificar token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('✅ Token decodificado:', { id: decoded.id, email: decoded.email });

            // Obtener usuario del token
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                console.error('❌ Usuario no encontrado en la base de datos');
                return res.status(401).json({
                    success: false,
                    message: 'No autorizado, usuario no encontrado'
                });
            }

            console.log('👤 Usuario autenticado:', { id: req.user._id, email: req.user.email });
            next();
        } catch (error) {
            console.error('❌ Error al verificar token:', error.message);
            res.status(401).json({
                success: false,
                message: 'No autorizado, token inválido',
                error: error.message
            });
        }
    } else {
        console.error('❌ No hay token en la petición');
        res.status(401).json({
            success: false,
            message: 'No autorizado, no hay token'
        });
    }
};

module.exports = { protect };