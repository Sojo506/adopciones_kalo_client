import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as dogEventsApi from "../../api/dogEvents";
import * as eventDetailsApi from "../../api/eventDetails";
import { useAuth } from "../../hooks/useAuth";

const imageStyle = {
  width: "72px",
  height: "72px",
  borderRadius: "18px",
  objectFit: "cover",
  display: "block",
};

const amountFormatter = new Intl.NumberFormat("es-CR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
  }).format(date);
};

const formatMoney = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return amountFormatter.format(Number(value));
};

const buildEventLabel = (dogEvent) => {
  if (!dogEvent) {
    return "";
  }

  const parts = [
    `#${dogEvent.idEvento}`,
    dogEvent.nombrePerrito,
    dogEvent.tipoEvento,
    formatDate(dogEvent.fechaEvento),
  ].filter(Boolean);

  return parts.join(" - ");
};

const EventDetailsDashboard = () => {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dogEvents, setDogEvents] = useState([]);
  const [eventDetails, setEventDetails] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const selectedEventId = searchParams.get("evento") || "";
  const selectedEvent = useMemo(
    () => dogEvents.find((dogEvent) => String(dogEvent.idEvento) === String(selectedEventId)) || null,
    [dogEvents, selectedEventId],
  );

  const dogEventById = useMemo(() => {
    return new Map(dogEvents.map((dogEvent) => [String(dogEvent.idEvento), dogEvent]));
  }, [dogEvents]);

  const filteredEventDetails = useMemo(() => {
    const query = search.trim().toLowerCase();

    return eventDetails.filter((eventDetail) => {
      const linkedEvent = dogEventById.get(String(eventDetail.idEvento));
      const matchesEvent =
        !selectedEventId || String(eventDetail.idEvento) === String(selectedEventId);

      if (!matchesEvent) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        eventDetail.idDetalleEvento,
        eventDetail.idEvento,
        eventDetail.nombrePerrito,
        eventDetail.descripcion,
        eventDetail.comprobanteUrl,
        eventDetail.monto,
        eventDetail.estado,
        linkedEvent?.tipoEvento,
        linkedEvent?.fechaEvento,
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [dogEventById, eventDetails, search, selectedEventId]);

  const loadDogEvents = async () => {
    try {
      setEventsLoading(true);
      const data = await dogEventsApi.getDogEvents({ force: true });
      setDogEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar los eventos de perrito",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setEventsLoading(false);
    }
  };

  const loadEventDetails = async (idEvento = "") => {
    try {
      setDetailsLoading(true);
      const data = idEvento
        ? await eventDetailsApi.getEventDetailsByEvent(idEvento, { force: true })
        : await eventDetailsApi.getEventDetails({ force: true });
      setEventDetails(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar los detalles de evento",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
      setEventDetails([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Detalle de evento | Dashboard Kalo";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setEventsLoading(false);
      setDetailsLoading(false);
      return;
    }

    loadDogEvents();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      setEventDetails([]);
      setDetailsLoading(false);
      return;
    }

    loadEventDetails(selectedEventId);
  }, [isAdmin, selectedEventId]);

  const onSelectEvent = (event) => {
    const nextEventId = event.target.value;
    const nextSearchParams = new URLSearchParams(searchParams);

    if (nextEventId) {
      nextSearchParams.set("evento", nextEventId);
    } else {
      nextSearchParams.delete("evento");
    }

    setSearchParams(nextSearchParams);
  };

  const onDelete = async (eventDetail) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar detalle",
      text: `Se desactivara el detalle #${eventDetail.idDetalleEvento}.`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(eventDetail.idDetalleEvento);
      await eventDetailsApi.deleteEventDetail(eventDetail.idDetalleEvento, {
        idEvento: eventDetail.idEvento,
      });
      await loadEventDetails(selectedEventId);

      Swal.fire({
        icon: "success",
        title: "Detalle eliminado",
        text: "El detalle fue desactivado correctamente.",
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

  if (!isAdmin) {
    return (
      <div className="dashboard-page">
        <section className="dashboard-card">
          <p className="dashboard-page__eyebrow">Acceso restringido</p>
          <h1>Detalle de evento</h1>
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
          <p className="dashboard-page__eyebrow">Perritos y adopciones</p>
          <h1>Detalle de evento</h1>
          <p className="dashboard-page__lede">
            Registra imagenes de comprobante, descripciones y montos de cada gasto asociado a un
            evento de perrito.
          </p>
        </div>
        <Link
          className="dashboard-btn dashboard-btn--primary"
          to={
            selectedEventId
              ? `/dashboard/detalle-evento/nuevo?evento=${encodeURIComponent(selectedEventId)}`
              : "/dashboard/detalle-evento/nuevo"
          }
        >
          Crear detalle
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Los comprobantes se suben como imagen a Cloudinary y la URL final queda almacenada en
          `COMPROBANTE_URL`. Mientras un evento tenga detalles activos, no podras desactivarlo ni
          eliminarlo desde el CRUD de eventos.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <label className="dashboard-input" style={{ minWidth: "360px", marginBottom: 0 }}>
            <span>Evento</span>
            <select
              className="form-select"
              disabled={eventsLoading || deletingId !== null}
              onChange={onSelectEvent}
              value={selectedEventId}
            >
              <option value="">Todos los eventos</option>
              {dogEvents.map((dogEvent) => (
                <option key={dogEvent.idEvento} value={dogEvent.idEvento}>
                  {buildEventLabel(dogEvent)}
                </option>
              ))}
            </select>
          </label>

          <div className="dashboard-toolbar dashboard-toolbar--between" style={{ gap: "0.75rem" }}>
            <input
              className="form-control dashboard-search"
              disabled={detailsLoading || deletingId !== null}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por ID, evento, perrito, descripcion, comprobante o estado"
              value={search}
            />
            <span className="dashboard-muted">
              {filteredEventDetails.length} de {eventDetails.length} detalles
            </span>
          </div>
        </div>

        {eventsLoading || detailsLoading ? (
          <div className="dashboard-empty-state">Cargando detalles...</div>
        ) : filteredEventDetails.length === 0 ? (
          <div className="dashboard-empty-state">
            {selectedEvent ? (
              <>
                No hay detalles registrados para <strong>{buildEventLabel(selectedEvent)}</strong>.
              </>
            ) : (
              "No hay detalles de evento que coincidan con tu busqueda."
            )}
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Evento</th>
                  <th>Perrito</th>
                  <th>Vista previa</th>
                  <th>Comprobante</th>
                  <th>Descripcion</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEventDetails.map((eventDetail) => {
                  const isDeletingCurrent = deletingId === eventDetail.idDetalleEvento;
                  const linkedEvent = dogEventById.get(String(eventDetail.idEvento));

                  return (
                    <tr key={eventDetail.idDetalleEvento}>
                      <td>{eventDetail.idDetalleEvento}</td>
                      <td>{buildEventLabel(linkedEvent) || eventDetail.idEvento}</td>
                      <td>{eventDetail.nombrePerrito || eventDetail.idPerrito || "-"}</td>
                      <td>
                        {eventDetail.comprobanteUrl ? (
                          <img
                            alt={`Comprobante ${eventDetail.idDetalleEvento}`}
                            loading="lazy"
                            src={eventDetail.comprobanteUrl}
                            style={imageStyle}
                          />
                        ) : (
                          <span className="dashboard-muted">Sin imagen</span>
                        )}
                      </td>
                      <td>
                        {eventDetail.comprobanteUrl ? (
                          <a href={eventDetail.comprobanteUrl} rel="noreferrer" target="_blank">
                            Abrir imagen
                          </a>
                        ) : (
                          <span className="dashboard-muted">Sin URL</span>
                        )}
                      </td>
                      <td>{eventDetail.descripcion || "-"}</td>
                      <td>{formatMoney(eventDetail.monto)}</td>
                      <td>{eventDetail.estado || eventDetail.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/detalle-evento/${eventDetail.idDetalleEvento}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingId !== null}
                            onClick={() => onDelete(eventDetail)}
                            type="button"
                          >
                            {isDeletingCurrent ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
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

export default EventDetailsDashboard;
