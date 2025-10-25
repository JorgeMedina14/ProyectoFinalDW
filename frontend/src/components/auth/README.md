# 🔐 Componentes de Autenticación

Esta carpeta contiene todos los componentes relacionados con la autenticación de usuarios.

## Archivos:

### **Login.js + Login.css**
- **Propósito**: Formulario de inicio de sesión
- **Funcionalidades**:
  - Validación de email y contraseña
  - Manejo de errores de autenticación
  - Redirección automática tras login exitoso
  - Interfaz responsive y moderna

### **Register.js + Register.css**
- **Propósito**: Formulario de registro de nuevos usuarios
- **Funcionalidades**:
  - Registro con email, nombre y contraseña
  - Validación de formularios
  - Verificación de confirmación de contraseña
  - Manejo de errores de registro

## Flujo de Autenticación:
1. **Usuario nuevo** → Register.js → Crea cuenta → Redirección a Login
2. **Usuario existente** → Login.js → Valida credenciales → Dashboard
3. **Token** se guarda en localStorage para mantener sesión

## Conexión con Backend:
- **API**: `/api/auth/register` y `/api/auth/login`
- **Servicio**: `authService` en `services/api.js`