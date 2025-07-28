import axios from 'axios';

const baseUrl = 'http://localhost:8081/plantillas-examen';

// ========================================
// SERVICIOS PARA PLANTILLAS
// ========================================

export const plantillaExamenService = {
    // Crear nueva plantilla
    crearPlantilla: async (plantillaData) => {
        try {
            const response = await axios.post(`${baseUrl}/crear`, plantillaData, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al crear plantilla:', error);
            throw error;
        }
    },

    // Listar todas las plantillas
    listarTodasPlantillas: async () => {
        try {
            const response = await axios.get(`${baseUrl}/listar`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al listar plantillas:', error);
            throw error;
        }
    },

    // Listar plantillas por tipo de examen
    listarPlantillasPorTipo: async (id_tipo_examen) => {
        try {
            const response = await axios.get(`${baseUrl}/tipo/${id_tipo_examen}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al listar plantillas por tipo:', error);
            throw error;
        }
    },

    // Obtener plantilla completa
    obtenerPlantillaCompleta: async (id_plantilla) => {
        try {
            const response = await axios.get(`${baseUrl}/${id_plantilla}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener plantilla completa:', error);
            throw error;
        }
    },

    // Actualizar plantilla
    actualizarPlantilla: async (id_plantilla, plantillaData) => {
        try {
            const response = await axios.put(`${baseUrl}/${id_plantilla}`, plantillaData, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al actualizar plantilla:', error);
            throw error;
        }
    },

    // Desactivar plantilla
    desactivarPlantilla: async (id_plantilla) => {
        try {
            const response = await axios.delete(`${baseUrl}/${id_plantilla}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al desactivar plantilla:', error);
            throw error;
        }
    },

    // Duplicar plantilla
    duplicarPlantilla: async (id_plantilla, nuevosdatos) => {
        try {
            const response = await axios.post(`${baseUrl}/${id_plantilla}/duplicar`, nuevosData, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al duplicar plantilla:', error);
            throw error;
        }
    },

    // Validar plantilla
    validarPlantilla: async (id_plantilla) => {
        try {
            const response = await axios.get(`${baseUrl}/${id_plantilla}/validar`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al validar plantilla:', error);
            throw error;
        }
    },

    // Buscar plantillas
    buscarPlantillas: async (termino) => {
        try {
            const response = await axios.get(`${baseUrl}/buscar/query?q=${encodeURIComponent(termino)}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al buscar plantillas:', error);
            throw error;
        }
    }
};

// ========================================
// SERVICIOS PARA PARÁMETROS
// ========================================

export const plantillaParametroService = {
    // Agregar parámetro
    agregarParametro: async (id_plantilla, parametroData) => {
        try {
            const response = await axios.post(`${baseUrl}/${id_plantilla}/parametros`, parametroData, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al agregar parámetro:', error);
            throw error;
        }
    },

    // Actualizar parámetro
    actualizarParametro: async (id_plantilla_parametro, parametroData) => {
        try {
            const response = await axios.put(`${baseUrl}/parametros/${id_plantilla_parametro}`, parametroData, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al actualizar parámetro:', error);
            throw error;
        }
    },

    // Eliminar parámetro
    eliminarParametro: async (id_plantilla_parametro) => {
        try {
            const response = await axios.delete(`${baseUrl}/parametros/${id_plantilla_parametro}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al eliminar parámetro:', error);
            throw error;
        }
    }
};

// ========================================
// SERVICIOS PARA USO EN EXÁMENES
// ========================================

export const plantillaUsoService = {
    // Crear resultados desde plantilla
    crearResultadosDesdeePlantilla: async (id_examen, id_plantilla) => {
        try {
            const response = await axios.post(`${baseUrl}/usar-plantilla`, {
                id_examen,
                id_plantilla
            }, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al crear resultados desde plantilla:', error);
            throw error;
        }
    }
};

// ========================================
// SERVICIOS AUXILIARES
// ========================================

export const plantillaUtilsService = {
    // Listar tipos de examen
    listarTiposExamen: async () => {
        try {
            const response = await axios.get(`${baseUrl}/utils/tipos-examen`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al listar tipos de examen:', error);
            throw error;
        }
    },

    // Contar plantillas por usuario
    contarPlantillasPorUsuario: async (id_usuario = null) => {
        try {
            const url = id_usuario 
                ? `${baseUrl}/stats/usuario/${id_usuario}`
                : `${baseUrl}/stats/usuario`;
            
            const response = await axios.get(url, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al contar plantillas por usuario:', error);
            throw error;
        }
    }
};

// ========================================
// SERVICIO INTEGRADO (Todo en uno)
// ========================================

export const plantillaCompleteService = {
    ...plantillaExamenService,
    ...plantillaParametroService,
    ...plantillaUsoService,
    ...plantillaUtilsService
};