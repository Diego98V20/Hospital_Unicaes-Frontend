import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Badge, Card, Row, Col, ProgressBar, Alert } from 'react-bootstrap';
import { despachoService } from '../../../services/despachoService';
import jsPDF from 'jspdf';
import logoUnicaes from '../../../assets/images/UNICAES_LOGO.png';
import 'jspdf-autotable';

const VerDespachoModal = ({ show, onHide, despacho }) => {
  // Estados
  const [recetaOriginal, setRecetaOriginal] = useState(null);
  const [loadingReceta, setLoadingReceta] = useState(false);
  const [errorReceta, setErrorReceta] = useState(null);
  const [imprimiendo, setImprimiendo] = useState(false);

  // Efecto para cargar datos cuando se abre el modal
  useEffect(() => {
    if (show && despacho) {
      cargarDetalleRecetaOriginal();
    }
  }, [show, despacho]);

  // Función para cargar detalles de la receta original
  const cargarDetalleRecetaOriginal = async () => {
    if (!despacho || !despacho.id_receta) return;

    try {
      setLoadingReceta(true);
      setErrorReceta(null);
      const response = await despachoService.obtenerInformacionCompletaReceta(despacho.id_receta);
      if (response.success) {
        setRecetaOriginal(response.data);
      } else {
        setErrorReceta("Error al cargar el detalle de la receta original");
      }
    } catch (err) {
      console.error("Error al cargar detalle de receta original:", err);
      setErrorReceta("Error de conexión al cargar detalle de la receta");
    } finally {
      setLoadingReceta(false);
    }
  };

  // Funciones de utilidad
  const getBadgeVariant = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'completo': return 'success';
      case 'parcial': return 'warning';
      case 'cancelado': return 'danger';
      default: return 'secondary';
    }
  };

  const getEstadoText = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'completo': return 'Despacho Completo';
      case 'parcial': return 'Despacho Parcial';
      case 'cancelado': return 'Despacho Cancelado';
      default: return estado || 'Desconocido';
    }
  };

  // Calcular estadísticas del despacho
  const calcularEstadisticas = () => {
    // Para despachos cancelados
    if (despacho.estado === 'cancelado') {
      if (recetaOriginal && recetaOriginal.medicamentos && recetaOriginal.medicamentos.length > 0) {
        return recetaOriginal.medicamentos.reduce((acc, medicamento) => {
          acc.medicamentosRequeridos = acc.medicamentosRequeridos + 1;
          acc.cantidadRequerida = acc.cantidadRequerida + medicamento.cantidad;
          acc.cantidadDespachada = 0;
          acc.cantidadFaltante = acc.cantidadFaltante + medicamento.cantidad;
          return acc;
        }, {
          medicamentosRequeridos: 0,
          cantidadRequerida: 0,
          cantidadDespachada: 0,
          cantidadFaltante: 0,
          porcentajeCompletado: 0
        });
      }
      return null;
    }

    // Para despachos activos (completos o parciales)
    // Necesitamos calcular basándose en la receta original, no solo en lo despachado
    if (!recetaOriginal || !recetaOriginal.medicamentos || recetaOriginal.medicamentos.length === 0) {
      // Fallback al cálculo anterior si no tenemos receta original
      if (!despacho.detalles) return null;
      
      const totales = despacho.detalles.reduce((acc, medicamento) => {
        const cantidadDespachada = medicamento.lotes.reduce(
          (sum, lote) => sum + parseInt(lote.cantidad_despachada || 0), 0
        );

        acc.medicamentosRequeridos = acc.medicamentosRequeridos + 1;
        acc.cantidadRequerida = acc.cantidadRequerida + medicamento.cantidad_requerida;
        acc.cantidadDespachada = acc.cantidadDespachada + cantidadDespachada;
        acc.cantidadFaltante = acc.cantidadFaltante + Math.max(0, medicamento.cantidad_requerida - cantidadDespachada);
        return acc;
      }, {
        medicamentosRequeridos: 0,
        cantidadRequerida: 0,
        cantidadDespachada: 0,
        cantidadFaltante: 0
      });

      totales.porcentajeCompletado = totales.cantidadRequerida > 0 ?
        Math.round((totales.cantidadDespachada / totales.cantidadRequerida) * 100) : 0;

      return totales;
    }

    // Cálculo correcto basado en la receta original
    const medicamentosDespachados = new Map();
    if (despacho.detalles) {
      despacho.detalles.forEach(med => {
        const cantidadDespachada = med.lotes.reduce(
          (sum, lote) => sum + parseInt(lote.cantidad_despachada || 0), 0
        );
        medicamentosDespachados.set(med.id_medicamento, cantidadDespachada);
      });
    }

    // Calcular estadísticas basándose en TODOS los medicamentos de la receta original
    const totales = recetaOriginal.medicamentos.reduce((acc, medicamento) => {
      const cantidadDespachada = medicamentosDespachados.get(medicamento.id_medicamento) || 0;
      const cantidadRequerida = medicamento.cantidad;
      const cantidadFaltante = Math.max(0, cantidadRequerida - cantidadDespachada);

      acc.medicamentosRequeridos = acc.medicamentosRequeridos + 1;
      acc.cantidadRequerida = acc.cantidadRequerida + cantidadRequerida;
      acc.cantidadDespachada = acc.cantidadDespachada + cantidadDespachada;
      acc.cantidadFaltante = acc.cantidadFaltante + cantidadFaltante;
      
      return acc;
    }, {
      medicamentosRequeridos: 0,
      cantidadRequerida: 0,
      cantidadDespachada: 0,
      cantidadFaltante: 0
    });

    // Calcular porcentaje real basado en el total de la receta original
    totales.porcentajeCompletado = totales.cantidadRequerida > 0 ?
      Math.round((totales.cantidadDespachada / totales.cantidadRequerida) * 100) : 0;

    return totales;
  };

  // Obtener medicamentos no despachados
  const obtenerMedicamentosNoDespachados = () => {
    if (!recetaOriginal || !recetaOriginal.medicamentos || recetaOriginal.medicamentos.length === 0) return [];

    const medicamentosDespachados = new Map();
    if (despacho.detalles) {
      despacho.detalles.forEach(med => {
        medicamentosDespachados.set(med.id_medicamento, med);
      });
    }

    return recetaOriginal.medicamentos.filter(med => {
      const medicamentoDespachado = medicamentosDespachados.get(med.id_medicamento);
      if (!medicamentoDespachado) {
        return true;
      }
      return med.cantidad > medicamentoDespachado.cantidad_total_despachada;
    });
  };

  // [Mantener función generarPDF tal como está - es muy extensa y funcional]
  const limpiarTextoParaArchivo = (texto) => {
    return texto
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  };

  const generarPDF = async () => {
    if (!despacho) return;

    try {
      setImprimiendo(true);

      // Crear nuevo documento PDF
      const doc = new jsPDF();

      // Configuraciones
      const pageWidth = doc.internal.pageSize.getWidth();
      const margenLateral = 20;
      const ancho = pageWidth - (margenLateral * 2);

      // Agregar logo
      doc.addImage(logoUnicaes, 'PNG', margenLateral, 10, 20, 20);

      // Título
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text('Hospital UNICAES - Farmacia', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(14);
      doc.text(`Despacho de Medicamentos #${despacho.id_despacho}`, pageWidth / 2, 30, { align: 'center' });

      // Estado del despacho
      doc.setFontSize(12);
      const estadoTexto = getEstadoText(despacho.estado);
      doc.setTextColor(
        despacho.estado === 'completo' ? 0 :
          despacho.estado === 'parcial' ? 200 :
            200,
        despacho.estado === 'completo' ? 150 :
          despacho.estado === 'parcial' ? 150 :
            0,
        despacho.estado === 'completo' ? 0 :
          despacho.estado === 'parcial' ? 0 :
            0
      );
      doc.text(estadoTexto, pageWidth / 2, 40, { align: 'center' });
      doc.setTextColor(0, 0, 0); // Restaurar color

      // Datos del despacho
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      let yPos = 55;

      // Información del despacho - Columna izquierda
      doc.setFont("helvetica", "bold");
      doc.text("Información del Despacho:", margenLateral, yPos);
      doc.setFont("helvetica", "normal");

      yPos += 8;
      doc.text(`ID Despacho: ${despacho.id_despacho}`, margenLateral, yPos);
      yPos += 6;
      doc.text(`Fecha: ${new Date(despacho.fecha_despacho).toLocaleString('es-ES')}`, margenLateral, yPos);
      yPos += 6;
      doc.text(`Despachado por: ${despacho.nombre_despachador}`, margenLateral, yPos);

      // Información de la receta - Columna derecha
      yPos = 55;
      const colDerecha = pageWidth / 2 + 10;

      doc.setFont("helvetica", "bold");
      doc.text("Información de la Receta:", colDerecha, yPos);
      doc.setFont("helvetica", "normal");

      yPos += 8;
      doc.text(`Receta #: ${despacho.id_receta}`, colDerecha, yPos);
      yPos += 6;
      doc.text(`Paciente: ${despacho.nombre_paciente}`, colDerecha, yPos);
      yPos += 6;
      doc.text(`Expediente: ${despacho.n_expediente || recetaOriginal?.n_expediente || 'N/A'}`, colDerecha, yPos);
      yPos += 6;
      doc.text(`Médico: ${despacho.nombre_medico}${despacho.especialidad ? ` (${despacho.especialidad})` : ''}`, colDerecha, yPos);

      yPos += 15;

      // Estadísticas del despacho
      const estadisticas = calcularEstadisticas();
      if (estadisticas) {
        doc.setFont("helvetica", "bold");
        doc.text("Resumen del Despacho:", margenLateral, yPos);
        doc.setFont("helvetica", "normal");

        yPos += 8;
        doc.text(`Medicamentos: ${estadisticas.medicamentosRequeridos}`, margenLateral, yPos);
        yPos += 6;
        doc.text(`Unidades Despachadas: ${estadisticas.cantidadDespachada}`, margenLateral, yPos);
        yPos += 6;
        doc.text(`Unidades Faltantes: ${estadisticas.cantidadFaltante}`, margenLateral, yPos);
        yPos += 6;
        doc.text(`Porcentaje Completado: ${estadisticas.porcentajeCompletado}%`, margenLateral, yPos);

        yPos += 10;
      }

      // Razón de cancelación si aplica
      if (despacho.estado === 'cancelado' && despacho.razon_cancelacion) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(200, 0, 0);
        doc.text("Razón de Cancelación:", margenLateral, yPos);
        doc.setFont("helvetica", "normal");

        yPos += 8;

        // Dividir texto largo en múltiples líneas
        const razonCancelacionSplit = doc.splitTextToSize(despacho.razon_cancelacion, ancho);
        doc.text(razonCancelacionSplit, margenLateral, yPos);

        yPos += (razonCancelacionSplit.length * 6) + 6;
        doc.setTextColor(0, 0, 0); // Restaurar color
      }

      // SECCIÓN: Tabla de medicamentos

      // Para despachos NO cancelados: mostrar medicamentos despachados
      if (despacho.estado !== 'cancelado' && despacho.detalles && despacho.detalles.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.text("Medicamentos Despachados:", margenLateral, yPos);

        yPos += 8;

        // Crear tabla con autoTable
        const tableColumn = ["Medicamento", "Concentración", "Dosis", "Frecuencia", "Duración", "Requerido", "Despachado", "Lotes"];
        const tableRows = [];

        despacho.detalles.forEach(medicamento => {
          const cantidadDespachada = medicamento.lotes.reduce(
            (sum, lote) => sum + parseInt(lote.cantidad_despachada || 0), 0
          );
          const cantidadRequerida = medicamento.cantidad_requerida || 0;

          // Formatear lotes para la tabla
          const lotesTexto = medicamento.lotes.map(lote =>
            `${lote.numero_lote}: ${lote.cantidad_despachada} uds. (Vence: ${new Date(lote.fecha_caducidad).toLocaleDateString('es-ES')})`
          ).join("\n");

          tableRows.push([
            medicamento.nombre_medicamento,
            medicamento.concentracion || "-",
            medicamento.dosis || "-",
            medicamento.frecuencia || "-",
            medicamento.duracion || "-",
            cantidadRequerida.toString(),
            cantidadDespachada.toString(),
            lotesTexto
          ]);
        });

        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: yPos,
          margin: { left: margenLateral, right: margenLateral },
          styles: {
            fontSize: 7,
            cellPadding: 2,
            overflow: 'linebreak',
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 'auto' },
            4: { cellWidth: 'auto' },
            5: { cellWidth: 15 },
            6: { cellWidth: 15 },
            7: { cellWidth: 'auto' }
          },
        });

        // Actualizar la posición Y después de la tabla
        yPos = doc.autoTable.previous.finalY + 10;
      }

      // SECCIÓN: Para despachos CANCELADOS - mostrar medicamentos de la receta original
      if (despacho.estado === 'cancelado' && recetaOriginal && recetaOriginal.medicamentos && recetaOriginal.medicamentos.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(200, 0, 0); // Color rojo para cancelados
        doc.text("Medicamentos de la Receta (Cancelados):", margenLateral, yPos);
        doc.setTextColor(0, 0, 0); // Restaurar color

        yPos += 8;

        // Crear tabla para medicamentos cancelados
        const tableCanceladosColumn = ["Medicamento", "Concentración", "Dosis", "Frecuencia", "Duración", "Cantidad", "Estado"];
        const tableCanceladosRows = [];

        recetaOriginal.medicamentos.forEach(medicamento => {
          tableCanceladosRows.push([
            medicamento.nombre_medicamento,
            medicamento.concentracion || "-",
            medicamento.dosis || "-",
            medicamento.frecuencia || "-",
            medicamento.duracion || "-",
            medicamento.cantidad.toString(),
            "No Despachado"
          ]);
        });

        doc.autoTable({
          head: [tableCanceladosColumn],
          body: tableCanceladosRows,
          startY: yPos,
          margin: { left: margenLateral, right: margenLateral },
          styles: {
            fontSize: 8,
            cellPadding: 2,
            overflow: 'linebreak',
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
          },
          headStyles: {
            fillColor: [220, 53, 69], // Color rojo para cancelados
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 'auto' },
            4: { cellWidth: 'auto' },
            5: { cellWidth: 20 },
            6: { cellWidth: 25 }
          },
          bodyStyles: {
            6: { textColor: [220, 53, 69], fontStyle: 'bold' } // Columna "Estado" en rojo
          }
        });

        // Actualizar la posición Y después de la tabla
        yPos = doc.autoTable.previous.finalY + 10;
      }

      // Medicamentos No Despachados (para despachos parciales)
      const medicamentosNoDespachados = (despacho.estado === 'parcial') ?
        obtenerMedicamentosNoDespachados() : [];

      if (medicamentosNoDespachados.length > 0) {
        // Verificar si necesitamos una nueva página
        if (yPos > doc.internal.pageSize.getHeight() - 60) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setTextColor(200, 150, 0); // Color naranja/amarillo para advertencia
        doc.text("Medicamentos No Despachados:", margenLateral, yPos);
        doc.setTextColor(0, 0, 0); // Restaurar color

        yPos += 8;

        // Crear tabla con autoTable para medicamentos no despachados
        const noDespachadosColumns = ["Medicamento", "Concentración", "Dosis", "Frecuencia", "Duración", "Cantidad Requerida", "No Despachada", "Motivo"];
        const noDespachadosRows = [];

        medicamentosNoDespachados.forEach(medicamento => {
          const medDespachado = despacho.detalles ?
            despacho.detalles.find(m => m.id_medicamento === medicamento.id_medicamento) : null;

          const cantidadDespachada = medDespachado ?
            medDespachado.cantidad_total_despachada : 0;
          const cantidadFaltante = medicamento.cantidad - cantidadDespachada;

          // Solo incluir si hay cantidad faltante
          if (cantidadFaltante <= 0) return;

          // Normalizar el stock disponible (convertir null/undefined a 0)
          const stockDisponible = medicamento.stock_disponible ?? 0;

          let motivo = 'No seleccionado para despacho';
          if (stockDisponible === 0) {
            motivo = 'Sin stock disponible';
          } else if (stockDisponible < medicamento.cantidad) {
            motivo = `Stock insuficiente (${stockDisponible} uds. disponibles)`;
          }

          noDespachadosRows.push([
            medicamento.nombre_medicamento,
            medicamento.concentracion || "-",
            medicamento.dosis || "-",
            medicamento.frecuencia || "-",
            medicamento.duracion || "-",
            medicamento.cantidad.toString(),
            cantidadFaltante.toString(),
            motivo
          ]);
        });

        if (noDespachadosRows.length > 0) {
          doc.autoTable({
            head: [noDespachadosColumns],
            body: noDespachadosRows,
            startY: yPos,
            margin: { left: margenLateral, right: margenLateral },
            styles: {
              fontSize: 7,
              cellPadding: 2,
              overflow: 'linebreak',
              lineColor: [0, 0, 0],
              lineWidth: 0.1,
            },
            headStyles: {
              fillColor: [230, 126, 34], // Naranja para sección de no despachados
              textColor: [255, 255, 255],
              fontStyle: 'bold'
            },
          });

          // Actualizar la posición Y después de la tabla
          yPos = doc.autoTable.previous.finalY + 10;
        }
      }

      // Observaciones (si existen)
      if (despacho.observaciones) {
        // Verificar si necesitamos una nueva página
        if (yPos > doc.internal.pageSize.getHeight() - 40) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.text("Observaciones:", margenLateral, yPos);
        doc.setFont("helvetica", "normal");

        yPos += 8;

        // Dividir texto largo en múltiples líneas
        const observacionesSplit = doc.splitTextToSize(despacho.observaciones, ancho);
        doc.text(observacionesSplit, margenLateral, yPos);
      }

      // Pie de página
      const fecha = new Date().toLocaleString('es-ES');
      const pageCount = doc.internal.getNumberOfPages();

      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Fecha de impresión: ${fecha}`, margenLateral, doc.internal.pageSize.getHeight() - 10);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margenLateral, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
      }

      // Generar nombre del archivo con nombre del paciente
      const nombrePaciente = limpiarTextoParaArchivo(despacho.nombre_paciente || 'Paciente');
      const fechaArchivo = new Date().toISOString().slice(0, 10);
      const nombreArchivo = `Despacho_${despacho.id_despacho}_${fechaArchivo}_${nombrePaciente}.pdf`;

      // Guardar o mostrar el PDF
      doc.save(nombreArchivo);

    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar el PDF. Por favor, intente nuevamente.");
    } finally {
      setImprimiendo(false);
    }
  };

  // Si no hay despacho, no mostrar nada
  if (!despacho) {
    return null;
  }

  // Variables calculadas
  const estadisticas = calcularEstadisticas();
  const esDespachoCompleto = despacho?.estado === 'completo';
  const esDespachoAgotado = despacho?.estado === 'parcial';
  const esDespachoCancelado = despacho?.estado === 'cancelado';
  const medicamentosNoDespachados = (esDespachoAgotado || esDespachoCancelado) ?
    obtenerMedicamentosNoDespachados() : [];

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-clipboard-list me-2"></i>
          Detalles de Despacho #{despacho.id_despacho}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* 1. INFORMACIÓN GENERAL DEL DESPACHO */}
        <InformacionGeneralCard 
          despacho={despacho} 
          recetaOriginal={recetaOriginal}
          getBadgeVariant={getBadgeVariant}
          getEstadoText={getEstadoText}
        />

        {/* 2. RESUMEN Y ESTADÍSTICAS */}
        {estadisticas && (
          <ResumenEstadisticasCard 
            estadisticas={estadisticas}
            esDespachoCompleto={esDespachoCompleto}
            esDespachoAgotado={esDespachoAgotado}
            esDespachoCancelado={esDespachoCancelado}
          />
        )}

        {/* 3. RAZÓN DE CANCELACIÓN (Solo si aplica) */}
        {esDespachoCancelado && despacho.razon_cancelacion && (
          <RazonCancelacionCard razon={despacho.razon_cancelacion} />
        )}

        {/* 4. MEDICAMENTOS PRINCIPALES */}
        <MedicamentosCard
          despacho={despacho}
          recetaOriginal={recetaOriginal}
          esDespachoCancelado={esDespachoCancelado}
          esDespachoAgotado={esDespachoAgotado}
          loadingReceta={loadingReceta}
        />

        {/* 5. MEDICAMENTOS NO DESPACHADOS (Solo para parciales) */}
        {esDespachoAgotado && medicamentosNoDespachados.length > 0 && (
          <MedicamentosNoDespachados 
            medicamentosNoDespachados={medicamentosNoDespachados}
            detallesDespacho={despacho.detalles}
          />
        )}

        {/* 6. OBSERVACIONES (Al final si existen) */}
        {despacho.observaciones && (
          <ObservacionesCard observaciones={despacho.observaciones} />
        )}

        {/* 7. MENSAJE DE ERROR SI OCURRE */}
        {errorReceta && (
          <Alert variant="warning" className="mt-3">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {errorReceta}
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between">
        <div className="text-muted small">
          <i className="fas fa-clock me-1"></i>
          Generado: {new Date(despacho.fecha_despacho).toLocaleString('es-ES')}
        </div>
        <div>
          <Button variant="secondary" onClick={onHide} className="me-2">
            <i className="fas fa-times me-1"></i>
            Cerrar
          </Button>
          <Button
            variant="primary"
            onClick={generarPDF}
            disabled={imprimiendo}
          >
            {imprimiendo ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Generando PDF...
              </>
            ) : (
              <>
                <i className="fas fa-file-pdf me-1"></i>
                Exportar PDF
              </>
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};



const InformacionGeneralCard = ({ despacho, recetaOriginal, getBadgeVariant, getEstadoText }) => (
  <Card className="mb-3 shadow-sm">
    <Card.Header className="bg-light">
      <div className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0 text-primary">
          <i className="fas fa-info-circle me-2"></i>
          Información del Despacho
        </h6>
        <Badge
          bg={getBadgeVariant(despacho.estado)}
          className="fs-6 px-3 py-2"
        >
          {getEstadoText(despacho.estado)}
        </Badge>
      </div>
    </Card.Header>
    <Card.Body>
      <Row className="mb-3">
        <Col lg={4} md={6}>
          <CampoInfo icon="fas fa-hashtag" label="ID Despacho" value={despacho.id_despacho} />
        </Col>
        <Col lg={4} md={6}>
          <CampoInfo 
            icon="fas fa-calendar-alt" 
            label="Fecha del Despacho" 
            value={new Date(despacho.fecha_despacho).toLocaleString('es-ES')} 
          />
        </Col>
        <Col lg={4} md={6}>
          <CampoInfo icon="fas fa-user-md" label="Despachado por" value={despacho.nombre_despachador} />
        </Col>
      </Row>
      
      <hr />
      
      <Row>
        <Col lg={3} md={6}>
          <CampoInfo icon="fas fa-prescription-bottle" label="Receta #" value={despacho.id_receta} />
        </Col>
        <Col lg={3} md={6}>
          <div className="mb-3">
            <p className="mb-1 text-muted small">
              <i className="fas fa-folder-open me-1"></i>
              <strong>Expediente:</strong>
            </p>
            <Badge bg="info" text="dark" className="fs-6">
              {despacho.n_expediente || recetaOriginal?.n_expediente || 'N/A'}
            </Badge>
          </div>
        </Col>
        <Col lg={3} md={6}>
          <CampoInfo icon="fas fa-user" label="Paciente" value={despacho.nombre_paciente} />
        </Col>
        <Col lg={3} md={6}>
          <CampoInfo 
            icon="fas fa-stethoscope" 
            label="Médico" 
            value={`${despacho.nombre_medico}${despacho.especialidad ? ` (${despacho.especialidad})` : ''}`} 
          />
        </Col>
      </Row>
    </Card.Body>
  </Card>
);

const ResumenEstadisticasCard = ({ estadisticas, esDespachoCompleto, esDespachoAgotado, esDespachoCancelado }) => (
  <Card className="mb-3 shadow-sm">
    <Card.Header className="bg-light">
      <h6 className="mb-0 text-primary">
        <i className="fas fa-chart-pie me-2"></i>
        Resumen del Despacho
      </h6>
    </Card.Header>
    <Card.Body>
      <Row className="text-center mb-3">
        <Col md={3}>
          <EstadisticaItem 
            icon="fas fa-pills"
            value={estadisticas.medicamentosRequeridos}
            label="Medicamentos"
            color="primary"
          />
        </Col>
        <Col md={3}>
          <EstadisticaItem 
            icon="fas fa-check-circle"
            value={estadisticas.cantidadDespachada}
            label="Unidades Despachadas"
            color="success"
          />
        </Col>
        <Col md={3}>
          <EstadisticaItem 
            icon="fas fa-exclamation-circle"
            value={estadisticas.cantidadFaltante}
            label="Unidades Faltantes"
            color={estadisticas.cantidadFaltante > 0 ? "danger" : "success"}
          />
        </Col>
        <Col md={3}>
          <EstadisticaItem 
            icon="fas fa-percentage"
            value={`${estadisticas.porcentajeCompletado}%`}
            label="Completado"
            color="info"
          />
        </Col>
      </Row>

      <div className="mb-2">
        <div className="d-flex justify-content-between mb-1">
          <small className="text-muted">Progreso del Despacho</small>
          <small className="text-muted">{estadisticas.porcentajeCompletado}%</small>
        </div>
        <ProgressBar
          variant={esDespachoCompleto ? 'success' : esDespachoAgotado ? 'warning' : 'danger'}
          now={estadisticas.porcentajeCompletado}
          style={{ height: '8px' }}
        />
      </div>

      {esDespachoCancelado && (
        <Alert variant="danger" className="mb-0 mt-3">
          <i className="fas fa-ban me-2"></i>
          <strong>Despacho Cancelado:</strong> No se entregaron medicamentos.
        </Alert>
      )}
    </Card.Body>
  </Card>
);

const RazonCancelacionCard = ({ razon }) => (
  <Card className="mb-3 border-danger shadow-sm">
    <Card.Header className="bg-danger bg-opacity-10 text-danger">
      <h6 className="mb-0">
        <i className="fas fa-times-circle me-2"></i>
        Razón de Cancelación
      </h6>
    </Card.Header>
    <Card.Body>
      <p className="mb-0 text-dark">{razon}</p>
    </Card.Body>
  </Card>
);

const MedicamentosCard = ({ despacho, recetaOriginal, esDespachoCancelado, esDespachoAgotado, loadingReceta }) => (
  <Card className="mb-3 shadow-sm">
    <Card.Header className="bg-light">
      <div className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0 text-primary">
          <i className="fas fa-pills me-2"></i>
          {!esDespachoCancelado ? "Medicamentos Despachados" : "Medicamentos en la Receta"}
        </h6>
        {esDespachoAgotado && (
          <Badge bg="warning" className="fs-6">
            <i className="fas fa-exclamation-triangle me-1"></i>
            Despacho Parcial
          </Badge>
        )}
      </div>
    </Card.Header>
    <Card.Body>
      {loadingReceta ? (
        <LoadingSpinner mensaje="Cargando información de medicamentos..." />
      ) : !esDespachoCancelado && despacho.detalles?.length > 0 ? (
        <TablaMedicamentosDespachados medicamentos={despacho.detalles} />
      ) : esDespachoCancelado && recetaOriginal?.medicamentos?.length > 0 ? (
        <TablaMedicamentosCancelados medicamentos={recetaOriginal.medicamentos} />
      ) : (
        <div className="text-center py-4">
          <i className="fas fa-info-circle text-muted me-2"></i>
          <span className="text-muted">No hay detalles de medicamentos disponibles.</span>
        </div>
      )}
    </Card.Body>

    {esDespachoAgotado && (
      <Card.Footer className="bg-light">
        <div className="d-flex align-items-center">
          <i className="fas fa-info-circle text-warning me-2"></i>
          <small className="text-muted">
            Este es un despacho parcial. Se entregaron menos medicamentos de los prescritos 
            originalmente debido a disponibilidad de stock.
          </small>
        </div>
      </Card.Footer>
    )}
  </Card>
);

const MedicamentosNoDespachados = ({ medicamentosNoDespachados, detallesDespacho }) => (
  <Card className="mb-3 border-warning shadow-sm">
    <Card.Header className="bg-warning bg-opacity-10 text-warning">
      <h6 className="mb-0">
        <i className="fas fa-exclamation-triangle me-2"></i>
        Medicamentos No Despachados
      </h6>
    </Card.Header>
    <Card.Body>
      <TablaMedicamentosNoDespachados 
        medicamentos={medicamentosNoDespachados}
        detallesDespacho={detallesDespacho}
      />
    </Card.Body>
  </Card>
);

const ObservacionesCard = ({ observaciones }) => (
  <Card className="mb-3 shadow-sm">
    <Card.Header className="bg-light">
      <h6 className="mb-0 text-primary">
        <i className="fas fa-sticky-note me-2"></i>
        Observaciones
      </h6>
    </Card.Header>
    <Card.Body>
      <p className="mb-0">{observaciones}</p>
    </Card.Body>
  </Card>
);


// COMPONENTES AUXILIARES

const CampoInfo = ({ icon, label, value }) => (
  <div className="mb-3">
    <p className="mb-1 text-muted small">
      <i className={`${icon} me-1`}></i>
      <strong>{label}:</strong>
    </p>
    <p className="mb-0">{value}</p>
  </div>
);

const EstadisticaItem = ({ icon, value, label, color }) => (
  <div className="mb-2">
    <div className="d-flex align-items-center justify-content-center mb-1">
      <i className={`${icon} text-${color} me-2`}></i>
      <h5 className={`mb-0 text-${color}`}>{value}</h5>
    </div>
    <p className="text-muted small mb-0">{label}</p>
  </div>
);

const LoadingSpinner = ({ mensaje = "Cargando..." }) => (
  <div className="text-center py-4">
    <div className="spinner-border text-primary mb-2" role="status">
      <span className="visually-hidden">Cargando...</span>
    </div>
    <p className="text-muted mb-0">{mensaje}</p>
  </div>
);

const TablaMedicamentosDespachados = ({ medicamentos }) => (
  <div className="table-responsive">
    <Table hover className="align-middle">
      <thead className="table-light">
        <tr>
          <th><i className="fas fa-pills me-1"></i>Medicamento</th>
          <th><i className="fas fa-vial me-1"></i>Concentración</th>
          <th><i className="fas fa-prescription me-1"></i>Prescripción</th>
          <th className="text-center">Requerido</th>
          <th className="text-center">Despachado</th>
          <th className="text-center">Faltante</th>
          <th className="text-center">Progreso</th>
          <th><i className="fas fa-barcode me-1"></i>Lotes</th>
        </tr>
      </thead>
      <tbody>
        {medicamentos.map((medicamento, index) => (
          <FilaMedicamentoDespachado key={index} medicamento={medicamento} />
        ))}
      </tbody>
    </Table>
  </div>
);

const FilaMedicamentoDespachado = ({ medicamento }) => {
  const cantidadDespachada = medicamento.lotes.reduce(
    (sum, lote) => sum + parseInt(lote.cantidad_despachada || 0), 0
  );
  const cantidadRequerida = medicamento.cantidad_requerida || 0;
  const cantidadFaltante = Math.max(0, cantidadRequerida - cantidadDespachada);
  const porcentajeCompletado = cantidadRequerida > 0 ?
    Math.round((cantidadDespachada / cantidadRequerida) * 100) : 0;

  return (
    <tr>
      <td>
        <div>
          <strong className="text-primary">{medicamento.nombre_medicamento}</strong>
          <br />
          <small className="text-muted">
            <i className="fas fa-route me-1"></i>
            {medicamento.via_administracion}
          </small>
        </div>
      </td>
      <td>{medicamento.concentracion}</td>
      <td>
        <div className="small">
          <div><strong>Dosis:</strong> {medicamento.dosis || 'No especificada'}</div>
          <div><strong>Frecuencia:</strong> {medicamento.frecuencia || 'No especificada'}</div>
          <div><strong>Duración:</strong> {medicamento.duracion || 'No especificada'}</div>
          {medicamento.instrucciones && (
            <div><strong>Instrucciones:</strong> {medicamento.instrucciones}</div>
          )}
        </div>
      </td>
      <td className="text-center">
        <Badge bg="secondary">{cantidadRequerida}</Badge>
      </td>
      <td className="text-center">
        <Badge bg={cantidadDespachada === cantidadRequerida ? 'success' : 'warning'}>
          {cantidadDespachada}
        </Badge>
      </td>
      <td className="text-center">
        <Badge bg={cantidadFaltante > 0 ? 'danger' : 'success'}>
          {cantidadFaltante}
        </Badge>
      </td>
      <td className="text-center" style={{ minWidth: '120px' }}>
        <div className="d-flex align-items-center">
          <span className="me-2 small">{porcentajeCompletado}%</span>
          <ProgressBar
            variant={cantidadDespachada === cantidadRequerida ? 'success' : 'warning'}
            now={porcentajeCompletado}
            style={{ height: '6px', flex: 1 }}
          />
        </div>
      </td>
      <td>
        <LotesInfo lotes={medicamento.lotes} />
      </td>
    </tr>
  );
};

const TablaMedicamentosCancelados = ({ medicamentos }) => (
  <div className="table-responsive">
    <Table hover className="align-middle">
      <thead className="table-light">
        <tr>
          <th><i className="fas fa-pills me-1"></i>Medicamento</th>
          <th><i className="fas fa-vial me-1"></i>Concentración</th>
          <th><i className="fas fa-prescription me-1"></i>Prescripción</th>
          <th className="text-center">Cantidad</th>
          <th className="text-center">Estado</th>
        </tr>
      </thead>
      <tbody>
        {medicamentos.map((medicamento, index) => (
          <tr key={index}>
            <td>
              <div>
                <strong className="text-primary">{medicamento.nombre_medicamento}</strong>
                <br />
                <small className="text-muted">
                  <i className="fas fa-route me-1"></i>
                  {medicamento.via_administracion}
                </small>
              </div>
            </td>
            <td>{medicamento.concentracion}</td>
            <td>
              <div className="small">
                <div><strong>Dosis:</strong> {medicamento.dosis || 'No especificada'}</div>
                <div><strong>Frecuencia:</strong> {medicamento.frecuencia || 'No especificada'}</div>
                <div><strong>Duración:</strong> {medicamento.duracion || 'No especificada'}</div>
                {medicamento.instrucciones && (
                  <div><strong>Instrucciones:</strong> {medicamento.instrucciones}</div>
                )}
              </div>
            </td>
            <td className="text-center">
              <Badge bg="secondary">{medicamento.cantidad}</Badge>
            </td>
            <td className="text-center">
              <Badge bg="danger">
                <i className="fas fa-times me-1"></i>
                No Despachado
              </Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  </div>
);

const TablaMedicamentosNoDespachados = ({ medicamentos, detallesDespacho }) => (
  <div className="table-responsive">
    <Table hover className="align-middle">
      <thead className="table-light">
        <tr>
          <th><i className="fas fa-pills me-1"></i>Medicamento</th>
          <th><i className="fas fa-vial me-1"></i>Concentración</th>
          <th><i className="fas fa-prescription me-1"></i>Prescripción</th>
          <th className="text-center">Requerido</th>
          <th className="text-center">No Despachado</th>
          <th><i className="fas fa-question-circle me-1"></i>Motivo</th>
        </tr>
      </thead>
      <tbody>
        {medicamentos.map((medicamento, index) => {
          const medDespachado = detallesDespacho?.find(m => 
            m.id_medicamento === medicamento.id_medicamento
          );
          const cantidadDespachada = medDespachado?.cantidad_total_despachada || 0;
          const cantidadFaltante = medicamento.cantidad - cantidadDespachada;

          if (cantidadFaltante <= 0) return null;

          return (
            <tr key={index}>
              <td>
                <div>
                  <strong className="text-primary">{medicamento.nombre_medicamento}</strong>
                  <br />
                  <small className="text-muted">
                    <i className="fas fa-route me-1"></i>
                    {medicamento.via_administracion}
                  </small>
                </div>
              </td>
              <td>{medicamento.concentracion}</td>
              <td>
                <div className="small">
                  <div><strong>Dosis:</strong> {medicamento.dosis || 'No especificada'}</div>
                  <div><strong>Frecuencia:</strong> {medicamento.frecuencia || 'No especificada'}</div>
                  <div><strong>Duración:</strong> {medicamento.duracion || 'No especificada'}</div>
                  {medicamento.instrucciones && (
                    <div><strong>Instrucciones:</strong> {medicamento.instrucciones}</div>
                  )}
                </div>
              </td>
              <td className="text-center">
                <Badge bg="secondary">{medicamento.cantidad}</Badge>
              </td>
              <td className="text-center">
                <Badge bg="danger">{cantidadFaltante}</Badge>
              </td>
              <td>
                <MotivoNoDespacho medicamento={medicamento} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  </div>
);

const LotesInfo = ({ lotes }) => (
  <div>
    {lotes?.map((lote, idx) => {
      const fechaCaducidad = new Date(lote.fecha_caducidad);
      const hoy = new Date();
      const diasHastaCaducidad = Math.ceil((fechaCaducidad - hoy) / (1000 * 60 * 60 * 24));
      const estaProximoAVencer = diasHastaCaducidad <= 90;
      const estaVencido = diasHastaCaducidad <= 0;

      return (
        <div key={idx} className="mb-1 small">
          <div className="d-flex align-items-center">
            <i className="fas fa-barcode text-primary me-1"></i>
            <strong>{lote.numero_lote}</strong>
            <span className="ms-1">: {lote.cantidad_despachada} uds.</span>
          </div>
          <div className="text-muted ps-3">
            <i className="fas fa-calendar-times me-1"></i>
            Vence: 
            <span className={`ms-1 ${estaVencido ? 'text-danger fw-bold' : estaProximoAVencer ? 'text-warning fw-bold' : ''}`}>
              {fechaCaducidad.toLocaleDateString('es-ES')}
            </span>
            {estaVencido && <i className="fas fa-exclamation-triangle text-danger ms-1" title="Vencido"></i>}
            {estaProximoAVencer && !estaVencido && <i className="fas fa-exclamation-triangle text-warning ms-1" title="Próximo a vencer"></i>}
          </div>
        </div>
      );
    })}
  </div>
);

const MotivoNoDespacho = ({ medicamento }) => {
  let icono = "fas fa-question-circle";
  let color = "text-muted";
  let motivo = "No seleccionado para despacho";

  // Normalizar el stock disponible (convertir null/undefined a 0)
  const stockDisponible = medicamento.stock_disponible ?? 0;

  if (stockDisponible === 0) {
    icono = "fas fa-times-circle";
    color = "text-danger";
    motivo = "Sin stock disponible";
  } else if (stockDisponible < medicamento.cantidad) {
    icono = "fas fa-exclamation-triangle";
    color = "text-warning";
    motivo = `Stock insuficiente (${stockDisponible} uds. disponibles)`;
  }

  return (
    <span className={color}>
      <i className={`${icono} me-1`}></i>
      {motivo}
    </span>
  );
};

export default VerDespachoModal;