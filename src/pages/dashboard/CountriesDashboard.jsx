import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as countriesApi from "../../api/countries";
import { useAuth } from "../../hooks/useAuth";

const CountriesDashboard = () => {
  const { isAdmin } = useAuth();
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return countries;
    }

    return countries.filter((country) =>
      [country.idPais, country.nombre, country.estado]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [countries, search]);

  const loadCountries = async () => {
    try {
      setLoading(true);
      const data = await countriesApi.getCountries({ force: true });
      setCountries(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar los paises",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Paises | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadCountries();
  }, [isAdmin]);

  const onDelete = async (country) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar pais",
      text: `Se desactivara el pais "${country.nombre}".`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(country.idPais);
      await countriesApi.deleteCountry(country.idPais);
      await loadCountries();

      Swal.fire({
        icon: "success",
        title: "Pais eliminado",
        text: "El pais fue desactivado correctamente.",
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
          <h1>Paises</h1>
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
          <p className="dashboard-page__eyebrow">Gestion de ubicaciones</p>
          <h1>Paises</h1>
          <p className="dashboard-page__lede">
            Administra el catalogo base de paises disponible para direcciones y jerarquias.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/paises/nuevo">
          Crear pais
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Si el pais todavia
          tiene provincias activas, el sistema bloqueara la operacion.
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
            {filteredCountries.length} de {countries.length} paises
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando paises...</div>
        ) : filteredCountries.length === 0 ? (
          <div className="dashboard-empty-state">No hay paises que coincidan con tu busqueda.</div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCountries.map((country) => {
                  const isDeletingCurrent = deletingId === country.idPais;
                  const isInactive = Number(country.idEstado) !== 1;

                  return (
                    <tr key={country.idPais}>
                      <td>{country.nombre}</td>
                      <td>{country.estado || country.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/paises/${country.idPais}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={isInactive || deletingId !== null}
                            onClick={() => onDelete(country)}
                            type="button"
                          >
                            {isDeletingCurrent ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
                        {isInactive ? (
                          <small className="dashboard-table__note">Pais ya inactivo</small>
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

export default CountriesDashboard;
