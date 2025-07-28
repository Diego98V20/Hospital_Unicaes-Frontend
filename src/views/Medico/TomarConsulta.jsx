import React, { useState, useEffect } from 'react';
import { consultaService } from '../../services/consultaService';
import Card from '../../components/Card/MainCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-solid-svg-icons';
import { faHeartbeat, faStethoscope, faCheckCircle, faQuestionCircle, faSmile } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { Row, Col, Button, InputGroup, FormControl, Container, Badge } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { useAuth } from 'components/AuthContext';

const TomarConsulta = () => {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    const loadConsultas = async () => {
      try {
        const data = await consultaService.getAllConsultas();
        setConsultas(data);
      } catch (error) {
        console.error('Error al obtener las consultas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConsultas();
  }, []);

  const toggleTomarConsulta = async (idConsulta) => {
    try {
      await consultaService.takeConsulta(idConsulta, user.id_usuario);

      const updatedConsultas = await consultaService.getAllConsultas();
      setConsultas(updatedConsultas);

      Swal.fire({
        title: 'Éxito',
        text: `Tomaste la consulta exitosamente!`,
        icon: 'success',
        confirmButtonText: 'Aceptar',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (error) {
      console.error('Error al tomar la consulta:', error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al tomar la consulta.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
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
        return <p>2 Hr</p>;
      case 'amarillo':
        return <p>4 Hr</p>;
      case 'verde':
        return <p>8 Hr</p>;
      default:
        return <p>0 Hr</p>;
    }
  };

  const columns = [
    {
      name: 'Nombre',
      selector: (row) => `${row.nombre_paciente} ${row.apellido_paciente}`,
      sortable: true
    },
    {
      name: 'Tipo consulta',
      selector: (row) => row.nombre_tipo_consulta,
      sortable: true
    },
    {
      name: 'Especialidad',
      selector: (row) => row.nombre_especialidad,
      sortable: true
    },

    {
      name: 'Estado',
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
      selector: row => row.motivo_consulta.length > 0 ? 
        row.motivo_consulta.split(" ").slice(0, 5).join("") + ("...") 
        : "N/A"      
    },

    {
      name: 'Tomar Consulta',
      cell: (row) => (
        <div className="mt-2 mb-2" aria-label="Consultas actions">
          <Button variant="info" onClick={() => toggleTomarConsulta(row.id_consulta)}>
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
    return <p>Cargando consultas...</p>;
  }

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Card title="Seleccionar y realizar una atencion médica" isOption>
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
              noDataComponent={<div>No hay consultas disponibles para mostrar.</div>}
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
                      {/* <div>
                        <label>Color Cardex </label>
                        <p>{data.estado_paciente}</p>
                      </div> */}
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
          </Card>
        </Col>
      </Row>
    </React.Fragment>

  );
};

export default TomarConsulta;
