import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as addressesApi from "../../api/addresses";
import * as cantonsApi from "../../api/cantons";
import * as catalogsApi from "../../api/catalogs";
import * as countriesApi from "../../api/countries";
import * as districtsApi from "../../api/districts";
import * as provincesApi from "../../api/provinces";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  idPais: "",
  idProvincia: "",
  idCanton: "",
  idDistrito: "",
  calle: "",
  numero: "",
  idEstado: "",
};

const mapAddressToForm = (address) => ({
  idPais: String(address?.idPais ?? ""),
  idProvincia: String(address?.idProvincia ?? ""),
  idCanton: String(address?.idCanton ?? ""),
  idDistrito: String(address?.idDistrito ?? ""),
  calle: address?.calle ?? "",
  numero: address?.numero ?? "",
  idEstado: String(address?.idEstado ?? ""),
});

const buildPayload = (values) => ({
  idDistrito: Number(values.idDistrito),
  calle: values.calle.trim(),
  numero: values.numero.trim(),
  idEstado: Number(values.idEstado),
});

const AddressFormPage = () => {
  const { idDireccion } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cantons, setCantons] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(idDireccion);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  const watchedCountry = watch("idPais");
  const watchedProvince = watch("idProvincia");
  const watchedCanton = watch("idCanton");

  const filteredProvinces = useMemo(
    () =>
      provinces.filter((province) => Number(province.idPais) === Number(watchedCountry || 0)),
    [provinces, watchedCountry],
  );

  const filteredCantons = useMemo(
    () =>
      cantons.filter((canton) => Number(canton.idProvincia) === Number(watchedProvince || 0)),
    [cantons, watchedProvince],
  );

  const filteredDistricts = useMemo(
    () =>
      districts.filter((district) => Number(district.idCanton) === Number(watchedCanton || 0)),
    [districts, watchedCanton],
  );

  const hasRequiredData =
    states.length > 0 &&
    countries.length > 0 &&
    filteredProvinces.length > 0 &&
    filteredCantons.length > 0 &&
    filteredDistricts.length > 0;

  const formDisabled = catalogsLoading || detailLoading || saving || !hasRequiredData;

  useEffect(() => {
    document.title = isEditing
      ? "Editar direccion | Dashboard Kalo"
      : "Nueva direccion | Dashboard Kalo";
  }, [isEditing]);

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        setCatalogsLoading(true);
        const [statesData, countriesData, provincesData, cantonsData, districtsData] = await Promise.all([
          catalogsApi.getStates(),
          countriesApi.getCountries({ force: true }),
          provincesApi.getProvinces({ force: true }),
          cantonsApi.getCantons({ force: true }),
          districtsApi.getDistricts({ force: true }),
        ]);

        const availableStates = Array.isArray(statesData) ? statesData : [];
        const availableCountries = Array.isArray(countriesData) ? countriesData : [];
        const availableProvinces = Array.isArray(provincesData) ? provincesData : [];
        const availableCantons = Array.isArray(cantonsData) ? cantonsData : [];
        const availableDistricts = Array.isArray(districtsData) ? districtsData : [];

        setStates(availableStates);
        setCountries(availableCountries);
        setProvinces(availableProvinces);
        setCantons(availableCantons);
        setDistricts(availableDistricts);

        if (!isEditing) {
          const activeState = availableStates.find((state) => Number(state.idEstado) === 1);
          const activeCountry = availableCountries.find((country) => Number(country.idEstado) === 1);
          const availableCountryId =
            activeCountry?.idPais ?? availableCountries?.[0]?.idPais ?? "";
          const availableProvince =
            availableProvinces.find(
              (province) =>
                Number(province.idPais) === Number(availableCountryId) &&
                Number(province.idEstado) === 1,
            ) ??
            availableProvinces.find(
              (province) => Number(province.idPais) === Number(availableCountryId),
            );
          const availableCanton =
            availableCantons.find(
              (canton) =>
                Number(canton.idProvincia) === Number(availableProvince?.idProvincia) &&
                Number(canton.idEstado) === 1,
            ) ??
            availableCantons.find(
              (canton) => Number(canton.idProvincia) === Number(availableProvince?.idProvincia),
            );
          const availableDistrict =
            availableDistricts.find(
              (district) =>
                Number(district.idCanton) === Number(availableCanton?.idCanton) &&
                Number(district.idEstado) === 1,
            ) ??
            availableDistricts.find(
              (district) => Number(district.idCanton) === Number(availableCanton?.idCanton),
            );

          reset({
            ...EMPTY_FORM,
            idPais: String(availableCountryId),
            idProvincia: String(availableProvince?.idProvincia ?? ""),
            idCanton: String(availableCanton?.idCanton ?? ""),
            idDistrito: String(availableDistrict?.idDistrito ?? ""),
            idEstado: String(activeState?.idEstado ?? availableStates?.[0]?.idEstado ?? ""),
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

    const loadAddress = async () => {
      try {
        setDetailLoading(true);
        const detail = await addressesApi.getAddressById(idDireccion, { force: true });
        reset(mapAddressToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar la direccion",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/direcciones");
      } finally {
        setDetailLoading(false);
      }
    };

    loadAddress();
  }, [idDireccion, isEditing, navigate, reset]);

  const handleCountryChange = (event) => {
    setValue("idPais", event.target.value);
    setValue("idProvincia", "");
    setValue("idCanton", "");
    setValue("idDistrito", "");
  };

  const handleProvinceChange = (event) => {
    setValue("idProvincia", event.target.value);
    setValue("idCanton", "");
    setValue("idDistrito", "");
  };

  const handleCantonChange = (event) => {
    setValue("idCanton", event.target.value);
    setValue("idDistrito", "");
  };

  const onSubmit = async (values) => {
    if (!isAdmin || !hasRequiredData) {
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload(values);

      if (isEditing) {
        await addressesApi.updateAddress(idDireccion, payload);
      } else {
        await addressesApi.createAddress(payload);
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Direccion actualizada" : "Direccion creada",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "La direccion fue creada correctamente.",
      });

      navigate("/dashboard/direcciones");
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
          <h1>Direcciones</h1>
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
            {isEditing ? "Editar direccion" : "Nueva direccion"}
          </p>
          <h1>{isEditing ? "Actualizar direccion" : "Crear direccion"}</h1>
          <p className="dashboard-page__lede">
            Define la jerarquia geografica completa, la calle, el numero y el estado operativo.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/direcciones">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !states.length || !countries.length ? (
          <div className="dashboard-empty-state">
            Debe existir al menos un estado y una jerarquia de ubicacion para gestionar este modulo.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              <div className="dashboard-form-grid">
                <label className="dashboard-input">
                  <span>Pais</span>
                  <select
                    className="form-select"
                    {...register("idPais", { required: "El pais es obligatorio" })}
                    onChange={handleCountryChange}
                  >
                    <option value="">Selecciona un pais</option>
                    {countries.map((country) => (
                      <option key={country.idPais} value={country.idPais}>
                        {country.nombre} ({country.estado || "-"})
                      </option>
                    ))}
                  </select>
                  {errors.idPais ? <small>{errors.idPais.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Provincia</span>
                  <select
                    className="form-select"
                    {...register("idProvincia", { required: "La provincia es obligatoria" })}
                    onChange={handleProvinceChange}
                  >
                    <option value="">Selecciona una provincia</option>
                    {filteredProvinces.map((province) => (
                      <option key={province.idProvincia} value={province.idProvincia}>
                        {province.nombre} ({province.estado || "-"})
                      </option>
                    ))}
                  </select>
                  {errors.idProvincia ? <small>{errors.idProvincia.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Canton</span>
                  <select
                    className="form-select"
                    {...register("idCanton", { required: "El canton es obligatorio" })}
                    onChange={handleCantonChange}
                  >
                    <option value="">Selecciona un canton</option>
                    {filteredCantons.map((canton) => (
                      <option key={canton.idCanton} value={canton.idCanton}>
                        {canton.nombre} ({canton.estado || "-"})
                      </option>
                    ))}
                  </select>
                  {errors.idCanton ? <small>{errors.idCanton.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Distrito</span>
                  <select
                    className="form-select"
                    {...register("idDistrito", { required: "El distrito es obligatorio" })}
                  >
                    <option value="">Selecciona un distrito</option>
                    {filteredDistricts.map((district) => (
                      <option key={district.idDistrito} value={district.idDistrito}>
                        {district.nombre} ({district.estado || "-"})
                      </option>
                    ))}
                  </select>
                  {errors.idDistrito ? <small>{errors.idDistrito.message}</small> : null}
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

                <label className="dashboard-input">
                  <span>Calle</span>
                  <input
                    className="form-control"
                    {...register("calle", {
                      maxLength: {
                        value: 100,
                        message: "La calle no puede superar 100 caracteres",
                      },
                    })}
                  />
                  {errors.calle ? <small>{errors.calle.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Numero</span>
                  <input
                    className="form-control"
                    {...register("numero", {
                      maxLength: {
                        value: 100,
                        message: "El numero no puede superar 100 caracteres",
                      },
                    })}
                  />
                  {errors.numero ? <small>{errors.numero.message}</small> : null}
                </label>
              </div>
            </fieldset>

            <div className="dashboard-form__actions">
              <button className="dashboard-btn dashboard-btn--primary" disabled={saving} type="submit">
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear direccion"}
              </button>
              <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/direcciones">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default AddressFormPage;
