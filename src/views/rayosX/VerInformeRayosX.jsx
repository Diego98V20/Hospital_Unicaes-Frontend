import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './verInforme.css';

const VerInformeRayosX = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [informe, setInforme] = useState(null);
  const [mostrarImagen, setMostrarImagen] = useState(false);

  useEffect(() => {
    const fetchInforme = async () => {
      try {
        const res = await axios.get(`http://localhost:8081/api/rayosx/${id}`);
        setInforme(res.data);
      } catch (err) {
        console.error('Error al obtener el informe:', err);
      }
    };

    fetchInforme();
  }, [id]);

  if (!informe) {
    return <div className="loading">Cargando informe...</div>;
  }

  return (
    <div className="informe-detalle-container">
      <h2>📝 Informe de Imagen</h2>
      <p><strong>Paciente:</strong> {informe.nombre_paciente} {informe.apellido_paciente}</p>
      <p><strong>Expediente:</strong> {informe.n_expediente}</p>
      <p><strong>Fecha del Estudio:</strong> {new Date(informe.fecha_estudio).toLocaleDateString('es-SV')}</p>
      <p><strong>Tipo de Estudio:</strong> {informe.tipo_estudio}</p>
      <p><strong>Observaciones Clínicas:</strong> {informe.observaciones_clinicas}</p>
      <p><strong>Equipo Utilizado:</strong> {informe.nombre_equipo}</p>
      <p><strong>Técnico:</strong> {informe.nombre_tecnico} {informe.apellido_tecnico}</p>

      <hr />

      <h3>🩺 Diagnóstico</h3>
      <p>{informe.diagnostico || 'No disponible'}</p>

      <h3>📌 Recomendaciones</h3>
      <p>{informe.recomendaciones || 'No disponible'}</p>

      <h3>🖼 Imagen del estudio</h3>
      {informe.url_imagen ? (
        <>
          <img
            src={`http://localhost:8081${informe.url_imagen}`}
            alt="Radiografía"
            className="imagen-rayosx"
            onClick={() => setMostrarImagen(true)}
          />
          {mostrarImagen && (
            <div className="imagen-modal-overlay" onClick={() => setMostrarImagen(false)}>
              <img
                src={`http://localhost:8081${informe.url_imagen}`}
                alt="Radiografía grande"
                className="imagen-modal"
              />
            </div>
          )}
        </>
      ) : (
        <p>Imagen no disponible</p>
      )}

      <button className="btn-volver" onClick={() => navigate(-1)}>Volver</button>
    </div>
  );
};

export default VerInformeRayosX;
