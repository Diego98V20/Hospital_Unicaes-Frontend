import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { proveedorService } from '../../../services/proveedorService';
import Select from 'react-select';

const MedicamentoModal = ({ show, onHide, medicamento, categorias = [], presentaciones = [], onGuardar }) => {
  const [validated, setValidated] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    id_categoria: '',
    id_presentacion: '',
    id_proveedor: '',
    concentracion: '',
    unidad_medida: '',
    via_administracion: '',
    stock_minimo: 10,
    ubicacion_almacen: '',
    requiere_receta: false
  });
  
  // Estado para errores personalizados
  const [errors, setErrors] = useState({});
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  
  // Opciones para los selects
  const categoriasOptions = categorias.map(cat => ({
    value: cat.id_categoria,
    label: cat.nombre_categoria
  }));
  
  const presentacionesOptions = presentaciones.map(pres => ({
    value: pres.id_presentacion,
    label: pres.nombre_presentacion
  }));
  
  const proveedoresOptions = proveedores.map(prov => ({
    value: prov.id_proveedor,
    label: prov.nombre
  }));

  // Cargar proveedores al montar el componente
  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const response = await proveedorService.listarProveedores();
        setProveedores(response.data || []);
      } catch (error) {
        console.error("Error al cargar proveedores:", error);
        setProveedores([]); // Inicializa con array vacío en caso de error
      }
    };

    if (show) {
      fetchProveedores();
    }
  }, [show]);

  // Actualizar formulario cuando se selecciona un medicamento para editar
  useEffect(() => {
    if (show) {
      if (medicamento) {
        setFormData({
          codigo: medicamento.codigo || '',
          nombre: medicamento.nombre || '',
          descripcion: medicamento.descripcion || '',
          id_categoria: medicamento.id_categoria || '',
          id_presentacion: medicamento.id_presentacion || '',
          id_proveedor: medicamento.id_proveedor || '',
          concentracion: medicamento.concentracion || '',
          unidad_medida: medicamento.unidad_medida || '',
          via_administracion: medicamento.via_administracion || '',
          stock_minimo: medicamento.stock_minimo || 10,
          ubicacion_almacen: medicamento.ubicacion_almacen || '',
          requiere_receta: medicamento.requiere_receta || false
        });
      } else {
        // Resetear formulario
        setFormData({
          codigo: '',
          nombre: '',
          descripcion: '',
          id_categoria: '',
          id_presentacion: '',
          id_proveedor: '',
          concentracion: '',
          unidad_medida: '',
          via_administracion: '',
          stock_minimo: 10,
          ubicacion_almacen: '',
          requiere_receta: false
        });
      }
      setValidated(false);
      setErrors({});
      setShowErrorAlert(false);
    }
  }, [medicamento, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Limpiar errores específicos cuando se edita un campo
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const handleSelectChange = (selectedOption, field) => {
    setFormData({
      ...formData,
      [field]: selectedOption ? selectedOption.value : ''
    });
    
    // Limpiar error específico
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null
      });
    }
  };
  
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = value === '' ? '' : parseInt(value, 10);
    
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
    
    // Limpiar error específico
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

    // Validar código (obligatorio)
    if (!formData.codigo || formData.codigo.trim() === '') {
      newErrors.codigo = 'El código es obligatorio.';
      isValid = false;
    }

    // Validar nombre (obligatorio)
    if (!formData.nombre || formData.nombre.trim() === '') {
      newErrors.nombre = 'El nombre del medicamento es obligatorio.';
      isValid = false;
    }

    // Validar categoría (obligatorio)
    if (!formData.id_categoria) {
      newErrors.id_categoria = 'Debe seleccionar una categoría.';
      isValid = false;
    }

    // Validar presentación (obligatorio)
    if (!formData.id_presentacion) {
      newErrors.id_presentacion = 'Debe seleccionar una presentación.';
      isValid = false;
    }
    
    // Validar proveedor (obligatorio)
    if (!formData.id_proveedor) {
      newErrors.id_proveedor = 'Debe seleccionar un proveedor.';
      isValid = false;
    }
    
    // Validar concentración (obligatorio)
    if (!formData.concentracion || formData.concentracion.trim() === '') {
      newErrors.concentracion = 'La concentración es obligatoria.';
      isValid = false;
    }
    
    // Validar unidad de medida (obligatorio)
    if (!formData.unidad_medida || formData.unidad_medida.trim() === '') {
      newErrors.unidad_medida = 'La unidad de medida es obligatoria.';
      isValid = false;
    }
    
    // Validar vía de administración (obligatorio)
    if (!formData.via_administracion || formData.via_administracion.trim() === '') {
      newErrors.via_administracion = 'La vía de administración es obligatoria.';
      isValid = false;
    }
    
    // Validar stock mínimo (obligatorio y mayor a 0)
    const stockMinimo = parseInt(formData.stock_minimo, 10);
    if (formData.stock_minimo === '' || isNaN(stockMinimo) || stockMinimo <= 0) {
      newErrors.stock_minimo = 'El stock mínimo debe ser mayor a 0.';
      isValid = false;
    }
    
    // Validar ubicación (obligatorio)
    if (!formData.ubicacion_almacen || formData.ubicacion_almacen.trim() === '') {
      newErrors.ubicacion_almacen = 'La ubicación en almacén es obligatoria.';
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

  // Estilo personalizado para react-select cuando hay error
  const customSelectStyles = (hasError) => ({
    control: (provided, state) => ({
      ...provided,
      borderColor: hasError ? '#dc3545' : provided.borderColor,
      boxShadow: hasError ? '0 0 0 0.25rem rgba(220, 53, 69, 0.25)' : provided.boxShadow,
      '&:hover': {
        borderColor: hasError ? '#dc3545' : provided.borderColor
      }
    })
  });

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {medicamento ? 'Editar Medicamento' : 'Nuevo Medicamento'}
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
              <Form.Group controlId="medicamentoCodigo">
                <Form.Label>Código <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej. ACETAM500"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleChange}
                  required
                  isInvalid={validated && !!errors.codigo}
                  className={errors.codigo ? 'border-danger' : ''}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.codigo || 'El código es obligatorio.'}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="medicamentoNombre">
                <Form.Label>Nombre del Medicamento <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej. Acetaminofén"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  isInvalid={validated && !!errors.nombre}
                  className={errors.nombre ? 'border-danger' : ''}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.nombre || 'El nombre es obligatorio.'}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="medicamentoCategoria">
                <Form.Label>Categoría <span className="text-danger">*</span></Form.Label>
                <Select
                  options={categoriasOptions}
                  placeholder="Seleccione una categoría"
                  onChange={(option) => handleSelectChange(option, 'id_categoria')}
                  value={categoriasOptions.find(option => option.value === formData.id_categoria)}
                  isClearable
                  styles={customSelectStyles(validated && errors.id_categoria)}
                />
                {errors.id_categoria && validated && (
                  <div className="text-danger mt-1" style={{ fontSize: '0.875em' }}>
                    {errors.id_categoria}
                  </div>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="medicamentoPresentacion">
                <Form.Label>Presentación <span className="text-danger">*</span></Form.Label>
                <Select
                  options={presentacionesOptions}
                  placeholder="Seleccione una presentación"
                  onChange={(option) => handleSelectChange(option, 'id_presentacion')}
                  value={presentacionesOptions.find(option => option.value === formData.id_presentacion)}
                  isClearable
                  styles={customSelectStyles(validated && errors.id_presentacion)}
                />
                {errors.id_presentacion && validated && (
                  <div className="text-danger mt-1" style={{ fontSize: '0.875em' }}>
                    {errors.id_presentacion}
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="medicamentoConcentracion">
                <Form.Label>Concentración <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej. 500mg, 250ml, etc."
                  name="concentracion"
                  value={formData.concentracion}
                  onChange={handleChange}
                  required
                  isInvalid={validated && !!errors.concentracion}
                  className={errors.concentracion ? 'border-danger' : ''}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.concentracion || 'La concentración es obligatoria.'}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="medicamentoUnidadMedida">
                <Form.Label>Unidad de Medida <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej. mg, ml, cda"
                  name="unidad_medida"
                  value={formData.unidad_medida}
                  onChange={handleChange}
                  required
                  isInvalid={validated && !!errors.unidad_medida}
                  className={errors.unidad_medida ? 'border-danger' : ''}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.unidad_medida || 'La unidad de medida es obligatoria.'}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="medicamentoViaAdministracion">
                <Form.Label>Vía de Administración <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej. Oral, Tópica, Intravenosa, Intramuscular, etc."
                  name="via_administracion"
                  value={formData.via_administracion}
                  onChange={handleChange}
                  required
                  isInvalid={validated && !!errors.via_administracion}
                  className={errors.via_administracion ? 'border-danger' : ''}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.via_administracion || 'La vía de administración es obligatoria.'}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Indique cómo debe administrarse el medicamento (Oral, Tópica, Intravenosa, etc.)
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="medicamentoStockMinimo">
                <Form.Label>Stock Mínimo <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="number"
                  name="stock_minimo"
                  value={formData.stock_minimo}
                  onChange={handleNumberChange}
                  min={1}
                  required
                  isInvalid={validated && !!errors.stock_minimo}
                  className={errors.stock_minimo ? 'border-danger' : ''}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.stock_minimo || 'El stock mínimo debe ser mayor a 0.'}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="medicamentoProveedor">
                <Form.Label>Proveedor <span className="text-danger">*</span></Form.Label>
                <Select
                  options={proveedoresOptions}
                  placeholder="Seleccione un proveedor"
                  onChange={(option) => handleSelectChange(option, 'id_proveedor')}
                  value={proveedoresOptions.find(option => option.value === formData.id_proveedor)}
                  isClearable
                  styles={customSelectStyles(validated && errors.id_proveedor)}
                />
                {errors.id_proveedor && validated && (
                  <div className="text-danger mt-1" style={{ fontSize: '0.875em' }}>
                    {errors.id_proveedor}
                  </div>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="medicamentoUbicacion">
                <Form.Label>Ubicación en Almacén <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej. Pasillo B, Estante A, Gaveta 3"
                  name="ubicacion_almacen"
                  value={formData.ubicacion_almacen}
                  onChange={handleChange}
                  required
                  isInvalid={validated && !!errors.ubicacion_almacen}
                  className={errors.ubicacion_almacen ? 'border-danger' : ''}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.ubicacion_almacen || 'La ubicación en almacén es obligatoria.'}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group controlId="medicamentoDescripcion" className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Describa el medicamento y sus usos"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
            />
          </Form.Group>
          
          <Form.Group controlId="medicamentoRequiereReceta" className="mb-4">
            <div className="card border p-3">
              <div className="d-flex align-items-center">
                <Form.Check 
                  type="checkbox"
                  id="requiere-receta-check"
                  name="requiere_receta"
                  checked={formData.requiere_receta}
                  onChange={handleChange}
                  className="me-2"
                />
                <label htmlFor="requiere-receta-check" className="form-check-label mb-0">
                  <strong>¿Requiere receta médica controlada?</strong>
                </label>
              </div>
              <small className="text-muted mt-2">
                Marque esta casilla si el medicamento requiere receta médica controlada para ser dispensado. 
              </small>
            </div>
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
          {medicamento ? 'Actualizar' : 'Guardar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MedicamentoModal;