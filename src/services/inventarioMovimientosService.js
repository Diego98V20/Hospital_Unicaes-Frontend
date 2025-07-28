import axios from 'axios';

const baseUrl = 'http://localhost:8081/inventario-movimientos';

export const inventarioMovimientosService = {
  obtenerMovimientosPorMedicamento: async (idMedicamento) => {
    try {
      const response = await axios.get(`${baseUrl}/medicamento/${idMedicamento}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener el historial de movimientos del medicamento:', error);
      throw error;
    }
  },

  obtenerMovimientosPorLote: async (idStock) => {
    try {
      const response = await axios.get(`${baseUrl}/lote/${idStock}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener el historial de movimientos del lote:', error);
      throw error;
    }
  }
};