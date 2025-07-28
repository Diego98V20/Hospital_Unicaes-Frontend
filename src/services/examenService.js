import axios from 'axios';

const baseUrl = 'http://localhost:8081/examenes';

export const listarExamenesPendientesService = {
    getExamenesPendientes: async () => {
        try {
            const response = await axios.get(`${baseUrl}/listar-pendientes`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener los exámenes pendientes:', error);
            throw error;
        }
    },
    marcarExamenComoInactivo: async (id_examen) => { 
        try {
            const response = await axios.put(`${baseUrl}/examen-inactivo/${id_examen}`, {}, { 
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al marcar el examen como inactivo:', error); // Mensaje de error correcto
            throw error;
        }
    }
};

export const pacientesConExamenService = {
    getPacientesConExamen: async () => {
        try {
            const response = await axios.get(`${baseUrl}/pacientes-con-examen`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener los pacientes con exámenes:', error);
            throw error;
        }
    },
};

export const historialExamenesPorPacienteService = {
    getHistorialExamenesPorPaciente: async (id_paciente) => {
        try {
            const response = await axios.get(`${baseUrl}/historial/${id_paciente}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener el historial de exámenes por paciente:', error);
            throw error;
        }
    },
};

export const mostrarResultadosExamenService = {
    getResultadosExamen: async (id_examen) => {
        try {
            const response = await axios.get(`${baseUrl}/resultados/${id_examen}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener los resultados del examen:', error);
            throw error;
        }
    },
    crearResultadoExamen: async (id_examen, nuevoResultado) => {
        try {
            const response = await axios.post(`${baseUrl}/resultados/${id_examen}`, nuevoResultado, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al crear el resultado del examen:', error);
            throw error;
        }
    },
    actualizarResultadoExamen: async (id_resultado, resultadoActualizado) => {
        try {
            const response = await axios.put(`${baseUrl}/resultados-editar/${id_resultado}`, resultadoActualizado, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al actualizar el resultado del examen:', error);
            throw error;
        }
    },
    eliminarResultadoExamen: async (id_resultado) => {
        try {
            const response = await axios.delete(`${baseUrl}/resultados-eliminar/${id_resultado}`,  {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al actualizar el estado del resultado del examen:', error);
            throw error;
        }
    },
    marcarExamenComoCompletadoService: async (id_examen) => {
        try {
            const response = await axios.put(`${baseUrl}/completar/${id_examen}`, {}, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al marcar el examen como completado:', error);
            throw error;
        }
    },
};

export const listarExamenesCompletadosService = {
    getExamenesCompletados: async () => {
        try {
            const response = await axios.get(`${baseUrl}/listar-completados`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener los exámenes completados:', error);
            throw error;
        }
    },
};

export const marcarPacienteComoInactivoService = {
    marcarPacienteComoInactivo: async (id_paciente) => {
        try {
            const response = await axios.put(`${baseUrl}/paciente-inactivo/${id_paciente}`, {}, { 
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al marcar el paciente como inactivo:', error); // Mensaje de error correcto
            throw error;
        }
    }
};


export const listarUltimosExamenesService = {
    getUltimosExamenes: async () => {
        try {
            const response = await axios.get(`${baseUrl}/listar-ultimos-examenes`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener los últimos exámenes:', error);
            throw error;
        }
    },
};

export const contarExamenesPendientesService = {
    contarExamenesPendientes: async () => {
        try {
            const response = await axios.get(`${baseUrl}/contar-examenes-pendientes`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al contar los exámenes pendientes:', error);
            throw error;
        }
    },
};

export const contarExamenesCompletadosService = {
    contarExamenesCompletados: async () => {
        try {
            const response = await axios.get(`${baseUrl}/contar-examenes-completados`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al contar los exámenes completados:', error);
            throw error;
        }
    },
};

export const contarPacientesConExamenService = {
    contarPacientesConExamen: async () => {
        try {
            const response = await axios.get(`${baseUrl}/pacientes-con-examen`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al contar los pacientes con exámenes:', error);
            throw error;
        }
    },
};

// ========== SERVICIOS PARA TIPOS DE EXAMEN ==========

export const tiposExamenService = {
    // Listar todos los tipos de examen
    listarTiposExamen: async () => {
        try {
            const response = await axios.get(`${baseUrl}/tipos-examen`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al listar tipos de examen:', error);
            throw error;
        }
    },

    // Obtener tipo de examen por ID
    obtenerTipoExamenPorId: async (id_tipo_examen) => {
        try {
            const response = await axios.get(`${baseUrl}/tipos-examen/${id_tipo_examen}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener tipo de examen:', error);
            throw error;
        }
    },

    // Crear nuevo tipo de examen
    crearTipoExamen: async (nuevoTipoExamen) => {
        try {
            const response = await axios.post(`${baseUrl}/tipos-examen`, nuevoTipoExamen, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al crear tipo de examen:', error);
            throw error;
        }
    },

    // Actualizar tipo de examen
    actualizarTipoExamen: async (id_tipo_examen, tipoExamenActualizado) => {
        try {
            const response = await axios.put(`${baseUrl}/tipos-examen/${id_tipo_examen}`, tipoExamenActualizado, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al actualizar tipo de examen:', error);
            throw error;
        }
    },

    // Eliminar tipo de examen
    eliminarTipoExamen: async (id_tipo_examen) => {
        try {
            const response = await axios.delete(`${baseUrl}/tipos-examen/${id_tipo_examen}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al eliminar tipo de examen:', error);
            throw error;
        }
    },

    // Contar plantillas por tipo
    contarPlantillasPorTipo: async (id_tipo_examen) => {
        try {
            const response = await axios.get(`${baseUrl}/tipos-examen/${id_tipo_examen}/plantillas-count`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al contar plantillas:', error);
            throw error;
        }
    }
};