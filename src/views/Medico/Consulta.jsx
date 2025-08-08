import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { consultaService } from '../../services/consultaService';
import { detalleConsultaService } from 'services/detalleConsultaService';
import { estadoConsultaService } from 'services/estadoConsultaService';
import Card from '../../components/Card/MainCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-solid-svg-icons';
import { faHeartbeat, faStethoscope, faEdit, faQuestionCircle, faSmile } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { Button, InputGroup, FormControl, Container, Badge, Modal, Form } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { useAuth } from 'components/AuthContext';
import { jsPDF } from 'jspdf';
import logo from '../../assets/images/UNICAES_Logo.png';
import axios from 'axios';
import Select from 'react-select';
import { Table } from 'react-bootstrap';





const Consulta = () => {
  const [consultas, setConsultas] = useState([]);
  const [selectedConsulta, setSelectedConsulta] = React.useState({ id_consulta: '' });

  const [estadoConsultas, setEstadosConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  //Examenes y Medicamentos
  const [examenes, setExamenes] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  // agregar medicamentos y examenes
  const [listaExamenes, setListaExamenes] = useState([]);
  const [listaMedicamentos, setListaMedicamentos] = useState([]);
  const [nuevoExamen, setNuevoExamen] = useState('');
  const [nuevoMedicamento, setNuevoMedicamento] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [dosis, setDosis] = useState('');
  const [frecuencia, setFrecuencia] = useState('');
  const [duracion, setDuracion] = useState('');
  //Rayos X
  const [rayosX, setRayosX] = useState([]);
  const [nuevoRayoX, setNuevoRayosX] = useState('');
  const [listaRayosX, setListaRayosX] = useState([]);


  //Examenes, Medicamentos Rayos X
  const opcionesExamenes = examenes.map(e => ({ value: e.id_tipo_examen, label: e.nombre }));
  const opcionesMedicamentos = medicamentos.map(m => ({ value: m.id_medicamento, label: m.nombre }));
  const opcionesRayosX = rayosX.map(r => ({ value: r.id_tipo_rayos_x, label: r.nombre }));

  const agregarExamen = () => {
    if (nuevoExamen && !listaExamenes.some(e => e.id === nuevoExamen.value)) {
      setListaExamenes([...listaExamenes, { id: nuevoExamen.value, nombre: nuevoExamen.label }]);
      setNuevoExamen(null);
    }
  };

  const eliminarExamen = (id) => {
    setListaExamenes(listaExamenes.filter((e) => e.id !== id));
  };
  //
  const agregarRayoX = () => {
    if (setNuevoRayosX && !listaRayosX.some(r => r.id === nuevoRayoX.value)) {
      setListaRayosX([...listaRayosX, { id: nuevoRayoX.value, nombre: nuevoRayoX.label }]);
      setNuevoRayosX(null);
    }
  };

  const eliminarRayoX = (id) => {
    setListaRayosX(listaRayosX.filter((r) => r.id !== id));
  };
  //
  const agregarMedicamento = () => {
    if (nuevoMedicamento && cantidad && dosis && frecuencia && duracion) {
      setListaMedicamentos([
        ...listaMedicamentos,
        { id: nuevoMedicamento.value, nombre: nuevoMedicamento.label, cantidad, dosis, frecuencia, duracion }
      ]);
      setNuevoMedicamento(null);
      setCantidad('');
      setDosis('');
      setFrecuencia('');
      setDuracion('');
    }
  };
  //
  const eliminarMedicamento = (id) => {
    setListaMedicamentos(listaMedicamentos.filter((m) => m.id !== id));
  };

  const limpiarTodo = () => {
    setListaExamenes([]);
    setListaMedicamentos([]);
    setListaRayosX([]);
    setNuevoExamen(null);
    setNuevoMedicamento(null);
    setCantidad('');
    setDosis('');
    setFrecuencia('');
    setDuracion('');
    if (handleCloseModal) handleCloseModal();
  };
  //
  //Iniciar variables ""
  const initialDetalleState = {
    id_estado_consulta: '',
    id_tipo_examen: '',
    id_medicamento: '',
    id_tipo_rayos_x: '',
    motivo_consulta: '',
    presente_enfermedad: '',
    antecedentes: '',
    presion_arterial: '',
    frecuencia_cardiaca: '',
    saturacion_oxigeno: '',
    temperatura: '',
    peso: '',
    altura: '',
    diagnostico: '',
    observaciones: '',
    examen_fisico: '',
    id_consulta: ''
  };

  const [detalleForm, setDetalleForm] = useState(initialDetalleState);
  const [errors, setErrors] = useState({});

  const { user } = useAuth();

  useEffect(() => {
    const loadConsultas = async () => {
      try {
        const data = await consultaService.getConsutasById(user.id_usuario);
        setConsultas(data);
      } catch (error) {
        console.error('Error al obtener las consultas del medico:', error);
      } finally {
        setLoading(false);
      }
    };
    //Cargar Rayos x
    
    const cargarRayosX = async () => {
    try {
        const exs = await estadoConsultaService.getRayosX();
        setRayosX(exs);
      } catch (error) {
        console.error('Error al cargar Rayos X:', error);
      } finally {
        setLoading(false);
      }
    };

    const loadEstadosConsultas = async () => {
      try {
        const data = await estadoConsultaService.getEstados();
        setEstadosConsultas(data);
      } catch (error) {
        console.error('Error al obtener los estados de la consulta:', error);
      } finally {
        setLoading(false);
      }
    };

    const cargarExamenes = async () => {
    try {
        const exs = await estadoConsultaService.getExamenes();
        setExamenes(exs);
      } catch (error) {
        console.error('Error al cargar exámenes:', error);
      } finally {
        setLoading(false);
      }
    };
    const cargarMedicamentos = async () => {
    try {
        const exs = await estadoConsultaService.getMedicamentos();
        setMedicamentos(exs);
      } catch (error) {
        console.error('Error al cargar medicamentos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    cargarExamenes();
    cargarMedicamentos();
    cargarRayosX();
    loadConsultas();
    loadEstadosConsultas();
  }, []);

  const handleShowAddModal = (id_consulta) => {
    const consultaSeleccionada = consultas.find((consulta) => consulta.id_consulta === id_consulta);
    setSelectedConsulta(consultaSeleccionada || { id_consulta });
    setDetalleForm({ ...initialDetalleState, id_consulta });
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDetalleForm({ ...detalleForm, [name]: value });
  };

  const validateFields = (detalleForm) => {
    const newErrors = {};

    if (!detalleForm?.id_estado_consulta) newErrors.id_estado_consulta = 'El estado de la consulta es requerido';
    if (!detalleForm?.motivo_consulta) newErrors.motivo_consulta = 'El motivo de la consulta es requerido';
    if (!detalleForm?.presente_enfermedad) newErrors.presente_enfermedad = 'La descripción de la enfermedad presente es requerida';
    if (!detalleForm?.presion_arterial) newErrors.presion_arterial = 'La presión arterial es requerida';
    if (!detalleForm?.frecuencia_cardiaca) newErrors.frecuencia_cardiaca = 'La frecuencia cardíaca es requerida';
    if (!detalleForm?.temperatura) newErrors.temperatura = 'La temperatura es requerida';
    if (!detalleForm?.saturacion_oxigeno) newErrors.saturacion_oxigeno = 'La saturacion de oxigeno es requerida';
    if (!detalleForm?.peso) newErrors.peso = 'El peso del paciente es requerido';
    if (!detalleForm?.altura) newErrors.altura = 'La altura del paciente es requerida';
    if (!detalleForm?.diagnostico) newErrors.diagnostico = 'El diagnóstico es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDetalle = async () => {
    if (!validateFields(detalleForm)) return;

    try {
      const payload = {
      ...detalleForm,
      id_usuario: user?.id_usuario,
      id_paciente: selectedConsulta.id_paciente,
      examenes: listaExamenes.map((e) => e.id),
      rayosX: listaRayosX.map((r) => r.id),
      medicamentos: listaMedicamentos.map((m) => ({
        id_medicamento: m.id,
        cantidad: m.cantidad,
        dosis: m.dosis,
        frecuencia: m.frecuencia,
        duracion: m.duracion
        }))
    };
      const response = await detalleConsultaService.createDetalleConsulta(payload);
      console.log('Detalle guardado:', response);

      const data = await consultaService.getConsutasById(user.id_usuario);
      setConsultas(data);

      Swal.fire({
        title: 'Éxito',
        text: 'Detalle agregado exitosamente!',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });

      handleCloseModal();
      limpiarTodo();
    } catch (error) {
      console.error('Error al guardar el detalle:', error);
    }
  };

  const getBadgeVariant = (estado) => {
    switch (estado.toLowerCase()) {
      case 'rojo':
        return 'danger';
      case 'amarillo':
        return 'warning';
      case 'verde':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getHealthIcon = (estado) => {
    switch (estado.toLowerCase()) {
      case 'rojo':
        return <FontAwesomeIcon icon={faHeartbeat} />;
      case 'amarillo':
        return <FontAwesomeIcon icon={faStethoscope} />;
      case 'verde':
        return <FontAwesomeIcon icon={faSmile} />;
      default:
        return <FontAwesomeIcon icon={faQuestionCircle} />;
    }
  };

  const getHours = (estado) => {
    switch (estado.toLowerCase()) {
      case 'rojo':
        return <p>2Hr</p>;
      case 'amarillo':
        return <p>4Hr</p>;
      case 'verde':
        return <p>8Hr</p>;
      default:
        return <p>0Hr</p>;
    }
  };

  const columns = [
    {
      name: 'Nombre',
      selector: (row) => `${row.nombre_paciente} ${row.apellido_paciente}`,
      sortable: true
    },
    {
      name: 'Tipo',
      selector: (row) => row.nombre_tipo_consulta,
      sortable: true
    },

    {
      name: 'Estado Triage',
      cell: (row) => (
        <div className="d-flex align-items-center">
          <Badge
            bg={getBadgeVariant(row.estado_paciente)}
            style={{
              fontSize: '1rem',
              padding: '0.4rem 0.6rem'
            }}
            className="me-2"
          >
            {getHealthIcon(row.estado_paciente)}
          </Badge>

          <span className="mt-3">{getHours(row.estado_paciente)}</span>
        </div>
      ),
      sortable: true
    },

    {
      name: 'Motivo',
      selector: (row) => (row.motivo_consulta.length > 0 ? row.motivo_consulta.split(' ').slice(0, 5).join('') + '...' : 'N/A')
    },

    {
      name: 'Crear Detalle Consulta',
      cell: (row) => (
        <div className="btn-group mt-2 mb-2" role="group" aria-label="Detalle actions">
          <Button variant="info" onClick={() => handleShowAddModal(row.id_consulta)}>
            <FontAwesomeIcon icon={faClipboard} className="" />
          </Button>
        </div>
      )
    }
  ];

  const subHeaderComponentMemo = React.useMemo(() => {
    return (
      <Container>
        <Row className="justify-content-end">
          <Col md={6}>
            <InputGroup className="mb-3">
              <InputGroup.Text>Buscar</InputGroup.Text>
              <FormControl
                placeholder="Buscar por nombre del paciente"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
        </Row>
      </Container>
    );
  }, [searchTerm]);

  if (loading) {
    return <p>Cargando tus consultas...</p>;
  }

  const handleGeneratePDF = async (id_usuario) => {
    try {
      const detalle = await detalleConsultaService.getDetalleConsutasByIdDetallePDF(user.id_usuario);

      if (!detalle) {
        Swal.fire('Advertencia', 'No se encontró información para esta consulta', 'warning');
        return;
      }

      const doc = new jsPDF();
      const pageHeight = doc.internal.pageSize.height;
      const marginLeft = 25;
      let currentY = 20;

      // Título principal en negrita
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('Detalle de Consulta Médica', marginLeft, currentY);
      doc.addImage(logo, 'PNG', 170, 7, 20, 20);
      currentY += 20;

      // Subtítulos e información del paciente en negrita
      doc.setFontSize(11);
      doc.text(`Nombre: ${detalle.nombre_paciente}`, marginLeft, currentY);
      currentY += 10;
      doc.text(`Expediente: ${detalle.n_expediente}`, marginLeft, currentY);
      doc.text(`Fecha: ${new Date(detalle.fecha).toISOString().split('T')[0]}`, 160, currentY);
      currentY += 10;

      // Información de la consulta (subtítulos en negrita)
      // doc.text('Información de la Consulta:', marginLeft, currentY);

      doc.text(`Tipo de Consulta: ${detalle.tipo_consulta}`, marginLeft, currentY);
      doc.text(`Estado Triage: ${detalle.estado_paciente}`, 95, currentY);
      doc.text(`Estado Consulta: ${detalle.estado_consulta}`, 140, currentY);
      currentY += 20;

      const detallesMedicos = [
        { label: 'Motivo Enfermería', value: detalle.motivo_enfermeria },
        { label: 'Motivo Consulta', value: detalle.motivo_consulta_detalle },
        { label: 'Presente Enfermedad', value: detalle.presente_enfermedad },
        { label: 'Antecedentes', value: detalle.antecedentes },
        { label: 'Presión Arterial', value: detalle.presion_arterial },
        { label: 'Frecuencia Cardíaca', value: detalle.frecuencia_cardiaca },
        { label: 'Saturación de Oxígeno', value: detalle.saturacion_oxigeno },
        { label: 'Temperatura', value: detalle.temperatura },
        { label: 'Peso', value: detalle.peso },
        { label: 'Altura', value: detalle.altura },
        { label: 'Diagnóstico', value: detalle.diagnostico },
        { label: 'Observaciones', value: detalle.observaciones },
        { label: 'Examen Físico', value: detalle.examen_fisico }
      ];

      doc.setFont('helvetica', 'normal');
      detallesMedicos.forEach((detalle) => {
        const text = `${detalle.label}: ${detalle.value}`;
        const lines = doc.splitTextToSize(text, 175);

        lines.forEach((line) => {
          if (currentY + 15 > pageHeight) {
            doc.addPage();
            currentY = 20;
          }
          doc.text(line, marginLeft, currentY);
          currentY += 10;
        });
      });

      // detallesMedicos.forEach((detalle) => {
      //   const labelText = `${detalle.label}: `;
      //   const valueText = `${detalle.value}`;
      //   const labelWidth = doc.getTextWidth(labelText);

      //   // Agregar el label en negrita
      //   doc.setFont('helvetica', 'bold');
      //   doc.text(labelText, marginLeft, currentY);

      //   // Agregar el valor en texto normal justo después del label
      //   doc.setFont('helvetica', 'normal');
      //   doc.text(valueText, marginLeft + labelWidth, currentY);

      //   currentY += 10;

      //   // Salto de página si es necesario
      //   if (currentY + 10 > pageHeight) {
      //     doc.addPage();
      //     currentY = 20;
      //   }

      doc.save(`Detalle_Consulta_${detalle.n_expediente}.pdf`);
      Swal.fire('Éxito', 'El PDF se generó correctamente', 'success');
    } catch (error) {
      console.error('web: Error al generar el PDF:', error);
      Swal.fire('Error', 'No se pudo generar el PDF', 'error');
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Card title="Tus Consultas" isOption>
            {/* <Button variant="primary" onClick={() => handleGeneratePDF(user.id_usuario)}>
              Generar Detalle
            </Button> */}
            <DataTable
              columns={columns}
              data={consultas.filter(
                (consulta) =>
                  (consulta.nombre_paciente && consulta.nombre_paciente.toLowerCase().includes(searchTerm.toLowerCase())) ||
                  (consulta.apellido_paciente && consulta.apellido_paciente.toLowerCase().includes(searchTerm.toLowerCase()))
              )}
              pagination
              striped
              responsive
              highlightOnHover
              dense
              noHeader
              subHeader
              subHeaderComponent={subHeaderComponentMemo}
              noDataComponent={<div>No tienes consultas disponibles para mostrar, toma primero una.</div>}
              expandableRows // Habilitar filas expandibles
              expandableRowsComponent={({ data }) => (
                <div style={{ padding: '25px' }}>
                  <Row>
                    <Col md={3}>
                      <div className="form-label">
                        <label>Nombre: </label>
                        <p>
                          {data.nombre_paciente} {data.apellido_paciente}
                        </p>
                      </div>

                      <div>
                        <label>Tipo consulta: </label>
                        <p>{data.nombre_tipo_consulta}</p>
                      </div>
                    </Col>

                    <Col md={3}>
                      <div>
                        <label>Especialidad:</label>
                        <p>{data.nombre_especialidad}</p>
                      </div>
                      <div>
                        <label>Color Cardex </label>
                        <p>{data.estado_paciente}</p>
                      </div>
                    </Col>

                    <Col md={6}>
                      <div>
                        <label>Motivo:</label>
                        <textarea className="custom-textarea" rows="4" readOnly>
                          {data.motivo_consulta}
                        </textarea>
                      </div>
                    </Col>
                  </Row>
                </div>
              )}
            />

            <Modal show={showModal} onHide={handleCloseModal} size="xl">
              <Modal.Header closeButton>
                <Modal.Title>Agregar Detalle de Consulta</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Row>
                    <Form.Group>
                      <Form.Control name="id_consulta" value={selectedConsulta.id_consulta || ''} type="hidden" />
                    </Form.Group>
                      <Form.Group>
                        <Form.Label>Motivo de Consulta</Form.Label>
                        <Form.Control
                          name="motivo_consulta"
                          onChange={handleInputChange}
                          value={detalleForm.motivo_consulta || ''}
                          as="textarea"
                          rows={4}
                          isInvalid={!!errors.motivo_consulta}
                          required
                        />
                        <Form.Control.Feedback type="invalid">{errors.motivo_consulta}</Form.Control.Feedback>
                      </Form.Group>
                    
                  </Row>

                  <Row className="mt-3">
                    <Form.Group>
                      <Form.Label>Presente Enfermedad</Form.Label>
                      <Form.Control
                        name="presente_enfermedad"
                        onChange={handleInputChange}
                        value={detalleForm.presente_enfermedad || ''}
                        as="textarea"
                        rows={4}
                        isInvalid={!!errors.presente_enfermedad}
                        required
                      />
                      <Form.Control.Feedback type="invalid">{errors.presente_enfermedad}</Form.Control.Feedback>
                    </Form.Group>
                  </Row>
                  <Row className="mt-3">
                    <Form.Group>
                      <Form.Label>Antecedentes</Form.Label>
                      <Form.Control
                        name="antecedentes"
                        onChange={handleInputChange}
                        value={detalleForm.antecedentes || ''}
                        as="textarea"
                        rows={4}
                        isInvalid={!!errors.antecedentes}
                        required
                      />
                      <Form.Control.Feedback type="invalid">{errors.antecedentes}</Form.Control.Feedback>
                    </Form.Group>
                  </Row>

                  <Row className="mt-3">
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Presión Arterial (mmHg)</Form.Label>
                        <Form.Control
                          name="presion_arterial"
                          onChange={(e) => {
                            let inputValue_pa = e.target.value;

                            // Permitir solo números y el carácter '/'
                            inputValue_pa = inputValue_pa.replace(/[^0-9/]/g, '');

                            // Asegurar que solo haya un '/'
                            const parts = inputValue_pa.split('/');
                            if (parts.length > 2) {
                              inputValue_pa = parts[0] + '/' + parts[1];
                            }

                            handleInputChange({
                              target: { name: 'presion_arterial', value: inputValue_pa }
                            });
                          }}
                          value={detalleForm.presion_arterial || ''}
                          type="text" // Mantener como texto para permitir '/'
                          maxLength={7} // Limitar longitud máxima para algo como '999/999'
                          isInvalid={!!errors.presion_arterial}
                        />
                        <Form.Control.Feedback type="invalid">{errors.presion_arterial}</Form.Control.Feedback>
                      </Form.Group>

                      {/* <Form.Group>
                        <Form.Label>Presión Arterial</Form.Label>
                        <Form.Control
                          name="presion_arterial"
                          onChange={handleInputChange}
                          value={detalleForm.presion_arterial || ''}
                          type="text"
                          maxLength={50}
                          isInvalid={!!errors.presion_arterial}
                        />
                        <Form.Control.Feedback type="invalid">{errors.presion_arterial}</Form.Control.Feedback>
                      </Form.Group> */}
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Frecuencia Cardíaca (lpm)</Form.Label>
                        <Form.Control
                          name="frecuencia_cardiaca"
                          onChange={(e) => {
                            let inputValue_fc = e.target.value;

                            // Permitir solo números y un único punto decimal
                            inputValue_fc = inputValue_fc.replace(/[^0-9.]/g, ''); // Permitir dígitos y '.'
                            // if ((inputValue.match(/\./g) || []).length > 1) {
                            //   // Si hay más de un punto decimal, eliminar el último
                            //   inputValue = inputValue.substring(0, inputValue.length - 1);
                            // }

                            // Agregar "lpm" si no está vacío
                            if (inputValue_fc !== '') {
                              inputValue_fc += ' Lpm';
                            }

                            handleInputChange({
                              target: { name: 'frecuencia_cardiaca', value: inputValue_fc }
                            });
                          }}
                          maxLength={7} // Limitar longitud del input
                          value={detalleForm.frecuencia_cardiaca || ''}
                          type="text" // Cambiado a texto para permitir "lpm"
                          isInvalid={!!errors.frecuencia_cardiaca}
                        />
                        <Form.Control.Feedback type="invalid">{errors.frecuencia_cardiaca}</Form.Control.Feedback>
                      </Form.Group>

                      {/* <Form.Group>
                        <Form.Label>Frecuencia Cardíaca</Form.Label>
                        <Form.Control
                          name="frecuencia_cardiaca"
                          onChange={handleInputChange}
                          value={detalleForm.frecuencia_cardiaca || ''}
                          type="number"
                          step="0.1"
                          isInvalid={!!errors.frecuencia_cardiaca}
                        />
                        <Form.Control.Feedback type="invalid">{errors.frecuencia_cardiaca}</Form.Control.Feedback>
                      </Form.Group> */}
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Saturación de Oxígeno (%)</Form.Label>
                        <Form.Control
                          name="saturacion_oxigeno"
                          onChange={(e) => {
                            let inputValue_so = e.target.value.replace(/\D/g, ''); // Permitir solo números
                            if (inputValue_so !== '') {
                              inputValue_so += '%'; // Agregar el símbolo % si el campo no está vacío
                            }
                            handleInputChange({
                              target: { name: 'saturacion_oxigeno', value: inputValue_so }
                            });
                          }}
                          maxLength={4}
                          value={detalleForm.saturacion_oxigeno || ''}
                          type="text" // Cambiado a texto para permitir el símbolo %
                          isInvalid={!!errors.saturacion_oxigeno}
                        />
                        <Form.Control.Feedback type="invalid">{errors.saturacion_oxigeno}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Temperatura (°C)</Form.Label>
                        <Form.Control
                          name="temperatura"
                          onChange={(e) => {
                            let inputValue_temp = e.target.value;

                            // Permitir solo números y un único punto decimal
                            inputValue_temp = inputValue_temp.replace(/[^0-9.]/g, ''); // Permitir dígitos y '.'
                            // Agregar "°C" si no está vacío
                            if (inputValue_temp !== '') {
                              inputValue_temp += '°C';
                            }

                            handleInputChange({
                              target: { name: 'temperatura', value: inputValue_temp }
                            });
                          }}
                          maxLength={6} // Para limitar la longitud (incluyendo números, punto y "°C")
                          value={detalleForm.temperatura || ''}
                          type="text" // Cambiado a texto para permitir "°C"
                          isInvalid={!!errors.temperatura}
                        />
                        <Form.Control.Feedback type="invalid">{errors.temperatura}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Peso (kg)</Form.Label>
                        <Form.Control
                          name="peso"
                          onChange={(e) => {
                            let inputValue_p = e.target.value;

                            // Permitir solo números y un único punto decimal
                            inputValue_p = inputValue_p.replace(/[^0-9.]/g, ''); // Permitir dígitos y '.'
                            // if ((inputValue.match(/\./g) || []).length > 1) {
                            //   // Si hay más de un punto decimal, eliminar el último
                            //   inputValue = inputValue.substring(0, inputValue.length - 1);
                            // }

                            // Agregar "kg" si no está vacío
                            if (inputValue_p !== '') {
                              inputValue_p += 'kg';
                            }

                            handleInputChange({
                              target: { name: 'peso', value: inputValue_p }
                            });
                          }}
                          value={detalleForm.peso || ''}
                          type="text" // Cambiado a texto para permitir "kg"
                          maxLength={10} // Limitar la longitud máxima
                          isInvalid={!!errors.peso}
                        />
                        <Form.Control.Feedback type="invalid">{errors.peso}</Form.Control.Feedback>
                      </Form.Group>

                      {/* <Form.Group>
                        <Form.Label>Peso</Form.Label>
                        <Form.Control
                          name="peso"
                          onChange={handleInputChange}
                          value={detalleForm.peso || ''}
                          type="number"
                          isInvalid={!!errors.peso}
                        />
                        <Form.Control.Feedback type="invalid">{errors.peso}</Form.Control.Feedback>
                      </Form.Group> */}
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Altura (m)</Form.Label>
                        <Form.Control
                          name="altura"
                          onChange={(e) => {
                            let inputValue_a = e.target.value;

                            // Permitir solo números y un único punto decimal
                            inputValue_a = inputValue_a.replace(/[^0-9.]/g, ''); // Permitir dígitos y '.'
                            // if ((inputValue.match(/\./g) || []).length > 1) {
                            //   // Si hay más de un punto decimal, eliminar el último
                            //   inputValue = inputValue.substring(0, inputValue.length - 1);
                            // }

                            // Agregar "m" si no está vacío
                            if (inputValue_a !== '') {
                              inputValue_a += 'm';
                            }

                            handleInputChange({
                              target: { name: 'altura', value: inputValue_a }
                            });
                          }}
                          value={detalleForm.altura || ''}
                          type="text" // Cambiado a texto para permitir "m"
                          maxLength={5} // Limitar la longitud máxima
                          isInvalid={!!errors.altura}
                        />
                        <Form.Control.Feedback type="invalid">{errors.altura}</Form.Control.Feedback>
                      </Form.Group>

                      {/* <Form.Group>
                        <Form.Label>Altura</Form.Label>
                        <Form.Control
                          name="altura"
                          onChange={handleInputChange}
                          value={detalleForm.altura || ''}
                          type="number"
                          step="0.1"
                          isInvalid={!!errors.altura}
                        />
                        <Form.Control.Feedback type="invalid">{errors.altura}</Form.Control.Feedback>
                      </Form.Group> */}
                    </Col>
                    <Col md={6}></Col>
                  </Row>

                  <Row className="mt-3">
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Observaciones</Form.Label>
                        <Form.Control
                          name="observaciones"
                          onChange={handleInputChange}
                          value={detalleForm.observaciones || ''}
                          as="textarea"
                          rows={4}
                          isInvalid={!!errors.observaciones}
                        />
                        <Form.Control.Feedback type="invalid">{errors.observaciones}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Examen Físico</Form.Label>
                        <Form.Control
                          name="examen_fisico"
                          onChange={handleInputChange}
                          value={detalleForm.examen_fisico || ''}
                          as="textarea"
                          rows={4}
                          isInvalid={!!errors.examen_fisico}
                        />
                        <Form.Control.Feedback type="invalid">{errors.examen_fisico}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Form.Group>
                      <Form.Label>Diagnóstico</Form.Label>
                      <Form.Control
                        name="diagnostico"
                        onChange={handleInputChange}
                        value={detalleForm.diagnostico || ''}
                        as="textarea"
                        rows={4}
                        isInvalid={!!errors.diagnostico}
                        required
                      />

                      <Form.Control.Feedback type="invalid">{errors.diagnostico}</Form.Control.Feedback>
                    </Form.Group>
                  </Row>
                  <Row>
                    <Form.Group>
                      <Form.Label>Plan</Form.Label>
                      <Form.Control
                        name="Plan"
                        onChange={handleInputChange}
                        value={detalleForm.diagnostico || ''}
                        as="textarea"
                        rows={4}
                        isInvalid={!!errors.diagnostico}
                        required
                      />

                      <Form.Control.Feedback type="invalid">{errors.diagnostico}</Form.Control.Feedback>
                    </Form.Group>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Estado de la consulta</Form.Label>
                        <Form.Select
                          name="id_estado_consulta"
                          onChange={handleInputChange}
                          value={detalleForm.id_estado_consulta || ''}
                          isInvalid={!!errors.id_estado_consulta}
                          required
                        >
                          <option value="">Seleccione un estado</option>
                          {estadoConsultas.map((estado) => (
                            <option key={estado.id_estado_consulta} value={estado.id_estado_consulta}>
                              {estado.nombre_estado_consulta}
                            </option>
                          ))}
                        </Form.Select>

                        <Form.Control.Feedback type="invalid">{errors.id_estado_consulta}</Form.Control.Feedback>
                      </Form.Group>
                    
                    </Col>
                  </Row>
                  <Row className="mt-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Exámenes</Form.Label>
                        <Select
                          options={opcionesExamenes}
                          value={nuevoExamen}
                          onChange={setNuevoExamen}
                          placeholder="Buscar examen..."
                          isClearable
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2} className="d-flex align-items-end">
                      <Button variant="success" sise="sm" onClick={agregarExamen}>Agregar Examen</Button>
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col>
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>Examen</th>
                            <th>Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {listaExamenes.map((ex) => (
                            <tr key={ex.id}>
                              <td>{ex.nombre}</td>
                              <td>
                                <Button variant="danger" size="sm" onClick={() => eliminarExamen(ex.id)}>
                                  Quitar
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Col>
                  </Row>
                  
                  <Row className="mt-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Imagenes "Rayos X"</Form.Label>
                        <Select
                          options={opcionesRayosX}
                          value={nuevoRayoX}
                          onChange={setNuevoRayosX}
                          placeholder="Buscar examen..."
                          isClearable
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2} className="d-flex align-items-end">
                      <Button variant="success" sise="sm" onClick={agregarRayoX}>Agregar Examen</Button>
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col>
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>Imagen</th>
                            <th>Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {listaRayosX.map((ra) => (
                            <tr key={ra.id}>
                              <td>{ra.nombre}</td>
                              <td>
                                <Button variant="danger" size="sm" onClick={() => eliminarRayoX(ra.id)}>
                                  Quitar
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Col>
                  </Row>

                  <Row className="mt-4">
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Medicamento</Form.Label>
                        <Select
                          options={opcionesMedicamentos}
                          value={nuevoMedicamento}
                          onChange={setNuevoMedicamento}
                          placeholder="Buscar medicamento..."
                          isClearable
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Cantidad</Form.Label>
                        <Form.Control
                          type="text"
                          value={cantidad}
                          onChange={(e) => setCantidad(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Dosis</Form.Label>
                        <Form.Control
                          type="text"
                          value={dosis}
                          onChange={(e) => setDosis(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Frecuencia</Form.Label>
                        <Form.Control
                          type="text"
                          value={frecuencia}
                          onChange={(e) => setFrecuencia(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Duración</Form.Label>
                        <Form.Control
                          type="text"
                          value={duracion}
                          onChange={(e) => setDuracion(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2} className="d-flex align-items-end">
                      <Button variant="success" sise="sm" onClick={agregarMedicamento}>Agregar Medicamento</Button>
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col>
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>Medicamento</th>
                            <th>Cantidad</th>
                            <th>Dosis</th>
                            <th>Frecuencia</th>
                            <th>Duración</th>
                            <th>Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {listaMedicamentos.map((med) => (
                            <tr key={med.id}>
                              <td>{med.nombre}</td>
                              <td>{med.cantidad}</td>
                              <td>{med.dosis}</td>
                              <td>{med.frecuencia}</td>
                              <td>{med.duracion}</td>
                              <td>
                                <Button variant="danger" size="sm" onClick={() => eliminarMedicamento(med.id)}>
                                  Quitar
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Col>
                  </Row>
                    
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Row className="mt-3">
                  <Col className="text-end">
                    <Button variant="secondary" onClick={limpiarTodo}>Cancelar</Button>
                  </Col>
                </Row>
                <Button
                  variant="info"
                  onClick={() => {
                    handleSaveDetalle(); // Guarda el detalle
                    setTimeout(() => {
                      handleGeneratePDF(user.id_usuario); // Genera el PDF después de 1 segundo
                    }, 2000); // Espera 1 segundo (1000 milisegundos)
                  }}
                >
                  Guardar y Generar Detalle
                </Button>
              </Modal.Footer>
            </Modal>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default Consulta;
