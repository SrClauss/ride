import React from 'react';

const DebugPanel = () => {
  const [debugInfo, setDebugInfo] = React.useState<any>({});

  React.useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    const testApi = async () => {
      try {
        const response = await fetch('http://localhost:8000/dashboard/stats', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.text();
        
        setDebugInfo({
          hasToken: !!token,
          token: token ? token.substring(0, 20) + '...' : null,
          userData: userData ? JSON.parse(userData) : null,
          apiResponse: {
            status: response.status,
            statusText: response.statusText,
            data: data
          }
        });
      } catch (error) {
        setDebugInfo({
          hasToken: !!token,
          token: token ? token.substring(0, 20) + '...' : null,
          userData: userData ? JSON.parse(userData) : null,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    testApi();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 10, 
      right: 10, 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: 20, 
      borderRadius: 5, 
      maxWidth: 400,
      fontSize: 12,
      zIndex: 9999
    }}>
      <h3>Debug Info</h3>
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  );
};

export default DebugPanel;
