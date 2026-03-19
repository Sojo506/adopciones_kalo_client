import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as productsApi from "../../api/products";
import { useAuth } from "../../hooks/useAuth";

const numberFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const imageStyle = {
  width: "56px",
  height: "56px",
  borderRadius: "16px",
  objectFit: "cover",
  display: "block",
};

const ProductsDashboard = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) =>
      [
        product.idProducto,
        product.nombre,
        product.categoria,
        product.marca,
        product.estado,
        product.precio,
        product.stock,
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [products, search]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getProducts({ force: true });
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar los productos",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Productos | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadProducts();
  }, [isAdmin]);

  const onDelete = async (product) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar producto",
      text: `Se desactivara el producto "${product.nombre}".`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(product.idProducto);
      await productsApi.deleteProduct(product.idProducto);
      await loadProducts();

      Swal.fire({
        icon: "success",
        title: "Producto eliminado",
        text: "El producto fue desactivado correctamente.",
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
          <h1>Productos</h1>
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
          <p className="dashboard-page__eyebrow">Gestion comercial</p>
          <h1>Productos</h1>
          <p className="dashboard-page__lede">
            Administra el catalogo principal, los precios, la marca, la categoria y la imagen
            principal expuesta por cada producto.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/productos/nuevo">
          Crear producto
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Las imagenes se suben y administran desde el CRUD de imagenes de producto. Aqui solo
          mostramos la imagen principal disponible.
        </div>

        <div className="dashboard-alert">
          El stock actual y sus ajustes se administran desde el CRUD de inventario, que registra
          automaticamente ingresos y egresos en la tabla de movimientos.
        </div>

        <div className="dashboard-alert">
          No puedes eliminar un producto si todavia tiene stock disponible en inventario.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por ID, nombre, categoria, marca, precio o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredProducts.length} de {products.length} productos
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando productos...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay productos que coincidan con tu busqueda.
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Categoria</th>
                  <th>Marca</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const isDeletingCurrent = deletingId === product.idProducto;

                  return (
                    <tr key={product.idProducto}>
                      <td>
                        {product.imageUrl ? (
                          <img
                            alt={`Producto ${product.nombre}`}
                            loading="lazy"
                            src={product.imageUrl}
                            style={imageStyle}
                          />
                        ) : (
                          <span className="dashboard-muted">Sin imagen</span>
                        )}
                      </td>
                      <td>{product.idProducto}</td>
                      <td>{product.nombre}</td>
                      <td>{product.categoria || product.idCategoria}</td>
                      <td>{product.marca || product.idMarca}</td>
                      <td>{numberFormatter.format(Number(product.precio || 0))}</td>
                      <td>{Number(product.stock || 0)}</td>
                      <td>{product.estado || product.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/productos/${product.idProducto}/editar`}
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
                            to={`/dashboard/imagenes-producto?producto=${encodeURIComponent(product.idProducto)}`}
                          >
                            Imagenes
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingId !== null}
                            onClick={() => onDelete(product)}
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

export default ProductsDashboard;
