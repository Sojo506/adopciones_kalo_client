import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as brandsApi from "../../api/brands";
import * as catalogsApi from "../../api/catalogs";
import * as categoriesApi from "../../api/categories";
import * as productsApi from "../../api/products";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  nombre: "",
  descripcion: "",
  precio: "",
  idCategoria: "",
  idMarca: "",
  idEstado: "",
};

const previewStyle = {
  width: "120px",
  height: "120px",
  borderRadius: "24px",
  objectFit: "cover",
  display: "block",
};

const mapProductToForm = (product) => ({
  nombre: product?.nombre ?? "",
  descripcion: product?.descripcion ?? "",
  precio:
    product?.precio === null || product?.precio === undefined ? "" : String(product.precio),
  idCategoria: String(product?.idCategoria ?? ""),
  idMarca: String(product?.idMarca ?? ""),
  idEstado: String(product?.idEstado ?? ""),
});

const buildPayload = (values) => ({
  nombre: values.nombre.trim(),
  descripcion: values.descripcion.trim(),
  precio: Number(values.precio),
  idCategoria: Number(values.idCategoria),
  idMarca: Number(values.idMarca),
  idEstado: Number(values.idEstado),
});

const ProductFormPage = () => {
  const { idProducto } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(idProducto);
  const hasDependencies = states.length > 0 && categories.length > 0 && brands.length > 0;
  const formDisabled = catalogsLoading || detailLoading || saving || !hasDependencies;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  useEffect(() => {
    document.title = isEditing ? "Editar producto | Dashboard Kalö" : "Nuevo producto | Dashboard Kalö";
  }, [isEditing]);

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        setCatalogsLoading(true);
        const [statesData, categoriesData, brandsData] = await Promise.all([
          catalogsApi.getStates(),
          categoriesApi.getCategories({ force: true }),
          brandsApi.getBrands({ force: true }),
        ]);

        const availableStates = Array.isArray(statesData) ? statesData : [];
        const availableCategories = Array.isArray(categoriesData) ? categoriesData : [];
        const availableBrands = Array.isArray(brandsData) ? brandsData : [];

        setStates(availableStates);
        setCategories(availableCategories);
        setBrands(availableBrands);

        if (!isEditing) {
          const activeState = availableStates.find((state) => Number(state.idEstado) === 1);
          reset({
            ...EMPTY_FORM,
            idEstado: String(activeState?.idEstado ?? availableStates?.[0]?.idEstado ?? ""),
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar los catalogos necesarios",
          text: error?.response?.data?.message || "Intenta de nuevo en un momento.",
        });
      } finally {
        setCatalogsLoading(false);
      }
    };

    loadCatalogs();
  }, [isEditing, reset]);

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const loadProduct = async () => {
      try {
        setDetailLoading(true);
        const detail = await productsApi.getProductById(idProducto, { force: true });
        setCurrentProduct(detail);
        reset(mapProductToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar el producto",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/productos");
      } finally {
        setDetailLoading(false);
      }
    };

    loadProduct();
  }, [idProducto, isEditing, navigate, reset]);

  const onSubmit = async (values) => {
    if (!isAdmin || !hasDependencies) {
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload(values);

      if (isEditing) {
        await productsApi.updateProduct(idProducto, payload);
      } else {
        await productsApi.createProduct(payload);
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Producto actualizado" : "Producto creado",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "El producto fue creado correctamente.",
      });

      navigate("/dashboard/productos");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos guardar",
        text: error?.response?.data?.message || "Verifica la informacion e intenta de nuevo.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="dashboard-page">
        <section className="dashboard-card">
          <p className="dashboard-page__eyebrow">Acceso restringido</p>
          <h1>Productos</h1>
          <p className="dashboard-page__lede">
            Solo un administrador puede crear o actualizar esta informacion.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header mt-4">
        <div>
          <p className="dashboard-page__eyebrow">{isEditing ? "Editar producto" : "Nuevo producto"}</p>
          <h1>{isEditing ? "Actualizar producto" : "Crear producto"}</h1>
          <p className="dashboard-page__lede">
            Define el nombre, la descripcion, el precio y las relaciones comerciales del producto.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/productos">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          La subida de imagenes a Cloudinary debe hacerse en el CRUD de imagenes de producto.
          Este formulario solo administra los datos base del producto.
        </div>

        {isEditing ? (
          <div className="dashboard-alert">
            Puedes administrar las imagenes de este producto desde{" "}
            <Link to={`/dashboard/imagenes-producto?producto=${encodeURIComponent(idProducto)}`}>
              Imagenes de producto
            </Link>
            .
          </div>
        ) : null}

        {isEditing ? (
          <div className="dashboard-alert">
            El inventario de este producto se administra desde{" "}
            <Link to="/dashboard/inventario">Inventario</Link>, donde los ajustes de stock generan
            movimientos automáticos de ingreso o egreso.
          </div>
        ) : null}

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasDependencies ? (
          <div className="dashboard-empty-state">
            Necesitas estados, categorias y marcas disponibles para completar este formulario.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              {isEditing && currentProduct?.imageUrl ? (
                <div className="dashboard-alert">
                  <strong>Imagen principal actual:</strong>
                  <div style={{ marginTop: "0.75rem" }}>
                    <img
                      alt={`Producto ${currentProduct.nombre}`}
                      loading="lazy"
                      src={currentProduct.imageUrl}
                      style={previewStyle}
                    />
                  </div>
                </div>
              ) : null}

              <div className="dashboard-form-grid">
                <label className="dashboard-input">
                  <span>Nombre</span>
                  <input
                    className="form-control"
                    {...register("nombre", {
                      required: "El nombre es obligatorio",
                      maxLength: {
                        value: 100,
                        message: "El nombre no puede superar 100 caracteres",
                      },
                    })}
                  />
                  {errors.nombre ? <small>{errors.nombre.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Precio</span>
                  <input
                    className="form-control"
                    min="0.01"
                    step="0.01"
                    type="number"
                    {...register("precio", {
                      required: "El precio es obligatorio",
                      min: {
                        value: 0.01,
                        message: "El precio debe ser mayor que cero",
                      },
                    })}
                  />
                  {errors.precio ? <small>{errors.precio.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Categoria</span>
                  <select
                    className="form-select"
                    {...register("idCategoria", { required: "La categoria es obligatoria" })}
                  >
                    <option value="">Selecciona una categoria</option>
                    {categories.map((category) => (
                      <option key={category.idCategoria} value={category.idCategoria}>
                        {category.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.idCategoria ? <small>{errors.idCategoria.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Marca</span>
                  <select
                    className="form-select"
                    {...register("idMarca", { required: "La marca es obligatoria" })}
                  >
                    <option value="">Selecciona una marca</option>
                    {brands.map((brand) => (
                      <option key={brand.idMarca} value={brand.idMarca}>
                        {brand.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.idMarca ? <small>{errors.idMarca.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Estado</span>
                  <select
                    className="form-select"
                    {...register("idEstado", { required: "El estado es obligatorio" })}
                  >
                    <option value="">Selecciona un estado</option>
                    {states.map((state) => (
                      <option key={state.idEstado} value={state.idEstado}>
                        {state.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.idEstado ? <small>{errors.idEstado.message}</small> : null}
                </label>
              </div>

              <label className="dashboard-input">
                <span>Descripcion</span>
                <textarea
                  className="form-control"
                  rows="4"
                  {...register("descripcion", {
                    maxLength: {
                      value: 500,
                      message: "La descripcion no puede superar 500 caracteres",
                    },
                  })}
                />
                {errors.descripcion ? <small>{errors.descripcion.message}</small> : null}
              </label>
            </fieldset>

            <div className="dashboard-form__actions">
              <button className="dashboard-btn dashboard-btn--primary" disabled={saving} type="submit">
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear producto"}
              </button>
              <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/productos">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default ProductFormPage;
