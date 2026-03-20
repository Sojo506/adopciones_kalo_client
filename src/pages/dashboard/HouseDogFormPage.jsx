import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as catalogsApi from "../../api/catalogs";
import * as dogsApi from "../../api/dogs";
import * as fosterHomesApi from "../../api/fosterHomes";
import * as houseDogsApi from "../../api/houseDogs";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  idCasaCuna: "",
  idPerrito: "",
  idEstado: "1",
};

const buildRelationKey = (idCasaCuna, idPerrito) =>
  `${String(idCasaCuna)}:${String(idPerrito)}`;

const buildFosterHomeLabel = (fosterHome) => {
  const base = `#${fosterHome.idCasaCuna}`;
  return fosterHome.nombre ? `${base} - ${fosterHome.nombre}` : base;
};

const buildDogLabel = (dog) => {
  const base = `#${dog.idPerrito}`;
  return dog.nombre ? `${base} - ${dog.nombre}` : base;
};

const mapHouseDogToForm = (houseDog) => ({
  idCasaCuna: String(houseDog?.idCasaCuna ?? ""),
  idPerrito: String(houseDog?.idPerrito ?? ""),
  idEstado: String(houseDog?.idEstado ?? "1"),
});

const buildCreatePayload = (values) => ({
  idCasaCuna: Number(values.idCasaCuna),
  idPerrito: Number(values.idPerrito),
  idEstado: 1,
});

const buildUpdatePayload = (values) => ({
  idEstado: Number(values.idEstado),
});

const getSelectableFosterHomes = ({ fosterHomes, currentHouseDog }) => {
  return (Array.isArray(fosterHomes) ? fosterHomes : [])
    .filter(
      (fosterHome) =>
        Number(fosterHome.idEstado) === 1 ||
        Number(fosterHome.idCasaCuna) === Number(currentHouseDog?.idCasaCuna),
    )
    .sort((left, right) => left.idCasaCuna - right.idCasaCuna);
};

const getSelectableDogs = ({ dogs, houseDogs, currentHouseDog }) => {
  const currentRelationKey = currentHouseDog
    ? buildRelationKey(currentHouseDog.idCasaCuna, currentHouseDog.idPerrito)
    : null;
  const usedDogIds = new Set(
    (Array.isArray(houseDogs) ? houseDogs : [])
      .filter(
        (houseDog) =>
          Number(houseDog.idEstado) === 1 &&
          buildRelationKey(houseDog.idCasaCuna, houseDog.idPerrito) !== currentRelationKey,
      )
      .map((houseDog) => Number(houseDog.idPerrito)),
  );

  return (Array.isArray(dogs) ? dogs : [])
    .filter((dog) => {
      const isCurrent = Number(dog.idPerrito) === Number(currentHouseDog?.idPerrito);

      if (isCurrent) {
        return true;
      }

      if (Number(dog.idEstado) !== 1) {
        return false;
      }

      return !usedDogIds.has(Number(dog.idPerrito));
    })
    .sort((left, right) => left.idPerrito - right.idPerrito);
};

