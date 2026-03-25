import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as dogEventsApi from "../../api/dogEvents";
import * as dogsApi from "../../api/dogs";
import { useAuth } from "../../hooks/useAuth";

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

const DogEventsDashboard = () => {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dogs, setDogs] = useState([]);
  const [dogEvents, setDogEvents] = useState([]);
  const [dogsLoading, setDogsLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const selectedDogId = searchParams.get("perrito") || "";
  const selectedDog = useMemo(
    () => dogs.find((dog) => String(dog.idPerrito) === String(selectedDogId)) || null,
    [dogs, selectedDogId],
  );

  const filteredDogEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return dogEvents.filter((dogEvent) => {
      const matchesDog =
        !selectedDogId || String(dogEvent.idPerrito) === String(selectedDogId);

      if (!matchesDog) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        dogEvent.idEvento,
        dogEvent.nombrePerrito,
        dogEvent.tipoEvento,
        dogEvent.fechaEvento,
        dogEvent.detalle,
        dogEvent.totalGasto,
        dogEvent.estado,
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [dogEvents, search, selectedDogId]);

  const loadDogs = async () => {
    try {
      setDogsLoading(true);
      const data = await dogsApi.getDogs({ force: true });
      setDogs(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar los perritos",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setDogsLoading(false);
    }
  };

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

  useEffect(() => {
    document.title = "Eventos de perrito | Dashboard Kalo";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setDogsLoading(false);
      setEventsLoading(false);
      return;
    }

    loadDogs();
    loadDogEvents();
  }, [isAdmin]);

  const onSelectDog = (event) => {
    const nextDogId = event.target.value;
    const nextSearchParams = new URLSearchParams(searchParams);

    if (nextDogId) {
      nextSearchParams.set("perrito", nextDogId);
    } else {
      nextSearchParams.delete("perrito");
    }

    setSearchParams(nextSearchParams);
  };

  const onDelete = async (dogEvent) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar evento",
      text: `Se desactivara el evento #${dogEvent.idEvento}.`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(dogEvent.idEvento);
      await dogEventsApi.deleteDogEvent(dogEvent.idEvento);
      await loadDogEvents();

      Swal.fire({
        icon: "success",
        title: "Evento eliminado",
        text: "El evento fue desactivado correctamente.",
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
          <h1>Eventos de perrito</h1>
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
          <h1>Eventos de perrito</h1>
          <p className="dashboard-page__lede">
            Administra el historial medico y operativo de los perritos con fecha, tipo de evento,
            detalle y gasto total registrado.
          </p>
        </div>
        <Link
          className="dashboard-btn dashboard-btn--primary"
          to={
            selectedDogId
              ? `/dashboard/eventos-perrito/nuevo?perrito=${encodeURIComponent(selectedDogId)}`
              : "/dashboard/eventos-perrito/nuevo"
          }
        >
          Crear evento
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Los eventos nuevos siempre inician activos por trigger y no podras desactivarlos si
          todavia tienen detalles de evento activos asociados.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <label className="dashboard-input" style={{ minWidth: "320px", marginBottom: 0 }}>
            <span>Perrito</span>
            <select
              className="form-select"
              disabled={dogsLoading || deletingId !== null}
              onChange={onSelectDog}
              value={selectedDogId}
            >
              <option value="">Todos los perritos</option>
              {dogs.map((dog) => (
                <option key={dog.idPerrito} value={dog.idPerrito}>
                  #{dog.idPerrito} - {dog.nombre}
                </option>
              ))}
            </select>
          </label>

          <div className="dashboard-toolbar dashboard-toolbar--between" style={{ gap: "0.75rem" }}>
            <input
              className="form-control dashboard-search"
              disabled={eventsLoading || deletingId !== null}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por ID, perrito, tipo, fecha, detalle o estado"
              value={search}
            />
            <span className="dashboard-muted">
              {filteredDogEvents.length} de {dogEvents.length} eventos
            </span>
          </div>
        </div>

        {dogsLoading || eventsLoading ? (
          <div className="dashboard-empty-state">Cargando eventos...</div>
        ) : filteredDogEvents.length === 0 ? (
          <div className="dashboard-empty-state">
            {selectedDog ? (
              <>
                No hay eventos que coincidan con tu busqueda para <strong>{selectedDog.nombre}</strong>.
              </>
            ) : (
              "No hay eventos de perrito que coincidan con tu busqueda."
            )}
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Perrito</th>
                  <th>Tipo de evento</th>
                  <th>Fecha</th>
                  <th>Detalle</th>
                  <th>Total gasto</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredDogEvents.map((dogEvent) => {
                  const isDeletingCurrent = deletingId === dogEvent.idEvento;

                  return (
                    <tr key={dogEvent.idEvento}>
                      <td>{dogEvent.nombrePerrito || dogEvent.idPerrito}</td>
                      <td>{dogEvent.tipoEvento || dogEvent.idTipoEvento}</td>
                      <td>{formatDate(dogEvent.fechaEvento)}</td>
                      <td>{dogEvent.detalle || "-"}</td>
                      <td>{formatMoney(dogEvent.totalGasto)}</td>
                      <td>{dogEvent.estado || dogEvent.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/eventos-perrito/${dogEvent.idEvento}/editar`}
                          >
                            Editar
                          </Link>
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/detalle-evento?evento=${encodeURIComponent(dogEvent.idEvento)}`}
                          >
                            Detalles
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingId !== null}
                            onClick={() => onDelete(dogEvent)}
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

export default DogEventsDashboard;
