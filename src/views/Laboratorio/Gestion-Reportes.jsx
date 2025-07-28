// GestionReportes.js

import React, { useEffect, useState } from 'react';
import { Container, InputGroup, FormControl, Row, Button, Modal } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { listarExamenesCompletadosService, mostrarResultadosExamenService } from 'services/examenService';
import Card from '../../components/Card/MainCard';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import logoUnicaes from '../../assets/images/UNICAES_LOGO.png'; // Adjust path as needed

const GestionReportes = () => {
    const [examenes, setExamenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showResultadosModal, setShowResultadosModal] = useState(false);
    const [selectedResultado, setSelectedResultado] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const cargarExamenes = async () => {
            try {
                const data = await listarExamenesCompletadosService.getExamenesCompletados();
                setExamenes(data);
            } catch (error) {
                console.error('Error al cargar los exámenes completados:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarExamenes();
    }, []);

    const handleOpenResultadosModal = (resultado) => {
        setSelectedResultado(resultado);
        setShowResultadosModal(true);
    };

    const handleCloseResultadosModal = () => {
        setShowResultadosModal(false);
        setSelectedResultado(null);
    };

    const columns = [
        { name: 'Paciente', selector: row => `${row.nombre_paciente} ${row.apellido_paciente}`, sortable: true },
        { name: 'N° de expediente', selector: row => `${row.n_expediente}`, sortable: true },
        { name: 'Tipo de Examen', selector: row => row.examen_nombre, sortable: true },
        { name: 'Doctor Responsable', selector: row => `${row.doctor_nombre} ${row.doctor_apellido}`, sortable: true },
        {
            name: 'Fecha de Procesamiento',
            selector: row => {
                const fecha = new Date(row.fecha_solicitud);
                const dia = String(fecha.getDate()).padStart(2, '0');
                const mes = String(fecha.getMonth() + 1).padStart(2, '0');
                const anio = fecha.getFullYear();
                return `${dia}/${mes}/${anio}`;
            },
            sortable: true
        },
        {
            name: 'Hora de Procesamiento',
            selector: row => {
                const fecha = new Date(row.fecha_solicitud);
                const horas = String(fecha.getHours()).padStart(2, '0');
                const minutos = String(fecha.getMinutes()).padStart(2, '0');
                return `${horas}:${minutos}`;
            },
            sortable: true
        },
        {
            name: 'Ver Resultados',
            cell: row => (
                <Button
                    variant="info"
                    size="sm"
                    className="mt-2 mb-2 ps-3 pe-2"
                    onClick={async () => {
                        setLoading(true);
                        try {
                            const resultados = await mostrarResultadosExamenService.getResultadosExamen(row.id_examen);
                            setSelectedResultado({
                                paciente: `${row.nombre_paciente} ${row.apellido_paciente}`,
                                muestra: row.nombre_muestra,
                                numeroExamen: row.id_examen,
                                fechaProceso: new Date(row.fecha_solicitud).toLocaleDateString('es-ES'),
                                examen: row.examen_nombre,
                                parametros: resultados,
                            });
                            setShowResultadosModal(true);
                        } catch (error) {
                            console.error('Error al obtener los resultados del examen:', error);
                        } finally {
                            setLoading(false);
                        }
                    }}
                    disabled={loading}
                >
                    <i className="fas fa-eye"></i>
                </Button>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true
        },
        {
            name: 'Descargar',
            cell: row => (
                <Button
                    variant="warning"
                    size="sm"
                    className="mt-2 mb-2 ps-3 pe-2"
                    onClick={async () => {
                        try {
                            const resultados = await mostrarResultadosExamenService.getResultadosExamen(row.id_examen);
                            const doc = new jsPDF();
                            const fecha = new Date(row.fecha_solicitud);

                            // Encabezado
                            doc.addImage(logoUnicaes, 'PNG', 20, 10, 20, 20);
                            doc.setFontSize(18);
                            doc.text('Hospital UNICAES - Laboratorio Clinico', 105, 20, { align: 'center' });

                            // Información del paciente
                            doc.setFontSize(12);
                            doc.text(`N° de expediente: ${row.n_expediente}`, 20, 40);
                            doc.text(`Paciente: ${row.nombre_paciente} ${row.apellido_paciente}`, 20, 50);
                            doc.text(`Examen: ${row.examen_nombre}`, 20, 60);
                            doc.text(`Fecha de Procesamiento: ${fecha.toLocaleDateString('es-ES')}`, 20, 70);
                            doc.text(`Hora de Procesamiento: ${fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })}`, 20, 80);
                            doc.text(`Doctor: ${row.doctor_nombre} ${row.doctor_apellido}`, 20, 90);
                            doc.text(`Laboratorista: ${row.nombre_laboratorista}`, 20, 100); 

                            // Tabla de resultados
                            let yPos = 110; 
                            doc.setFontSize(10);

                            // Encabezados de la tabla
                            doc.text('Parámetro', 20, yPos);
                            doc.text('Valor', 80, yPos);
                            doc.text('Unidad', 120, yPos);
                            doc.text('Valor Referencia', 160, yPos);

                            yPos += 10;

                            // Contenido de la tabla
                            resultados.forEach(param => {
                                if (yPos > 270) { // Nueva página si se excede el límite
                                    doc.addPage();
                                    yPos = 20;
                                }

                                doc.text(param.nombre_parametro?.toString() || '', 20, yPos);
                                doc.text(param.valor?.toString() || '', 80, yPos);
                                doc.text(param.unidad?.toString() || '', 120, yPos);
                                doc.text(param.rango_referencia?.toString() || '', 160, yPos);

                                yPos += 10;
                            });

                            // Guardar PDF
                            doc.save(`Resultados_${row.nombre_paciente}_${row.apellido_paciente}_${row.examen_nombre}.pdf`);
                        } catch (error) {
                            console.error("Error al generar PDF:", error);
                        }
                    }}
                >
                    <i className="fas fa-download"></i>
                </Button>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true
        }
    ];

    const filteredExamenes = examenes.filter(examen =>
        `${examen.nombre_paciente} ${examen.apellido_paciente} ${examen.examen_nombre}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <p>Cargando exámenes completados...</p>;

    return (
        <Row>
            <Card title="Gestión de Reportes">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="m-0">Catálogo de exámenes completados</h5>
                    <Button variant="success" onClick={() => { }}>
                        <i className="fas fa-file-export me-2"></i>
                        Exportar Exámenes
                    </Button>
                </div>
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
                    noDataComponent={<div>No hay exámenes completados para mostrar.</div>}
                />
            </Card>

            {/* Modal de Resultados */}
            <Modal size="lg" show={showResultadosModal} onHide={handleCloseResultadosModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Resultados de Laboratorio</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedResultado && (
                        <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                            <p><strong>Paciente:</strong> {selectedResultado.paciente}</p>
                            <p><strong>Muestra:</strong> {selectedResultado.muestra}</p>
                            <p><strong>Fecha de Procesamiento:</strong> {selectedResultado.fechaProceso}</p>
                            <p><strong>Examen:</strong> {selectedResultado.examen}</p>

                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Parámetro</th>
                                            <th>Valor</th>
                                            <th>Unidad</th>
                                            <th>Valor Referencia</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedResultado.parametros && Array.isArray(selectedResultado.parametros) && selectedResultado.parametros.map((parametro, index) => (
                                            <tr key={index}>
                                                <td>{parametro.nombre_parametro}</td>
                                                <td>{parametro.valor}</td>
                                                <td>{parametro.unidad}</td>
                                                <td>{parametro.rango_referencia}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseResultadosModal}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Row>
    );
};

export default GestionReportes;