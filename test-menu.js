// Test simple para verificar la API de menús
const API_URL = 'http://localhost:5000/api';

// Simular token de usuario (debes reemplazar esto con un token real)
const testToken = 'Bearer YOUR_TOKEN_HERE';

async function testMenuAPI() {
  try {
    console.log('🧪 Iniciando prueba de API de menús...');
    
    // Test básico de conectividad
    const response = await fetch(`${API_URL}/weekly-menu/current`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': testToken
      }
    });
    
    console.log('📊 Estado de respuesta:', response.status);
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Respuesta exitosa:', data);
    } else {
      const errorData = await response.text();
      console.log('❌ Error en respuesta:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
}

// Para ejecutar en Node.js, necesitamos fetch
if (typeof fetch === 'undefined') {
  console.log('⚠️ Este script está diseñado para ejecutarse en el navegador');
  console.log('📝 Para probar, copia y pega el código en la consola del navegador');
} else {
  testMenuAPI();
}