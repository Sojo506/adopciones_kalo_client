import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as categoriesApi from "../../api/categories";
import { useAuth } from "../../hooks/useAuth";

const CategoriesDashboard = () => {
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter((category) =>
      [category.idCategoria, category.nombre, category.estado]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [categories, search]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.getCategories({ force: true });
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar las categorias",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Categorias | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadCategories();
  }, [isAdmin]);

  const onDelete = async (category) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar categoria",
      text: `Se desactivara la categoria "${category.nombre}".`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(category.idCategoria);
      await categoriesApi.deleteCategory(category.idCategoria);
      await loadCategories();

      Swal.fire({
        icon: "success",
        title: "Categoria eliminada",
        text: "La categoria fue desactivada correctamente.",
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
          <h1>Categorias</h1>
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
          <h1>Categorias</h1>
          <p className="dashboard-page__lede">
            Administra las categorias comerciales que organizan el catalogo de productos.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/categorias/nuevo">
          Crear categoria
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          No puedes eliminar una categoria si todavia tiene productos activos asociados.
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
            {filteredCategories.length} de {categories.length} categorias
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando categorias...</div>
        ) : filteredCategories.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay categorias que coincidan con tu busqueda.
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
                {filteredCategories.map((category) => {
                  const isDeletingCurrent = deletingId === category.idCategoria;

                  return (
                    <tr key={category.idCategoria}>
                      <td>{category.idCategoria}</td>
                      <td>{category.nombre}</td>
                      <td>{category.estado || category.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/categorias/${category.idCategoria}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingId !== null}
                            onClick={() => onDelete(category)}
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

export default CategoriesDashboard;
