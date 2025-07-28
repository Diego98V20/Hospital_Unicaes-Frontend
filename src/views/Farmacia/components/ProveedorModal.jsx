import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';

const ProveedorModal = ({ show, onHide, proveedor, onGuardar }) => {
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    persona_contacto: '',
    telefono: '',
    correo: '',
    direccion: '',
    ruc: ''
  });
  
  // Estado para mensajes de error personalizados
  const [errors, setErrors] = useState({});
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  // Actualizar formulario cuando se selecciona un proveedor para editar
  useEffect(() => {
    if (proveedor) {
      setFormData({
        nombre: proveedor.nombre || '',
        persona_contacto: proveedor.persona_contacto || '',
        telefono: proveedor.telefono || '',
        correo: proveedor.correo || '',
        direccion: proveedor.direccion || '',
        ruc: proveedor.ruc || ''
      });
    } else {
      // Resetear formulario
      setFormData({
        nombre: '',
        persona_contacto: '',
        telefono: '',
        correo: '',
        direccion: '',
        ruc: ''
      });
    }
    // Limpiar validación y errores
    setValidated(false);
    setErrors({});
    setShowErrorAlert(false);
  }, [proveedor, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error específico al editar el campo
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    // Validar nombre (obligatorio)
    if (!formData.nombre || formData.nombre.trim() === '') {
      newErrors.nombre = 'El nombre del proveedor es obligatorio.';
      isValid = false;
    }
    
    // Validar formato de correo electrónico si se ha proporcionado
    if (formData.correo && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.correo)) {
      newErrors.correo = 'Formato de correo electrónico inválido.';
      isValid = false;
    }
    
    // Validar formato de teléfono si se ha proporcionado
    if (formData.telefono && !/^[0-9\-\(\)\s\+]{7,15}$/.test(formData.telefono)) {
      newErrors.telefono = 'Formato de teléfono inválido. Use solo números, guiones y paréntesis.';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // Marcar como validado para mostrar los mensajes de error de Bootstrap
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
    <Modal show={show} onHide={onHide} backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {proveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {showErrorAlert && (
          <Alert variant="danger" className="mb-3">
            Por favor corrija los errores en el formulario antes de continuar.
          </Alert>
        )}
        
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="proveedorNombre">
                <Form.Label>Nombre del Proveedor <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej. Distribuidora Farmacéutica S.A."
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  isInvalid={validated && errors.nombre}
                  className={errors.nombre ? 'border-danger' : ''}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.nombre || 'El nombre del proveedor es obligatorio.'}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="proveedorPersonaContacto">
                <Form.Label>Persona de Contacto</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  name="persona_contacto"
                  value={formData.persona_contacto}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="proveedorTelefono">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej. 2222-9999"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  isInvalid={validated && errors.telefono}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.telefono}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="proveedorCorreo">
                <Form.Label>Correo Electrónico</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Ej. contacto@proveedor.com"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  isInvalid={validated && errors.correo}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.correo || 'Ingrese un correo electrónico válido.'}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="proveedorRUC">
                <Form.Label>RUC / NIT</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej. 12345678-9"
                  name="ruc"
                  value={formData.ruc}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group controlId="proveedorDireccion" className="mb-3">
            <Form.Label>Dirección</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Ingrese la dirección completa del proveedor"
              name="direccion"
              value={formData.direccion}
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
          {proveedor ? 'Actualizar' : 'Guardar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProveedorModal;