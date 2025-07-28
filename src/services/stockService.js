import axios from 'axios';

const baseUrl = 'http://localhost:8081/stock';

export const stockService = {
  listarStock: async () => {
    try {
      const response = await axios.get(`${baseUrl}/listar`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener el stock de medicamentos:', error);
      throw error;
    }
  },

  obtenerStockPorId: async (id) => {
    try {
      const response = await axios.get(`${baseUrl}/listar/${id}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener el stock:', error);
      throw error;
    }
  },

  obtenerStockPorMedicamento: async (idMedicamento) => {
    try {
      const response = await axios.get(`${baseUrl}/medicamento/${idMedicamento}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener el stock del medicamento:', error);
      throw error;
    }
  },

  crearStock: async (stockData) => {
    try {
      const response = await axios.post(`${baseUrl}/crear`, stockData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear el registro de stock:', error);
      throw error;
    }
  },

  actualizarStock: async (id, stockData) => {
    try {
      const response = await axios.put(`${baseUrl}/actualizar/${id}`, stockData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar el registro de stock:', error);
      throw error;
    }
  },

  cambiarEstadoStock: async (id, estado) => {
    try {
      const response = await axios.put(`${baseUrl}/cambiar-estado/${id}`, { estado }, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar el estado del stock:', error);
      throw error;
    }
  },

  verificarStockProximoVencer: async (dias = 90) => {
    try {
      const response = await axios.get(`${baseUrl}/proximos-vencer?dias=${dias}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al verificar el stock próximo a vencer:', error);
      throw error;
    }
  },

  listarLotesAgotados: async () => {
    try {
      const response = await axios.get(`${baseUrl}/lotes-agotados`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al listar los lotes agotados:', error);
      throw error;
    }
  },

  listarIngresosMedicamentos: async () => {
    try {
      const response = await axios.get(`${baseUrl}/ingresos`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al listar los ingresos de medicamentos:', error);
      throw error;
    }
  },
  listarLotesVencidos: async () => {
    try {
      const response = await axios.get(`${baseUrl}/lotes-vencidos`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al listar los lotes vencidos:', error);
      throw error;
    }
  }

};