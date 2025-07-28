// dashboardService.js es para el modulo de farmacia especificamente par el Rol 'Jefe de Farmacia'

import { medicamentoService } from './medicamentoService';
import { stockService } from './stockService';
import { despachoService } from './despachoService';

export const dashboardService = {
  // Obtener todas las estadísticas del dashboard en una sola función
  obtenerEstadisticasCompletas: async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      // Ejecutar todas las consultas en paralelo
      const [
        // Datos de inventario
        medicamentos,
        stockBajo,
        proximosVencer, // Cambiado a 90 días
        lotesAgotados,
        
        // Datos de despacho
        recetasPendientes,
        despachosHoy,
        despachosParciales,
        despachosCancelados,
        ultimosDespachos
      ] = await Promise.all([
        // Llamadas para inventario (usando tus servicios existentes)
        medicamentoService.listarMedicamentos(),
        medicamentoService.verificarStockBajo(),
        stockService.verificarStockProximoVencer(90), // 90 días como pediste
        stockService.listarLotesAgotados(),
        
        // Llamadas para despacho (usando tus servicios existentes)
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

      // Procesar y estructurar los datos
      return {
        // Métricas de inventario
        totalMedicamentos: medicamentos.data?.length || 0,
        medicamentosStockBajo: stockBajo.data?.length || 0,
        lotesProximosVencer: proximosVencer.data?.length || 0,
        medicamentosAgotados: medicamentos.data?.filter(m => (m.stock_actual || 0) === 0).length || 0,
        
        // Métricas de despacho
        recetasPendientes: (recetasPendientes.data || []).length,
        despachosHoy: (despachosHoy.data || []).length,
        despachosParciales: (despachosParciales.data || []).length,
        despachosCancelados: (despachosCancelados.data || []).length,
        
        // Datos para tablas (primeros 5 registros)
        medicamentosStockBajoDetalle: (stockBajo.data || []).slice(0, 5),
        proximosVencimientos: (proximosVencer.data || []).slice(0, 5),
        ultimasRecetas: (recetasPendientes.data || []).slice(0, 5),
        ultimosDespachos: ultimosDespachos.data || []
      };
    } catch (error) {
      console.error('Error al obtener estadísticas completas del dashboard:', error);
      throw error;
    }
  }
};