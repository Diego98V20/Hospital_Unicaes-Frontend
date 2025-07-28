import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import Select from 'react-select';

const LoteModal = ({ show, onHide, medicamentos = [], medicamentoPreseleccionado, onGuardar }) => {
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState({
    id_medicamento: '',
    numero_lote: '',
    fecha_fabricacion: '',
    fecha_caducidad: '',
    cantidad_disponible: '',
    tipo_ingreso: 'compra',
    precio_unitario: '',
    costo_unitario: '',
    observaciones: ''
  });
  
  // Estado para errores personalizados
  const [errors, setErrors] = useState({});
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showWarningAlert, setShowWarningAlert] = useState(true);
  
  // Opciones para el select de medicamentos
  const medicamentosOptions = medicamentos.map(med => ({
    value: med.id_medicamento,
    label: `${med.nombre} ${med.concentracion ? `(${med.concentracion})` : ''}`
  }));

  // Establecer medicamento preseleccionado (si se proporciona)
  useEffect(() => {
    if (show) {
      if (medicamentoPreseleccionado) {
        setFormData(prev => ({
          ...prev,
          id_medicamento: medicamentoPreseleccionado.id_medicamento
        }));
      } else {
        // Resetear formulario al abrir modal sin medicamento preseleccionado
        setFormData({
          id_medicamento: '',
          numero_lote: '',
          fecha_fabricacion: '',
          fecha_caducidad: '',
          cantidad_disponible: '',
          tipo_ingreso: 'compra',
          precio_unitario: '',
          costo_unitario: '',
          observaciones: ''
        });
      }
      setValidated(false);
      setErrors({});
      setShowErrorAlert(false);
      setShowWarningAlert(true);
    }
  }, [show, medicamentoPreseleccionado]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Para campos numéricos, asegurarse de que no se guarde NaN
    if (type === 'number') {
      // Si el valor está vacío o no es un número válido, guardarlo como string vacío
      const numValue = value === '' ? '' : parseFloat(value);
      
      // Verificar si el valor es un número válido
      if (!isNaN(numValue)) {
        setFormData({
          ...formData,
          [name]: numValue
        });
      } else {
        setFormData({
          ...formData,
          [name]: ''
        });
      }
    } else {
      // Para campos no numéricos
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Limpiar errores específicos cuando se edita un campo
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const handleSelectChange = (selectedOption) => {
    setFormData({
      ...formData,
      id_medicamento: selectedOption ? selectedOption.value : ''
    });
    
    // Limpiar error de medicamento si existe
    if (errors.id_medicamento) {
      setErrors({
        ...errors,
        id_medicamento: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validar medicamento (obligatorio)
    if (!formData.id_medicamento) {
      newErrors.id_medicamento = 'La selección de un medicamento es obligatoria.';
      isValid = false;
    }

    // Validar número de lote (obligatorio)
    if (!formData.numero_lote || formData.numero_lote.trim() === '') {
      newErrors.numero_lote = 'El número de lote es obligatorio.';
      isValid = false;
    }

    // Validar fecha de fabricación (obligatorio)
    if (!formData.fecha_fabricacion) {
      newErrors.fecha_fabricacion = 'La fecha de fabricación es obligatoria.';
      isValid = false;
    }

    // Validar fecha de caducidad (obligatorio)
    if (!formData.fecha_caducidad) {
      newErrors.fecha_caducidad = 'La fecha de caducidad es obligatoria.';
      isValid = false;
    } else if (formData.fecha_fabricacion) {
      // Validar que la fecha de caducidad sea mayor que la de fabricación
      const fechaFabricacion = new Date(formData.fecha_fabricacion);
      const fechaCaducidad = new Date(formData.fecha_caducidad);
      
      if (fechaCaducidad <= fechaFabricacion) {
        newErrors.fecha_caducidad = 'La fecha de caducidad debe ser posterior a la fecha de fabricación.';
        isValid = false;
      }
    }

    // Validar cantidad (obligatorio y mayor a 0)
    const cantidad = parseFloat(formData.cantidad_disponible);
    if (formData.cantidad_disponible === '' || isNaN(cantidad) || cantidad <= 0) {
      newErrors.cantidad_disponible = 'La cantidad debe ser mayor a 0.';
      isValid = false;
    }
    
    // Si es una compra, validar que el precio y costo unitario sean mayores a 0
    if (formData.tipo_ingreso === 'compra') {
      const precioUnitario = parseFloat(formData.precio_unitario);
      if (formData.precio_unitario === '' || isNaN(precioUnitario) || precioUnitario <= 0) {
        newErrors.precio_unitario = 'El precio unitario debe ser mayor a 0 para una compra.';
        isValid = false;
      }
      
      const costoUnitario = parseFloat(formData.costo_unitario);
      if (formData.costo_unitario === '' || isNaN(costoUnitario) || costoUnitario <= 0) {
        newErrors.costo_unitario = 'El costo unitario debe ser mayor a 0 para una compra.';
        isValid = false;
      }
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
    
    // Confirmar si está seguro antes de guardar
    if (window.confirm(
      "IMPORTANTE: Por motivos de integridad de datos, una vez ingresada esta información NO PODRÁ SER MODIFICADA. " +
      "Por favor, verifique cuidadosamente toda la información, especialmente el medicamento, número de lote, fechas y cantidad. " +
      "¿Está seguro de que todos los datos son correctos?"
    )) {
      // Ocultar alerta si todo es válido
      setShowErrorAlert(false);
      
      // Enviar datos
      onGuardar(formData);
    }
  };

  // Calcular fecha mínima (hoy) para fecha de fabricación
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Nuevo Lote</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Alerta de advertencia para datos que no se pueden modificar */}
        {showWarningAlert && (
          <Alert 
            variant="warning" 
            className="mb-3" 
            dismissible 
            onClose={() => setShowWarningAlert(false)}
          >
            <Alert.Heading>¡Importante! Información no modificable</Alert.Heading>
            <p className="mb-0">
              Por motivos de integridad de datos, una vez guardado este registro <strong>NO PODRÁ SER MODIFICADO</strong>.
              Verifique cuidadosamente toda la información, especialmente el medicamento, número de lote, fechas y cantidad antes de guardar.
            </p>
          </Alert>
        )}
        
        {/* Alerta de errores de validación */}
        {showErrorAlert && (
          <Alert variant="danger" className="mb-3">
            Por favor corrija los errores en el formulario antes de continuar.
          </Alert>
        )}
        
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="loteMedicamento">
                <Form.Label>Medicamento <span className="text-danger">*</span></Form.Label>
                <Select
                  options={medicamentosOptions}
                  placeholder="Seleccione un medicamento"
                  onChange={handleSelectChange}
                  value={medicamentosOptions.find(option => option.value === formData.id_medicamento)}
                  isDisabled={medicamentoPreseleccionado !== null}
                  isClearable
                  className={errors.id_medicamento ? 'is-invalid' : ''}
                />
                {errors.id_medicamento && <div className="text-danger">{errors.id_medicamento}</div>}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="loteNumero">
                <Form.Label>Número de Lote <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej. LOT-A12345"
                  name="numero_lote"
                  value={formData.numero_lote}
                  onChange={handleChange}
                  required
                  isInvalid={validated && (!!errors.numero_lote || !formData.numero_lote)}
                  className={errors.numero_lote ? 'border-danger' : ''}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.numero_lote || 'El número de lote es obligatorio.'}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="loteFechaFabricacion">
                <Form.Label>Fecha de Fabricación <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_fabricacion"
                  value={formData.fecha_fabricacion}
                  onChange={handleChange}
                  max={today}
                  required
                  isInvalid={validated && (!!errors.fecha_fabricacion || !formData.fecha_fabricacion)}
                  className={errors.fecha_fabricacion ? 'border-danger' : ''}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.fecha_fabricacion || 'La fecha de fabricación es obligatoria y no puede ser futura.'}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="loteFechaCaducidad">
                <Form.Label>Fecha de Caducidad <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_caducidad"
                  value={formData.fecha_caducidad}
                  onChange={handleChange}
                  min={formData.fecha_fabricacion || today}
                  required
                  isInvalid={validated && (!!errors.fecha_caducidad || !formData.fecha_caducidad)}
                  className={errors.fecha_caducidad ? 'border-danger' : ''}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.fecha_caducidad || 'La fecha de caducidad es obligatoria y debe ser posterior a la fecha de fabricación.'}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="loteCantidad">
                <Form.Label>Cantidad<span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="number"
                  name="cantidad_disponible"
                  value={formData.cantidad_disponible}
                  onChange={handleChange}
                  min="1"
                  required
                  isInvalid={validated && (!!errors.cantidad_disponible || formData.cantidad_disponible <= 0)}
                  className={errors.cantidad_disponible ? 'border-danger' : ''}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.cantidad_disponible || 'La cantidad inicial debe ser mayor a 0.'}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="loteTipoIngreso">
                <Form.Label>Tipo de Ingreso</Form.Label>
                <Form.Select
                  name="tipo_ingreso"
                  value={formData.tipo_ingreso}
                  onChange={handleChange}
                  required
                >
                  <option value="compra">Compra</option>
                  <option value="donacion">Donación</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="lotePrecioUnitario">
                <Form.Label>{formData.tipo_ingreso === 'compra' && <span className="text-danger">*</span>} Precio Unitario ($)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="precio_unitario"
                  value={formData.precio_unitario}
                  onChange={handleChange}
                  min="0"
                  required={formData.tipo_ingreso === 'compra'}
                  disabled={formData.tipo_ingreso === 'donacion'}
                  isInvalid={validated && !!errors.precio_unitario}
                  className={errors.precio_unitario ? 'border-danger' : ''}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.precio_unitario || 'El precio unitario es obligatorio para una compra.'}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Precio sin costos adicionales.
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="loteCostoUnitario">
                <Form.Label>{formData.tipo_ingreso === 'compra' && <span className="text-danger">*</span>} Costo Unitario ($)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="costo_unitario"
                  value={formData.costo_unitario}
                  onChange={handleChange}
                  min="0"
                  required={formData.tipo_ingreso === 'compra'}
                  disabled={formData.tipo_ingreso === 'donacion'}
                  isInvalid={validated && !!errors.costo_unitario}
                  className={errors.costo_unitario ? 'border-danger' : ''}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.costo_unitario || 'El costo unitario es obligatorio para una compra.'}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Precio total incluyendo transporte, impuestos, etc.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group controlId="loteObservaciones" className="mb-3">
            <Form.Label>Observaciones</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Ingrese cualquier información adicional relevante..."
              name="observaciones"
              value={formData.observaciones}
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
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LoteModal;