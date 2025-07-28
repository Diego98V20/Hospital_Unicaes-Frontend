import React, { useEffect, useState } from 'react';
import { Container, InputGroup, FormControl, Row, Button, Modal } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { listarExamenesPendientesService } from 'services/examenService';
import Card from '../../components/Card/MainCard';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Examenes = () => {
    const [examenes, setExamenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [showInactiveConfirmModal, setShowInactiveConfirmModal] = useState(false);
    const [inactiveExamId, setInactiveExamId] = useState(null);

    const loadExamenes = async () => {
        try {
            const data = await listarExamenesPendientesService.getExamenesPendientes();
            setExamenes(data);
        } catch (error) {
            console.error('Error al cargar exámenes pendientes:', error);
            Swal.fire('Error', 'No se pudieron cargar los exámenes pendientes.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExamenes();
    }, []);

    const handleOpenInactiveConfirmModal = (id) => {
        setInactiveExamId(id);
        setShowInactiveConfirmModal(true);
    };

    const handleCloseInactiveConfirmModal = () => {
        setShowInactiveConfirmModal(false);
        setInactiveExamId(null);
    };

    const handleMarcarComoInactivo = async () => {
      try {
          await listarExamenesPendientesService.marcarExamenComoInactivo(inactiveExamId); // 
          Swal.fire('Éxito', 'Examen marcado como inactivo.', 'success').then(() => {
              navigate('/examenes-pendientes');
          });
      } catch (error) {
          console.error('Error al marcar el examen como inactivo:', error);
          Swal.fire('Error', 'No se pudo marcar el examen como inactivo.', 'error');
      }
  };

    const columns = [
        { name: 'Nombre de Muestra', selector: row => `${row.nombre_muestra}`, sortable: true },
        { name: 'Examen', selector: row => row.examen_nombre, sortable: true },
        { name: 'Nombre del Paciente', selector: row => `${row.nombre_paciente} ${row.apellido_paciente}`, sortable: true },
        { name: 'N° de expediente', selector: row => `${row.n_expediente}`,sortable: true},
        { name: 'Doctor Responsable', selector: row => `${row.doctor_nombre} ${row.doctor_apellido}`, sortable: true },
        { name: 'Fecha de Solicitud', selector: row => new Date(row.fecha_solicitud).toLocaleDateString('es-ES'), sortable: true },
        {
            name: 'Completar',
            cell: row => (
                <Button
                    variant="success"
                    size="sm"
                    className="mt-2 mb-2 ps-3 pe-2"
                    onClick={() => navigate(`/examenes/${row.id_examen}/resultados`)}
                    disabled={loading}
                >
                    <i className="fas fa-pen"></i>
                </Button>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true
        },
        {
            name: 'Marcar Inactivo',
            cell: row => (
                <Button
                    variant="danger"
                    size="sm"
                    className="mt-2 mb-2 ps-3 pe-2"
                    onClick={() => handleOpenInactiveConfirmModal(row.id_examen)}
                    disabled={loading}
                >
                    <i className="fas fa-trash"></i>
                </Button>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true
        }
    ];

    const filteredExamenes = examenes.filter(examen =>
        `${examen.nombre_paciente} ${examen.apellido_paciente} ${examen.examen_nombre} ${examen.n_expediente}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <p>Cargando exámenes pendientes...</p>;

    return (
        <Row>
            <Card title="Exámenes Pendientes">
                <Container className="mb-3">
                    <InputGroup>
                        <FormControl
                            placeholder="Buscar examen o paciente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Container>
                <DataTable
                    columns={columns}
                    data={filteredExamenes}
                    pagination
                    striped
                    highlightOnHover
                    responsive
                    dense
                    noDataComponent={<div>No hay exámenes pendientes para mostrar.</div>}
                />
            </Card>

            {/* Modal de Confirmación para Marcar como Inactivo */}
            <Modal show={showInactiveConfirmModal} onHide={handleCloseInactiveConfirmModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Inactivación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Estás seguro de que deseas marcar este examen como inactivo?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseInactiveConfirmModal}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleMarcarComoInactivo} disabled={loading}>
                        Marcar como Inactivo
                    </Button>
                </Modal.Footer>
            </Modal>
        </Row>
    );
};

export default Examenes;