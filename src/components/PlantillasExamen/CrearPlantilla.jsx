import React, { useState, useEffect } from 'react';
import { Container, Row, Form, Button, Modal, Table, Alert, Badge } from 'react-bootstrap';
import { plantillaCompleteService } from 'services/plantillaExamenService';
import Card from '../../components/Card/MainCard';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const CrearPlantilla = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [tiposExamen, setTiposExamen] = useState([]);
    
    // Estados para la plantilla
    const [plantillaData, setPlantillaData] = useState({
        nombre_plantilla: '',
        descripcion: '',
        id_tipo_examen: ''
    });

    // Estados para parámetros
    const [parametros, setParametros] = useState([]);
    const [showParametroModal, setShowParametroModal] = useState(false);
    const [parametroActual, setParametroActual] = useState({
        nombre_parametro: '',
        unidad: '',
        rango_referencia: '',
        valor_por_defecto: '',
        es_obligatorio: false
    });
    const [editandoParametro, setEditandoParametro] = useState(null);

    useEffect(() => {
        cargarTiposExamen();
    }, []);

    const cargarTiposExamen = async () => {
        try {
            const tipos = await plantillaCompleteService.listarTiposExamen();
            setTiposExamen(tipos);
        } catch (error) {
            console.error('Error al cargar tipos de examen:', error);
            Swal.fire('Error', 'No se pudieron cargar los tipos de examen.', 'error');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPlantillaData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleParametroChange = (e) => {
        const { name, value, type, checked } = e.target;
        setParametroActual(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const abrirModalParametro = () => {
        setParametroActual({
            nombre_parametro: '',
            unidad: '',
            rango_referencia: '',
            valor_por_defecto: '',
            es_obligatorio: false
        });
        setEditandoParametro(null);
        setShowParametroModal(true);
    };

    const editarParametro = (index) => {
        setParametroActual(parametros[index]);
        setEditandoParametro(index);
        setShowParametroModal(true);
    };

    const guardarParametro = () => {
        if (!parametroActual.nombre_parametro.trim()) {
            Swal.fire('Error', 'El nombre del parámetro es requerido.', 'error');
            return;
        }

        // Verificar duplicados (excepto si estamos editando)
        const nombreExiste = parametros.some((param, index) => 
            param.nombre_parametro.toLowerCase() === parametroActual.nombre_parametro.toLowerCase() &&
            index !== editandoParametro
        );

        if (nombreExiste) {
            Swal.fire('Error', 'Ya existe un parámetro con ese nombre.', 'error');
            return;
        }

        const nuevoParametro = {
            ...parametroActual,
            orden: editandoParametro !== null ? parametros[editandoParametro].orden : parametros.length + 1
        };

        if (editandoParametro !== null) {
            // Editar parámetro existente
            const nuevosParametros = [...parametros];
            nuevosParametros[editandoParametro] = nuevoParametro;
            setParametros(nuevosParametros);
        } else {
            // Agregar nuevo parámetro
            setParametros(prev => [...prev, nuevoParametro]);
        }

        setShowParametroModal(false);
    };

    const eliminarParametro = (index) => {
        Swal.fire({
            title: '¿Eliminar parámetro?',
            text: `¿Estás seguro de eliminar "${parametros[index].nombre_parametro}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                setParametros(prev => prev.filter((_, i) => i !== index));
            }
        });
    };

    const moverParametro = (index, direccion) => {
        const nuevosParametros = [...parametros];
        const nuevoIndex = direccion === 'arriba' ? index - 1 : index + 1;
        
        if (nuevoIndex >= 0 && nuevoIndex < parametros.length) {
            [nuevosParametros[index], nuevosParametros[nuevoIndex]] = 
            [nuevosParametros[nuevoIndex], nuevosParametros[index]];
            
            // Actualizar órdenes
            nuevosParametros.forEach((param, i) => {
                param.orden = i + 1;
            });
            
            setParametros(nuevosParametros);
        }
    };

    const validarFormulario = () => {
        if (!plantillaData.nombre_plantilla.trim()) {
            Swal.fire('Error', 'El nombre de la plantilla es requerido.', 'error');
            return false;
        }

        if (!plantillaData.id_tipo_examen) {
            Swal.fire('Error', 'Debe seleccionar un tipo de examen.', 'error');
            return false;
        }

        if (parametros.length === 0) {
            Swal.fire('Error', 'Debe agregar al menos un parámetro.', 'error');
            return false;
        }

        return true;
    };

    const guardarPlantilla = async () => {
        if (!validarFormulario()) return;

        try {
            setLoading(true);

            // Crear la plantilla
            const resultadoPlantilla = await plantillaCompleteService.crearPlantilla(plantillaData);
            const idPlantilla = resultadoPlantilla.id_plantilla;

            // Agregar todos los parámetros
            for (let i = 0; i < parametros.length; i++) {
                const parametro = {
                    ...parametros[i],
                    orden: i + 1
                };
                await plantillaCompleteService.agregarParametro(idPlantilla, parametro);
            }

            Swal.fire({
                title: 'Éxito',
                text: 'Plantilla creada exitosamente.',
                icon: 'success',
                confirmButtonText: 'Ver Plantilla'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate(`/plantillas-examen/${idPlantilla}`);
                } else {
                    navigate('/plantillas-examen');
                }
            });

        } catch (error) {
            console.error('Error al guardar plantilla:', error);
            Swal.fire('Error', 'No se pudo guardar la plantilla.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const cancelar = () => {
        if (plantillaData.nombre_plantilla || parametros.length > 0) {
            Swal.fire({
                title: '¿Cancelar creación?',
                text: 'Se perderán todos los datos ingresados.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, cancelar',
                cancelButtonText: 'Continuar editando'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/plantillas-examen');
                }
            });
        } else {
            navigate('/plantillas-examen');
        }
    };

    return (
        <>
            <Row>
                <Card title="Crear Nueva Plantilla de Examen">
                    <Container>
                        {/* Formulario de plantilla */}
                        <Form>
                            <Row className="mb-3">
                                <Form.Group className="col-md-8">
                                    <Form.Label>Nombre de la Plantilla *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nombre_plantilla"
                                        value={plantillaData.nombre_plantilla}
                                        onChange={handleInputChange}
                                        placeholder="Ej: Hemograma Completo Estándar"
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="col-md-4">
                                    <Form.Label>Tipo de Examen *</Form.Label>
                                    <Form.Select
                                        name="id_tipo_examen"
                                        value={plantillaData.id_tipo_examen}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Seleccionar tipo...</option>
                                        {tiposExamen.map(tipo => (
                                            <option key={tipo.id_tipo_examen} value={tipo.id_tipo_examen}>
                                                {tipo.nombre}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Row>

                            <Form.Group className="mb-4">
                                <Form.Label>Descripción</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="descripcion"
                                    value={plantillaData.descripcion}
                                    onChange={handleInputChange}
                                    placeholder="Descripción opcional de la plantilla..."
                                />
                            </Form.Group>
                        </Form>

                        {/* Sección de parámetros */}
                        <div className="border-top pt-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5>Parámetros de la Plantilla</h5>
                                <Button variant="success" onClick={abrirModalParametro}>
                                    <i className="fas fa-plus me-2"></i>
                                    Agregar Parámetro
                                </Button>
                            </div>

                            {parametros.length === 0 ? (
                                <Alert variant="info">
                                    <i className="fas fa-info-circle me-2"></i>
                                    No hay parámetros agregados. Los parámetros definen qué resultados 
                                    se capturarán en los exámenes que usen esta plantilla.
                                </Alert>
                            ) : (
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th style={{width: '30px'}}>#</th>
                                            <th>Parámetro</th>
                                            <th>Unidad</th>
                                            <th>Rango Referencia</th>
                                            <th>Valor por Defecto</th>
                                            <th style={{width: '100px'}}>Obligatorio</th>
                                            <th style={{width: '150px'}}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parametros.map((param, index) => (
                                            <tr key={index}>
                                                <td className="text-center">{index + 1}</td>
                                                <td><strong>{param.nombre_parametro}</strong></td>
                                                <td>{param.unidad}</td>
                                                <td>{param.rango_referencia}</td>
                                                <td>{param.valor_por_defecto}</td>
                                                <td className="text-center">
                                                    {param.es_obligatorio ? (
                                                        <Badge bg="danger">Obligatorio</Badge>
                                                    ) : (
                                                        <Badge bg="secondary">Opcional</Badge>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => moverParametro(index, 'arriba')}
                                                            disabled={index === 0}
                                                            title="Mover arriba"
                                                        >
                                                            <i className="fas fa-arrow-up"></i>
                                                        </Button>
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => moverParametro(index, 'abajo')}
                                                            disabled={index === parametros.length - 1}
                                                            title="Mover abajo"
                                                        >
                                                            <i className="fas fa-arrow-down"></i>
                                                        </Button>
                                                        <Button
                                                            variant="warning"
                                                            size="sm"
                                                            onClick={() => editarParametro(index)}
                                                            title="Editar"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => eliminarParametro(index)}
                                                            title="Eliminar"
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </div>

                        {/* Botones de acción */}
                        <div className="d-flex justify-content-end gap-2 pt-4 border-top">
                            <Button variant="secondary" onClick={cancelar} disabled={loading}>
                                Cancelar
                            </Button>
                            <Button 
                                variant="primary" 
                                onClick={guardarPlantilla} 
                                disabled={loading || parametros.length === 0}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-save me-2"></i>
                                        Guardar Plantilla
                                    </>
                                )}
                            </Button>
                        </div>
                    </Container>
                </Card>
            </Row>

            {/* Modal para agregar/editar parámetro */}
            <Modal show={showParametroModal} onHide={() => setShowParametroModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editandoParametro !== null ? 'Editar Parámetro' : 'Agregar Parámetro'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            <Form.Group className="col-md-8 mb-3">
                                <Form.Label>Nombre del Parámetro *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="nombre_parametro"
                                    value={parametroActual.nombre_parametro}
                                    onChange={handleParametroChange}
                                    placeholder="Ej: Hemoglobina, Glucosa, etc."
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="col-md-4 mb-3">
                                <Form.Label>Unidad</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="unidad"
                                    value={parametroActual.unidad}
                                    onChange={handleParametroChange}
                                    placeholder="g/dL, mg/dL, %, etc."
                                />
                            </Form.Group>
                        </Row>

                        <Row>
                            <Form.Group className="col-md-6 mb-3">
                                <Form.Label>Rango de Referencia</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="rango_referencia"
                                    value={parametroActual.rango_referencia}
                                    onChange={handleParametroChange}
                                    placeholder="Ej: 13.0 - 17.0"
                                />
                                <Form.Text className="text-muted">
                                    Valores normales esperados
                                </Form.Text>
                            </Form.Group>
                            <Form.Group className="col-md-6 mb-3">
                                <Form.Label>Valor por Defecto</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="valor_por_defecto"
                                    value={parametroActual.valor_por_defecto}
                                    onChange={handleParametroChange}
                                    placeholder="Valor inicial (opcional)"
                                />
                            </Form.Group>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                name="es_obligatorio"
                                checked={parametroActual.es_obligatorio}
                                onChange={handleParametroChange}
                                label="Este parámetro es obligatorio"
                            />
                            <Form.Text className="text-muted">
                                Los parámetros obligatorios siempre aparecerán en los exámenes
                            </Form.Text>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowParametroModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={guardarParametro}>
                        {editandoParametro !== null ? 'Actualizar' : 'Agregar'} Parámetro
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default CrearPlantilla;