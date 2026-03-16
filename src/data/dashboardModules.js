export const dashboardNavigationSections = [
  {
    title: "Resumen",
    items: [{ to: "/dashboard", label: "Resumen general", hint: "Mapa del sistema" }],
  },
  {
    title: "Adopciones",
    items: [
      { to: "/dashboard/usuarios", label: "Usuarios", hint: "Perfiles, cuentas y contactos" },
      { to: "/dashboard/perritos", label: "Perritos", hint: "Ficha, raza, sexo e imagenes" },
      { to: "/dashboard/solicitudes", label: "Solicitudes", hint: "Postulaciones y respuestas" },
      { to: "/dashboard/adopciones", label: "Adopciones", hint: "Procesos aprobados y casas cuna" },
      { to: "/dashboard/seguimiento", label: "Seguimiento", hint: "Responsabilidad y evidencias" },
    ],
  },
  {
    title: "Comercial",
    items: [
      { to: "/dashboard/productos", label: "Productos", hint: "Catalogo, precio y categoria" },
      { to: "/dashboard/categorias", label: "Categorias", hint: "Clasificacion comercial" },
      { to: "/dashboard/inventario", label: "Inventario", hint: "Existencias por producto" },
      { to: "/dashboard/movimientos", label: "Mov. inventario", hint: "Entradas, salidas y ajustes" },
      { to: "/dashboard/ventas", label: "Ventas", hint: "Ventas y detalle por producto" },
      { to: "/dashboard/facturas", label: "Facturas", hint: "Facturacion y enlaces de venta" },
    ],
  },
  {
    title: "Finanzas y control",
    items: [
      { to: "/dashboard/donaciones", label: "Donaciones", hint: "Campanas, aportes y facturas" },
      { to: "/dashboard/reportes", label: "Reportes", hint: "Indicadores operativos y financieros" },
      { to: "/dashboard/auditoria", label: "Auditoria", hint: "Trazabilidad de cambios" },
      { to: "/dashboard/catalogos", label: "Catalogos base", hint: "Estados, tipos y tablas maestras" },
      { to: "/dashboard/ubicaciones", label: "Ubicaciones", hint: "Paises, provincias y direcciones" },
    ],
  },
];

export const dashboardModuleGroups = [
  {
    title: "Usuarios y acceso",
    badge: "Operacion base",
    description:
      "Gestiona perfiles, cuentas, correos, telefonos y tokens de autenticacion para mantener controlado el acceso al sistema.",
    tables: ["FIDE_USUARIO_TB", "FIDE_CUENTA_TB", "FIDE_CORREO_TB", "FIDE_TELEFONO_TB"],
    modules: ["Usuarios", "Cuentas", "Correos", "Telefonos", "OTP y refresh tokens"],
  },
  {
    title: "Perritos y bienestar",
    badge: "Nucleo animal",
    description:
      "Agrupa la informacion de los perritos, sus imagenes, raza, sexo y el historial de eventos de salud o atencion.",
    tables: ["FIDE_PERRITO_TB", "FIDE_PERRITO_IMAGE_TB", "FIDE_EVENTO_PERRITO_TB", "FIDE_DETALLE_EVENTO_TB"],
    modules: ["Perritos", "Imagenes", "Eventos", "Detalle de gastos", "Razas y sexos"],
  },
  {
    title: "Solicitudes, adopciones y seguimiento",
    badge: "Proceso de adopcion",
    description:
      "Prepara el flujo de formularios, respuestas, adopciones aprobadas, seguimiento de responsabilidad y evidencias posteriores.",
    tables: ["FIDE_SOLICITUD_TB", "FIDE_RESPUESTA_TB", "FIDE_ADOPCION_TB", "FIDE_SEGUIMIENTO_TB"],
    modules: ["Solicitudes", "Preguntas", "Respuestas", "Adopciones", "Seguimiento y evidencia"],
  },
  {
    title: "Productos e inventario",
    badge: "Operacion comercial",
    description:
      "Organiza el catalogo de productos, las categorias, el inventario disponible y los movimientos que afectan existencias.",
    tables: ["FIDE_PRODUCTO_TB", "FIDE_CATEGORIA_TB", "FIDE_INVENTARIO_TB", "FIDE_MOVIMIENTO_INVENTARIO_TB"],
    modules: ["Productos", "Categorias", "Inventario", "Movimientos", "Tipos de movimiento"],
  },
  {
    title: "Ventas y facturacion",
    badge: "Ingreso transaccional",
    description:
      "Relaciona ventas, detalle por producto, facturas, moneda y pagos para dejar lista la capa comercial del sistema.",
    tables: ["FIDE_VENTA_TB", "FIDE_VENTA_PRODUCTO_TB", "FIDE_FACTURA_TB", "FIDE_PAGO_PAYPAL_TB"],
    modules: ["Ventas", "Detalle de venta", "Facturas", "Monedas", "Pagos PayPal"],
  },
  {
    title: "Donaciones y campanas",
    badge: "Impacto social",
    description:
      "Conecta campanas activas, donaciones recibidas y su facturacion para medir el aporte economico del proyecto.",
    tables: ["FIDE_CAMPANIA_TB", "FIDE_DONACION_TB", "FIDE_DONACION_FACTURA_TB", "FIDE_MONEDA_TB"],
    modules: ["Campanas", "Donaciones", "Facturas de donacion", "Monedas"],
  },
];

export const dashboardReadinessItems = [
  {
    name: "Catalogos base",
    state: "Preparado",
    note: "Estados, tipos de usuario, tipos de solicitud, tipos de respuesta, tipos de seguimiento y tipos de evento.",
  },
  {
    name: "Ubicaciones y direcciones",
    state: "Preparado",
    note: "Paises, provincias, cantones, distritos y direcciones como soporte transversal del sistema.",
  },
  {
    name: "Casas cuna",
    state: "Preparado",
    note: "Relacion entre hogares temporales, solicitudes y perritos asignados.",
  },
  {
    name: "Auditoria",
    state: "Preparado",
    note: "Registro de entidad, accion, usuario y detalle para trazabilidad administrativa.",
  },
  {
    name: "Reportes",
    state: "Preparado",
    note: "Base para paneles de ventas, donaciones, adopciones, movimientos e historial operativo.",
  },
];
