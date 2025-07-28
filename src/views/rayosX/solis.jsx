import React, { useEffect, useState } from 'react';
import { useAuth } from "components/AuthContext";
import Paso6Informe from "./crear/Paso6Informe";
import { obtenerSolicitudesRayosX } from '../../services/rayosxService';
import './solis.css';

const SolisRayosX = () => {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [vista, setVista] = useState('recibidas'); // 'recibidas' o 'gestion'
  const [solicitudActiva, setSolicitudActiva] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const data = await obtenerSolicitudesRayosX(); // Única fuente de verdad
        setSolicitudes(data);
      } catch (err) {
        console.error('❌ Error al obtener solicitudes:', err);
      }
    };
    fetchData();
  }, [vista, user]);

  const abrirInforme = (solicitud) => {
    setSolicitudActiva(solicitud);
  };

  const cerrarInforme = () => {
    setSolicitudActiva(null);
  };

  const renderTabla = () => (
    <table className="rayosx-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Paciente</th>
          <th>Fecha Estudio</th>
          <th>Tipo Estudio</th>
          <th>Observaciones</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {solicitudes
          .filter((s) =>
            vista === 'recibidas'
              ? !s.estado || s.estado === 'pendiente'
              : s.estado === 'completado'
          )
          .map((s) => (
            <tr key={s.id_rayos_x}>
              <td>{s.id_rayos_x}</td>
              <td>{s.nombre_paciente} {s.apellido_paciente}</td>
              <td>{s.fecha_estudio?.split('T')[0]}</td>
              <td>{s.tipo_estudio}</td>
              <td>{s.observaciones_clinicas || 'Sin observaciones'}</td>
              <td>
                {vista === 'gestion' && (
                  <button className="btn btn-realizar" onClick={() => abrirInforme(s)}>
                    Realizar Estudio
                  </button>
                )}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );

  return (
    <div className="rayosx-container">
      <h2>📋 Módulo Técnico - Rayos X</h2>

      <div className="tabs">
        <button
          className={vista === 'recibidas' ? 'active' : ''}
          onClick={() => setVista('recibidas')}
        >
          Solicitudes Recibidas
        </button>
        <button
          className={vista === 'gestion' ? 'active' : ''}
          onClick={() => setVista('gestion')}
        >
          Gestión del Estudio
        </button>
      </div>

      {renderTabla()}

      {solicitudActiva && (
        <div className="modal-informe">
          <Paso6Informe
            idRayosX={solicitudActiva.id_rayos_x}
            onBack={cerrarInforme}
            onSubmitFinal={cerrarInforme}
          />
        </div>
      )}
    </div>
  );
};

export default SolisRayosX;