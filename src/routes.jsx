import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loader from './components/Loader/Loader';
import AdminLayout from './layouts/AdminLayout';
import AuthGuard from 'components/AuthGuard';
import { useAuth } from 'components/AuthContext';

const routes = [
  {
    path: '/',
    exact: true,
    element: () => <Navigate to="/login" /> // Redirige a login desde la raíz
  },
  {
    path: '/login',
    exact: true,
    element: lazy(() => import('./views/auth/signin/SignIn1'))
  },
  {
    path: '*',
    layout: AdminLayout,
    routes: [
      {
        path: '/dashboard',
        exact: true,
        guard: AuthGuard,
        element: lazy(() => import('./views/dashboard'))
      },
      {
        //rutas de perifl usuario
        path: '/perfil',
        exact: true,
        guard: AuthGuard,
        element: lazy(() => import('./views/pacientes_archivo/index_archivo_form')),
        roles: ['Administrador', 'Médico', 'Enfermero', 'Laboratorista', 'Jefe de Farmacia', 'Despachador de Medicamentos']
      },
      {
        //rutas del administrador
        path: '/usuarios',
        exact: true,
        guard: AuthGuard,
        element: lazy(() => import('./views/Administrador/Usuarios'))
      },
      {
        //rutas del administrador
        path: '/especialidades',
        exact: true,
        guard: AuthGuard,
        element: lazy(() => import('./views/Administrador/Especialidades'))
      },
      {
        //rutas del administrador
        path: '/areas',
        exact: true,
        guard: AuthGuard,
        element: lazy(() => import('./views/Administrador/Areas'))
      },
      {
        //rutas de medico - Tomar Consulta
        path: '/tomar-consulta',
        exact: true,
        guard: AuthGuard,
        element: lazy(() => import('./views/Medico/TomarConsulta'))
      },

      {
        //rutas de medico - Consulta
        path: '/consultas',
        exact: true,
        guard: AuthGuard,
        element: lazy(() => import('./views/Medico/Consulta'))
      },

      {
        //rutas de medico - Detalles
        path: '/consultas-realizadas',
        exact: true,
        guard: AuthGuard,
        element: lazy(() => import('./views/Medico/DetallesConsultas'))
      },
      //Seguimiento
      {
        path: '/seguimiento-consulta/:id_consulta',
        exact: true,
        guard: AuthGuard,
        element: lazy(() => import('./views/Seguimiento/SeguimientoConsulta')),
        roles: ['Médico', 'Enfermero']
      },
       //Seguimiento
      {
        path: '/seguimiento-paciente/:id_paciente',
        exact: true,
        guard: AuthGuard,
        element: lazy(() => import('./views/Seguimiento/SeguimientoPaciente')),
        roles: ['Médico', 'Enfermero']
      },
      
      {
        //rutas de enfermeros
        path: '/pacientes',
        exact: true,
        guard: AuthGuard,
        element: lazy(() => import('./views/Enfermero/Pacientes'))
      },
      {
        path: '/seleccion',
        exact: true,
        guard: AuthGuard,
        element: lazy(() => import('./views/Enfermero/SeleccionTriage'))
      },
      {
        path: '/archivo_form',
        exact: true,
        guard: AuthGuard,
        element: lazy(() => import('./views/pacientes_archivo/index_archivo_form')),
        roles: ['Enfermero'] //permiso específico
      },
      {
        //rutas del Laboratorista
        path: '/examenes-pendientes',
        exact: true,
        guard: AuthGuard,
        element: lazy(() => import('./views/Laboratorio/Examenes'))
      },
      {
        //rutas del Laboratorista
        path: '/pacientes-historial',
        exact: true,
        guard: AuthGuard,
        element: lazy(() => import('./views/Laboratorio/Pacientes-Historial'))
      },
      {
        //rutas del Laboratorista
        path: '/examenes/:id_examen/resultados',
        exact: true,
        guard: AuthGuard,
        element: lazy(() => import('./views/Laboratorio/Resultados-Examen')),
        roles: ['Laboratorista']
      },
      {
        //rutas del Laboratorista
        path: '/gestion-reportes',
        exact: true,
        guard: AuthGuard,
        element: lazy(() => import('./views/Laboratorio/Gestion-Reportes'))
      },
      //  GESTIÓN DE PLANTILLAS
      {
        path: '/GestionTipoExamenes-plantillas',
        exact: true,
        guard: AuthGuard,
        element: lazy(() => import('./views/Laboratorio/GestionTipoExamenesPlantillas')),
        roles: ['Laboratorista'] // Solo Laboratoristas pueden acceder
      },

      {
        // Ruta para Farmacia
        path: '/inventario-medicamentos',
        exact: true,
        guard: AuthGuard,
        element: lazy(() => import('./views/Farmacia/InventarioMedicamentos')),
        roles: ['Jefe de Farmacia']
      },
      {
        path: '/despacho-medicamentos',
        exact: true,
        guard: AuthGuard,
        element: lazy(() => import('./views/Farmacia/DespachoMedicamentos')),
        roles: ['Jefe de Farmacia', 'Despachador de Medicamentos']
      },
      {
        path: '/rayosx',
        exact: true,
        element: () => <Navigate to="/rayosx/solicitudes" />
      },


      {
        path: '/rayosx/solicitudes',
        exact: true,
        guard: AuthGuard,
        element: lazy(() => import('./views/rayosX/solis')),
      },

      {
        path: '/rayosx/crear',
        exact: true,
        guard: AuthGuard,
        element: lazy(() => import('./views/rayosX/crear/CrearSolicitudWizard')),
      },

      {
        path: '/rayosx/ver/:id',
        exact: true,
        guard: AuthGuard,
        element: lazy(() => import('./views/rayosX/VerInformeRayosX')),
      },

      {
        path: '/rayosx/informes/completados',
        exact: true,
        guard: AuthGuard,
        element: lazy(() => import('./views/rayosX/VerInformesCompletados')),
      },
      {
        path: '/rayosx/informes',
        exact: true,
        guard: AuthGuard,
        element: lazy(() => import('./views/rayosX/InformesMedico')),
      },
      {
        path: '*',
        exact: true,
        element: () => <Navigate to="/login" />
      }
    ]
  }
];

const RenderRoutes = ({ routes }) => {
  const { user, loading } = useAuth();

  // Mostrar loading mientras se carga la información del usuario
  if (loading) {
    return <Loader />;
  }

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {routes.map((route, i) => {
          const Guard = route.guard || React.Fragment;
          const Layout = route.layout || React.Fragment;
          const Element = route.element;

          // Validación de roles mejorada
          if (route.roles) {
            // Si la ruta requiere roles específicos
            if (!user || !route.roles.includes(user.rol)) {
              // Si no hay usuario o no tiene el rol adecuado, no renderizar esta ruta
              return null;
            }
          }

          return (
            <Route
              key={i}
              path={route.path}
              element={
                <Guard>
                  <Layout>{route.routes ? <RenderRoutes routes={route.routes} /> : <Element />}</Layout>
                </Guard>
              }
            />
          );
        })}
      </Routes>
    </Suspense>
  );
};

export { routes };
export default RenderRoutes;