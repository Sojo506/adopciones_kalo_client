import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as catalogsApi from "../../api/catalogs";
import * as dogsApi from "../../api/dogs";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  nombre: "",
  fechaIngreso: "",
  edad: "",
  peso: "",
  estatura: "",
  idSexo: "",
  idRaza: "",
  idEstado: "1",
};

const previewStyle = {
  width: "120px",
  height: "120px",
  borderRadius: "24px",
  objectFit: "cover",
  display: "block",
};

const toDateInputValue = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 10);
};

const mapDogToForm = (dog) => ({
  nombre: dog?.nombre ?? "",
  fechaIngreso: toDateInputValue(dog?.fechaIngreso),
  edad: dog?.edad === null || dog?.edad === undefined ? "" : String(dog.edad),
  peso: dog?.peso === null || dog?.peso === undefined ? "" : String(dog.peso),
  estatura: dog?.estatura === null || dog?.estatura === undefined ? "" : String(dog.estatura),
  idSexo: String(dog?.idSexo ?? ""),
  idRaza: String(dog?.idRaza ?? ""),
  idEstado: String(dog?.idEstado ?? "1"),
});

const buildCreatePayload = (values) => ({
  nombre: values.nombre.trim(),
  fechaIngreso: values.fechaIngreso,
  edad: Number(values.edad),
  peso: Number(values.peso),
  estatura: Number(values.estatura),
  idSexo: Number(values.idSexo),
  idRaza: Number(values.idRaza),
  idEstado: 1,
});

const buildUpdatePayload = (values) => ({
  nombre: values.nombre.trim(),
  edad: Number(values.edad),
  peso: Number(values.peso),
  estatura: Number(values.estatura),
  idSexo: Number(values.idSexo),
  idRaza: Number(values.idRaza),
  idEstado: Number(values.idEstado),
});

