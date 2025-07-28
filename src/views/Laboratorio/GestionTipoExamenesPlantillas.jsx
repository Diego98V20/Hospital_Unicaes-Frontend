import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Card, Modal, Form, Table, Badge, Alert, InputGroup, Tab, Nav } from 'react-bootstrap';
import Select from 'react-select';
import DataTable from 'react-data-table-component';
import { tiposExamenService } from 'services/examenService';
import { plantillaCompleteService } from 'services/plantillaExamenService';
import Swal from 'sweetalert2';

const GestionTipoExamenesPlantillas = () => {
    // Estados para tipos de examen
    const [tiposExamen, setTiposExamen] = useState([]);
    const [tiposExamenFiltrados, setTiposExamenFiltrados] = useState([]);
    const [loadingTipos, setLoadingTipos] = useState(false);
    const [searchTiposTerm, setSearchTiposTerm] = useState('');

    // Estados para plantillas
    const [plantillas, setPlantillas] = useState([]);
    const [plantillasFiltradas, setPlantillasFiltradas] = useState([]);
    const [loadingPlantillas, setLoadingPlantillas] = useState(false);

    // Estados generales
    const [activeTab, setActiveTab] = useState('tipos-examen');

    // Estados para filtros de plantillas
    const [filtrosPlantillas, setFiltrosPlantillas] = useState({
        busqueda: '',
        tipoExamen: ''
    });
    const [vistaPlantillas, setVistaPlantillas] = useState('cards');

    // Estados para modales de tipos de examen
    const [showTipoModal, setShowTipoModal] = useState(false);
    const [tipoEditando, setTipoEditando] = useState(null);
    const [formTipo, setFormTipo] = useState({
        nombre: '',
        descripcion: ''
    });

    // Estados para modales de plantillas
    const [showPlantillaModal, setShowPlantillaModal] = useState(false);
    const [tipoSeleccionadoParaPlantilla, setTipoSeleccionadoParaPlantilla] = useState(null);
    const [showVerModal, setShowVerModal] = useState(false);
    const [plantillaVisualizando, setPlantillaVisualizando] = useState(null);
    const [resultadosVisualizando, setResultadosVisualizando] = useState([]);

    // Estados para crear plantilla
    const [showCrearModal, setShowCrearModal] = useState(false);
    const [nuevaPlantilla, setNuevaPlantilla] = useState({
        nombre_plantilla: '',
        descripcion: '',
        id_tipo_examen: ''
    });
    const [resultadosNuevos, setResultadosNuevos] = useState([]);
    const [resultadoActual, setResultadoActual] = useState({
        nombre_parametro: '',
        unidad: '',
        rango_referencia: ''
    });

    // Estados para editar plantilla
    const [showEditarModal, setShowEditarModal] = useState(false);
    const [plantillaEditando, setPlantillaEditando] = useState(null);
    const [resultadosEditando, setResultadosEditando] = useState([]);
    const [resultadoEditandoInline, setResultadoEditandoInline] = useState(null);

    useEffect(() => {
        cargarTiposExamen();
    }, []);

    useEffect(() => {
        if (activeTab === 'plantillas') {
            cargarPlantillas();
        }
    }, [activeTab]);

    useEffect(() => {
        aplicarFiltrosTipos();
    }, [tiposExamen, searchTiposTerm]);

    useEffect(() => {
        aplicarFiltrosPlantillas();
    }, [plantillas, filtrosPlantillas]);

    // Funciones para tipos de examen
    const cargarTiposExamen = async () => {
        try {
            setLoadingTipos(true);
            const data = await tiposExamenService.listarTiposExamen();
            setTiposExamen(data);
        } catch (error) {
            console.error('Error al cargar tipos de examen:', error);
            Swal.fire('Error', 'No se pudieron cargar los tipos de examen.', 'error');
        } finally {
            setLoadingTipos(false);
        }
    };

    const aplicarFiltrosTipos = () => {
        let resultado = [...tiposExamen];

        if (searchTiposTerm) {
            const termino = searchTiposTerm.toLowerCase();
            resultado = resultado.filter(tipo =>
                tipo.nombre.toLowerCase().includes(termino) ||
                (tipo.descripcion && tipo.descripcion.toLowerCase().includes(termino))
            );
        }

        setTiposExamenFiltrados(resultado);
    };

    const abrirModalTipo = (tipo = null) => {
        if (tipo) {
            setTipoEditando(tipo);
            setFormTipo({
                nombre: tipo.nombre,
                descripcion: tipo.descripcion || ''
            });
        } else {
            setTipoEditando(null);
            setFormTipo({
                nombre: '',
                descripcion: ''
            });
        }
        setShowTipoModal(true);
    };

    const guardarTipo = async () => {
        if (!formTipo.nombre.trim()) {
            Swal.fire('Error', 'El nombre del tipo de examen es requerido.', 'error');
            return;
        }

        try {
            if (tipoEditando) {
                await tiposExamenService.actualizarTipoExamen(tipoEditando.id_tipo_examen, formTipo);
                Swal.fire('Éxito', 'Tipo de examen actualizado exitosamente.', 'success');
            } else {
                await tiposExamenService.crearTipoExamen(formTipo);
                Swal.fire('Éxito', 'Tipo de examen creado exitosamente.', 'success');
            }
            setShowTipoModal(false);
            cargarTiposExamen();
        } catch (error) {
            console.error('Error al guardar tipo de examen:', error);
            const mensaje = error.response?.data?.message || 'Error al guardar el tipo de examen.';
            Swal.fire('Error', mensaje, 'error');
        }
    };

    // Funciones para plantillas
    const cargarPlantillas = async () => {
        try {
            setLoadingPlantillas(true);
            const data = await plantillaCompleteService.listarTodasPlantillas();
            setPlantillas(data);
        } catch (error) {
            console.error('Error al cargar plantillas:', error);
            Swal.fire('Error', 'No se pudieron cargar las plantillas.', 'error');
        } finally {
            setLoadingPlantillas(false);
        }
    };

    const aplicarFiltrosPlantillas = () => {
        let resultado = [...plantillas];

        if (filtrosPlantillas.busqueda) {
            const termino = filtrosPlantillas.busqueda.toLowerCase();
            resultado = resultado.filter(plantilla =>
                plantilla.nombre_plantilla.toLowerCase().includes(termino) ||
                plantilla.descripcion?.toLowerCase().includes(termino) ||
                plantilla.tipo_examen_nombre.toLowerCase().includes(termino) ||
                `${plantilla.creador_nombre} ${plantilla.creador_apellido}`.toLowerCase().includes(termino)
            );
        }

        if (filtrosPlantillas.tipoExamen) {
            resultado = resultado.filter(plantilla =>
                plantilla.tipo_examen_nombre === filtrosPlantillas.tipoExamen
            );
        }

        setPlantillasFiltradas(resultado);
    };

    const handleFiltroChange = (campo, valor) => {
        setFiltrosPlantillas(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    const limpiarFiltros = () => {
        setFiltrosPlantillas({
            busqueda: '',
            tipoExamen: ''
        });
    };

    // === FUNCIONES PARA VER PLANTILLA ===
    const abrirModalVer = async (plantilla) => {
        try {
            setLoadingPlantillas(true);
            const plantillaCompleta = await plantillaCompleteService.obtenerPlantillaCompleta(plantilla.id_plantilla);

            setPlantillaVisualizando(plantillaCompleta.plantilla);
            setResultadosVisualizando(plantillaCompleta.parametros);
            setShowVerModal(true);
        } catch (error) {
            console.error('Error al cargar plantilla:', error);
            Swal.fire('Error', 'No se pudo cargar la plantilla.', 'error');
        } finally {
            setLoadingPlantillas(false);
        }
    };

    const editarDesdeVer = () => {
        setShowVerModal(false);
        abrirModalEditar({
            id_plantilla: plantillaVisualizando.id_plantilla,
            nombre_plantilla: plantillaVisualizando.nombre_plantilla
        });
    };

    // === FUNCIONES PARA CREAR PLANTILLA ===
    const abrirModalCrear = () => {
        setNuevaPlantilla({
            nombre_plantilla: '',
            descripcion: '',
            id_tipo_examen: ''
        });
        setResultadosNuevos([]);
        setResultadoActual({
            nombre_parametro: '',
            unidad: '',
            rango_referencia: ''
        });
        setShowCrearModal(true);
    };

    const abrirModalPlantilla = (tipo) => {
        setTipoSeleccionadoParaPlantilla(tipo);
        setNuevaPlantilla({
            nombre_plantilla: '',
            descripcion: '',
            id_tipo_examen: tipo.id_tipo_examen
        });
        setResultadosNuevos([]);
        setResultadoActual({
            nombre_parametro: '',
            unidad: '',
            rango_referencia: ''
        });
        setShowPlantillaModal(true);
    };

    const handleInputPlantilla = (e) => {
        const { name, value } = e.target;
        setNuevaPlantilla(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleInputResultado = (e) => {
        const { name, value } = e.target;
        setResultadoActual(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (selectedOption, campo) => {
        const valor = selectedOption ? selectedOption.value : '';
        if (campo === 'id_tipo_examen') {
            setNuevaPlantilla(prev => ({
                ...prev,
                [campo]: valor
            }));
        }
    };

    const agregarResultado = () => {
        if (!resultadoActual.nombre_parametro.trim()) {
            Swal.fire('Error', 'El nombre del resultado es requerido.', 'error');
            return;
        }

        const existe = resultadosNuevos.some(p =>
            p.nombre_parametro.toLowerCase() === resultadoActual.nombre_parametro.toLowerCase()
        );

        if (existe) {
            Swal.fire('Error', 'Ya existe un resultado con ese nombre.', 'error');
            return;
        }

        setResultadosNuevos(prev => [...prev, {
            ...resultadoActual,
            id: Date.now()
        }]);

        setResultadoActual({
            nombre_parametro: '',
            unidad: '',
            rango_referencia: ''
        });
    };

    const eliminarResultadoNuevo = (id) => {
        setResultadosNuevos(prev => prev.filter(p => p.id !== id));
    };

    const guardarPlantilla = async () => {
        if (!nuevaPlantilla.nombre_plantilla.trim()) {
            Swal.fire('Error', 'El nombre de la plantilla es requerido.', 'error');
            return;
        }

        if (resultadosNuevos.length === 0) {
            Swal.fire('Error', 'Debe agregar al menos un resultado.', 'error');
            return;
        }

        try {
            setLoadingPlantillas(true);

            const resultadoPlantilla = await plantillaCompleteService.crearPlantilla(nuevaPlantilla);
            const idPlantilla = resultadoPlantilla.id_plantilla;

            for (let i = 0; i < resultadosNuevos.length; i++) {
                const parametro = {
                    nombre_parametro: resultadosNuevos[i].nombre_parametro,
                    unidad: resultadosNuevos[i].unidad,
                    rango_referencia: resultadosNuevos[i].rango_referencia || '',
                    valor_por_defecto: '',
                    orden: i + 1,
                    es_obligatorio: false
                };
                await plantillaCompleteService.agregarParametro(idPlantilla, parametro);
            }

            Swal.fire('Éxito', 'Plantilla creada exitosamente.', 'success');
            setShowPlantillaModal(false);
            setShowCrearModal(false);
            cargarPlantillas();

        } catch (error) {
            console.error('Error al guardar plantilla:', error);
            Swal.fire('Error', 'No se pudo guardar la plantilla.', 'error');
        } finally {
            setLoadingPlantillas(false);
        }
    };

    // === FUNCIONES PARA EDITAR PLANTILLA ===
    const abrirModalEditar = async (plantilla) => {
        try {
            setLoadingPlantillas(true);
            const plantillaCompleta = await plantillaCompleteService.obtenerPlantillaCompleta(plantilla.id_plantilla);

            setPlantillaEditando(plantillaCompleta.plantilla);
            setResultadosEditando(plantillaCompleta.parametros.map(p => ({
                ...p,
                esNuevo: false
            })));
            setShowEditarModal(true);
        } catch (error) {
            console.error('Error al cargar plantilla para editar:', error);
            Swal.fire('Error', 'No se pudo cargar la plantilla.', 'error');
        } finally {
            setLoadingPlantillas(false);
        }
    };

    const agregarResultadoEdicion = () => {
        if (!resultadoActual.nombre_parametro.trim()) {
            Swal.fire('Error', 'El nombre del resultado es requerido.', 'error');
            return;
        }

        const existe = resultadosEditando.some(p =>
            p.nombre_parametro.toLowerCase() === resultadoActual.nombre_parametro.toLowerCase()
        );

        if (existe) {
            Swal.fire('Error', 'Ya existe un resultado con ese nombre.', 'error');
            return;
        }

        setResultadosEditando(prev => [...prev, {
            id_plantilla_parametro: `new_${Date.now()}`,
            nombre_parametro: resultadoActual.nombre_parametro,
            unidad: resultadoActual.unidad,
            rango_referencia: resultadoActual.rango_referencia,
            valor_por_defecto: '',
            orden: prev.length + 1,
            es_obligatorio: false,
            esNuevo: true
        }]);

        setResultadoActual({
            nombre_parametro: '',
            unidad: '',
            rango_referencia: ''
        });
    };

    const eliminarResultadoEdicion = async (resultado) => {
        if (resultado.esNuevo) {
            setResultadosEditando(prev => prev.filter(p => p.id_plantilla_parametro !== resultado.id_plantilla_parametro));
        } else {
            const confirmar = await Swal.fire({
                title: '¿Eliminar resultado?',
                text: `¿Estás seguro de eliminar "${resultado.nombre_parametro}"?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });

            if (confirmar.isConfirmed) {
                try {
                    await plantillaCompleteService.eliminarParametro(resultado.id_plantilla_parametro);
                    setResultadosEditando(prev => prev.filter(p => p.id_plantilla_parametro !== resultado.id_plantilla_parametro));
                    Swal.fire('Éxito', 'Resultado eliminado correctamente.', 'success');
                } catch (error) {
                    console.error('Error al eliminar resultado:', error);
                    Swal.fire('Error', 'No se pudo eliminar el resultado.', 'error');
                }
            }
        }
    };

    // === FUNCIONES PARA EDICIÓN INLINE ===
    const iniciarEdicionInline = (resultado) => {
        setResultadoEditandoInline({
            ...resultado,
            nombre_parametro_temp: resultado.nombre_parametro,
            unidad_temp: resultado.unidad,
            rango_referencia_temp: resultado.rango_referencia
        });
    };

    const cancelarEdicionInline = () => {
        setResultadoEditandoInline(null);
    };

    const guardarEdicionInline = async () => {
        try {
            if (!resultadoEditandoInline.esNuevo) {
                const parametroActualizado = {
                    nombre_parametro: resultadoEditandoInline.nombre_parametro_temp,
                    unidad: resultadoEditandoInline.unidad_temp,
                    rango_referencia: resultadoEditandoInline.rango_referencia_temp,
                    valor_por_defecto: resultadoEditandoInline.valor_por_defecto,
                    orden: resultadoEditandoInline.orden,
                    es_obligatorio: resultadoEditandoInline.es_obligatorio
                };

                await plantillaCompleteService.actualizarParametro(
                    resultadoEditandoInline.id_plantilla_parametro,
                    parametroActualizado
                );
            }

            setResultadosEditando(prev => prev.map(p =>
                p.id_plantilla_parametro === resultadoEditandoInline.id_plantilla_parametro
                    ? {
                        ...p,
                        nombre_parametro: resultadoEditandoInline.nombre_parametro_temp,
                        unidad: resultadoEditandoInline.unidad_temp,
                        rango_referencia: resultadoEditandoInline.rango_referencia_temp
                    }
                    : p
            ));

            setResultadoEditandoInline(null);
            Swal.fire('Éxito', 'Resultado actualizado correctamente.', 'success');

        } catch (error) {
            console.error('Error al actualizar resultado:', error);
            Swal.fire('Error', 'No se pudo actualizar el resultado.', 'error');
        }
    };

    const handleChangeInline = (campo, valor) => {
        setResultadoEditandoInline(prev => ({
            ...prev,
            [`${campo}_temp`]: valor
        }));
    };

    const eliminarPlantilla = async (plantilla) => {
        const confirmar = await Swal.fire({
            title: '¿Eliminar plantilla?',
            text: `¿Estás seguro de eliminar "${plantilla.nombre_plantilla}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (confirmar.isConfirmed) {
            try {
                await plantillaCompleteService.desactivarPlantilla(plantilla.id_plantilla);
                Swal.fire('Éxito', 'Plantilla eliminada exitosamente.', 'success');
                cargarPlantillas();
            } catch (error) {
                console.error('Error al eliminar plantilla:', error);
                Swal.fire('Error', 'No se pudo eliminar la plantilla.', 'error');
            }
        }
    };

    const guardarEdicionPlantilla = async () => {
        try {
            setLoadingPlantillas(true);

            await plantillaCompleteService.actualizarPlantilla(plantillaEditando.id_plantilla, {
                nombre_plantilla: plantillaEditando.nombre_plantilla,
                descripcion: plantillaEditando.descripcion
            });

            const resultadosNuevos = resultadosEditando.filter(p => p.esNuevo);
            for (const resultado of resultadosNuevos) {
                const parametroData = {
                    nombre_parametro: resultado.nombre_parametro,
                    unidad: resultado.unidad,
                    rango_referencia: resultado.rango_referencia || '',
                    valor_por_defecto: '',
                    orden: resultado.orden,
                    es_obligatorio: false
                };
                await plantillaCompleteService.agregarParametro(plantillaEditando.id_plantilla, parametroData);
            }

            Swal.fire('Éxito', 'Plantilla actualizada exitosamente.', 'success');
            setShowEditarModal(false);
            cargarPlantillas();

        } catch (error) {
            console.error('Error al actualizar plantilla:', error);
            Swal.fire('Error', 'No se pudo actualizar la plantilla.', 'error');
        } finally {
            setLoadingPlantillas(false);
        }
    };

    // === FUNCIONES DE RENDERIZADO ===
    // Columnas para DataTable de tipos de examen
    const columnsTipos = [
        {
            name: 'Nombre',
            selector: row => row.nombre,
            sortable: true,
            grow: 2, // Permite que esta columna crezca más
            cell: row => <strong className="text-primary">{row.nombre}</strong>
        },
        {
            name: 'Descripción',
            selector: row => row.descripcion || 'Sin descripción',
            sortable: true,
            grow: 3, // Permite que esta columna sea la más ancha
            wrap: true, // Permite que el texto se envuelva
            cell: row => (
                <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                    {row.descripcion || 'Sin descripción'}
                </span>
            )
        },
        {
            name: 'Acciones',
            width: '280px', // Ancho fijo para las acciones
            cell: row => (
                <div className="d-flex gap-1 flex-wrap">
                    <Button
                        variant="success"
                        size="sm"
                        onClick={() => abrirModalPlantilla(row)}
                        title="Crear plantilla para este tipo de examen"
                        className="btn-action"
                    >
                        <i className="fas fa-plus me-1"></i>
                        <span className="d-none d-lg-inline">Crear </span>Plantilla
                    </Button>
                    <Button
                        variant="warning"
                        size="sm"
                        onClick={() => abrirModalTipo(row)}
                        title="Editar tipo de examen"
                        className="btn-action"
                    >
                        <i className="fas fa-edit me-1"></i>
                        <span className="d-none d-md-inline">Editar</span>
                    </Button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true
        }
    ];
    // Vista en tarjetas para plantillas
    const renderVistaCards = () => (
        <Row>
            {plantillasFiltradas.length > 0 ? (
                plantillasFiltradas.map(plantilla => (
                    <Col md={6} lg={4} key={plantilla.id_plantilla} className="mb-3">
                        <Card className="h-100 shadow-sm">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <Card.Title className="h6 mb-0 flex-grow-1">
                                        {plantilla.nombre_plantilla}
                                    </Card.Title>
                                    <Badge bg="primary" className="ms-2 flex-shrink-0">
                                        {plantilla.tipo_examen_nombre}
                                    </Badge>
                                </div>

                                <div className="mb-2">
                                    <Badge bg="info" className="me-1">
                                        <i className="fas fa-list me-1"></i>
                                        {plantilla.total_parametros} resultados
                                    </Badge>
                                </div>

                                <Card.Text className="text-muted small mb-2" style={{ fontSize: '0.85rem' }}>
                                    {plantilla.descripcion ?
                                        (plantilla.descripcion.length > 100
                                            ? `${plantilla.descripcion.substring(0, 100)}...`
                                            : plantilla.descripcion
                                        ) :
                                        <em>Sin descripción</em>
                                    }
                                </Card.Text>

                                <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                                    <div className="mb-1">
                                        <i className="fas fa-user me-1"></i>
                                        {plantilla.creador_nombre} {plantilla.creador_apellido}
                                    </div>
                                    <div>
                                        <i className="fas fa-calendar me-1"></i>
                                        {new Date(plantilla.fecha_modificacion).toLocaleDateString('es-ES')}
                                    </div>
                                </div>
                            </Card.Body>
                            <Card.Footer className="bg-light">
                                <div className="d-flex gap-1">
                                    <Button
                                        variant="info"
                                        size="sm"
                                        onClick={() => abrirModalVer(plantilla)}
                                        className="flex-fill"
                                    >
                                        <i className="fas fa-eye me-1"></i>
                                        Ver
                                    </Button>
                                    <Button
                                        variant="warning"
                                        size="sm"
                                        onClick={() => abrirModalEditar(plantilla)}
                                        className="flex-fill"
                                    >
                                        <i className="fas fa-edit me-1"></i>
                                        Editar
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => eliminarPlantilla(plantilla)}
                                        className="flex-fill"
                                    >
                                        <i className="fas fa-trash me-1"></i>
                                        Eliminar
                                    </Button>
                                </div>
                            </Card.Footer>
                        </Card>
                    </Col>
                ))
            ) : (
                <Col>
                    <Alert variant="info" className="text-center">
                        <i className="fas fa-info-circle me-2"></i>
                        {plantillas.length === 0
                            ? 'No hay plantillas creadas. '
                            : 'No se encontraron plantillas con los filtros aplicados. '
                        }
                        {plantillas.length === 0 && (
                            <Button variant="link" onClick={abrirModalCrear} className="p-0 ms-1">
                                Crear la primera plantilla
                            </Button>
                        )}
                    </Alert>
                </Col>
            )}
        </Row>
    );

    // Vista en tabla para plantillas
    const renderVistaTabla = () => (
        <div className="table-responsive">
            <Table hover>
                <thead className="table-dark">
                    <tr>
                        <th>Plantilla</th>
                        <th>Tipo de Examen</th>
                        <th>Resultados</th>
                        <th>Creador</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {plantillasFiltradas.length > 0 ? (
                        plantillasFiltradas.map(plantilla => (
                            <tr key={plantilla.id_plantilla}>
                                <td>
                                    <div>
                                        <strong className="text-primary">{plantilla.nombre_plantilla}</strong>
                                        {plantilla.descripcion && (
                                            <div>
                                                <small className="text-muted">
                                                    {plantilla.descripcion.length > 50
                                                        ? `${plantilla.descripcion.substring(0, 50)}...`
                                                        : plantilla.descripcion
                                                    }
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <Badge bg="primary">
                                        {plantilla.tipo_examen_nombre}
                                    </Badge>
                                </td>
                                <td>
                                    <Badge bg="info">
                                        <i className="fas fa-list me-1"></i>
                                        {plantilla.total_parametros}
                                    </Badge>
                                </td>
                                <td>
                                    <small>{plantilla.creador_nombre} {plantilla.creador_apellido}</small>
                                </td>
                                <td>
                                    <small>{new Date(plantilla.fecha_modificacion).toLocaleDateString('es-ES')}</small>
                                </td>
                                <td>
                                    <div className="d-flex gap-1">
                                        <Button
                                            variant="info"
                                            size="sm"
                                            onClick={() => abrirModalVer(plantilla)}
                                            title="Ver plantilla"
                                        >
                                            <i className="fas fa-eye"></i>
                                        </Button>
                                        <Button
                                            variant="warning"
                                            size="sm"
                                            onClick={() => abrirModalEditar(plantilla)}
                                            title="Editar plantilla"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => eliminarPlantilla(plantilla)}
                                            title="Eliminar plantilla"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center py-4">
                                <div className="text-muted">
                                    <i className="fas fa-search fa-2x mb-2"></i>
                                    <br />
                                    {filtrosPlantillas.busqueda || filtrosPlantillas.tipoExamen ?
                                        'No se encontraron plantillas que coincidan con los filtros' :
                                        'No hay plantillas creadas'
                                    }
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );

    // Opciones para selects
    const tiposExamenOptions = tiposExamen.map(tipo => ({
        value: tipo.id_tipo_examen,
        label: tipo.nombre
    }));

    const tiposExamenFiltroOptions = [
        { value: '', label: 'Todos los tipos' },
        ...Array.from(new Set(plantillas.map(p => p.tipo_examen_nombre)))
            .map(tipo => ({ value: tipo, label: tipo }))
    ];

    if (loadingTipos && tiposExamen.length === 0) {
        return (
            <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-2">Cargando información...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid>
            <Row>
                <Col>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h4 className="mb-0">Gestión de Exámenes</h4>
                        </Card.Header>

                        <Card.Body>
                            <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                                <Nav variant="pills" className="mb-4">
                                    <Nav.Item>
                                        <Nav.Link eventKey="tipos-examen" className="d-flex align-items-center">
                                            <i className="fas fa-flask me-2"></i>
                                            Tipos de Examen
                                            {tiposExamen.length > 0 && (
                                                <Badge bg="primary" className="ms-2">{tiposExamen.length}</Badge>
                                            )}
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="plantillas" className="d-flex align-items-center">
                                            <i className="fas fa-file-medical me-2"></i>
                                            Plantillas de Examen
                                            {plantillas.length > 0 && (
                                                <Badge bg="secondary" className="ms-2">{plantillas.length}</Badge>
                                            )}
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>

                                <Tab.Content>
                                    {/* Tab de Tipos de Examen */}
                                    <Tab.Pane eventKey="tipos-examen">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <InputGroup style={{ width: '300px' }}>
                                                    <InputGroup.Text>
                                                        <i className="fas fa-search"></i>
                                                    </InputGroup.Text>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Buscar tipos de examen..."
                                                        value={searchTiposTerm}
                                                        onChange={(e) => setSearchTiposTerm(e.target.value)}
                                                    />
                                                    {searchTiposTerm && (
                                                        <Button
                                                            variant="outline-secondary"
                                                            onClick={() => setSearchTiposTerm('')}
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </Button>
                                                    )}
                                                </InputGroup>
                                            </div>

                                            <div className="d-flex gap-2">
                                                <Button
                                                    variant="outline-success"
                                                    onClick={cargarTiposExamen}
                                                    disabled={loadingTipos}
                                                >
                                                    <i className={`fas fa-sync-alt me-1 ${loadingTipos ? 'fa-spin' : ''}`}></i>
                                                    Actualizar
                                                </Button>
                                                <Button variant="primary" onClick={() => abrirModalTipo()}>
                                                    <i className="fas fa-plus me-2"></i>
                                                    Nuevo Tipo
                                                </Button>
                                            </div>
                                        </div>

                                        <DataTable
                                            columns={columnsTipos}
                                            data={tiposExamenFiltrados}
                                            pagination
                                            striped
                                            highlightOnHover
                                            responsive
                                            dense
                                            noDataComponent={
                                                <div className="text-center py-4">
                                                    <div className="text-muted">
                                                        <i className="fas fa-search fa-2x mb-2"></i>
                                                        <br />
                                                        {searchTiposTerm ?
                                                            'No se encontraron tipos de examen que coincidan con la búsqueda' :
                                                            'No hay tipos de examen registrados'
                                                        }
                                                    </div>
                                                </div>
                                            }
                                        />
                                    </Tab.Pane>

                                    {/* Tab de Plantillas */}
                                    <Tab.Pane eventKey="plantillas">
                                        {/* Filtros para plantillas */}
                                        <Row className="mb-3">
                                            <Col md={4}>
                                                <Form.Label className="small text-muted mb-1">Buscar plantillas</Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text>
                                                        <i className="fas fa-search"></i>
                                                    </InputGroup.Text>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Buscar por nombre, descripción, tipo o creador..."
                                                        value={filtrosPlantillas.busqueda}
                                                        onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                                                    />
                                                    {filtrosPlantillas.busqueda && (
                                                        <Button
                                                            variant="outline-secondary"
                                                            onClick={() => handleFiltroChange('busqueda', '')}
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </Button>
                                                    )}
                                                </InputGroup>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Label className="small text-muted mb-1">Filtrar por tipo de examen</Form.Label>
                                                <Select
                                                    options={tiposExamenFiltroOptions}
                                                    placeholder="Seleccionar tipo..."
                                                    value={tiposExamenFiltroOptions.find(option => option.value === filtrosPlantillas.tipoExamen)}
                                                    onChange={(option) => handleFiltroChange('tipoExamen', option?.value || '')}
                                                    isClearable
                                                    className="react-select-container"
                                                    classNamePrefix="react-select"
                                                />
                                            </Col>
                                            <Col md={3}>
                                                <Form.Label className="small text-muted mb-1">Vista</Form.Label>
                                                <div className="d-flex gap-2">
                                                    <Button
                                                        variant={vistaPlantillas === 'cards' ? 'primary' : 'outline-primary'}
                                                        onClick={() => setVistaPlantillas('cards')}
                                                        className="flex-fill"
                                                    >
                                                        <i className="fas fa-th-large me-1"></i>
                                                        Tarjetas
                                                    </Button>
                                                    <Button
                                                        variant={vistaPlantillas === 'tabla' ? 'primary' : 'outline-primary'}
                                                        onClick={() => setVistaPlantillas('tabla')}
                                                        className="flex-fill"
                                                    >
                                                        <i className="fas fa-list me-1"></i>
                                                        Tabla
                                                    </Button>
                                                </div>
                                            </Col>
                                            <Col md={2} className="d-flex align-items-end">
                                                <Button
                                                    variant="outline-secondary"
                                                    onClick={limpiarFiltros}
                                                    className="w-100"
                                                >
                                                    <i className="fas fa-broom me-1"></i>
                                                    Limpiar
                                                </Button>
                                            </Col>
                                        </Row>

                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <small className="text-muted">
                                                Mostrando {plantillasFiltradas.length} de {plantillas.length} plantillas
                                            </small>
                                            <div className="d-flex gap-2 align-items-center">
                                                {(filtrosPlantillas.busqueda || filtrosPlantillas.tipoExamen) && (
                                                    <Badge bg="info">
                                                        <i className="fas fa-filter me-1"></i>
                                                        Filtros activos
                                                    </Badge>
                                                )}
                                                <Button variant="primary" onClick={abrirModalCrear}>
                                                    <i className="fas fa-plus me-2"></i>
                                                    Crear Plantilla
                                                </Button>
                                            </div>
                                        </div>

                                        {loadingPlantillas ? (
                                            <div className="text-center py-4">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Cargando plantillas...</span>
                                                </div>
                                            </div>
                                        ) : (
                                            vistaPlantillas === 'cards' ? renderVistaCards() : renderVistaTabla()
                                        )}
                                    </Tab.Pane>
                                </Tab.Content>
                            </Tab.Container>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Modal para Tipo de Examen */}
            <Modal show={showTipoModal} onHide={() => setShowTipoModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className={`fas ${tipoEditando ? 'fa-edit' : 'fa-plus'} me-2`}></i>
                        {tipoEditando ? 'Editar Tipo de Examen' : 'Nuevo Tipo de Examen'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                value={formTipo.nombre}
                                onChange={(e) => setFormTipo(prev => ({ ...prev, nombre: e.target.value }))}
                                placeholder="Ej: Hemograma Completo"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formTipo.descripcion}
                                onChange={(e) => setFormTipo(prev => ({ ...prev, descripcion: e.target.value }))}
                                placeholder="Descripción del tipo de examen..."
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowTipoModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={guardarTipo}>
                        <i className="fas fa-save me-2"></i>
                        {tipoEditando ? 'Actualizar' : 'Crear'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal para Crear Plantilla desde Tipo */}
            <Modal show={showPlantillaModal} onHide={() => setShowPlantillaModal(false)} size="lg" backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="fas fa-plus me-2 text-primary"></i>
                        Crear Plantilla para {tipoSeleccionadoParaPlantilla?.nombre}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row className="mb-3">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Nombre de la Plantilla <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nombre_plantilla"
                                        value={nuevaPlantilla.nombre_plantilla}
                                        onChange={handleInputPlantilla}
                                        placeholder="Ej: Hemograma Completo Estándar"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-4">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="descripcion"
                                value={nuevaPlantilla.descripcion}
                                onChange={handleInputPlantilla}
                                placeholder="Descripción opcional de la plantilla..."
                            />
                        </Form.Group>

                        <hr />

                        <h6>
                            <i className="fas fa-list me-2"></i>
                            Resultados de la Plantilla
                        </h6>

                        <div className="border rounded p-3 mb-3 bg-light">
                            <Row className="g-2">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="small">Nombre del Resultado</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="nombre_parametro"
                                            value={resultadoActual.nombre_parametro}
                                            onChange={handleInputResultado}
                                            placeholder="Ej: Hemoglobina"
                                            size="sm"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label className="small">Unidad</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="unidad"
                                            value={resultadoActual.unidad}
                                            onChange={handleInputResultado}
                                            placeholder="g/dL, mg/dL"
                                            size="sm"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="small">Rango Referencia</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="rango_referencia"
                                            value={resultadoActual.rango_referencia}
                                            onChange={handleInputResultado}
                                            placeholder="13.0-17.0"
                                            size="sm"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={1}>
                                    <Form.Label className="small">&nbsp;</Form.Label>
                                    <Button
                                        variant="success"
                                        size="sm"
                                        className="w-100"
                                        onClick={agregarResultado}
                                    >
                                        <i className="fas fa-plus"></i>
                                    </Button>
                                </Col>
                            </Row>
                        </div>

                        {resultadosNuevos.length > 0 && (
                            <Table striped bordered size="sm">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: '5%' }}>#</th>
                                        <th>Resultado</th>
                                        <th>Unidad</th>
                                        <th>Rango Referencia</th>
                                        <th style={{ width: '10%' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resultadosNuevos.map((param, index) => (
                                        <tr key={param.id}>
                                            <td className="text-center">{index + 1}</td>
                                            <td><strong>{param.nombre_parametro}</strong></td>
                                            <td>{param.unidad || <em className="text-muted">N/A</em>}</td>
                                            <td>{param.rango_referencia || <em className="text-muted">No definido</em>}</td>
                                            <td className="text-center">
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => eliminarResultadoNuevo(param.id)}
                                                    title="Eliminar resultado"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}

                        {resultadosNuevos.length === 0 && (
                            <Alert variant="info">
                                <i className="fas fa-info-circle me-2"></i>
                                Agregue al menos un resultado para crear la plantilla.
                            </Alert>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPlantillaModal(false)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={guardarPlantilla}
                        disabled={loadingPlantillas || resultadosNuevos.length === 0}
                    >
                        {loadingPlantillas ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Guardando...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-save me-2"></i>
                                Guardar Plantilla
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* Modal para Ver Plantilla */}
            <Modal show={showVerModal} onHide={() => setShowVerModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="fas fa-eye me-2 text-info"></i>
                        Ver Plantilla
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {plantillaVisualizando && (
                        <div>
                            <Row className="mb-4">
                                <Col md={8}>
                                    <h5 className="text-primary mb-1">{plantillaVisualizando.nombre_plantilla}</h5>
                                    <Badge bg="primary" className="mb-2">
                                        {plantillaVisualizando.tipo_examen_nombre}
                                    </Badge>
                                    {plantillaVisualizando.descripcion && (
                                        <p className="text-muted mb-2">{plantillaVisualizando.descripcion}</p>
                                    )}
                                    <div className="text-muted small">
                                        <div><strong>Creado por:</strong> {plantillaVisualizando.creador_nombre} {plantillaVisualizando.creador_apellido}</div>
                                        <div><strong>Fecha de creación:</strong> {new Date(plantillaVisualizando.fecha_creacion).toLocaleDateString('es-ES')}</div>
                                    </div>
                                </Col>
                                <Col md={4} className="text-end">
                                    <div className="bg-light p-3 rounded">
                                        <h6 className="mb-1 text-center">Total Resultados</h6>
                                        <div className="display-6 text-center text-primary">
                                            {resultadosVisualizando.length}
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            <hr />

                            <h6 className="mb-3">
                                <i className="fas fa-list me-2"></i>
                                Resultados de la Plantilla
                            </h6>

                            {resultadosVisualizando.length > 0 ? (
                                <Table striped bordered hover size="sm">
                                    <thead className="table-dark">
                                        <tr>
                                            <th style={{ width: '5%' }}>#</th>
                                            <th style={{ width: '40%' }}>Resultado</th>
                                            <th style={{ width: '20%' }}>Unidad</th>
                                            <th style={{ width: '35%' }}>Rango Referencia</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resultadosVisualizando
                                            .sort((a, b) => a.orden - b.orden)
                                            .map((param, index) => (
                                                <tr key={param.id_plantilla_parametro}>
                                                    <td className="text-center">{index + 1}</td>
                                                    <td><strong>{param.nombre_parametro}</strong></td>
                                                    <td>{param.unidad || <em className="text-muted">N/A</em>}</td>
                                                    <td>{param.rango_referencia || <em className="text-muted">No definido</em>}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <Alert variant="warning">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    Esta plantilla no tiene resultados definidos.
                                </Alert>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowVerModal(false)}>
                        Cerrar
                    </Button>
                    <Button variant="warning" onClick={editarDesdeVer}>
                        <i className="fas fa-edit me-2"></i>
                        Editar Plantilla
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* Modal para Crear Plantilla */}
            <Modal show={showCrearModal} onHide={() => setShowCrearModal(false)} size="lg" backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="fas fa-plus me-2 text-primary"></i>
                        Crear Nueva Plantilla
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row className="mb-3">
                            <Col md={8}>
                                <Form.Group>
                                    <Form.Label>Nombre de la Plantilla <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nombre_plantilla"
                                        value={nuevaPlantilla.nombre_plantilla}
                                        onChange={handleInputPlantilla}
                                        placeholder="Ej: Hemograma Completo Estándar"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Tipo de Examen <span className="text-danger">*</span></Form.Label>
                                    <Select
                                        options={tiposExamenOptions}
                                        placeholder="Seleccionar tipo..."
                                        onChange={(option) => handleSelectChange(option, 'id_tipo_examen')}
                                        value={tiposExamenOptions.find(option => option.value === nuevaPlantilla.id_tipo_examen)}
                                        isClearable
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-4">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="descripcion"
                                value={nuevaPlantilla.descripcion}
                                onChange={handleInputPlantilla}
                                placeholder="Descripción opcional de la plantilla..."
                            />
                        </Form.Group>

                        <hr />

                        <h6>
                            <i className="fas fa-list me-2"></i>
                            Resultados de la Plantilla
                        </h6>

                        <div className="border rounded p-3 mb-3 bg-light">
                            <Row className="g-2">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="small">Nombre del Resultado</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="nombre_parametro"
                                            value={resultadoActual.nombre_parametro}
                                            onChange={handleInputResultado}
                                            placeholder="Ej: Hemoglobina"
                                            size="sm"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label className="small">Unidad</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="unidad"
                                            value={resultadoActual.unidad}
                                            onChange={handleInputResultado}
                                            placeholder="g/dL, mg/dL"
                                            size="sm"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="small">Rango Referencia</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="rango_referencia"
                                            value={resultadoActual.rango_referencia}
                                            onChange={handleInputResultado}
                                            placeholder="13.0-17.0"
                                            size="sm"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={1}>
                                    <Form.Label className="small">&nbsp;</Form.Label>
                                    <Button
                                        variant="success"
                                        size="sm"
                                        className="w-100"
                                        onClick={agregarResultado}
                                    >
                                        <i className="fas fa-plus"></i>
                                    </Button>
                                </Col>
                            </Row>
                        </div>

                        {resultadosNuevos.length > 0 && (
                            <Table striped bordered size="sm">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: '5%' }}>#</th>
                                        <th>Resultado</th>
                                        <th>Unidad</th>
                                        <th>Rango Referencia</th>
                                        <th style={{ width: '10%' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resultadosNuevos.map((param, index) => (
                                        <tr key={param.id}>
                                            <td className="text-center">{index + 1}</td>
                                            <td><strong>{param.nombre_parametro}</strong></td>
                                            <td>{param.unidad || <em className="text-muted">N/A</em>}</td>
                                            <td>{param.rango_referencia || <em className="text-muted">No definido</em>}</td>
                                            <td className="text-center">
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => eliminarResultadoNuevo(param.id)}
                                                    title="Eliminar resultado"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}

                        {resultadosNuevos.length === 0 && (
                            <Alert variant="info">
                                <i className="fas fa-info-circle me-2"></i>
                                Agregue al menos un resultado para crear la plantilla.
                            </Alert>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCrearModal(false)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={guardarPlantilla}
                        disabled={loadingPlantillas || resultadosNuevos.length === 0}
                    >
                        {loadingPlantillas ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Guardando...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-save me-2"></i>
                                Guardar Plantilla
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal para Editar Plantilla */}
            <Modal show={showEditarModal} onHide={() => setShowEditarModal(false)} size="lg" backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="fas fa-edit me-2 text-warning"></i>
                        Editar Plantilla
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {plantillaEditando && (
                        <Form>
                            <Row className="mb-3">
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label>Nombre de la Plantilla</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={plantillaEditando.nombre_plantilla}
                                            onChange={(e) => setPlantillaEditando(prev => ({
                                                ...prev,
                                                nombre_plantilla: e.target.value
                                            }))}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-4">
                                <Form.Label>Descripción</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={plantillaEditando.descripcion || ''}
                                    onChange={(e) => setPlantillaEditando(prev => ({
                                        ...prev,
                                        descripcion: e.target.value
                                    }))}
                                />
                            </Form.Group>

                            <hr />

                            <h6 className="mb-3">
                                <i className="fas fa-list me-2"></i>
                                Resultados Existentes
                            </h6>

                            {resultadosEditando.length > 0 && (
                                <div className="mb-4">
                                    <Table striped bordered size="sm">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Resultado</th>
                                                <th>Unidad</th>
                                                <th>Rango Referencia</th>
                                                <th>Estado</th>
                                                <th style={{ width: '120px' }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {resultadosEditando.map(param => (
                                                <tr key={param.id_plantilla_parametro}>
                                                    <td>
                                                        {resultadoEditandoInline?.id_plantilla_parametro === param.id_plantilla_parametro ? (
                                                            <Form.Control
                                                                type="text"
                                                                size="sm"
                                                                value={resultadoEditandoInline.nombre_parametro_temp}
                                                                onChange={(e) => handleChangeInline('nombre_parametro', e.target.value)}
                                                            />
                                                        ) : (
                                                            <strong>{param.nombre_parametro}</strong>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {resultadoEditandoInline?.id_plantilla_parametro === param.id_plantilla_parametro ? (
                                                            <Form.Control
                                                                type="text"
                                                                size="sm"
                                                                value={resultadoEditandoInline.unidad_temp}
                                                                onChange={(e) => handleChangeInline('unidad', e.target.value)}
                                                            />
                                                        ) : (
                                                            param.unidad || <em className="text-muted">N/A</em>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {resultadoEditandoInline?.id_plantilla_parametro === param.id_plantilla_parametro ? (
                                                            <Form.Control
                                                                type="text"
                                                                size="sm"
                                                                value={resultadoEditandoInline.rango_referencia_temp}
                                                                onChange={(e) => handleChangeInline('rango_referencia', e.target.value)}
                                                            />
                                                        ) : (
                                                            param.rango_referencia || <em className="text-muted">No definido</em>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {param.esNuevo ? (
                                                            <Badge bg="success">Nuevo</Badge>
                                                        ) : (
                                                            <Badge bg="secondary">Existente</Badge>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {resultadoEditandoInline?.id_plantilla_parametro === param.id_plantilla_parametro ? (
                                                            <div className="d-flex gap-1">
                                                                <Button
                                                                    variant="success"
                                                                    size="sm"
                                                                    onClick={guardarEdicionInline}
                                                                    title="Guardar cambios"
                                                                >
                                                                    <i className="fas fa-check"></i>
                                                                </Button>
                                                                <Button
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    onClick={cancelarEdicionInline}
                                                                    title="Cancelar edición"
                                                                >
                                                                    <i className="fas fa-times"></i>
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="d-flex gap-1">
                                                                <Button
                                                                    variant="warning"
                                                                    size="sm"
                                                                    onClick={() => iniciarEdicionInline(param)}
                                                                    title="Editar resultado"
                                                                    disabled={resultadoEditandoInline !== null}
                                                                >
                                                                    <i className="fas fa-edit"></i>
                                                                </Button>
                                                                <Button
                                                                    variant="danger"
                                                                    size="sm"
                                                                    onClick={() => eliminarResultadoEdicion(param)}
                                                                    title="Eliminar resultado"
                                                                    disabled={resultadoEditandoInline !== null}
                                                                >
                                                                    <i className="fas fa-trash"></i>
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}

                            <h6 className="mb-3">
                                <i className="fas fa-plus me-2"></i>
                                Agregar Nuevo Resultado
                            </h6>

                            <div className="border rounded p-3 mb-3 bg-light">
                                <Row className="g-2">
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Control
                                                type="text"
                                                name="nombre_parametro"
                                                value={resultadoActual.nombre_parametro}
                                                onChange={handleInputResultado}
                                                placeholder="Nombre del resultado"
                                                size="sm"
                                                disabled={resultadoEditandoInline !== null}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Control
                                                type="text"
                                                name="unidad"
                                                value={resultadoActual.unidad}
                                                onChange={handleInputResultado}
                                                placeholder="Unidad"
                                                size="sm"
                                                disabled={resultadoEditandoInline !== null}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Control
                                                type="text"
                                                name="rango_referencia"
                                                value={resultadoActual.rango_referencia}
                                                onChange={handleInputResultado}
                                                placeholder="Rango referencia"
                                                size="sm"
                                                disabled={resultadoEditandoInline !== null}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={1}>
                                        <Button
                                            variant="success"
                                            size="sm"
                                            className="w-100"
                                            onClick={agregarResultadoEdicion}
                                            disabled={resultadoEditandoInline !== null}
                                        >
                                            <i className="fas fa-plus"></i>
                                        </Button>
                                    </Col>
                                </Row>
                            </div>

                            {resultadoEditandoInline && (
                                <Alert variant="info">
                                    <i className="fas fa-edit me-2"></i>
                                    <strong>Editando resultado:</strong> Complete la edición actual antes de agregar nuevos resultados.
                                </Alert>
                            )}
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditarModal(false)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={guardarEdicionPlantilla}
                        disabled={loadingPlantillas || resultadoEditandoInline !== null}
                    >
                        {loadingPlantillas ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Guardando...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-save me-2"></i>
                                Guardar Cambios
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Estilos adicionales para react-select */}
            <style jsx>{`
                .react-select-container .react-select__control {
                    border: 1px solid #ced4da;
                    border-radius: 0.375rem;
                    min-height: 38px;
                }
                
                .react-select-container .react-select__control:hover {
                    border-color: #86b7fe;
                }
                
                .react-select-container .react-select__control--is-focused {
                    border-color: #86b7fe;
                    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
                }
                
                .react-select-container .react-select__option--is-selected {
                    background-color: #0d6efd;
                }
                
                .react-select-container .react-select__option--is-focused {
                    background-color: #e7f1ff;
                }
                
                .react-select-container .react-select__placeholder {
                    color: #6c757d;
                }
                
                .react-select-container .react-select__single-value {
                    color: #212529;
                }

                .card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
                    transition: all 0.3s ease;
                }
                
                /* Estilos mejorados para la tabla */
                .btn-action {
                    min-width: 70px;
                    white-space: nowrap;
                }
                
                @media (max-width: 768px) {
                    .btn-action {
                        font-size: 0.8rem;
                        padding: 0.25rem 0.5rem;
                    }
                }
                
                @media (max-width: 992px) {
                    .btn-action .d-none.d-lg-inline {
                        display: none !important;
                    }
                }
                
                .rdt_Table {
                    font-size: 0.9rem;
                }
                
                .rdt_TableHeadRow {
                    background-color: #f8f9fa;
                    border-bottom: 2px solid #dee2e6;
                }
                
                .rdt_TableRow:hover {
                    background-color: #f8f9fa;
                }
            `}</style>
        </Container>

    );
};

export default GestionTipoExamenesPlantillas;
