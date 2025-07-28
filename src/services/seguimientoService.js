import axios from 'axios';

const baseUrl = 'http://localhost:8081/seguimiento';

export const seguimientoService = {
      //Seguimiento consultas
  getSeguimientoConsulta: async (id_consulta) => {
        try {
            const response = await axios.get(`http://localhost:8081/seguimiento/seguimiento-consulta/${id_consulta}`, {
            withCredentials: true
            });

            return response.data;
        } catch (error) {
            console.error("Error al obtener el Seguimiento:", error);
            throw error;
        }
    },   
    //Seguimiento por Paciente
    getSeguimientoPaciente: async (id_paciente) => {
        try {
            const response = axios.get(`http://localhost:8081/seguimiento/seguimiento-paciente/${id_paciente}`, {
            withCredentials: true
            });

            return response.data;
        } catch (error) {
            console.error("Error al obtener el Seguimiento:", error);
            throw error;
        }
    }  
}
