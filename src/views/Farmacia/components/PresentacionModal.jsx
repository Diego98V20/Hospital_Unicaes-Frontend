import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

const PresentacionModal = ({ show, onHide, presentacion, onGuardar }) => {
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState({
    nombre_presentacion: '',
    descripcion: '',
    estado: 'activo'
  });
  
  // Estado para errores personalizados
  const [errors, setErrors] = useState({});
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  // Actualizar formulario cuando se selecciona una presentación para editar
  useEffect(() => {
    if (show) {
      if (presentacion) {
        setFormData({
          nombre_presentacion: presentacion.nombre_presentacion || '',
          descripcion: presentacion.descripcion || '',
          estado: presentacion.estado || 'activo'
        });
      } else {
        // Resetear formulario
        setFormData({
          nombre_presentacion: '',
          descripcion: '',
          estado: 'activo'
        });
      }
      setValidated(false);
      setErrors({});
      setShowErrorAlert(false);
    }
  }, [presentacion, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'radio' ? value : (type === 'checkbox' ? checked : value)
    });
    
    // Limpiar errores específicos cuando se edita un campo
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
      
      if (Object.keys(errors).length === 1) {
        setShowErrorAlert(false);
      }
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    // Validar nombre (obligatorio)
    if (!formData.nombre_presentacion || formData.nombre_presentacion.trim() === '') {
      newErrors.nombre_presentacion = 'El nombre de la presentación es obligatorio.';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // Marcar como validado para mostrar los mensajes de error
    setValidated(true);
    
    // Realizar validaciones personalizadas
    const isValid = validateForm();
    
    // Verificar validez del formulario
    if (form.checkValidity() === false || !isValid) {
      e.stopPropagation();
      setShowErrorAlert(true);
      return;
    }
    
    // Ocultar alerta si todo es válido
    setShowErrorAlert(false);
    
    // Enviar datos
    onGuardar(formData);
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {presentacion ? 'Editar Presentación' : 'Nueva Presentación'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {showErrorAlert && (
          <Alert variant="danger" className="mb-3">
            Por favor corrija los errores en el formulario antes de continuar.
          </Alert>
        )}
        
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="presentacionNombre">
            <Form.Label>Nombre de la Presentación <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej. Tableta, Jarabe, Inyectable, etc."
              name="nombre_presentacion"
              value={formData.nombre_presentacion}
              onChange={handleChange}
              required
              isInvalid={validated && (!!errors.nombre_presentacion || !formData.nombre_presentacion)}
              className={errors.nombre_presentacion ? 'border-danger' : ''}
            />
            <Form.Control.Feedback type="invalid">
              {errors.nombre_presentacion || 'El nombre de la presentación es obligatorio.'}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="presentacionDescripcion">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Descripción de la presentación (opcional)"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
            />
          </Form.Group>
          <div className="text-muted mb-3">
            <small>Los campos marcados con <span className="text-danger">*</span> son obligatorios</small>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {presentacion ? 'Actualizar' : 'Guardar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PresentacionModal;