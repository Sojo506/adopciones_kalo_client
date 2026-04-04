import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as catalogsApi from "../../api/catalogs";
import * as evidencesApi from "../../api/evidences";
import * as followUpsApi from "../../api/followUps";
import { useAuth } from "../../hooks/useAuth";

const previewStyle = {
  width: "72px",
  height: "72px",
  borderRadius: "18px",
  objectFit: "cover",
  display: "block",
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
  }).format(date);
};

const buildFollowUpLabel = (evidence) => {
  const segments = [];

  if (evidence.tipoSeguimiento) {
    segments.push(evidence.tipoSeguimiento);
  }

  if (evidence.nombrePerrito) {
    segments.push(evidence.nombrePerrito);
  }

  return segments.join(" - ") || "Seguimiento programado";
};

const buildAdopterLabel = (evidence) => {
  const base = String(evidence.identificacion || "-");
  return evidence.adoptante ? `${base} - ${evidence.adoptante}` : base;
};

const buildDogLabel = (evidence) => {
  return evidence.nombrePerrito || "Perrito asociado";
};

const formatCommentsPreview = (value) => {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return "-";
  }

  if (normalized.length <= 88) {
    return normalized;
  }

  return `${normalized.slice(0, 85)}...`;
};

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const getEvidenceTone = (evidence) => {
  const normalizedState = normalizeText(evidence?.estado);

  if (normalizedState === "aprobado") {
    return { accent: "success", label: evidence?.estado || "Aprobado" };
  }

  if (normalizedState === "pendiente") {
    return { accent: "pending", label: evidence?.estado || "Pendiente" };
  }

  if (normalizedState === "inactivo") {
    return { accent: "muted", label: evidence?.estado || "Inactivo" };
  }

  return { accent: "soft", label: evidence?.estado || "-" };
};

