import React, { useEffect, useState } from 'react';
import { Button, InputGroup, FormControl, Container, Modal, Form, Row, Col } from 'react-bootstrap';
import Card from '../../components/Card/MainCard';

import DataTable from 'react-data-table-component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faToggleOn, faEye, faEyeSlash, faTrash } from '@fortawesome/free-solid-svg-icons';
import { specialtyService } from 'services/specialtyService';
import Swal from 'sweetalert2';
import { data } from 'jquery';

const Especialidades = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal_esp, setShowModal_esp] = useState(false);
  const [especialidades, setEspecialidades] = useState([]);

  const initialUserState = {
    nombre_especialidad: '',
    id_especialidad: ''
  };

  const [userForm, setUserForm] = useState(initialUserState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadEspecialidades = async () => {
      try {
        const data = await specialtyService.getEspecialidades();
        setEspecialidades(data);
      } catch (error) {
        console.error('web: Error al obtener las especialidades:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEspecialidades();
  }, []);

  //al abrir establecer vacios
  const handleShowAddModal_esp = () => {
    setUserForm(initialUserState);
    setShowModal_esp(true);
  };

  //cerrar modales emergentes
  const handleCloseModal = () => {
    setShowModal_esp(false);
  };

  //carga la esp por id y  Muestra el modal editar ESPECIALIDAD
  const handleShowEditModal_esp = async (Id) => {
    try {
      const user_esp = await specialtyService.getEspecialidadById(Id);
      setUserForm(user_esp[0]);
      setShowModal_esp(true);

      console.log('Epecialidad ID:', Id);
      console.log('Epecialidad ID:', user_esp[0]);
    } catch (error) {
      console.error('web: Error al obtener la especialidad:', error);
    }
  };

  //al hacer cambios, establecerlos en el modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm({ ...userForm, [name]: value });
  };

  const validateFields = () => {
    const newErrors = {};
    if (!userForm.nombre_especialidad) newErrors.nombre_especialidad = 'El nombre es requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave_esp = async () => {
    if (!validateFields()) return;

    try {
      const response = await specialtyService.createEspecialidad(userForm);
      console.log('Especialidad guardada:', response);

      const data = await specialtyService.getEspecialidades();
      setEspecialidades(data);

      Swal.fire({
        title: 'Éxito',
        text: 'Espexialidad agregada exitosamente!',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });

      handleCloseModal();
    } catch (error) {
      console.error('web: Error al guardar el usuario:', error);
    }
  };

  const handleEdit_esp = async () => {
    if (!validateFields()) return;
    const updatedUser_esp = { ...userForm };

    try {
      const response = await specialtyService.updateEspecialidad(userForm.id_especialidad, updatedUser_esp);
      console.log(' Especialidad actualizada:', response);

      // Actualizar la lista
      const data = await specialtyService.getEspecialidades();
      setEspecialidades(data);

      Swal.fire({
        title: 'Éxito',
        text: 'Especialidad actualizada exitosamente!',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });

      handleCloseModal();
    } catch (error) {
      console.error('web: Error al actualizar:', error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al actualizar el nombre.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  //Toggle para cambiar de estado
  const toggleEspState2 = async (Id) => {
    try {
      await specialtyService.changeStateEspecialidad(Id);

      const data = await specialtyService.getEspecialidades();
      setEspecialidades(data);

      Swal.fire({
        title: 'Éxito',
        text: `Estado de la especialidad actualizado exitosamente!`,
        icon: 'success',
        confirmButtonText: 'Aceptar',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (error) {
      console.error('web: Error al cambiar el estado:', error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al cambiar el estado.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  //Columnas especialidad
  const columns_especialidad = [
    // { name: 'ID', selector: (row) => `${row.id_especialidad}` },
    { name: 'Nombre de Especialidad', selector: (row) => `${row.nombre_especialidad}`, sortable: true },
    { name: 'Estado', selector: (row) => `${row.estado}` },
    {
      name: 'Acciones',
      cell: (row) => (
        <div className="btn-group mt-2 mb-2" role="group" aria-label="esp actions">
          <Button variant="warning" onClick={() => handleShowEditModal_esp(row.id_especialidad)}>
            <FontAwesomeIcon icon={faEdit} className="me-1" />
          </Button>

          <Button variant={row.estado === 'activo' ? 'danger' : 'danger'} onClick={() => toggleEspState2(row.id_especialidad)}>
            <FontAwesomeIcon icon={faTrash} className="me-1" />
          </Button>
        </div>
      )
    }
  ];
  //Termina Columnas especialidad

  const subHeaderComponentMemo = React.useMemo(() => {
    return (
      <Container>
        <InputGroup>
          <FormControl placeholder="Buscar" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </InputGroup>
      </Container>
    );
  }, [searchTerm]);
  //si no hay datos disponibles en la tabla
  if (loading) {
    return <p>Cargando datos...</p>;
  }
  return (
    <React.Fragment>
      <Row>
        <Card title="Especialidades" isOption>
          <Button onClick={() => handleShowAddModal_esp()} variant="info">
            <FontAwesomeIcon icon={faPlus} className="me-1" /> Agregar Nuevo
          </Button>

          <Row className="justify-content-end">
            <Col md={4}>
              <Form.Label>Nombre Especilidad:</Form.Label>
              {subHeaderComponentMemo}
            </Col>
          </Row>
          {/* <Button onClick={() => handleShowAddModal()} variant="primary">
              <FontAwesomeIcon icon={faPlus} className="me-1" /> Agregar Especialidad
            </Button> */}
          <DataTable
            className="mt-4"
            columns={columns_especialidad}
            data={especialidades.filter((esp) => esp.nombre_especialidad.toLowerCase().includes(searchTerm.toLowerCase()))}
            pagination
            striped
            responsive
            highlightOnHover
            dense
            noHeader
            // subHeader
            // subHeaderComponent={subHeaderComponentMemo}
            noDataComponent={<div>No hay usuarios disponibles para mostrar.</div>}
          />
        </Card>
      </Row>

      <Modal show={showModal_esp} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{userForm.id_especialidad ? 'Editar Especialidad' : 'Agregar Nueva Especialidad'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    name="nombre_especialidad"
                    onChange={(e) => {
                      const regex = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/;
                      const value = e.target.value;
                      if (regex.test(value) || value === '') {
                        handleInputChange(e); // Permite actualizar solo si pasa la validación
                      }
                    }}
                    value={userForm.nombre_especialidad || ''}
                    type="text"
                    maxLength={100} // Límite
                    isInvalid={!!errors.nombre_especialidad}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{errors.nombre_especialidad}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="info" onClick={userForm.id_especialidad ? handleEdit_esp : handleSave_esp}>
            {userForm.id_especialidad ? 'Actualizar Especialidad' : 'Guardar Especialidad'}
          </Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
};

export default Especialidades;