const HouseDogFormPage = () => {
  const { idCasaCuna, idPerrito } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [fosterHomes, setFosterHomes] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [houseDogs, setHouseDogs] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentHouseDog, setCurrentHouseDog] = useState(null);

  const isEditing = Boolean(idCasaCuna && idPerrito);

  const fosterHomeOptions = useMemo(() => {
    return getSelectableFosterHomes({
      fosterHomes,
      currentHouseDog,
    });
  }, [currentHouseDog, fosterHomes]);

  const dogOptions = useMemo(() => {
    return getSelectableDogs({
      dogs,
      houseDogs,
      currentHouseDog,
    });
  }, [currentHouseDog, dogs, houseDogs]);

  const hasRequiredData = states.length > 0 && fosterHomeOptions.length > 0 && dogOptions.length > 0;
  const formDisabled = catalogsLoading || detailLoading || saving || !hasRequiredData;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  const watchedHouseId = watch("idCasaCuna");
  const watchedDogId = watch("idPerrito");

  const selectedFosterHome = useMemo(() => {
    return (
      fosterHomeOptions.find(
        (fosterHome) => Number(fosterHome.idCasaCuna) === Number(watchedHouseId),
      ) || null
    );
  }, [fosterHomeOptions, watchedHouseId]);

  const selectedDog = useMemo(() => {
    return dogOptions.find((dog) => Number(dog.idPerrito) === Number(watchedDogId)) || null;
  }, [dogOptions, watchedDogId]);

  const hasSelectedDogConflict = useMemo(() => {
    if (!watchedDogId) {
      return false;
    }

    const currentRelationKey = currentHouseDog
      ? buildRelationKey(currentHouseDog.idCasaCuna, currentHouseDog.idPerrito)
      : null;

    return houseDogs.some(
      (houseDog) =>
        Number(houseDog.idEstado) === 1 &&
        Number(houseDog.idPerrito) === Number(watchedDogId) &&
        buildRelationKey(houseDog.idCasaCuna, houseDog.idPerrito) !== currentRelationKey,
    );
  }, [currentHouseDog, houseDogs, watchedDogId]);

  useEffect(() => {
    document.title = isEditing
      ? "Editar casa-perrito | Dashboard Kalö"
      : "Nueva casa-perrito | Dashboard Kalö";
  }, [isEditing]);

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        setCatalogsLoading(true);
        const [statesData, fosterHomesData, dogsData, houseDogsData] = await Promise.all([
          catalogsApi.getStates(),
          fosterHomesApi.getFosterHomes({ force: true }),
          dogsApi.getDogs({ force: true }),
          houseDogsApi.getHouseDogs({ force: true }),
        ]);

        const availableStates = Array.isArray(statesData) ? statesData : [];
        const availableFosterHomes = Array.isArray(fosterHomesData) ? fosterHomesData : [];
        const availableDogs = Array.isArray(dogsData) ? dogsData : [];
        const existingHouseDogs = Array.isArray(houseDogsData) ? houseDogsData : [];
        const activeState = availableStates.find((state) => Number(state.idEstado) === 1);
        const defaultFosterHome = getSelectableFosterHomes({
          fosterHomes: availableFosterHomes,
          currentHouseDog: null,
        })[0];
        const defaultDog = getSelectableDogs({
          dogs: availableDogs,
          houseDogs: existingHouseDogs,
          currentHouseDog: null,
        })[0];

        setStates(availableStates);
        setFosterHomes(availableFosterHomes);
        setDogs(availableDogs);
        setHouseDogs(existingHouseDogs);

        if (!isEditing) {
          reset({
            ...EMPTY_FORM,
            idCasaCuna: String(defaultFosterHome?.idCasaCuna ?? ""),
            idPerrito: String(defaultDog?.idPerrito ?? ""),
            idEstado: String(activeState?.idEstado ?? 1),
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar la informacion base",
          text: error?.response?.data?.message || "Intenta de nuevo en un momento.",
        });
      } finally {
        setCatalogsLoading(false);
      }
    };

    loadBaseData();
  }, [isEditing, reset]);

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const loadHouseDog = async () => {
      try {
        setDetailLoading(true);
        const detail = await houseDogsApi.getHouseDogByPk(idCasaCuna, idPerrito, {
          force: true,
        });
        setCurrentHouseDog(detail);
        reset(mapHouseDogToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar la relacion casa-perrito",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/casas-perrito");
      } finally {
        setDetailLoading(false);
      }
    };

    loadHouseDog();
  }, [idCasaCuna, idPerrito, isEditing, navigate, reset]);

  useEffect(() => {
    if (catalogsLoading || detailLoading) {
      return;
    }

    if (!fosterHomeOptions.length) {
      setValue("idCasaCuna", "", { shouldDirty: false });
    } else {
      const hasSelectedFosterHome = fosterHomeOptions.some(
        (fosterHome) => Number(fosterHome.idCasaCuna) === Number(watchedHouseId),
      );

      if (!hasSelectedFosterHome) {
        setValue("idCasaCuna", String(fosterHomeOptions[0].idCasaCuna), {
          shouldDirty: false,
        });
      }
    }

    if (!dogOptions.length) {
      setValue("idPerrito", "", { shouldDirty: false });
      return;
    }

    const hasSelectedDog = dogOptions.some((dog) => Number(dog.idPerrito) === Number(watchedDogId));

    if (!hasSelectedDog) {
      setValue("idPerrito", String(dogOptions[0].idPerrito), {
        shouldDirty: false,
      });
    }
  }, [
    catalogsLoading,
    detailLoading,
    dogOptions,
    fosterHomeOptions,
    setValue,
    watchedDogId,
    watchedHouseId,
  ]);

  const onSubmit = async (values) => {
    if (!isAdmin || !hasRequiredData) {
      return;
    }

    try {
      setSaving(true);

      if (isEditing) {
        await houseDogsApi.updateHouseDog(idCasaCuna, idPerrito, buildUpdatePayload(values));
      } else {
        await houseDogsApi.createHouseDog(buildCreatePayload(values));
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Relacion actualizada" : "Relacion creada",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "La relacion casa-perrito fue creada correctamente.",
      });

      navigate("/dashboard/casas-perrito");
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
          <h1>Casa-perrito</h1>
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
            {isEditing ? "Editar relacion" : "Nueva relacion"}
          </p>
          <h1>{isEditing ? "Actualizar casa-perrito" : "Crear casa-perrito"}</h1>
          <p className="dashboard-page__lede">
            Asigna un perrito a una casa cuna y controla el estado de esa relacion temporal.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/casas-perrito">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Las relaciones nuevas siempre inician activas. Si la relacion ya existe inactiva,
          editala y reactivala en lugar de crearla de nuevo.
        </div>

        <div className="dashboard-alert">
          Solo se muestran perritos disponibles para asignacion activa. Las casas cuna pueden tener
          varios perritos, pero un perrito no puede quedar activo en dos casas cuna al mismo
          tiempo.
        </div>

        {selectedFosterHome && Number(selectedFosterHome.idEstado) !== 1 ? (
          <div className="dashboard-alert">
            La casa cuna actual esta inactiva. Solo podras guardar la relacion en estado inactivo
            hasta reactivar la casa cuna.
          </div>
        ) : null}

        {selectedDog && Number(selectedDog.idEstado) !== 1 ? (
          <div className="dashboard-alert">
            El perrito actual esta inactivo. Solo podras guardar la relacion en estado inactivo
            hasta reactivar el perrito.
          </div>
        ) : null}

        {hasSelectedDogConflict ? (
          <div className="dashboard-alert">
            El perrito actual ya tiene otra asignacion activa en casa-perrito. Puedes dejar esta
            relacion inactiva, pero no reactivarla hasta liberar la otra asignacion.
          </div>
        ) : null}

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasRequiredData ? (
          <div className="dashboard-empty-state">
            Necesitas estados, casas cuna y perritos disponibles para completar este formulario.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              <div className="dashboard-form-grid">
                <label className="dashboard-input">
                  <span>Casa cuna</span>
                  <select
                    className="form-select"
                    disabled={isEditing}
                    {...register("idCasaCuna", {
                      required: "La casa cuna es obligatoria",
                    })}
                  >
                    <option value="">Selecciona una casa cuna</option>
                    {fosterHomeOptions.map((fosterHome) => (
                      <option key={fosterHome.idCasaCuna} value={fosterHome.idCasaCuna}>
                        {buildFosterHomeLabel(fosterHome)}
                      </option>
                    ))}
                  </select>
                  {errors.idCasaCuna ? <small>{errors.idCasaCuna.message}</small> : null}
                </label>

                <label className="dashboard-input dashboard-input--full">
                  <span>Perrito</span>
                  <select
                    className="form-select"
                    disabled={isEditing}
                    {...register("idPerrito", {
                      required: "El perrito es obligatorio",
                    })}
                  >
                    <option value="">Selecciona un perrito</option>
                    {dogOptions.map((dog) => (
                      <option key={dog.idPerrito} value={dog.idPerrito}>
                        {buildDogLabel(dog)}
                      </option>
                    ))}
                  </select>
                  {errors.idPerrito ? <small>{errors.idPerrito.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Estado</span>
                  <select
                    className="form-select"
                    disabled={!isEditing}
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
            </fieldset>

            {selectedFosterHome ? (
              <p className="dashboard-muted">
                Casa cuna seleccionada: {buildFosterHomeLabel(selectedFosterHome)}.
              </p>
            ) : null}

            {selectedDog ? (
              <p className="dashboard-muted">
                Perrito seleccionado: {buildDogLabel(selectedDog)}.
              </p>
            ) : null}

            <div className="dashboard-form__actions">
              <button className="dashboard-btn dashboard-btn--primary" disabled={saving} type="submit">
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear relacion"}
              </button>
              <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/casas-perrito">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default HouseDogFormPage;
