import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as responseTypesApi from "../../api/responseTypes";
import { useAuth } from "../../hooks/useAuth";

const ResponseTypesDashboard = () => {
  const { isAdmin } = useAuth();
  const [responseTypes, setResponseTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredResponseTypes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return responseTypes;
    }

    return responseTypes.filter((responseType) =>
      [responseType.idTipoRespuesta, responseType.nombre, responseType.estado]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [responseTypes, search]);

  const loadResponseTypes = async () => {
    try {
      setLoading(true);
      const data = await responseTypesApi.getResponseTypes({ force: true });
      setResponseTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar los tipos de respuesta",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Tipos de respuesta | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadResponseTypes();
  }, [isAdmin]);

  const onDelete = async (responseType) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar tipo de respuesta",
      text: `Se desactivara el tipo "${responseType.nombre}".`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(responseType.idTipoRespuesta);
      await responseTypesApi.deleteResponseType(responseType.idTipoRespuesta);
      await loadResponseTypes();

      Swal.fire({
        icon: "success",
        title: "Tipo de respuesta eliminado",
        text: "El tipo de respuesta fue desactivado correctamente.",
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
          <h1>Tipos de respuesta</h1>
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
          <p className="dashboard-page__eyebrow">Gestion de catalogo</p>
          <h1>Tipos de respuesta</h1>
          <p className="dashboard-page__lede">
            Administra los tipos de respuesta disponibles para el banco reutilizable de preguntas y
            los formularios del sistema.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/tipos-respuesta/nuevo">
          Crear tipo
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          No puedes eliminar un tipo de respuesta si todavia tiene preguntas activas asociadas.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por ID, nombre o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredResponseTypes.length} de {responseTypes.length} tipos
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando tipos de respuesta...</div>
        ) : filteredResponseTypes.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay tipos de respuesta que coincidan con tu busqueda.
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredResponseTypes.map((responseType) => {
                  const isDeletingCurrent = deletingId === responseType.idTipoRespuesta;

                  return (
                    <tr key={responseType.idTipoRespuesta}>
                      <td>{responseType.idTipoRespuesta}</td>
                      <td>{responseType.nombre}</td>
                      <td>{responseType.estado || responseType.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/tipos-respuesta/${responseType.idTipoRespuesta}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingId !== null}
                            onClick={() => onDelete(responseType)}
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

export default ResponseTypesDashboard;
