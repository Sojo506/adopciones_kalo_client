import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as catalogsApi from "../../api/catalogs";
import * as productImagesApi from "../../api/productImages";
import * as productsApi from "../../api/products";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  idProducto: "",
  idEstado: "",
};

const previewStyle = {
  width: "180px",
  height: "180px",
  borderRadius: "28px",
  objectFit: "cover",
  display: "block",
};

const mapProductImageToForm = (productImage) => ({
  idProducto: String(productImage?.idProducto ?? ""),
  idEstado: String(productImage?.idEstado ?? ""),
});

const ProductImageFormPage = () => {
  const { idImagen } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [states, setStates] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fileError, setFileError] = useState("");

  const isEditing = Boolean(idImagen);
  const hasDependencies = products.length > 0 && states.length > 0;
  const formDisabled = catalogsLoading || detailLoading || saving || !hasDependencies;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  const watchedProductId = watch("idProducto");

  const previewUrl = useMemo(() => {
    if (selectedFile) {
      return URL.createObjectURL(selectedFile);
    }

    return currentImage?.imageUrl || null;
  }, [currentImage?.imageUrl, selectedFile]);

  useEffect(() => {
    return () => {
      if (selectedFile && previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, selectedFile]);

  useEffect(() => {
    document.title = isEditing
      ? "Editar imagen de producto | Dashboard Kalö"
      : "Nueva imagen de producto | Dashboard Kalö";
  }, [isEditing]);

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        setCatalogsLoading(true);
        const [productsData, statesData] = await Promise.all([
          productsApi.getProducts({ force: true }),
          catalogsApi.getStates(),
        ]);

        const availableProducts = Array.isArray(productsData) ? productsData : [];
        const availableStates = Array.isArray(statesData) ? statesData : [];
        const preferredProductId = searchParams.get("producto");
        const activeState = availableStates.find((state) => Number(state.idEstado) === 1);

        setProducts(availableProducts);
        setStates(availableStates);

        if (!isEditing) {
          reset({
            ...EMPTY_FORM,
            idProducto: preferredProductId || "",
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
  }, [isEditing, reset, searchParams]);

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const loadProductImage = async () => {
      try {
        setDetailLoading(true);
        const detail = await productImagesApi.getProductImageById(idImagen, { force: true });
        setCurrentImage(detail);
        reset(mapProductImageToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar la imagen",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/imagenes-producto");
      } finally {
        setDetailLoading(false);
      }
    };

    loadProductImage();
  }, [idImagen, isEditing, navigate, reset]);

  const onFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;
    setSelectedFile(nextFile);
    setFileError("");
  };

  const onSubmit = async (values) => {
    if (!isAdmin || !hasDependencies) {
      return;
    }

    if (!isEditing && !selectedFile) {
      setFileError("La imagen es obligatoria.");
      return;
    }

    try {
      setSaving(true);
      setFileError("");

      const formData = new FormData();
      formData.append("idProducto", values.idProducto);
      formData.append("idEstado", values.idEstado);

      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const savedImage = isEditing
        ? await productImagesApi.updateProductImage(idImagen, formData)
        : await productImagesApi.createProductImage(formData);

      Swal.fire({
        icon: "success",
        title: isEditing ? "Imagen actualizada" : "Imagen subida",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "La imagen fue subida y vinculada al producto.",
      });

      navigate(
        `/dashboard/imagenes-producto?producto=${encodeURIComponent(
          savedImage?.idProducto || values.idProducto
        )}`
      );
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos guardar la imagen",
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
          <h1>Imagenes de producto</h1>
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
          <p className="dashboard-page__eyebrow">
            {isEditing ? "Editar imagen de producto" : "Nueva imagen de producto"}
          </p>
          <h1>{isEditing ? "Actualizar imagen" : "Subir imagen"}</h1>
          <p className="dashboard-page__lede">
            Vincula una imagen a un producto y define si debe quedar activa para el catalogo.
          </p>
        </div>
        <Link
          className="dashboard-btn dashboard-btn--ghost"
          to={
            watchedProductId
              ? `/dashboard/imagenes-producto?producto=${encodeURIComponent(watchedProductId)}`
              : "/dashboard/imagenes-producto"
          }
        >
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          {isEditing
            ? "Si subes un archivo nuevo, reemplazaremos la URL almacenada para esta imagen."
            : "La imagen se subira a Cloudinary y luego se registrara en FIDE_PRODUCTO_IMAGEN_TB."}
        </div>

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasDependencies ? (
          <div className="dashboard-empty-state">
            Necesitas productos y estados disponibles para completar este formulario.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              {previewUrl ? (
                <div className="dashboard-alert">
                  <strong>Vista previa:</strong>
                  <div style={{ marginTop: "0.75rem" }}>
                    <img
                      alt={currentImage?.producto ? `Imagen de ${currentImage.producto}` : "Vista previa"}
                      loading="lazy"
                      src={previewUrl}
                      style={previewStyle}
                    />
                  </div>
                </div>
              ) : null}

              <div className="dashboard-form-grid">
                <label className="dashboard-input">
                  <span>Producto</span>
                  <select
                    className="form-select"
                    {...register("idProducto", { required: "El producto es obligatorio" })}
                  >
                    <option value="">Selecciona un producto</option>
                    {products.map((product) => (
                      <option key={product.idProducto} value={product.idProducto}>
                        {product.nombre || "Producto registrado"}
                      </option>
                    ))}
                  </select>
                  {errors.idProducto ? <small>{errors.idProducto.message}</small> : null}
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
                <span>{isEditing ? "Nueva imagen (opcional)" : "Imagen"}</span>
                <input
                  accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                  className="form-control"
                  onChange={onFileChange}
                  type="file"
                />
                {fileError ? <small>{fileError}</small> : null}
              </label>
            </fieldset>

            <div className="dashboard-form__actions">
              <button className="dashboard-btn dashboard-btn--primary" disabled={saving} type="submit">
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Subir imagen"}
              </button>
              <Link
                className="dashboard-btn dashboard-btn--ghost"
                to={
                  watchedProductId
                    ? `/dashboard/imagenes-producto?producto=${encodeURIComponent(watchedProductId)}`
                    : "/dashboard/imagenes-producto"
                }
              >
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default ProductImageFormPage;
