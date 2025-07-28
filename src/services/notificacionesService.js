import axios from 'axios';

const baseUrl = 'http://localhost:8081/notificaciones';

export const notificacionesService = {
  obtenerNotificaciones: async () => {
    try {
      const response = await axios.get(baseUrl, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener las notificaciones:', error);
      throw error;
    }
  }
};