import React, { useEffect, useState } from 'react';
import { obtenerSolicitudesPendientes } from '../../../services/rayosxService';
import './Paso1SeleccionarPaciente.css';

const Paso1SeleccionarPaciente = ({ formData, setFormData, onNext, reload }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerSolicitudesPendientes()
      .then(data => {
        setSolicitudes(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('❌ Error al obtener solicitudes pendientes:', err);
        setError('❌ No se pudieron cargar las solicitudes pendientes.');
      });
  }, [reload]); // ← vuelve a cargar cuando cambia

  const seleccionarSolicitud = (solicitud) => {
    if (!solicitud || !onNext) return;

    setFormData(prev => ({
      ...prev,
      id_rayos_x: solicitud.id_rayos_x,
      id_paciente: solicitud.id_paciente,
      id_tecnico: solicitud.id_tecnico,
      id_equipo: solicitud.id_equipo,
      tipo_estudio: solicitud.tipo_estudio,
      fecha_estudio: solicitud.fecha_estudio,
      estado: solicitud.estado || 'pendiente',
      observaciones_clinicas: solicitud.observaciones_clinicas || '',
      nombre_paciente: solicitud.nombre_paciente,
      apellido_paciente: solicitud.apellido_paciente,
      nombre_tecnico: solicitud.nombre_tecnico,
      apellido_tecnico: solicitud.apellido_tecnico,
      nombre_equipo: solicitud.nombre_equipo || solicitud.nombre,
    }));

    onNext();
  };

  const formatearFecha = (fecha) => {
    try {
      return new Date(fecha).toLocaleDateString('es-SV', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  return (
    <div className="paso1-container">
      <h3>📋 Seleccionar Solicitud Pendiente</h3>

      {error && <p className="paso1-error">{error}</p>}

      <table className="tabla-pacientes">
        <thead>
          <tr>
            <th>Expediente</th>
            <th>Paciente</th>
            <th>Fecha</th>
            <th>Tipo de Estudio</th>
            <th>Observaciones</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {solicitudes.length > 0 ? (
            solicitudes.map((s) => (
              <tr key={s.id_rayos_x}>
                <td>{s.n_expediente || '-'}</td>
                <td>{`${s.nombre_paciente || ''} ${s.apellido_paciente || ''}`}</td>
                <td>{formatearFecha(s.fecha_estudio)}</td>
                <td>{s.tipo_estudio}</td>
                <td>{s.observaciones_clinicas || 'Sin observaciones'}</td>
                <td>
                  <button className="btn-seleccionar" onClick={() => seleccionarSolicitud(s)}>
                    Seleccionar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No hay solicitudes pendientes.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Paso1SeleccionarPaciente;
