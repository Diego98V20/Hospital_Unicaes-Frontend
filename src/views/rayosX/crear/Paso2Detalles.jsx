import React from 'react';
import './Paso2DetallesEstudio.css';

const Paso2DetallesEstudio = ({ formData, setFormData, onNext, onBack }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="paso2-container">
      <h3>📋 Detalles del Estudio</h3>

      <div className="campo-formulario">
        <label>Tipo de estudio:</label>
        <input
          type="text"
          name="tipo_estudio"
          value={formData.tipo_estudio || ''}
          onChange={handleChange}
          placeholder="Ej: Radiografía de tórax"
          className="editable-input"
        />
      </div>

      <div className="campo-formulario">
        <label>Estado:</label>
        <input
          type="text"
          name="estado"
          value={formData.estado || 'pendiente'}
          readOnly
          className="readonly-input"
        />
      </div>

      <div className="paso2-botones">
        <button className="btn-atras" onClick={onBack}>Atrás</button>
        <button className="btn-siguiente" onClick={onNext}>Siguiente</button>
      </div>
    </div>
  );
};

export default Paso2DetallesEstudio;