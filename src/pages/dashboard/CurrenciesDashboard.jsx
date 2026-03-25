import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as currenciesApi from "../../api/currencies";
import { useAuth } from "../../hooks/useAuth";

const CurrenciesDashboard = () => {
  const { isAdmin } = useAuth();
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredCurrencies = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return currencies;
    }

    return currencies.filter((currency) =>
      [currency.idMoneda, currency.nombre, currency.simbolo, currency.estado]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [currencies, search]);

  const loadCurrencies = async () => {
    try {
      setLoading(true);
      const data = await currenciesApi.getCurrencies({ force: true });
      setCurrencies(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar las monedas",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Monedas | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadCurrencies();
  }, [isAdmin]);

  const onDelete = async (currency) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar moneda",
      text: `Se desactivara la moneda "${currency.nombre}".`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(currency.idMoneda);
      await currenciesApi.deleteCurrency(currency.idMoneda);
      await loadCurrencies();

      Swal.fire({
        icon: "success",
        title: "Moneda eliminada",
        text: "La moneda fue desactivada correctamente.",
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
          <h1>Monedas</h1>
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
          <h1>Monedas</h1>
          <p className="dashboard-page__lede">
            Administra las monedas admitidas para facturacion, donaciones y operaciones comerciales.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/monedas/nuevo">
          Crear moneda
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          No puedes eliminar una moneda si todavia tiene facturas activas asociadas.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por ID, nombre, simbolo o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredCurrencies.length} de {currencies.length} monedas
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando monedas...</div>
        ) : filteredCurrencies.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay monedas que coincidan con tu busqueda.
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Simbolo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCurrencies.map((currency) => {
                  const isDeletingCurrent = deletingId === currency.idMoneda;

                  return (
                    <tr key={currency.idMoneda}>
                      <td>{currency.nombre}</td>
                      <td>{currency.simbolo}</td>
                      <td>{currency.estado || currency.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/monedas/${currency.idMoneda}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingId !== null}
                            onClick={() => onDelete(currency)}
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

export default CurrenciesDashboard;
