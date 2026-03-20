import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as catalogsApi from "../../api/catalogs";
import * as dogImagesApi from "../../api/dogImages";
import * as dogsApi from "../../api/dogs";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  idPerrito: "",
  idEstado: "1",
};

const previewStyle = {
  width: "180px",
  height: "180px",
  borderRadius: "28px",
  objectFit: "cover",
  display: "block",
};

const mapDogImageToForm = (dogImage) => ({
  idPerrito: String(dogImage?.idPerrito ?? ""),
  idEstado: String(dogImage?.idEstado ?? "1"),
});

const DogImageFormPage = () => {
  const { idImagen } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [dogs, setDogs] = useState([]);
  const [states, setStates] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fileError, setFileError] = useState("");

  const isEditing = Boolean(idImagen);

  const dogOptions = useMemo(() => {
    return dogs.filter(
      (dog) =>
        Number(dog.idEstado) === 1 ||
        Number(dog.idPerrito) === Number(currentImage?.idPerrito),
    );
  }, [currentImage?.idPerrito, dogs]);

  const hasDependencies = dogOptions.length > 0 && states.length > 0;
  const formDisabled = catalogsLoading || detailLoading || saving || !hasDependencies;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  const watchedDogId = watch("idPerrito");

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
      ? "Editar imagen de perrito | Dashboard Kalo"
      : "Nueva imagen de perrito | Dashboard Kalo";
  }, [isEditing]);

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        setCatalogsLoading(true);
        const [dogsData, statesData] = await Promise.all([
          dogsApi.getDogs({ force: true }),
          catalogsApi.getStates(),
        ]);

        const availableDogs = Array.isArray(dogsData) ? dogsData : [];
        const availableStates = Array.isArray(statesData) ? statesData : [];
        const preferredDogId = searchParams.get("perrito");
        const activeState = availableStates.find((state) => Number(state.idEstado) === 1);
        const activeDog = availableDogs.find((dog) => Number(dog.idEstado) === 1);

        setDogs(availableDogs);
        setStates(availableStates);

        if (!isEditing) {
          reset({
            ...EMPTY_FORM,
            idPerrito: preferredDogId || String(activeDog?.idPerrito ?? ""),
            idEstado: String(activeState?.idEstado ?? 1),
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

    const loadDogImage = async () => {
      try {
        setDetailLoading(true);
        const detail = await dogImagesApi.getDogImageById(idImagen, { force: true });
        setCurrentImage(detail);
        reset(mapDogImageToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar la imagen",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/imagenes-perrito");
      } finally {
        setDetailLoading(false);
      }
    };

    loadDogImage();
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
      formData.append("idPerrito", values.idPerrito);

      if (isEditing) {
        formData.append("idEstado", values.idEstado);
      } else {
        formData.append("idEstado", "1");
      }

      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const savedImage = isEditing
        ? await dogImagesApi.updateDogImage(idImagen, formData)
        : await dogImagesApi.createDogImage(formData);

      Swal.fire({
        icon: "success",
        title: isEditing ? "Imagen actualizada" : "Imagen subida",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "La imagen fue subida y vinculada al perrito.",
      });

      navigate(
        `/dashboard/imagenes-perrito?perrito=${encodeURIComponent(
          savedImage?.idPerrito || values.idPerrito
        )}`,
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
          <h1>Imagenes de perrito</h1>
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
            {isEditing ? "Editar imagen de perrito" : "Nueva imagen de perrito"}
          </p>
          <h1>{isEditing ? "Actualizar imagen" : "Subir imagen"}</h1>
          <p className="dashboard-page__lede">
            Vincula una imagen a un perrito y define si debe quedar activa para usarse como imagen
            principal o dentro del historial visual.
          </p>
        </div>
        <Link
          className="dashboard-btn dashboard-btn--ghost"
          to={
            watchedDogId
              ? `/dashboard/imagenes-perrito?perrito=${encodeURIComponent(watchedDogId)}`
              : "/dashboard/imagenes-perrito"
          }
        >
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          {isEditing
            ? "Si subes un archivo nuevo, reemplazaremos la URL almacenada para esta imagen."
            : "La imagen se subira a Cloudinary y luego se registrara en FIDE_PERRITO_IMAGEN_TB."}
        </div>

        <div className="dashboard-alert">
          {isEditing
            ? "Puedes activar o desactivar la imagen al editarla."
            : "Las imagenes nuevas siempre inician activas porque el trigger de la base fija ese estado."}
        </div>

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasDependencies ? (
          <div className="dashboard-empty-state">
            Necesitas perritos y estados disponibles para completar este formulario.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              {previewUrl ? (
                <div className="dashboard-alert">
                  <strong>Vista previa:</strong>
                  <div style={{ marginTop: "0.75rem" }}>
                    <img
                      alt={
                        currentImage?.nombrePerrito
                          ? `Imagen de ${currentImage.nombrePerrito}`
                          : "Vista previa"
                      }
                      loading="lazy"
                      src={previewUrl}
                      style={previewStyle}
                    />
                  </div>
                </div>
              ) : null}

              <div className="dashboard-form-grid">
                <label className="dashboard-input">
                  <span>Perrito</span>
                  <select
                    className="form-select"
                    {...register("idPerrito", { required: "El perrito es obligatorio" })}
                  >
                    <option value="">Selecciona un perrito</option>
                    {dogOptions.map((dog) => (
                      <option key={dog.idPerrito} value={dog.idPerrito}>
                        #{dog.idPerrito} - {dog.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.idPerrito ? <small>{errors.idPerrito.message}</small> : null}
                </label>

                {isEditing ? (
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
                ) : (
                  <label className="dashboard-input">
                    <span>Estado inicial</span>
                    <input className="form-control" readOnly type="text" value="Activo" />
                  </label>
                )}
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

              <div className="dashboard-form__actions">
                <button className="dashboard-btn dashboard-btn--primary" disabled={saving} type="submit">
                  {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Subir imagen"}
                </button>
                <Link
                  className="dashboard-btn dashboard-btn--ghost"
                  to={
                    watchedDogId
                      ? `/dashboard/imagenes-perrito?perrito=${encodeURIComponent(watchedDogId)}`
                      : "/dashboard/imagenes-perrito"
                  }
                >
                  Cancelar
                </Link>
              </div>
            </fieldset>
          </form>
        )}
      </section>
    </div>
  );
};

export default DogImageFormPage;
