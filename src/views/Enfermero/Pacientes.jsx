import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { pacienteService } from '../../services/pacienteService';
import Card from '../../components/Card/MainCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { Button, InputGroup, FormControl, Container, Modal, Form } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

const Pacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const initialUserState = {
    n_expediente: '',
    nombre_paciente: '',
    apellido_paciente: '',
    fecha_nacimiento_paciente: '',
    dui_paciente: '',
    sexo_paciente: '',
    telefono_paciente: '',
    direccion_paciente: '',
    contactoE_nombre: '',
    contactoE_telefono: '',
    contactoE_parentesco: '',
    responsable_nombre: '',
    responsable_dui: '',
    responsable_telefono: '',
    responsable_parentesco: ''
  };

  const [userForm, setUserForm] = useState(initialUserState);
  const [errors, setErrors] = useState({});
  const { id_paciente } = useParams();
  const [consultas, setConsultas] = useState([]);


  useEffect(() => {
    const loadPacientes = async () => {
      try {
        const data = await pacienteService.getPacientes();
        setPacientes(data);
      } catch (error) {
        console.error('Error al obtener los pacientes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPacientes();
  }, []);

  const handleShowAddModal = () => {
    setUserForm(initialUserState);
    setShowModal(true);
  };

  const handleShowEditModal = async (userId) => {
    try {
      const user = await pacienteService.getPacienteById(userId);
      setUserForm(user[0][0]);
      setShowModal(true);
    } catch (error) {
      console.error('Error al obtener el paciente:', error);
    }
  };

  const handleCloseModal = () => setShowModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm({ ...userForm, [name]: value });
  };

  const validateFields = () => {
    const newErrors = {};

    if (!userForm.nombre_paciente) newErrors.nombre_paciente = 'Nombre del paciente es requerido';
    if (!userForm.apellido_paciente) newErrors.apellido_paciente = 'Apellido del paciente es requerido';
    if (!userForm.fecha_nacimiento_paciente) newErrors.fecha_nacimiento_paciente = 'Fecha de nacimiento del paciente es requerida';
    if (!userForm.dui_paciente) newErrors.dui_paciente = 'DUI del paciente es requerido';
    if (!userForm.sexo_paciente) newErrors.sexo_paciente = 'El campo sexo del paciente es requerido';
    if (!userForm.telefono_paciente) newErrors.telefono_paciente = 'Teléfono del paciente es requerido';
    if (!userForm.direccion_paciente) newErrors.direccion_paciente = 'Dirección del paciente es requerida';
    if (!userForm.contactoE_nombre) newErrors.contactoE_nombre = 'Nombre del contacto de emergencia es requerido';
    if (!userForm.contactoE_telefono) newErrors.contactoE_telefono = 'Teléfono del contacto de emergencia es requerido';
    if (!userForm.contactoE_parentesco) newErrors.contactoE_parentesco = 'Parentesco del contacto de emergencia es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveUser = async () => {
    if (!validateFields()) return;

    try {
      const response = await pacienteService.createPaciente(userForm);
      console.log('Paciente guardado:', response);

      const data = await pacienteService.getPacientes();
      setPacientes(data);

      Swal.fire({
        title: 'Éxito',
        text: 'Paciente agregado exitosamente!',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });

      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar el paciente:', error);
    }
  };

  const handleEditUser = async () => {
    if (!validateFields()) return;

    try {
      const updatedPaciente = { ...userForm };

      const response = await pacienteService.updatePaciente(userForm.id_paciente, updatedPaciente);
      console.log('Paciente actualizado:', response);

      // Actualizar la lista de pacientes
      const data = await pacienteService.getPacientes();
      setPacientes(data);

      Swal.fire({
        title: 'Éxito',
        text: 'Paciente actualizado exitosamente!',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });

      handleCloseModal();
    } catch (error) {
      console.error('Error al actualizar el paciente:', error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al actualizar el paciente.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  const togglePacienteState = async (userId) => {
    try {
      await pacienteService.changeStatePaciente(userId);

      const data = await pacienteService.getPacientes();
      setPacientes(data);

      Swal.fire({
        title: 'Éxito',
        text: `Estado del paciente actualizado exitosamente!`,
        icon: 'success',
        confirmButtonText: 'Aceptar',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (error) {
      console.error('Error al cambiar el estado del paciente:', error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al cambiar el estado del paciente.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  const columns = [
    {
      name: 'Nombre',
      selector: (row) => `${row.nombre_paciente} ${row.apellido_paciente}`,
      sortable: true
    },
    {
      name: 'DUI',
      selector: (row) => row.dui_paciente,
      sortable: true
    },
    {
      name: 'Telefono',
      selector: (row) => row.telefono_paciente,
      sortable: true
    },
    {
      name: 'Expediente',
      selector: (row) => row.n_expediente,
      sortable: true
    },
    {
      name: 'Contacto Emergencia',
      selector: (row) => row.contactoE_telefono,
      sortable: true
    },

    {
      name: 'Acciones',
      cell: (row) => (
        <div className="btn-group mt-2 mb-2" role="group" aria-label="Paciente actions">
          <Button variant="warning" onClick={() => handleShowEditModal(row.id_paciente)}>
            <FontAwesomeIcon icon={faEdit} className="me-1" />
          </Button>

          <Button variant={row.estado === 'activo' ? 'primary' : 'danger'} onClick={() => togglePacienteState(row.id_paciente)}>
            <FontAwesomeIcon icon={faTrash} className="me-1" />
          </Button>
        </div>
      )
      
    },
    {
        name: 'Seguimiento',
        cell: (row) => (
        <div className="btn-group mt-2 mb-2" role="group" aria-label="Paciente actions">
        <Button
          variant="info"
         onClick={() => navigate(`/seguimiento-paciente/${row.id_paciente}`)}
        >
          <FontAwesomeIcon icon={faEye} className="me-1" />
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
                placeholder="Buscar por nombre o expediente"
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
    return <p>Cargando pacientes...</p>;
  }

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Card title="Pacientes" isOption>
            <Button onClick={() => handleShowAddModal()} variant="info">
              <FontAwesomeIcon icon={faPlus} className="me-1" /> Agregar Paciente
            </Button>

            <DataTable
              columns={columns}
              data={pacientes.filter(
                (paciente) =>
                  (paciente.nombre_paciente && paciente.nombre_paciente.toLowerCase().includes(searchTerm.toLowerCase())) ||
                  (paciente.apellido_paciente && paciente.apellido_paciente.toLowerCase().includes(searchTerm.toLowerCase())) ||
                  (paciente.n_expediente && paciente.n_expediente.toLowerCase().includes(searchTerm.toLowerCase()))
              )}
              pagination
              striped
              responsive
              highlightOnHover
              dense
              noHeader
              subHeader
              subHeaderComponent={subHeaderComponentMemo}
              noDataComponent={<div>No hay pacientes disponibles para mostrar.</div>}
            />

            <Modal show={showModal} onHide={handleCloseModal} size="xl">
              <Modal.Header closeButton>
                <Modal.Title>{userForm.id_paciente ? 'Editar Paciente' : 'Agregar Paciente'}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Row>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Nombres</Form.Label>
                        <Form.Control
                          name="nombre_paciente"
                          //onChange={handleInputChange}
                          onChange={(e) => {
                            const regex = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/;
                            const value = e.target.value;
                            if (regex.test(value) || value === '') {
                              handleInputChange(e); // Permite actualizar solo si pasa la validación
                            }
                          }}
                          value={userForm.nombre_paciente || ''}
                          type="text"
                          isInvalid={!!errors.nombre_paciente}
                          required
                        />
                        <Form.Control.Feedback type="invalid">{errors.nombre_paciente}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Apellidos</Form.Label>
                        <Form.Control
                          name="apellido_paciente"
                          //onChange={handleInputChange}
                          onChange={(e) => {
                            const regex = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/;
                            const value = e.target.value;
                            if (regex.test(value) || value === '') {
                              handleInputChange(e); // Permite actualizar solo si pasa la validación
                            }
                          }}
                          value={userForm.apellido_paciente || ''}
                          type="text"
                          isInvalid={!!errors.apellido_paciente}
                          required
                        />
                        <Form.Control.Feedback type="invalid">{errors.apellido_paciente}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>DUI</Form.Label>
                        <Form.Control
                          name="dui_paciente"
                          value={userForm.dui_paciente || ''}
                          //onChange={handleInputChange}
                          onChange={(e) => {
                            const value = e.target.value;
                            const regex = /^[0-9]{0,8}(-[0-9]{0,1})?$/; // Regex para DUI

                            // Solo actualiza el estado si el valor es válido
                            if (regex.test(value)) {
                              handleInputChange(e); // Permite actualizar solo si pasa la validación
                            }
                          }}
                          type="text"
                          maxLength={10}
                          isInvalid={!!errors.dui_paciente}
                          required
                        />
                        <Form.Control.Feedback type="invalid">{errors.dui_paciente}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Teléfono</Form.Label>
                        <Form.Control
                          name="telefono_paciente"
                          value={userForm.telefono_paciente || ''}
                          //onChange={handleInputChange}
                          onChange={(e) => {
                            const regex = /^[0-9]{0,4}(-?[0-9]{0,4})$/; // Permite 4 dígitos, guion opcional y otros 4 dígitos
                            if (regex.test(e.target.value)) {
                              handleInputChange(e); // Llama a la función para manejar el cambio si pasa la validación
                            }
                          }}
                          type="text"
                          maxLength={9}
                          isInvalid={!!errors.telefono_paciente}
                          required
                        />
                        <Form.Control.Feedback type="invalid">{errors.telefono_paciente}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mt-2">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Número de Expediente</Form.Label>
                      <Form.Control
                        name="n_expediente"
                        value={userForm.n_expediente || ""}
                        onChange={handleInputChange}
                        type="text"
                        readOnly
                        isInvalid={!!errors.n_expediente}
                        required
                      />
                      <Form.Text className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem', fontWeight: 'bold' }}>
                        Este campo se genera automáticamente.
                      </Form.Text>
                      <Form.Control.Feedback type="invalid">
                        {errors.n_expediente}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                    <Col md={8}>
                      <Form.Group>
                        <Form.Label>Dirección</Form.Label>
                        <Form.Control
                          name="direccion_paciente"
                          onChange={handleInputChange}
                          type="text"
                          value={userForm.direccion_paciente || ''}
                          isInvalid={!!errors.direccion_paciente}
                          required
                        />
                        <Form.Control.Feedback type="invalid">{errors.direccion_paciente}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mt-2">
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Fecha de nacimiento</Form.Label>
                        <Form.Control
                          name="fecha_nacimiento_paciente"
                          onChange={handleInputChange}
                          type="date"
                          value={
                            userForm.fecha_nacimiento_paciente
                              ? userForm.fecha_nacimiento_paciente.split('T')[0] // Extraer solo la fecha
                              : ''
                          }
                          isInvalid={!!errors.fecha_nacimiento_paciente}
                          required
                        />
                        <Form.Control.Feedback type="invalid">{errors.fecha_nacimiento_paciente}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Sexo</Form.Label>
                        <Form.Select
                          name="sexo_paciente"
                          onChange={handleInputChange}
                          value={userForm.sexo_paciente || ''}
                          isInvalid={!!errors.sexo_paciente}
                        >
                          <option value="">Seleccione..</option>
                          <option value="M">Masculino</option>
                          <option value="F">Femenino</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{errors.sexo_paciente}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Nombre de contacto de emergencia </Form.Label>
                        <Form.Control
                          name="contactoE_nombre"
                          onChange={handleInputChange}
                          value={userForm.contactoE_nombre || ''}
                          type="text"
                          isInvalid={!!errors.contactoE_nombre}
                          required
                        />
                        <Form.Control.Feedback type="invalid">{errors.contactoE_nombre}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Parentesco del contacto de emergencia </Form.Label>
                        <Form.Control
                          name="contactoE_parentesco"
                          onChange={handleInputChange}
                          value={userForm.contactoE_parentesco || ''}
                          type="text"
                          isInvalid={!!errors.contactoE_parentesco}
                          required
                        />
                        <Form.Control.Feedback type="invalid">{errors.contactoE_parentesco}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Teléfono del contacto de emergencia </Form.Label>
                        <Form.Control
                          name="contactoE_telefono"
                          value={userForm.contactoE_telefono || ''}
                          onChange={handleInputChange}
                          type="text"
                          maxLength={9}
                          isInvalid={!!errors.contactoE_telefono}
                          required
                        />
                        <Form.Control.Feedback type="invalid">{errors.contactoE_telefono}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Nombre del responsable (Si aplica)</Form.Label>
                        <Form.Control
                          name="responsable_nombre"
                          onChange={handleInputChange}
                          value={userForm.responsable_nombre || ''}
                          type="text"
                          isInvalid={!!errors.responsable_nombre}
                          required
                        />
                        <Form.Control.Feedback type="invalid">{errors.responsable_nombre}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Parentesco del responsable (Si aplica) </Form.Label>
                        <Form.Control
                          name="responsable_parentesco"
                          onChange={handleInputChange}
                          value={userForm.responsable_parentesco || ''}
                          type="text"
                          isInvalid={!!errors.responsable_parentesco}
                          required
                        />
                        <Form.Control.Feedback type="invalid">{errors.responsable_parentesco}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>DUI del responsable (Si aplica)</Form.Label>
                        <Form.Control
                          name="responsable_dui"
                          value={userForm.responsable_dui || ''}
                          onChange={handleInputChange}
                          type="text"
                          maxLength={10}
                          isInvalid={!!errors.responsable_dui}
                          required
                        />
                        <Form.Control.Feedback type="invalid">{errors.responsable_dui}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Teléfono del responsable (Si aplica)</Form.Label>
                        <Form.Control
                          name="responsable_telefono"
                          value={userForm.responsable_telefono || ''}
                          onChange={handleInputChange}
                          type="text"
                          maxLength={9}
                          isInvalid={!!errors.responsable_telefono}
                          required
                        />
                        <Form.Control.Feedback type="invalid">{errors.responsable_telefono}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="primary" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button variant="info" onClick={userForm.id_paciente ? handleEditUser : handleSaveUser}>
                  {userForm.id_paciente ? 'Actualizar Paciente' : 'Guardar Paciente'}
                </Button>
              </Modal.Footer>
            </Modal>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default Pacientes;