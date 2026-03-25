import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as brandsApi from "../../api/brands";
import { useAuth } from "../../hooks/useAuth";

const BrandsDashboard = () => {
  const { isAdmin } = useAuth();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredBrands = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return brands;
    }

    return brands.filter((brand) =>
      [brand.idMarca, brand.nombre, brand.estado]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [brands, search]);

  const loadBrands = async () => {
    try {
      setLoading(true);
      const data = await brandsApi.getBrands({ force: true });
      setBrands(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar las marcas",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Marcas | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadBrands();
  }, [isAdmin]);

  const onDelete = async (brand) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar marca",
      text: `Se desactivara la marca "${brand.nombre}".`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(brand.idMarca);
      await brandsApi.deleteBrand(brand.idMarca);
      await loadBrands();

      Swal.fire({
        icon: "success",
        title: "Marca eliminada",
        text: "La marca fue desactivada correctamente.",
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
          <h1>Marcas</h1>
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
          <h1>Marcas</h1>
          <p className="dashboard-page__lede">
            Administra las marcas comerciales asociadas a los productos de la tienda solidaria.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/marcas/nuevo">
          Crear marca
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          No puedes eliminar una marca si todavia tiene productos activos asociados.
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
            {filteredBrands.length} de {brands.length} marcas
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando marcas...</div>
        ) : filteredBrands.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay marcas que coincidan con tu busqueda.
          </div>
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
                {filteredBrands.map((brand) => {
                  const isDeletingCurrent = deletingId === brand.idMarca;

                  return (
                    <tr key={brand.idMarca}>
                      <td>{brand.nombre}</td>
                      <td>{brand.estado || brand.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/marcas/${brand.idMarca}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingId !== null}
                            onClick={() => onDelete(brand)}
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

export default BrandsDashboard;