const EvidencesDashboard = () => {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [states, setStates] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [evidences, setEvidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [search, setSearch] = useState("");

  const selectedFollowUpId = searchParams.get("seguimiento") || "";
  const selectedFollowUp = useMemo(
    () =>
      followUps.find((followUp) => String(followUp.idSeguimiento) === String(selectedFollowUpId)) ||
      null,
    [followUps, selectedFollowUpId],
  );

  const filteredEvidences = useMemo(() => {
    const query = search.trim().toLowerCase();

    return evidences.filter((evidence) => {
      if (selectedFollowUpId && String(evidence.idSeguimiento) !== String(selectedFollowUpId)) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        evidence.idEvidencia,
        evidence.idSeguimiento,
        evidence.idAdopcion,
        evidence.identificacion,
        evidence.adoptante,
        evidence.idPerrito,
        evidence.nombrePerrito,
        evidence.tipoSeguimiento,
        evidence.fechaEvidencia,
        evidence.comentarios,
        evidence.imageUrl,
        evidence.estado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [evidences, search, selectedFollowUpId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statesData, followUpsData, evidencesData] = await Promise.all([
        catalogsApi.getStates(),
        followUpsApi.getFollowUps({ force: true }),
        evidencesApi.getEvidences({ force: true }),
      ]);

      setStates(Array.isArray(statesData) ? statesData : []);
      setFollowUps(Array.isArray(followUpsData) ? followUpsData : []);
      setEvidences(Array.isArray(evidencesData) ? evidencesData : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar las evidencias",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  const approvedState = useMemo(
    () =>
      states.find((state) => normalizeText(state.nombre) === "aprobado") || null,
    [states],
  );

  useEffect(() => {
    document.title = "Evidencias | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadData();
  }, [isAdmin]);

  const onSelectFollowUp = (event) => {
    const nextFollowUpId = event.target.value;
    const nextSearchParams = new URLSearchParams(searchParams);

    if (nextFollowUpId) {
      nextSearchParams.set("seguimiento", nextFollowUpId);
    } else {
      nextSearchParams.delete("seguimiento");
    }

    setSearchParams(nextSearchParams);
  };

  const onDelete = async (evidence) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar evidencia",
      text: `Se desactivara la evidencia del ${formatDate(evidence.fechaEvidencia).toLowerCase()}.`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(evidence.idEvidencia);
      await evidencesApi.deleteEvidence(evidence.idEvidencia, {
        idSeguimiento: evidence.idSeguimiento,
      });
      await loadData();

      Swal.fire({
        icon: "success",
        title: "Evidencia eliminada",
        text: "La evidencia fue desactivada correctamente.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos eliminar",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const onApprove = async (evidence) => {
    if (!approvedState) {
      Swal.fire({
        icon: "error",
        title: "Estado no disponible",
        text: "No encontramos el estado Aprobado en el catalogo.",
      });
      return;
    }

    try {
      setApprovingId(evidence.idEvidencia);
      await evidencesApi.updateEvidence(evidence.idEvidencia, {
        idSeguimiento: evidence.idSeguimiento,
        fechaEvidencia: evidence.fechaEvidencia,
        comentarios: evidence.comentarios || "",
        idEstado: approvedState.idEstado,
        clearImage: false,
      });
      await loadData();

      Swal.fire({
        icon: "success",
        title: "Evidencia aprobada",
        text: "La evidencia quedo marcada como aprobada correctamente.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos aprobar",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setApprovingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="dashboard-page">
        <section className="dashboard-card">
          <p className="dashboard-page__eyebrow">Acceso restringido</p>
          <h1>Evidencias</h1>
          <p className="dashboard-page__lede">
            Solo un administrador puede gestionar esta tabla desde el dashboard.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header mt-4">
        <div>
          <p className="dashboard-page__eyebrow">Seguimiento y evidencia</p>
          <h1>Evidencias</h1>
          <p className="dashboard-page__lede">
            Revisa lo que el usuario carga para cada seguimiento, corrige datos cuando haga falta
            y conserva la trazabilidad del acompanamiento post adopcion.
          </p>
        </div>
        <Link
          className="dashboard-btn dashboard-btn--primary"
          to={
            selectedFollowUpId
              ? `/dashboard/evidencias/nuevo?seguimiento=${encodeURIComponent(selectedFollowUpId)}`
              : "/dashboard/evidencias/nuevo"
          }
        >
          Crear evidencia
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Las evidencias pertenecen a un <Link to="/dashboard/seguimientos">seguimiento</Link> y
          deben caer dentro de su rango de fechas.
        </div>

        <div className="dashboard-alert">
          Aunque el usuario normalmente las carga desde su perfil, desde aqui puedes auditarlas o
          corregirlas si hubo errores operativos.
        </div>

        <div className="dashboard-alert">
          Las evidencias del usuario llegan en estado pendiente y su aprobacion final se hace
          unicamente desde este dashboard.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <label className="dashboard-input" style={{ minWidth: "320px", marginBottom: 0 }}>
            <span>Seguimiento</span>
            <select
              className="form-select"
              disabled={loading || deletingId !== null || approvingId !== null}
              onChange={onSelectFollowUp}
              value={selectedFollowUpId}
            >
              <option value="">Todos los seguimientos</option>
              {followUps.map((followUp) => (
                <option key={followUp.idSeguimiento} value={followUp.idSeguimiento}>
                  {followUp.tipoSeguimiento || "Seguimiento"}{followUp.nombrePerrito ? ` - ${followUp.nombrePerrito}` : ""}
                </option>
              ))}
            </select>
          </label>

          <div className="dashboard-toolbar dashboard-toolbar--between" style={{ gap: "0.75rem" }}>
            <input
              className="form-control dashboard-search"
              disabled={loading || deletingId !== null || approvingId !== null}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por evidencia, seguimiento, adoptante, perrito, fecha, comentario o estado"
              value={search}
            />
            <span className="dashboard-muted">
              {filteredEvidences.length} de {evidences.length} evidencias
            </span>
          </div>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando evidencias...</div>
        ) : filteredEvidences.length === 0 ? (
          <div className="dashboard-empty-state">
            {selectedFollowUp ? (
              <>
                No hay evidencias registradas para el seguimiento{" "}
                <strong>{selectedFollowUp.tipoSeguimiento || "seleccionado"}</strong>.
              </>
            ) : (
              "No hay evidencias que coincidan con tu busqueda."
            )}
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Vista previa</th>
                  <th>Seguimiento</th>
                  <th>Adoptante</th>
                  <th>Perrito</th>
                  <th>Fecha</th>
                  <th>Comentarios</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvidences.map((evidence) => {
                  const isDeletingCurrent = deletingId === evidence.idEvidencia;
                  const isInactive = Number(evidence.idEstado) !== 1;

                  return (
                    <tr key={evidence.idEvidencia}>
                      <td>
                        {evidence.imageUrl ? (
                          <img
                            alt="Vista previa de evidencia"
                            loading="lazy"
                            src={evidence.imageUrl}
                            style={previewStyle}
                          />
                        ) : (
                          <span className="dashboard-muted">Sin imagen</span>
                        )}
                      </td>
                      <td>{buildFollowUpLabel(evidence)}</td>
                      <td>{buildAdopterLabel(evidence)}</td>
                      <td>{buildDogLabel(evidence)}</td>
                      <td>{formatDate(evidence.fechaEvidencia)}</td>
                      <td title={evidence.comentarios}>
                        {formatCommentsPreview(evidence.comentarios)}
                      </td>
                      <td>
                        <span className={`followup-badge followup-badge--${getEvidenceTone(evidence).accent}`}>
                          {getEvidenceTone(evidence).label}
                        </span>
                      </td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null || approvingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null || approvingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/evidencias/${evidence.idEvidencia}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--primary"
                            disabled={
                              approvingId !== null ||
                              deletingId !== null ||
                              normalizeText(evidence.estado) !== "pendiente"
                            }
                            onClick={() => onApprove(evidence)}
                            type="button"
                          >
                            {approvingId === evidence.idEvidencia ? "Aprobando..." : "Aprobar"}
                          </button>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={isInactive || deletingId !== null || approvingId !== null}
                            onClick={() => onDelete(evidence)}
                            type="button"
                          >
                            {isDeletingCurrent ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
                        {isInactive ? (
                          <small className="dashboard-table__note">Evidencia ya inactiva</small>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default EvidencesDashboard;
