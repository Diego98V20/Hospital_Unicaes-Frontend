import React from 'react';
import './Paso5Observaciones.css';

const Paso5Observaciones = ({ formData, setFormData, onSubmit, onBack }) => {
  const handleContinuar = () => {
    setFormData(prev => ({
      ...prev,
      observaciones_clinicas: formData.observaciones_clinicas || 'No hay observaciones clínicas registradas.'
    }));
    onSubmit();
  };

  return (
    <div className="wizard-step">
      <h3 className="title">📈 Observaciones Clínicas</h3>

      <div className="card-info">
        <strong>Tipo de Rayos X Seleccionado</strong>
        <p>{formData.tipo_estudio || 'No especificado'}</p>
      </div>

      <label className="label">Observaciones del médico</label>
      <textarea
        value={formData.observaciones_clinicas || 'No hay observaciones clínicas registradas.'}
        readOnly
        className="textarea readonly"
      />

      <div className="wizard-buttons">
        <button className="btn-secondary" onClick={onBack}>Atrás</button>
        <button className="btn-primary" onClick={handleContinuar}>Siguiente</button>
      </div>
    </div>
  );
};

export default Paso5Observaciones;
