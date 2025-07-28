import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  obtenerSolicitudPorId,
  actualizarSolicitudRayosX,
  obtenerTecnicos,
  obtenerEquiposRayosX,
  buscarPacientes
} from '../../services/rayosxService';

const EditarSolicitud = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [tecnicos, setTecnicos] = useState([]);
  const [equipos, setEquipos] = useState([]);

  useEffect(() => {
    obtenerSolicitudPorId(id).then(setFormData);
    obtenerTecnicos().then(setTecnicos);
    obtenerEquiposRayosX().then(setEquipos);
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await actualizarSolicitudRayosX(id, formData);
    alert('✅ Solicitud actualizada');
    navigate('/hospital-unicaes/rayosx/solicitudes');
  };

  if (!formData) return <p>Cargando solicitud...</p>;

  return (
    <div className="container mt-4">
      <h2>Editar Solicitud de Rayos X</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Paciente (ID)</label>
          <input
            name="id_paciente"
            value={formData.id_paciente}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div>
          <label>Técnico</label>
          <select
            name="id_tecnico"
            value={formData.id_tecnico}
            onChange={handleChange}
            className="form-control"
          >
            {tecnicos.map((tec) => (
              <option key={tec.id_usuario} value={tec.id_usuario}>
                {tec.nombre} {tec.apellido}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Equipo</label>
          <select
            name="id_equipo"
            value={formData.id_equipo}
            onChange={handleChange}
            className="form-control"
          >
            {equipos.map((eq) => (
              <option key={eq.id_equipo} value={eq.id_equipo}>
                {eq.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Fecha de Estudio</label>
          <input
            type="date"
            name="fecha_estudio"
            value={formData.fecha_estudio?.split('T')[0]}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div>
          <label>Tipo de Estudio</label>
          <input
            name="tipo_estudio"
            value={formData.tipo_estudio}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div>
          <label>Estado</label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="form-control"
          >
            <option value="pendiente">Pendiente</option>
            <option value="completado">Completado</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary mt-3">Guardar cambios</button>
      </form>
    </div>
  );
};

export default EditarSolicitud;