export default {
  server: {
    port: 5173,
    open: '/login.html',
    proxy: {
      '/api': 'http://192.168.178.36:8080'  
    }
  }
}
