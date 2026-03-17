const createDashboardItem = (slug, label, table, description, hint = "") => ({
  to: slug ? `/dashboard/${slug}` : "/dashboard",
  label,
  table,
  description,
  hint,
});

export const dashboardNavigationSections = [
  {
    title: "Resumen",
    items: [
      createDashboardItem(
        "",
        "Resumen general",
        null,
        "Vista consolidada del panel administrativo con accesos a todas las tablas del esquema.",
        "Vista principal"
      ),
    ],
  },
  {
    title: "Usuarios y acceso",
    items: [
      createDashboardItem("usuarios", "Usuarios", "FIDE_USUARIO_TB", "CRUD principal de perfiles y datos base de cada usuario."),
      createDashboardItem(
        "tipos-usuario",
        "Tipos de usuario",
        "FIDE_TIPO_USUARIO_TB",
        "Configura los roles y clasificaciones que definen el tipo de cuenta dentro del sistema."
      ),
      createDashboardItem("correos", "Correos", "FIDE_CORREO_TB", "Administra los correos asociados a cada usuario registrado."),
      createDashboardItem("telefonos", "Telefonos", "FIDE_TELEFONO_TB", "Gestiona los telefonos vinculados a cada perfil."),
      createDashboardItem("cuentas", "Cuentas", "FIDE_CUENTA_TB", "Controla usuarios de acceso, hashes y estado general de las cuentas."),
      createDashboardItem(
        "codigos-otp",
        "Codigos OTP",
        "FIDE_CODIGO_OTP_TB",
        "Permite revisar y administrar los codigos temporales emitidos para autenticacion o verificacion."
      ),
      createDashboardItem(
        "refresh-tokens",
        "Refresh tokens",
        "FIDE_REFRESH_TOKEN_TB",
        "Centraliza las sesiones persistentes, revocaciones y trazabilidad de tokens activos."
      ),
    ],
  },
  {
    title: "Catalogos y ubicaciones",
    items: [
      createDashboardItem("estados", "Estados", "FIDE_ESTADO_TB", "Administra los estados reutilizables que afectan el ciclo de vida de todo el esquema."),
      createDashboardItem("paises", "Paises", "FIDE_PAIS_TB", "Mantiene el catalogo de paises para direcciones y jerarquias de ubicacion."),
      createDashboardItem("provincias", "Provincias", "FIDE_PROVINCIA_TB", "Gestiona provincias enlazadas a cada pais disponible."),
      createDashboardItem("cantones", "Cantones", "FIDE_CANTON_TB", "Controla los cantones registrados dentro de cada provincia."),
      createDashboardItem("distritos", "Distritos", "FIDE_DISTRITO_TB", "Mantiene los distritos para completar la jerarquia geografica del sistema."),
      createDashboardItem("direcciones", "Direcciones", "FIDE_DIRECCION_TB", "CRUD de direcciones detalladas usadas por usuarios y casas cuna."),
      createDashboardItem(
        "tipos-otp",
        "Tipos de OTP",
        "FIDE_TIPO_OTP_TB",
        "Define las categorias de codigos temporales que se pueden emitir en autenticacion."
      ),
      createDashboardItem(
        "categorias",
        "Categorias",
        "FIDE_CATEGORIA_TB",
        "Organiza las categorias comerciales asociadas al catalogo de productos."
      ),
      createDashboardItem("marcas", "Marcas", "FIDE_MARCA_TB", "Centraliza las marcas usadas en los productos de la tienda solidaria."),
      createDashboardItem("monedas", "Monedas", "FIDE_MONEDA_TB", "Mantiene las monedas admitidas para facturacion y donaciones."),
      createDashboardItem("razas", "Razas", "FIDE_RAZA_TB", "Gestiona las razas disponibles para clasificar perritos."),
      createDashboardItem("sexos", "Sexos", "FIDE_SEXO_TB", "Controla las opciones de sexo asociadas a cada perrito."),
      createDashboardItem(
        "tipos-solicitud",
        "Tipos de solicitud",
        "FIDE_TIPO_SOLICITUD_TB",
        "Configura las clases de solicitud disponibles dentro del flujo de adopcion."
      ),
      createDashboardItem(
        "tipos-respuesta",
        "Tipos de respuesta",
        "FIDE_TIPO_RESPUESTA_TB",
        "Define el tipo esperado para responder preguntas de formularios o procesos."
      ),
      createDashboardItem(
        "tipos-seguimiento",
        "Tipos de seguimiento",
        "FIDE_TIPO_SEGUIMIENTO",
        "Administra las categorias de seguimiento aplicables a adopciones activas."
      ),
      createDashboardItem(
        "tipos-evento",
        "Tipos de evento",
        "FIDE_TIPO_EVENTO_TB",
        "Mantiene los tipos de evento para registrar historial medico y operativo de perritos."
      ),
      createDashboardItem(
        "preguntas",
        "Preguntas",
        "FIDE_PREGUNTA_TB",
        "CRUD del banco de preguntas utilizado en solicitudes y formularios del sistema."
      ),
    ],
  },
  {
    title: "Productos y ventas",
    items: [
      createDashboardItem("productos", "Productos", "FIDE_PRODUCTO_TB", "Gestiona el catalogo principal de productos, precios y relaciones comerciales."),
      createDashboardItem(
        "inventario",
        "Inventario",
        "FIDE_INVENTARIO_TB",
        "Controla la existencia actual por producto dentro de la operacion comercial."
      ),
      createDashboardItem(
        "movimientos-inventario",
        "Movimientos de inventario",
        "FIDE_MOVIMIENTO_INVENTARIO_TB",
        "Registra entradas, salidas y ajustes que impactan existencias."
      ),
      createDashboardItem(
        "tipos-movimiento",
        "Tipos de movimiento",
        "FIDE_TIPO_MOVIMIENTO_TB",
        "Define las clases de movimiento que luego utiliza el inventario y las ventas."
      ),
      createDashboardItem("ventas", "Ventas", "FIDE_VENTA_TB", "Administra ventas registradas por usuario y total de transaccion."),
      createDashboardItem(
        "ventas-producto",
        "Detalle venta-producto",
        "FIDE_VENTA_PRODUCTO_TB",
        "CRUD de lineas de detalle que conectan productos vendidos con una venta."
      ),
      createDashboardItem("facturas", "Facturas", "FIDE_FACTURA_TB", "Gestiona facturas, impuestos, subtotales y totales del sistema."),
      createDashboardItem(
        "ventas-factura",
        "Ventas-factura",
        "FIDE_VENTA_FACTURA_TB",
        "Relaciona cada factura con la venta correspondiente para cierre comercial."
      ),
      createDashboardItem(
        "pagos-paypal",
        "Pagos PayPal",
        "FIDE_PAGO_PAYPAL_TB",
        "Administra las capturas y referencias de pago asociadas a una factura."
      ),
    ],
  },
  {
    title: "Perritos y adopciones",
    items: [
      createDashboardItem("perritos", "Perritos", "FIDE_PERRITO_TB", "CRUD principal de perritos con datos fisicos, raza, sexo y estado."),
      createDashboardItem(
        "imagenes-perrito",
        "Imagenes de perrito",
        "FIDE_PERRITO_IMAGE_TB",
        "Gestiona las imagenes y recursos visuales asociados a cada perrito."
      ),
      createDashboardItem(
        "eventos-perrito",
        "Eventos de perrito",
        "FIDE_EVENTO_PERRITO_TB",
        "Registra eventos medicos u operativos asociados a cada perrito."
      ),
      createDashboardItem(
        "detalle-evento",
        "Detalle de evento",
        "FIDE_DETALLE_EVENTO_TB",
        "Controla comprobantes, montos y desglose financiero por evento del perrito."
      ),
      createDashboardItem(
        "solicitudes",
        "Solicitudes",
        "FIDE_SOLICITUD_TB",
        "Administra solicitudes de adopcion y su relacion con usuarios y perritos."
      ),
      createDashboardItem(
        "respuestas",
        "Respuestas",
        "FIDE_RESPUESTA_TB",
        "CRUD de respuestas ligadas a solicitudes y preguntas del formulario."
      ),
      createDashboardItem(
        "casas-cuna",
        "Casas cuna",
        "FIDE_CASA_CUNA_TB",
        "Gestiona hogares temporales, responsable asignado y solicitud asociada."
      ),
      createDashboardItem(
        "casas-perrito",
        "Casa-perrito",
        "FIDE_CASA_PERRITO_TB",
        "Administra la asignacion de perritos a cada casa cuna disponible."
      ),
      createDashboardItem("adopciones", "Adopciones", "FIDE_ADOPCION_TB", "Controla las adopciones aprobadas y su fecha oficial de cierre."),
      createDashboardItem(
        "seguimientos",
        "Seguimientos",
        "FIDE_SEGUIMIENTO_TB",
        "Gestiona el seguimiento posterior a la adopcion con fechas y comentarios."
      ),
      createDashboardItem(
        "evidencias",
        "Evidencias",
        "FIDE_EVIDENCIA_TB",
        "CRUD de evidencias, imagenes y observaciones asociadas a un seguimiento."
      ),
    ],
  },
  {
    title: "Donaciones",
    items: [
      createDashboardItem(
        "campanias",
        "Campanias",
        "FIDE_CAMPANIA_TB",
        "Gestiona campanias activas, descripcion y vigencia para procesos de recaudacion."
      ),
      createDashboardItem(
        "donaciones",
        "Donaciones",
        "FIDE_DONACION_TB",
        "Administra aportes economicos por usuario y campania."
      ),
      createDashboardItem(
        "donaciones-factura",
        "Donaciones-factura",
        "FIDE_DONACION_FACTURA_TB",
        "Relaciona cada donacion con su factura correspondiente."
      ),
    ],
  },
];

export const dashboardNavigationItems = dashboardNavigationSections.flatMap((section) =>
  section.items.map((item) => ({ ...item, sectionTitle: section.title }))
);

export const dashboardNavigationCount = dashboardNavigationItems.length;

export const findDashboardNavigationItem = (pathname) => {
  const normalizedPath =
    pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

  return (
    dashboardNavigationItems.find((item) => {
      if (item.to === "/dashboard") {
        return normalizedPath === item.to;
      }

      return normalizedPath === item.to || normalizedPath.startsWith(`${item.to}/`);
    }) || null
  );
};

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
