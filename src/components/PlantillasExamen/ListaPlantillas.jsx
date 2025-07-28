import React, { useEffect, useState } from 'react';
import { Container, InputGroup, FormControl, Row, Button, Modal, Badge } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { plantillaCompleteService } from 'services/plantillaExamenService';
import Card from '../../components/Card/MainCard';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ListaPlantillas = () => {
    const [plantillas, setPlantillas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [plantillaAEliminar, setPlantillaAEliminar] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        cargarPlantillas();
    }, []);

    const cargarPlantillas = async () => {
        try {
            setLoading(true);
            const data = await plantillaCompleteService.listarTodasPlantillas();
            setPlantillas(data);
        } catch (error) {
            console.error('Error al cargar plantillas:', error);
            Swal.fire('Error', 'No se pudieron cargar las plantillas.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleNuevaPlantilla = () => {
        navigate('/plantillas-examen/crear');
    };

    const handleVerPlantilla = (id_plantilla) => {
        navigate(`/plantillas-examen/${id_plantilla}`);
    };

    const handleEditarPlantilla = (id_plantilla) => {
        navigate(`/plantillas-examen/${id_plantilla}/editar`);
    };

    const handleDuplicarPlantilla = async (plantilla) => {
        try {
            const { value: nuevosData } = await Swal.fire({
                title: 'Duplicar Plantilla',
                html: `
                    <div class="mb-3">
                        <label for="nombre" class="form-label">Nombre de la nueva plantilla:</label>
                        <input type="text" id="nombre" class="form-control" 
                               value="${plantilla.nombre_plantilla} (Copia)" 
                               placeholder="Ingrese el nombre">
                    </div>
                    <div class="mb-3">
                        <label for="descripcion" class="form-label">Descripción (opcional):</label>
                        <textarea id="descripcion" class="form-control" rows="3" 
                                  placeholder="Descripción de la plantilla">${plantilla.descripcion || ''}</textarea>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Duplicar',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    const nombre = document.getElementById('nombre').value;
                    const descripcion = document.getElementById('descripcion').value;
                    
                    if (!nombre.trim()) {
                        Swal.showValidationMessage('El nombre es requerido');
                        return false;
                    }
                    
                    return {
                        nombre_plantilla: nombre.trim(),
                        descripcion: descripcion.trim()
                    };
                }
            });

            if (nuevosData) {
                await plantillaCompleteService.duplicarPlantilla(plantilla.id_plantilla, nuevosData);
                Swal.fire('Éxito', 'Plantilla duplicada exitosamente.', 'success');
                cargarPlantillas();
            }
        } catch (error) {
            console.error('Error al duplicar plantilla:', error);
            Swal.fire('Error', 'No se pudo duplicar la plantilla.', 'error');
        }
    };

    const handleEliminarPlantilla = (plantilla) => {
        setPlantillaAEliminar(plantilla);
        setShowDeleteModal(true);
    };

    const confirmarEliminar = async () => {
        try {
            await plantillaCompleteService.desactivarPlantilla(plantillaAEliminar.id_plantilla);
            setPlantillas(prev => prev.filter(p => p.id_plantilla !== plantillaAEliminar.id_plantilla));
            Swal.fire('Éxito', 'Plantilla desactivada exitosamente.', 'success');
        } catch (error) {
            console.error('Error al desactivar plantilla:', error);
            Swal.fire('Error', 'No se pudo desactivar la plantilla.', 'error');
        } finally {
            setShowDeleteModal(false);
            setPlantillaAEliminar(null);
        }
    };

    const columns = [
        {
            name: 'Nombre',
            selector: row => row.nombre_plantilla,
            sortable: true,
            grow: 2
        },
        {
            name: 'Tipo de Examen',
            selector: row => row.tipo_examen_nombre,
            sortable: true,
            cell: row => (
                <Badge bg="primary" className="p-2">
                    {row.tipo_examen_nombre}
                </Badge>
            )
        },
        {
            name: 'Parámetros',
            selector: row => row.total_parametros,
            sortable: true,
            center: true,
            cell: row => (
                <Badge bg="info" className="p-2">
                    {row.total_parametros} parámetros
                </Badge>
            )
        },
        {
            name: 'Creador',
            selector: row => `${row.creador_nombre} ${row.creador_apellido}`,
            sortable: true
        },
        {
            name: 'Fecha Modificación',
            selector: row => new Date(row.fecha_modificacion).toLocaleDateString('es-ES'),
            sortable: true
        },
        {
            name: 'Acciones',
            cell: row => (
                <div className="d-flex gap-1">
                    <Button
                        variant="info"
                        size="sm"
                        onClick={() => handleVerPlantilla(row.id_plantilla)}
                        title="Ver Plantilla"
                    >
                        <i className="fas fa-eye"></i>
                    </Button>
                    <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleEditarPlantilla(row.id_plantilla)}
                        title="Editar Plantilla"
                    >
                        <i className="fas fa-edit"></i>
                    </Button>
                    <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleDuplicarPlantilla(row)}
                        title="Duplicar Plantilla"
                    >
                        <i className="fas fa-copy"></i>
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleEliminarPlantilla(row)}
                        title="Desactivar Plantilla"
                    >
                        <i className="fas fa-trash"></i>
                    </Button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true
        }
    ];

    const filteredPlantillas = plantillas.filter(plantilla =>
        `${plantilla.nombre_plantilla} ${plantilla.tipo_examen_nombre} ${plantilla.descripcion || ''}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    if (loading) return <p>Cargando plantillas...</p>;

    return (
        <>
            <Row>
                <Card title="Gestión de Plantillas de Exámenes">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="m-0">Plantillas disponibles ({plantillas.length})</h5>
                        <Button 
                            variant="primary" 
                            onClick={handleNuevaPlantilla}
                            disabled={loading}
                        >
                            <i className="fas fa-plus me-2"></i>
                            Nueva Plantilla
                        </Button>
                    </div>

                    <Container className="mb-3">
                        <InputGroup>
                            <FormControl
                                placeholder="Buscar plantillas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </Container>

                    <DataTable
                        columns={columns}
                        data={filteredPlantillas}
                        pagination
                        striped
                        highlightOnHover
                        responsive
                        dense
                        progressPending={loading}
                        noDataComponent={
                            <div className="text-center p-4">
                                <i className="fas fa-file-medical fa-3x text-muted mb-3"></i>
                                <p>No hay plantillas disponibles</p>
                                <Button variant="primary" onClick={handleNuevaPlantilla}>
                                    Crear Primera Plantilla
                                </Button>
                            </div>
                        }
                    />
                </Card>
            </Row>

            {/* Modal de confirmación para eliminar */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Desactivación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {plantillaAEliminar && (
                        <>
                            <p>¿Estás seguro de que deseas desactivar la plantilla?</p>
                            <div className="alert alert-warning">
                                <strong>Plantilla:</strong> {plantillaAEliminar.nombre_plantilla}<br/>
                                <strong>Tipo:</strong> {plantillaAEliminar.tipo_examen_nombre}<br/>
                                <strong>Parámetros:</strong> {plantillaAEliminar.total_parametros}
                            </div>
                            <small className="text-muted">
                                Esta acción no eliminará la plantilla permanentemente, 
                                solo la marcará como inactiva.
                            </small>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={confirmarEliminar}>
                        Sí, Desactivar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ListaPlantillas;