import React, { useEffect, useState } from 'react';
import { Button, InputGroup, FormControl, Container, Modal, Form, Row, Col } from 'react-bootstrap';
import Card from '../../components/Card/MainCard';

import DataTable from 'react-data-table-component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faToggleOn, faEye, faEyeSlash, faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
//import { data } from 'jquery';
import { areaService } from 'services/areaService';
//import { area } from 'd3';

const Areas = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal_area, setShowModal_area] = useState(false);
  const [Areas, setAreas] = useState([]);

  const initialUserState = {
    nombre_area: '',
    id_area: ''
  };

  const [userForm, setUserForm] = useState(initialUserState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadAreas = async () => {
      try {
        const data = await areaService.getAreas();
        setAreas(data);
      } catch (error) {
        console.error('Error al obtener los roles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAreas();
  }, []);

  //al abrir establecer vacios
  const handleShowAddModal_area = () => {
    setUserForm(initialUserState);
    setShowModal_area(true);
  };

  //cerrar modales emergentes
  const handleCloseModal = () => {
    setShowModal_area(false);
  };

  //carga por id y Muestra el modal editar
  const handleShowEditModal_area = async (Id) => {
    try {
      const user_esp = await areaService.getAreaById(Id);
      setUserForm(user_esp[0]);
      setShowModal_area(true);
    } catch (error) {
      console.error('web: Error al obtener El area:', error);
    }
  };

  //al hacer cambios, establecerlos en el modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm({ ...userForm, [name]: value });
  };

  const validateFields = () => {
    const newErrors = {};
    if (!userForm.nombre_area) newErrors.nombre_area = 'El nombre es requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave_area = async () => {
    if (!validateFields()) return;

    try {
      const response = await areaService.createArea(userForm);
      console.log('Especialidad guardada:', response);

      const data = await areaService.getAreas();
      setAreas(data);

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
      console.error('web: Error al guardar el area:', error);
    }
  };

  const handleEdit_esp = async () => {
    if (!validateFields()) return;
    const updatedUser_area = { ...userForm };

    try {
      const response = await areaService.updateArea(userForm.id_area, updatedUser_area);
      console.log(' Area actualizada:', response);

      // Actualizar la lista
      const data = await areaService.getAreas();
      setAreas(data);

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
      await areaService.changeStateArea(Id);

      const data = await areaService.getAreas();
      setAreas(data);

      Swal.fire({
        title: 'Éxito',
        text: `Estado del area actualizado exitosamente!`,
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

  const columns_areas = [
    { name: 'Nombre del Área', selector: (row) => `${row.nombre_area}`, sortable: true },
    { name: 'Estado', selector: (row) => `${row.estado}` },
    {
      name: 'Acciones',
      cell: (row) => (
        <div className="btn-group mt-2 mb-2" role="group" aria-label="esp actions">
          <Button variant="warning" onClick={() => handleShowEditModal_area(row.id_area)}>
            <FontAwesomeIcon icon={faEdit} className="me-1" />
          </Button>

          <Button variant={row.estado === 'activo' ? 'danger' : 'danger'} onClick={() => toggleEspState2(row.id_area)}>
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
        <Card title="Áreas" isOption>
          <Button onClick={() => handleShowAddModal_area()} variant="info">
            <FontAwesomeIcon icon={faPlus} className="me-1" /> Agregar Nuevo
          </Button>

          <Row className="justify-content-end">
            <Col md={4}>
              <Form.Label>Nombre Área:</Form.Label>
              {subHeaderComponentMemo}
            </Col>
          </Row>
          <DataTable
            className="mt-4"
            columns={columns_areas}
            data={Areas.filter((areas) => areas.nombre_area.toLowerCase().includes(searchTerm.toLowerCase()))}
            pagination
            striped
            responsive
            highlightOnHover
            dense
            noHeader
            noDataComponent={<div>No hay usuarios disponibles para mostrar.</div>}
          />
        </Card>
      </Row>

      <Modal show={showModal_area} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{userForm.id_area ? 'Editar Área' : 'Registrar Nueva Área'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    name="nombre_area"
                    onChange={(e) => {
                      const regex = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/;
                      const value = e.target.value;
                      if (regex.test(value) || value === '') {
                        handleInputChange(e); // Permite actualizar solo si pasa la validación
                      }
                    }}
                    value={userForm.nombre_area || ''}
                    type="text"
                    maxLength={100} // Límite
                    isInvalid={!!errors.nombre_area}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{errors.nombre_area}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="info" onClick={userForm.id_area ? handleEdit_esp : handleSave_area}>
            {userForm.id_area ? 'Actualizar Área' : 'Guardar Área'}
          </Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
};

export default Areas;
