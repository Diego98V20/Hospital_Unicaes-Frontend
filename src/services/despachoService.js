import axios from 'axios';

const baseUrl = 'http://localhost:8081/despacho';

export const despachoService = {
  listarRecetasPendientes: async () => {
    try {
      const response = await axios.get(`${baseUrl}/recetas-pendientes`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener recetas pendientes:', error);
      throw error;
    }
  },

  obtenerDetalleReceta: async (idReceta) => {
    try {
      const response = await axios.get(`${baseUrl}/receta/${idReceta}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener detalle de receta:', error);
      throw error;
    }
  },

  // Nuevo método para obtener información completa de la receta
  obtenerInformacionCompletaReceta: async (idReceta) => {
    try {
      const response = await axios.get(`${baseUrl}/receta-completa/${idReceta}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener información completa de receta:', error);
      throw error;
    }
  },

  obtenerLotesDisponibles: async (idMedicamento) => {
    try {
      const response = await axios.get(`${baseUrl}/lotes-disponibles/${idMedicamento}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener lotes disponibles:', error);
      throw error;
    }
  },

  realizarDespacho: async (despachoData) => {
    try {
      const response = await axios.post(`${baseUrl}/realizar`, despachoData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al realizar despacho:', error);
      throw error;
    }
  },

  cancelarDespacho: async (cancelacionData) => {
    try {
      const response = await axios.post(`${baseUrl}/cancelar`, cancelacionData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al cancelar despacho:', error);
      throw error;
    }
  },

  listarHistorialDespachos: async (page = 1, limit = 10, filtros = {}) => {
    try {
      const params = { page, limit, ...filtros };
      const response = await axios.get(`${baseUrl}/historial`, {
        params,
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener historial de despachos:', error);
      throw error;
    }
  },

  obtenerDetalleDespacho: async (idDespacho) => {
    try {
      const response = await axios.get(`${baseUrl}/detalle/${idDespacho}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener detalle de despacho:', error);
      throw error;
    }
  }

};



export const dashboardService = {
  obtenerEstadisticasDashboard: async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      // Ejecutar todas las consultas en paralelo
      const [
        recetasPendientes,
        despachosHoy,
        despachosParciales,
        despachosCancelados,
        ultimosDespachos
      ] = await Promise.all([
        despachoService.listarRecetasPendientes(),
        despachoService.listarHistorialDespachos(1, 100, {
          fechaInicio: today,
          fechaFin: today
        }),
        despachoService.listarHistorialDespachos(1, 100, {
          estado: 'parcial',
          fechaInicio: firstDayOfMonth,
          fechaFin: today
        }),
        despachoService.listarHistorialDespachos(1, 100, {
          estado: 'cancelado',
          fechaInicio: firstDayOfMonth,
          fechaFin: today
        }),
        despachoService.listarHistorialDespachos(1, 5)
      ]);

      return {
        recetasPendientes: (recetasPendientes.data || []).length,
        despachosHoy: (despachosHoy.data || []).length,
        despachosParciales: (despachosParciales.data || []).length,
        despachosCancelados: (despachosCancelados.data || []).length,
        ultimasRecetas: (recetasPendientes.data || []).slice(0, 5),
        ultimosDespachos: ultimosDespachos.data || []
      };
    } catch (error) {
      console.error('Error al obtener estadísticas del dashboard:', error);
      throw error;
    }
  },

  // Obtener resumen de despachos por período
  obtenerResumenDespachos: async (fechaInicio, fechaFin) => {
    try {
      const response = await axios.get(`${baseUrl}/resumen-despachos`, {
        params: { fechaInicio, fechaFin },
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener resumen de despachos:', error);
      throw error;
    }
  },

  // Obtener métricas de rendimiento del despachador
  obtenerMetricasRendimiento: async (idUsuario = null, periodo = 'mes') => {
    try {
      const params = { periodo };
      if (idUsuario) params.idUsuario = idUsuario;

      const response = await axios.get(`${baseUrl}/metricas-rendimiento`, {
        params,
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener métricas de rendimiento:', error);
      throw error;
    }
  }
};