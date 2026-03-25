export const adminReportModules = [
  {
    id: "facturas",
    title: "Facturas",
    badge: "Finanzas",
    description:
      "Consolidado PDF de facturas con montos, moneda, estado y trazabilidad comercial.",
    modulePath: "/dashboard/facturas",
    moduleLabel: "Abrir facturas",
    highlights: ["Totales e impuestos", "Relaciones con ventas y donaciones", "Conteo de pagos PayPal"],
  },
  {
    id: "donaciones",
    title: "Donaciones",
    badge: "Impacto social",
    description:
      "Resumen de donaciones registradas por campaña, donador y cantidad de facturas asociadas.",
    modulePath: "/dashboard/donaciones",
    moduleLabel: "Abrir donaciones",
    highlights: ["Monto acumulado", "Detalle por campania", "Control de facturacion"],
  },
  {
    id: "adopciones",
    title: "Adopciones",
    badge: "Bienestar",
    description:
      "Panorama PDF del cierre de adopciones y su carga de seguimientos activos o vencidos.",
    modulePath: "/dashboard/adopciones",
    moduleLabel: "Abrir adopciones",
    highlights: ["Adoptante y perrito", "Seguimientos activos", "Seguimientos vencidos"],
  },
  {
    id: "inventario-bajo",
    title: "Inventario bajo",
    badge: "Operacion comercial",
    description:
      "Lista los productos con existencias criticas para que el equipo actue antes de quedarse sin stock.",
    modulePath: "/dashboard/inventario",
    moduleLabel: "Abrir inventario",
    highlights: ["Productos criticos", "Valor estimado comprometido", "Categoria y marca"],
  },
];

export const adminQuickActions = [
  {
    to: "/dashboard/reportes",
    title: "Centro de reportes",
    description: "Descarga reportes PDF ejecutivos para reuniones, cierres y seguimiento.",
  },
  {
    to: "/dashboard/facturas",
    title: "Revisar facturas",
    description: "Consulta montos, impuestos y el estado de la facturacion comercial.",
  },
  {
    to: "/dashboard/seguimientos",
    title: "Atender seguimientos",
    description: "Prioriza seguimientos proximos o vencidos antes de que afecten la operacion.",
  },
  {
    to: "/dashboard/inventario",
    title: "Monitorear inventario",
    description: "Valida existencias bajas y coordina reposicion de productos sensibles.",
  },
];
