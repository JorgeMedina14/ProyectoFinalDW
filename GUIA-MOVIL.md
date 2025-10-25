# 📱 Guía para Usar la App en Móvil

## 🚀 Pasos para Probar en tu Celular

### 1. Preparación
- Asegúrate de que tu celular esté conectado a la misma red WiFi que tu computadora
- Tu IP local es: **192.168.1.142**

### 2. Iniciar la Aplicación
1. Ejecuta el archivo `start-mobile.bat` en la carpeta del proyecto
2. Se abrirán dos ventanas de comandos (backend y frontend)
3. Espera a que ambos servidores estén listos

### 3. Acceder desde tu Celular
1. Abre el navegador en tu celular
2. Ve a: **http://192.168.1.142:3000**
3. ¡La aplicación debería cargar correctamente!

### 4. Probar Carga de Imágenes
1. Ve al Dashboard
2. Toca el botón "Subir Imagen"
3. Selecciona una imagen desde tu galería o toma una foto
4. Verifica que los ingredientes se detecten correctamente

## ⚡ Características Optimizadas para Móvil

- **Límite de imagen aumentado**: Hasta 10MB (perfecto para fotos de móvil)
- **Interfaz responsive**: Se adapta automáticamente al tamaño de pantalla
- **Upload mejorado**: Compatible con cámaras de móvil
- **CORS configurado**: Permite acceso desde tu red local

## 🔧 Solución de Problemas

### Si no puedes acceder:
1. Verifica que ambos dispositivos estén en la misma WiFi
2. Desactiva temporalmente el firewall de Windows
3. Verifica que tu IP no haya cambiado ejecutando `ipconfig`

### Si las imágenes no cargan:
1. Verifica que tengas espacio en el dispositivo
2. Prueba con imágenes más pequeñas primero
3. Asegúrate de que el formato sea JPG, PNG o JPEG

### Si hay errores de conexión:
1. Reinicia ambos servidores
2. Limpia la caché del navegador móvil
3. Prueba en modo incógnito

## 📱 URLs Importantes

- **Frontend (tu app)**: http://192.168.1.142:3000
- **Backend (API)**: http://192.168.1.142:5000
- **Imágenes**: http://192.168.1.142:5000/uploads/

## 🎯 Funciones a Probar en Móvil

✅ **Carga de imágenes desde galería**
✅ **Tomar foto directamente**
✅ **Detección de ingredientes**
✅ **Generación de recetas**
✅ **Planificador semanal**
✅ **Navegación responsive**
✅ **Drag & drop en táctil**

¡Disfruta probando tu aplicación en móvil! 📱✨