import React from 'react';
import './Paso4Confirmacion.css';

const Paso4Confirmacion = ({ formData, onBack, onNext }) => {
  const formatearFecha = (fecha) => {
    return fecha ? new Date(fecha).toLocaleDateString('es-SV') : '—';
  };

  return (
    <div className="confirmacion-contenedor">
      <h3>✅ Confirmación</h3>

      <div className="datos-resumen">
        <p><strong>Paciente:</strong> {formData.nombre_paciente} {formData.apellido_paciente}</p>
        <p><strong>Técnico:</strong> {formData.nombre_tecnico} {formData.apellido_tecnico}</p>
        <p><strong>Equipo:</strong> {formData.nombre_equipo}</p>
        <p><strong>Fecha:</strong> {formatearFecha(formData.fecha_estudio)}</p>
        <p><strong>Tipo de Estudio:</strong> {formData.tipo_estudio}</p>
        <p><strong>Estado:</strong> {formData.estado}</p>
      </div>

      <div className="wizard-buttons">
        <button className="btn-secondary" onClick={onBack}>Atrás</button>
        <button className="btn-primary" onClick={onNext}>Confirmar</button>
      </div>
    </div>
  );
};

export default Paso4Confirmacion;