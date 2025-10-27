export default {
  server: {
    port: 5173,
    open: '/login.html', // Öffnet automatisch die Login-Seite
    proxy: {
      '/api': 'http://192.168.178.36:8080'  
    }
  }
}
