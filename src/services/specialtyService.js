import axios from 'axios';

const baseUrl = 'http://localhost:8081/especialidades';

export const specialtyService = {
  getEspecialidades: async () => {
    try {
      const response = await axios.get(`${baseUrl}/listar`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener las epecialidades:', error);
      throw error;
    }
  },

  getEspecialidadById: async (id) => {
    try {
      const response = await axios.get(`${baseUrl}/listar/${id}`, {
        withCredentials: true
      });
      return response.data; // Devuelve directamente el objeto (o arreglo plano) desde el backend
    } catch (error) {
      console.error('Service: Error al obtener la especialidad:', error);
      throw error;
    }
  },

  createEspecialidad: async (esp_Data) => {
    try {
      const response = await axios.post(`${baseUrl}/registrar`, esp_Data, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('service: Error al agregar la especialidad:', error);
      throw error;
    }
  },

  updateEspecialidad: async (id, especialidadData) => {
    try {
      const response = await axios.put(`${baseUrl}/actualizar/${id}`, especialidadData, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('service: Error al actualizar la especialidad:', error);
      throw error;
    }
  },
  //crear fun para cambiar el estado esp
  changeStateEspecialidad: async (id) => {
    try {
      const response = await axios.put(`${baseUrl}/cambiar-estado/${id}`, {}, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('service: Error al cambiar el estado', error);
      throw error;
    }
  }
};
