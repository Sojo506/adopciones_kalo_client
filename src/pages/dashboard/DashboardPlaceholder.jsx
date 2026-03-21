import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { findDashboardNavigationItem } from "../../data/dashboardModules";

const formatFallbackTitle = (pathname) => {
  const slug = pathname.split("/").filter(Boolean).at(-1) || "dashboard";

  return slug
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const SCHEMA_NOTES_BY_TABLE = {
  FIDE_SOLICITUD_TB: {
    note:
      "La solicitud ahora funciona como formulario base: conserva usuario y tipo de solicitud, pero ya no selecciona perrito directamente.",
    related: [
      { label: "Tipo solicitud-pregunta", to: "/dashboard/tipos-solicitud-pregunta" },
      { label: "Adopciones", to: "/dashboard/adopciones" },
    ],
    tags: ["Formulario base", "Sin perrito directo"],
  },
  FIDE_TIPO_SOLICITUD_PREGUNTA_TB: {
    note:
      "Esta tabla intermedia resuelve la relacion N:N entre tipos de solicitud y preguntas reutilizables del sistema.",
    related: [
      { label: "Tipos de solicitud", to: "/dashboard/tipos-solicitud" },
      { label: "Preguntas", to: "/dashboard/preguntas" },
    ],
    tags: ["Relacion N:N"],
  },
  FIDE_RESPUESTA_TB: {
    note:
      "Cada respuesta debe apuntar a una pregunta que ya este asignada al tipo de solicitud correspondiente.",
    related: [
      { label: "Solicitudes", to: "/dashboard/solicitudes" },
      { label: "Tipo solicitud-pregunta", to: "/dashboard/tipos-solicitud-pregunta" },
      { label: "Preguntas", to: "/dashboard/preguntas" },
    ],
    tags: ["Valida asignacion"],
  },
  FIDE_ADOPCION_TB: {
    note:
      "La adopcion conserva la solicitud aprobada y el perrito seleccionado para formalizar el cierre del proceso.",
    related: [
      { label: "Solicitudes", to: "/dashboard/solicitudes" },
      { label: "Perritos", to: "/dashboard/perritos" },
    ],
    tags: ["Define perrito"],
  },
};

const DashboardPlaceholder = () => {
  const location = useLocation();
  const currentItem = findDashboardNavigationItem(location.pathname);
  const sectionName = currentItem?.label || formatFallbackTitle(location.pathname);
  const schemaNote = currentItem?.table ? SCHEMA_NOTES_BY_TABLE[currentItem.table] : null;
  const tags = [...new Set([
    currentItem?.table,
    currentItem?.hint,
    ...(schemaNote?.tags || []),
    currentItem?.table ? "CRUD listo para conectar" : null,
  ].filter(Boolean))];

  useEffect(() => {
    document.title = `${sectionName} | Dashboard | Adopciones Kalö`;
  }, [sectionName]);

  return (
    <div className="dashboard-page">
      <section className="dashboard-card">
        <p className="dashboard-page__eyebrow">{currentItem?.sectionTitle || "Modulo en preparacion"}</p>
        <h2>{sectionName}</h2>
        <p className="dashboard-page__lede">
          {currentItem?.description ||
            "Esta ruta ya existe dentro del panel y queda lista para conectarle su CRUD o vista operativa cuando continuemos con ese dominio."}
        </p>
        {schemaNote?.note ? <div className="dashboard-alert">{schemaNote.note}</div> : null}
        {schemaNote?.related?.length ? (
          <p className="dashboard-muted">
            Relacionado con{" "}
            {schemaNote.related.map((item, index) => (
              <span key={item.to}>
                {index > 0 ? ", " : ""}
                <Link to={item.to}>{item.label}</Link>
              </span>
            ))}
            .
          </p>
        ) : null}
        {tags.length > 0 ? (
          <div className="dashboard-tags">
            {tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default DashboardPlaceholder;
