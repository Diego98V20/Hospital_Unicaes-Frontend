import axios from 'axios';

const baseUrl = 'http://localhost:8081/medicamentos';

export const medicamentoService = {
  listarMedicamentos: async () => {
    try {
      const response = await axios.get(`${baseUrl}/listar`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener los medicamentos:', error);
      throw error;
    }
  },

  obtenerMedicamentoPorId: async (id) => {
    try {
      const response = await axios.get(`${baseUrl}/listar/${id}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener el medicamento:', error);
      throw error;
    }
  },

  crearMedicamento: async (medicamentoData) => {
    try {
      const response = await axios.post(`${baseUrl}/crear`, medicamentoData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear el medicamento:', error);
      throw error;
    }
  },

  actualizarMedicamento: async (id, medicamentoData) => {
    try {
      const response = await axios.put(`${baseUrl}/actualizar/${id}`, medicamentoData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar el medicamento:', error);
      throw error;
    }
  },

  desactivarMedicamento: async (id) => {
    try {
      const response = await axios.put(`${baseUrl}/desactivar/${id}`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al desactivar el medicamento:', error);
      throw error;
    }
  },

  verificarStockBajo: async () => {
    try {
      const response = await axios.get(`${baseUrl}/stock-bajo`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al verificar el stock bajo:', error);
      throw error;
    }
  },
};