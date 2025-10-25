import React, { useState, useEffect } from 'react';

const NetworkDiagnostic = () => {
  const [diagnostics, setDiagnostics] = useState({
    hostname: window.location.hostname,
    port: window.location.port,
    protocol: window.location.protocol,
    apiUrl: '',
    backendStatus: 'checking...',
    authStatus: 'checking...',
    token: null,
    user: null,
    error: null,
    logs: []
  });

  const addLog = (message) => {
    setDiagnostics(prev => ({
      ...prev,
      logs: [...prev.logs, `${new Date().toLocaleTimeString()}: ${message}`]
    }));
  };

  useEffect(() => {
    const runDiagnostics = async () => {
      addLog('🔍 Iniciando diagnósticos...');
      
      // Verificar token y usuario
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      setDiagnostics(prev => ({
        ...prev,
        token: token ? 'Presente' : 'Ausente',
        user: user ? JSON.parse(user) : null
      }));

      addLog(`🔑 Token: ${token ? 'Presente' : 'Ausente'}`);
      addLog(`👤 Usuario: ${user ? 'Presente' : 'Ausente'}`);

      // Test 1: Conectividad básica
      try {
        addLog('🌐 Probando conectividad básica...');
        const testUrl = `${window.location.protocol}//${window.location.hostname}:5000/api/test`;
        const response = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          await response.json(); // Leer respuesta pero no almacenar
          addLog('✅ Conectividad básica: OK');
          setDiagnostics(prev => ({
            ...prev,
            backendStatus: '✅ Conectado',
            apiUrl: `${window.location.protocol}//${window.location.hostname}:5000/api`
          }));
        } else {
          addLog(`❌ Conectividad básica: Error ${response.status}`);
          setDiagnostics(prev => ({
            ...prev,
            backendStatus: '❌ Error de respuesta',
            error: `Status: ${response.status}`
          }));
        }
      } catch (error) {
        addLog(`❌ Conectividad básica: ${error.message}`);
        setDiagnostics(prev => ({
          ...prev,
          backendStatus: '❌ Sin conexión',
          error: error.message,
          apiUrl: `${window.location.protocol}//${window.location.hostname}:5000/api`
        }));
      }

      // Test 2: Autenticación
      if (token) {
        try {
          addLog('🔐 Probando autenticación...');
          const authResponse = await fetch(`${window.location.protocol}//${window.location.hostname}:5000/api/weekly-menus/current`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (authResponse.ok) {
            addLog('✅ Autenticación: OK');
            setDiagnostics(prev => ({
              ...prev,
              authStatus: '✅ Válida'
            }));
          } else {
            addLog(`❌ Autenticación: Error ${authResponse.status}`);
            setDiagnostics(prev => ({
              ...prev,
              authStatus: '❌ Inválida',
              error: `Auth Status: ${authResponse.status}`
            }));
          }
        } catch (error) {
          addLog(`❌ Autenticación: ${error.message}`);
          setDiagnostics(prev => ({
            ...prev,
            authStatus: '❌ Error',
            error: error.message
          }));
        }
      } else {
        setDiagnostics(prev => ({
          ...prev,
          authStatus: '⚠️ No hay token'
        }));
      }

      addLog('🏁 Diagnósticos completados');
    };

    runDiagnostics();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', background: '#f5f5f5', margin: '20px' }}>
      <h2>🔍 Diagnóstico de Red</h2>
      
      <div style={{ background: 'white', padding: '15px', margin: '10px 0', borderRadius: '8px' }}>
        <h3>📍 Información de Conexión</h3>
        <p><strong>Hostname:</strong> {diagnostics.hostname}</p>
        <p><strong>Puerto Frontend:</strong> {diagnostics.port || '3000'}</p>
        <p><strong>Protocolo:</strong> {diagnostics.protocol}</p>
        <p><strong>URL API:</strong> {diagnostics.apiUrl}</p>
      </div>

      <div style={{ background: 'white', padding: '15px', margin: '10px 0', borderRadius: '8px' }}>
        <h3>🔗 Estado del Backend</h3>
        <p><strong>Estado:</strong> {diagnostics.backendStatus}</p>
        {diagnostics.error && (
          <p><strong>Error:</strong> <span style={{ color: 'red' }}>{diagnostics.error}</span></p>
        )}
      </div>

      <div style={{ background: 'white', padding: '15px', margin: '10px 0', borderRadius: '8px' }}>
        <h3>🔐 Estado de Autenticación</h3>
        <p><strong>Estado:</strong> {diagnostics.authStatus}</p>
        <p><strong>Token:</strong> {diagnostics.token}</p>
        {diagnostics.user && (
          <div>
            <p><strong>Usuario:</strong> {diagnostics.user.name} ({diagnostics.user.email})</p>
          </div>
        )}
      </div>

      <div style={{ background: 'white', padding: '15px', margin: '10px 0', borderRadius: '8px' }}>
        <h3>📝 Logs de Diagnóstico</h3>
        <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '4px', maxHeight: '200px', overflow: 'auto' }}>
          {diagnostics.logs.map((log, index) => (
            <div key={index} style={{ fontSize: '12px', marginBottom: '2px' }}>
              {log}
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#e3f2fd', padding: '15px', margin: '10px 0', borderRadius: '8px' }}>
        <h3>💡 Instrucciones</h3>
        <p>1. Asegúrate de que el backend esté ejecutándose en puerto 5000</p>
        <p>2. Verifica que estés en la misma red WiFi</p>
        <p>3. La IP debe ser: 192.168.1.142</p>
        <p>4. Si ves ✅ Conectado, puedes proceder a iniciar sesión</p>
        <p>5. Si hay errores 401, el token ha expirado - haz logout y login nuevamente</p>
        <p>6. Si hay errores 404, verifica que las rutas del backend estén correctas</p>
      </div>
    </div>
  );
};

export default NetworkDiagnostic;