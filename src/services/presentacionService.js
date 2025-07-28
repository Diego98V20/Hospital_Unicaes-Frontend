import axios from 'axios';

const baseUrl = 'http://localhost:8081/presentaciones-medicamento';

export const presentacionService = {
  listarPresentaciones: async () => {
    try {
      const response = await axios.get(`${baseUrl}/listar`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener las presentaciones de medicamentos:', error);
      throw error;
    }
  },

  obtenerPresentacionPorId: async (id) => {
    try {
      const response = await axios.get(`${baseUrl}/listar/${id}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener la presentación de medicamento:', error);
      throw error;
    }
  },

  crearPresentacion: async (presentacionData) => {
    try {
      const response = await axios.post(`${baseUrl}/crear`, presentacionData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear la presentación de medicamento:', error);
      throw error;
    }
  },

  actualizarPresentacion: async (id, presentacionData) => {
    try {
      const response = await axios.put(`${baseUrl}/actualizar/${id}`, presentacionData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar la presentación de medicamento:', error);
      throw error;
    }
  },

  desactivarPresentacion: async (id) => {
    try {
      const response = await axios.put(`${baseUrl}/desactivar/${id}`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al desactivar la presentación de medicamento:', error);
      throw error;
    }
  }
};