const DogFormPage = () => {
  const { idPerrito } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [sexes, setSexes] = useState([]);
  const [currentDog, setCurrentDog] = useState(null);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(idPerrito);

  const breedOptions = useMemo(() => {
    return breeds.filter(
      (breed) =>
        Number(breed.idEstado) === 1 || Number(breed.idRaza) === Number(currentDog?.idRaza),
    );
  }, [breeds, currentDog?.idRaza]);

  const sexOptions = useMemo(() => {
    return sexes.filter(
      (sex) => Number(sex.idEstado) === 1 || Number(sex.idSexo) === Number(currentDog?.idSexo),
    );
  }, [sexes, currentDog?.idSexo]);

  const hasDependencies = states.length > 0 && breedOptions.length > 0 && sexOptions.length > 0;
  const formDisabled = catalogsLoading || detailLoading || saving || !hasDependencies;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  useEffect(() => {
    document.title = isEditing ? "Editar perrito | Dashboard Kalo" : "Nuevo perrito | Dashboard Kalo";
  }, [isEditing]);

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        setCatalogsLoading(true);
        const [statesData, breedsData, sexesData] = await Promise.all([
          catalogsApi.getStates(),
          catalogsApi.getBreeds({ force: true }),
          catalogsApi.getSexes({ force: true }),
        ]);

        const availableStates = Array.isArray(statesData) ? statesData : [];
        const availableBreeds = Array.isArray(breedsData) ? breedsData : [];
        const availableSexes = Array.isArray(sexesData) ? sexesData : [];
        const activeState = availableStates.find((state) => Number(state.idEstado) === 1);
        const activeBreed = availableBreeds.find((breed) => Number(breed.idEstado) === 1);
        const activeSex = availableSexes.find((sex) => Number(sex.idEstado) === 1);

        setStates(availableStates);
        setBreeds(availableBreeds);
        setSexes(availableSexes);

        if (!isEditing) {
          reset({
            ...EMPTY_FORM,
            fechaIngreso: toDateInputValue(new Date()),
            idRaza: String(activeBreed?.idRaza ?? ""),
            idSexo: String(activeSex?.idSexo ?? ""),
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
  }, [isEditing, reset]);

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const loadDog = async () => {
      try {
        setDetailLoading(true);
        const detail = await dogsApi.getDogById(idPerrito, { force: true });
        setCurrentDog(detail);
        reset(mapDogToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar el perrito",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/perritos");
      } finally {
        setDetailLoading(false);
      }
    };

    loadDog();
  }, [idPerrito, isEditing, navigate, reset]);

  const onSubmit = async (values) => {
    if (!isAdmin || !hasDependencies) {
      return;
    }

    try {
      setSaving(true);

      if (isEditing) {
        await dogsApi.updateDog(idPerrito, buildUpdatePayload(values));
      } else {
        await dogsApi.createDog(buildCreatePayload(values));
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Perrito actualizado" : "Perrito creado",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "El perrito fue creado correctamente.",
      });

      navigate("/dashboard/perritos");
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
          <h1>Perritos</h1>
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
          <p className="dashboard-page__eyebrow">{isEditing ? "Editar perrito" : "Nuevo perrito"}</p>
          <h1>{isEditing ? "Actualizar perrito" : "Crear perrito"}</h1>
          <p className="dashboard-page__lede">
            Registra la fecha de ingreso, los datos fisicos y la clasificacion base de cada
            perrito dentro del sistema.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/perritos">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          El trigger de la base siempre crea perritos en estado activo. Para desactivar uno ya
          existente, primero debes asegurarte de que no tenga dependencias activas.
        </div>

        {isEditing && currentDog?.imageUrl ? (
          <div className="dashboard-alert">
            <strong>Imagen principal actual:</strong>
            <div style={{ marginTop: "0.75rem" }}>
              <img
                alt={`Perrito ${currentDog.nombre}`}
                loading="lazy"
                src={currentDog.imageUrl}
                style={previewStyle}
              />
            </div>
          </div>
        ) : null}

        {isEditing ? (
          <div className="dashboard-alert">
            La fecha de ingreso se define solo al crear el perrito porque el package de update no
            permite modificarla despues.
          </div>
        ) : null}

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasDependencies ? (
          <div className="dashboard-empty-state">
            Necesitas estados, razas y sexos disponibles para completar este formulario.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
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
                  <span>Fecha de ingreso</span>
                  <input
                    className="form-control"
                    readOnly={isEditing}
                    type="date"
                    {...register("fechaIngreso", {
                      required: "La fecha de ingreso es obligatoria",
                    })}
                  />
                  {errors.fechaIngreso ? <small>{errors.fechaIngreso.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Edad</span>
                  <input
                    className="form-control"
                    min="0"
                    step="1"
                    type="number"
                    {...register("edad", {
                      required: "La edad es obligatoria",
                      min: {
                        value: 0,
                        message: "La edad no puede ser negativa",
                      },
                    })}
                  />
                  {errors.edad ? <small>{errors.edad.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Peso</span>
                  <input
                    className="form-control"
                    min="0.01"
                    step="0.01"
                    type="number"
                    {...register("peso", {
                      required: "El peso es obligatorio",
                      min: {
                        value: 0.01,
                        message: "El peso debe ser mayor que cero",
                      },
                    })}
                  />
                  {errors.peso ? <small>{errors.peso.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Estatura</span>
                  <input
                    className="form-control"
                    min="0.01"
                    step="0.01"
                    type="number"
                    {...register("estatura", {
                      required: "La estatura es obligatoria",
                      min: {
                        value: 0.01,
                        message: "La estatura debe ser mayor que cero",
                      },
                    })}
                  />
                  {errors.estatura ? <small>{errors.estatura.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Sexo</span>
                  <select
                    className="form-select"
                    {...register("idSexo", { required: "El sexo es obligatorio" })}
                  >
                    <option value="">Selecciona un sexo</option>
                    {sexOptions.map((sex) => (
                      <option key={sex.idSexo} value={sex.idSexo}>
                        {sex.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.idSexo ? <small>{errors.idSexo.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Raza</span>
                  <select
                    className="form-select"
                    {...register("idRaza", { required: "La raza es obligatoria" })}
                  >
                    <option value="">Selecciona una raza</option>
                    {breedOptions.map((breed) => (
                      <option key={breed.idRaza} value={breed.idRaza}>
                        {breed.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.idRaza ? <small>{errors.idRaza.message}</small> : null}
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
                    <input className="form-control" readOnly type="text" value="Activo (por trigger)" />
                  </label>
                )}
              </div>

              <div className="dashboard-form__actions">
                <button className="dashboard-btn dashboard-btn--primary" disabled={formDisabled} type="submit">
                  {saving
                    ? isEditing
                      ? "Guardando..."
                      : "Creando..."
                    : isEditing
                      ? "Guardar cambios"
                      : "Crear perrito"}
                </button>
                <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/perritos">
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

export default DogFormPage;
