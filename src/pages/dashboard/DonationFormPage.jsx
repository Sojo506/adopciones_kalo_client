import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as campaignsApi from "../../api/campaigns";
import * as catalogsApi from "../../api/catalogs";
import * as donationsApi from "../../api/donations";
import * as usersApi from "../../api/users";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  identificacion: "",
  idCampania: "",
  monto: "",
  fechaDonacion: "",
  mensaje: "",
  idEstado: "",
};

const previewStyle = {
  width: "180px",
  height: "180px",
  borderRadius: "28px",
  objectFit: "cover",
  display: "block",
};

const amountFormatter = new Intl.NumberFormat("es-CR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

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

const formatDate = (value) => {
  if (!value) {
    return "Sin fecha";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("es-CR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const buildFullName = (user) =>
  [user?.nombre, user?.apellidoPaterno, user?.apellidoMaterno].filter(Boolean).join(" ");

const mapDonationToForm = (donation) => ({
  identificacion: String(donation?.identificacion ?? ""),
  idCampania: String(donation?.idCampania ?? ""),
  monto:
    donation?.monto === null || donation?.monto === undefined ? "" : String(Number(donation.monto)),
  fechaDonacion: toDateInputValue(donation?.fechaDonacion),
  mensaje: donation?.mensaje ?? "",
  idEstado: String(donation?.idEstado ?? ""),
});

const buildPayload = (values, isEditing) => ({
  identificacion: Number(values.identificacion),
  idCampania: Number(values.idCampania),
  monto: Number(values.monto),
  fechaDonacion: values.fechaDonacion,
  mensaje: values.mensaje.trim(),
  idEstado: isEditing ? Number(values.idEstado) : Number(values.idEstado || 1),
});

const DonationFormPage = () => {
  const { idDonacion } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [users, setUsers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentDonation, setCurrentDonation] = useState(null);

  const isEditing = Boolean(idDonacion);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  const watchedCampaignId = watch("idCampania");
  const watchedAmount = watch("monto");
  const selectedCampaign = useMemo(() => {
    return campaigns.find((campaign) => Number(campaign.idCampania) === Number(watchedCampaignId)) || null;
  }, [campaigns, watchedCampaignId]);

  const activeStateLabel = useMemo(() => {
    return states.find((state) => Number(state.idEstado) === 1)?.nombre || "Activo";
  }, [states]);

  const userOptions = useMemo(() => {
    return users.filter(
      (candidate) =>
        Number(candidate.idEstado) === 1 ||
        Number(candidate.identificacion) === Number(currentDonation?.identificacion),
    );
  }, [currentDonation?.identificacion, users]);

  const campaignOptions = useMemo(() => {
    return campaigns.filter(
      (campaign) =>
        Number(campaign.idEstado) === 1 ||
        Number(campaign.idCampania) === Number(currentDonation?.idCampania),
    );
  }, [campaigns, currentDonation?.idCampania]);

  const hasRequiredData =
    states.length > 0 && userOptions.length > 0 && campaignOptions.length > 0;
  const formDisabled = catalogsLoading || detailLoading || saving || !hasRequiredData;

  useEffect(() => {
    document.title = isEditing ? "Editar donacion | Dashboard Kalö" : "Nueva donacion | Dashboard Kalö";
  }, [isEditing]);

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        setCatalogsLoading(true);
        const [statesData, usersData, campaignsData] = await Promise.all([
          catalogsApi.getStates(),
          usersApi.getUsers({ force: true }),
          campaignsApi.getCampaigns({ force: true }),
        ]);

        const availableStates = Array.isArray(statesData) ? statesData : [];
        const availableUsers = Array.isArray(usersData) ? usersData : [];
        const availableCampaigns = Array.isArray(campaignsData) ? campaignsData : [];
        const activeState = availableStates.find((state) => Number(state.idEstado) === 1);
        const firstActiveUser = availableUsers.find((user) => Number(user.idEstado) === 1);
        const firstActiveCampaign = availableCampaigns.find((campaign) => Number(campaign.idEstado) === 1);

        setStates(availableStates);
        setUsers(availableUsers);
        setCampaigns(availableCampaigns);

        if (!isEditing) {
          reset({
            ...EMPTY_FORM,
            identificacion: String(firstActiveUser?.identificacion ?? ""),
            idCampania: String(firstActiveCampaign?.idCampania ?? ""),
            fechaDonacion: toDateInputValue(new Date()),
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

    const loadDonation = async () => {
      try {
        setDetailLoading(true);
        const detail = await donationsApi.getDonationById(idDonacion, { force: true });
        setCurrentDonation(detail);
        reset(mapDonationToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar la donacion",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/donaciones");
      } finally {
        setDetailLoading(false);
      }
    };

    loadDonation();
  }, [idDonacion, isEditing, navigate, reset]);

  const onSubmit = async (values) => {
    if (!isAdmin || !hasRequiredData) {
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload(values, isEditing);

      if (isEditing) {
        await donationsApi.updateDonation(idDonacion, payload);
      } else {
        await donationsApi.createDonation(payload);
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Donacion actualizada" : "Donacion creada",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "La donacion fue creada correctamente.",
      });

      navigate("/dashboard/donaciones");
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
          <h1>Donaciones</h1>
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
          <p className="dashboard-page__eyebrow">{isEditing ? "Editar donacion" : "Nueva donacion"}</p>
          <h1>{isEditing ? "Actualizar donacion" : "Crear donacion"}</h1>
          <p className="dashboard-page__lede">
            Registra el donador, la campania destino, el monto, la fecha, el mensaje y el estado de
            cada aporte.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/donaciones">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Solo se muestran usuarios y campanias activas al crear una donacion nueva. Si la donacion
          ya existe, sus relaciones actuales se mantienen disponibles aunque luego se desactiven.
        </div>

        {selectedCampaign?.imageUrl ? (
          <div className="dashboard-alert">
            <strong>Campania seleccionada:</strong>
            <div style={{ marginTop: "0.75rem" }}>
              <img
                alt={selectedCampaign.nombre ? `Campania ${selectedCampaign.nombre}` : "Campania seleccionada"}
                loading="lazy"
                src={selectedCampaign.imageUrl}
                style={previewStyle}
              />
            </div>
            <div style={{ marginTop: "0.75rem" }}>
              <strong>{selectedCampaign.nombre}</strong>
              <div className="dashboard-muted">
                Vigencia: {formatDate(selectedCampaign.fechaInicio)} al {formatDate(selectedCampaign.fechaFin)}
              </div>
            </div>
          </div>
        ) : null}

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasRequiredData ? (
          <div className="dashboard-empty-state">
            No hay usuarios, campanias o estados disponibles para completar este formulario.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              <div className="dashboard-form-grid">
                <label className="dashboard-input">
                  <span>Donador</span>
                  <select
                    className="form-select"
                    {...register("identificacion", { required: "El donador es obligatorio" })}
                  >
                    <option value="">Selecciona un donador</option>
                    {userOptions.map((candidate) => (
                      <option key={candidate.identificacion} value={candidate.identificacion}>
                        {candidate.identificacion} - {buildFullName(candidate) || "Usuario sin nombre"}
                      </option>
                    ))}
                  </select>
                  {errors.identificacion ? <small>{errors.identificacion.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Campania</span>
                  <select
                    className="form-select"
                    {...register("idCampania", { required: "La campania es obligatoria" })}
                  >
                    <option value="">Selecciona una campania</option>
                    {campaignOptions.map((campaign) => (
                      <option key={campaign.idCampania} value={campaign.idCampania}>
                        #{campaign.idCampania} - {campaign.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.idCampania ? <small>{errors.idCampania.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Monto</span>
                  <input
                    className="form-control"
                    inputMode="decimal"
                    step="0.01"
                    type="number"
                    {...register("monto", {
                      required: "El monto es obligatorio",
                      validate: (value) =>
                        Number(value) > 0 || "El monto debe ser mayor que cero",
                    })}
                  />
                  <small>
                    Monto actual: {watchedAmount ? amountFormatter.format(Number(watchedAmount)) : "0.00"}
                  </small>
                  {errors.monto ? <small>{errors.monto.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Fecha de la donacion</span>
                  <input
                    className="form-control"
                    type="date"
                    {...register("fechaDonacion", {
                      required: "La fecha de la donacion es obligatoria",
                    })}
                  />
                  {errors.fechaDonacion ? <small>{errors.fechaDonacion.message}</small> : null}
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
                    <input className="form-control" disabled readOnly value={activeStateLabel} />
                    <small>Las donaciones nuevas se crean activas por defecto en este formulario.</small>
                  </label>
                )}
              </div>

              <label className="dashboard-input">
                <span>Mensaje</span>
                <textarea
                  className="form-control"
                  rows={5}
                  {...register("mensaje", {
                    maxLength: {
                      value: 500,
                      message: "El mensaje no puede superar 500 caracteres",
                    },
                  })}
                />
                {errors.mensaje ? <small>{errors.mensaje.message}</small> : null}
              </label>
            </fieldset>

            <div className="dashboard-form__actions">
              <button className="dashboard-btn dashboard-btn--primary" disabled={saving} type="submit">
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear donacion"}
              </button>
              <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/donaciones">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default DonationFormPage;
