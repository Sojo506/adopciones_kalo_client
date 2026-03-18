import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as productImagesApi from "../../api/productImages";
import * as productsApi from "../../api/products";
import { useAuth } from "../../hooks/useAuth";

const imageStyle = {
  width: "72px",
  height: "72px",
  borderRadius: "18px",
  objectFit: "cover",
  display: "block",
};

const ProductImagesDashboard = () => {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const selectedProductId = searchParams.get("producto") || "";
  const selectedProduct = useMemo(
    () =>
      products.find((product) => String(product.idProducto) === String(selectedProductId)) || null,
    [products, selectedProductId]
  );

  const filteredImages = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return images;
    }

    return images.filter((image) =>
      [image.idImagen, image.producto, image.imageUrl, image.estado]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [images, search]);

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const data = await productsApi.getProducts({ force: true });
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar los productos",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setProductsLoading(false);
    }
  };

  const loadImages = async (idProducto) => {
    if (!idProducto) {
      setImages([]);
      return;
    }

    try {
      setImagesLoading(true);
      const data = await productImagesApi.getProductImagesByProduct(idProducto, { force: true });
      setImages(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar las imagenes",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
      setImages([]);
    } finally {
      setImagesLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Imagenes de producto | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setProductsLoading(false);
      return;
    }

    loadProducts();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin || !selectedProductId) {
      setImages([]);
      setImagesLoading(false);
      return;
    }

    loadImages(selectedProductId);
  }, [isAdmin, selectedProductId]);

  const onSelectProduct = (event) => {
    const nextProductId = event.target.value;
    const nextSearchParams = new URLSearchParams(searchParams);

    if (nextProductId) {
      nextSearchParams.set("producto", nextProductId);
    } else {
      nextSearchParams.delete("producto");
    }

    setSearchParams(nextSearchParams);
  };

  const onDelete = async (image) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Desactivar imagen",
      text: `Se desactivara la imagen ${image.idImagen} del producto "${image.producto}".`,
      showCancelButton: true,
      confirmButtonText: "Desactivar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(image.idImagen);
      await productImagesApi.deleteProductImage(image.idImagen, {
        idProducto: image.idProducto,
      });
      await loadImages(image.idProducto);

      Swal.fire({
        icon: "success",
        title: "Imagen desactivada",
        text: "La imagen fue desactivada correctamente.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos desactivar la imagen",
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
          <h1>Imagenes de producto</h1>
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
          <h1>Imagenes de producto</h1>
          <p className="dashboard-page__lede">
            Sube recursos a Cloudinary, revisa las imagenes asociadas a cada producto y desactiva
            las que ya no deban mostrarse en el catalogo.
          </p>
        </div>
        <Link
          className={`dashboard-btn dashboard-btn--primary${!selectedProductId ? " is-disabled" : ""}`}
          onClick={(event) => {
            if (!selectedProductId) {
              event.preventDefault();
            }
          }}
          to={
            selectedProductId
              ? `/dashboard/imagenes-producto/nuevo?producto=${encodeURIComponent(selectedProductId)}`
              : "/dashboard/imagenes-producto/nuevo"
          }
        >
          Subir imagen
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Selecciona un producto para listar sus imagenes. La primera imagen activa es la que el
          backend usa como referencia principal en el catalogo.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <label className="dashboard-input" style={{ minWidth: "320px", marginBottom: 0 }}>
            <span>Producto</span>
            <select
              className="form-select"
              disabled={productsLoading || deletingId !== null}
              onChange={onSelectProduct}
              value={selectedProductId}
            >
              <option value="">Selecciona un producto</option>
              {products.map((product) => (
                <option key={product.idProducto} value={product.idProducto}>
                  #{product.idProducto} - {product.nombre}
                </option>
              ))}
            </select>
          </label>

          <div className="dashboard-toolbar dashboard-toolbar--between" style={{ gap: "0.75rem" }}>
            <input
              className="form-control dashboard-search"
              disabled={!selectedProductId || imagesLoading || deletingId !== null}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por ID, URL o estado"
              value={search}
            />
            <span className="dashboard-muted">
              {filteredImages.length} de {images.length} imagenes
            </span>
          </div>
        </div>

        {productsLoading ? (
          <div className="dashboard-empty-state">Cargando productos...</div>
        ) : !selectedProductId ? (
          <div className="dashboard-empty-state">
            Selecciona un producto para ver sus imagenes.
          </div>
        ) : imagesLoading ? (
          <div className="dashboard-empty-state">Cargando imagenes...</div>
        ) : filteredImages.length === 0 ? (
          <div className="dashboard-empty-state">
            {selectedProduct ? (
              <>
                No hay imagenes registradas para <strong>{selectedProduct.nombre}</strong>.
              </>
            ) : (
              "No hay imagenes registradas para este producto."
            )}
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Vista previa</th>
                  <th>ID imagen</th>
                  <th>Producto</th>
                  <th>URL</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredImages.map((image) => {
                  const isDeletingCurrent = deletingId === image.idImagen;

                  return (
                    <tr key={image.idImagen}>
                      <td>
                        {image.imageUrl ? (
                          <img
                            alt={`Imagen ${image.idImagen} del producto ${image.producto}`}
                            loading="lazy"
                            src={image.imageUrl}
                            style={imageStyle}
                          />
                        ) : (
                          <span className="dashboard-muted">Sin imagen</span>
                        )}
                      </td>
                      <td>{image.idImagen}</td>
                      <td>{image.producto || image.idProducto}</td>
                      <td>
                        {image.imageUrl ? (
                          <a href={image.imageUrl} rel="noreferrer" target="_blank">
                            Abrir recurso
                          </a>
                        ) : (
                          <span className="dashboard-muted">Sin URL</span>
                        )}
                      </td>
                      <td>{image.estado || image.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/imagenes-producto/${image.idImagen}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingId !== null}
                            onClick={() => onDelete(image)}
                            type="button"
                          >
                            {isDeletingCurrent ? "Desactivando..." : "Desactivar"}
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

export default ProductImagesDashboard;
