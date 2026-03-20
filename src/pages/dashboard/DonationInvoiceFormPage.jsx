import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as catalogsApi from "../../api/catalogs";
import * as donationInvoicesApi from "../../api/donationInvoices";
import * as donationsApi from "../../api/donations";
import * as invoicesApi from "../../api/invoices";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  idDonacion: "",
  idFactura: "",
  idEstado: "1",
};

const amountFormatter = new Intl.NumberFormat("es-CR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatMoney = (amount, symbol) => {
  const formattedAmount = amountFormatter.format(Number(amount || 0));
  return symbol ? `${symbol} ${formattedAmount}` : formattedAmount;
};

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
  }).format(date);
};

const formatDateTime = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const buildDonationLabel = (donation) => {
  const donorLabel = donation?.donador || donation?.identificacion || "Donacion sin donador";
  const campaignLabel = donation?.campania || "Sin campania";
  return `#${donation.idDonacion} - ${donorLabel} - ${campaignLabel} - ${formatMoney(donation.monto)}`;
};

const buildInvoiceLabel = (invoice) => {
  const amountLabel = formatMoney(invoice?.total, invoice?.simbolo);
  return `${invoice?.idFactura} - ${invoice?.moneda || "Sin moneda"} - ${amountLabel}`;
};

const mapDonationInvoiceToForm = (donationInvoice) => ({
  idDonacion: String(donationInvoice?.idDonacion ?? ""),
  idFactura: String(donationInvoice?.idFactura ?? ""),
  idEstado: String(donationInvoice?.idEstado ?? "1"),
});

const buildCreatePayload = (values) => ({
  idDonacion: Number(values.idDonacion),
  idFactura: String(values.idFactura),
  idEstado: 1,
});

const buildUpdatePayload = (values) => ({
  idEstado: Number(values.idEstado),
});

const DonationInvoiceFormPage = () => {
  const { idDonacion, idFactura } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [donations, setDonations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentDonationInvoice, setCurrentDonationInvoice] = useState(null);

  const isEditing = Boolean(idDonacion && idFactura);

  const donationOptions = useMemo(() => {
    return donations.filter(
      (donation) =>
        Number(donation.idEstado) === 1 ||
        Number(donation.idDonacion) === Number(currentDonationInvoice?.idDonacion),
    );
  }, [currentDonationInvoice?.idDonacion, donations]);

  const invoiceOptions = useMemo(() => {
    return invoices.filter(
      (invoice) =>
        Number(invoice.idEstado) === 1 ||
        String(invoice.idFactura) === String(currentDonationInvoice?.idFactura),
    );
  }, [currentDonationInvoice?.idFactura, invoices]);

  const hasRequiredData =
    states.length > 0 && donationOptions.length > 0 && invoiceOptions.length > 0;
  const formDisabled = catalogsLoading || detailLoading || saving || !hasRequiredData;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  const watchedDonationId = watch("idDonacion");
  const watchedInvoiceId = watch("idFactura");

  const selectedDonation = useMemo(() => {
    return donationOptions.find((donation) => Number(donation.idDonacion) === Number(watchedDonationId)) || null;
  }, [donationOptions, watchedDonationId]);

  const selectedInvoice = useMemo(() => {
    return invoiceOptions.find((invoice) => String(invoice.idFactura) === String(watchedInvoiceId)) || null;
  }, [invoiceOptions, watchedInvoiceId]);

  useEffect(() => {
    document.title = isEditing
      ? "Editar donacion-factura | Dashboard Kalo"
      : "Nueva donacion-factura | Dashboard Kalo";
  }, [isEditing]);

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        setCatalogsLoading(true);
        const [statesData, donationsData, invoicesData] = await Promise.all([
          catalogsApi.getStates(),
          donationsApi.getDonations({ force: true }),
          invoicesApi.getInvoices({ force: true }),
        ]);

        const availableStates = Array.isArray(statesData) ? statesData : [];
        const availableDonations = Array.isArray(donationsData) ? donationsData : [];
        const availableInvoices = Array.isArray(invoicesData) ? invoicesData : [];
        const activeState = availableStates.find((state) => Number(state.idEstado) === 1);
        const activeDonation = availableDonations.find((donation) => Number(donation.idEstado) === 1);
        const activeInvoice = availableInvoices.find((invoice) => Number(invoice.idEstado) === 1);

        setStates(availableStates);
        setDonations(availableDonations);
        setInvoices(availableInvoices);

        if (!isEditing) {
          reset({
            ...EMPTY_FORM,
            idDonacion: String(activeDonation?.idDonacion ?? ""),
            idFactura: String(activeInvoice?.idFactura ?? ""),
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

    const loadDonationInvoice = async () => {
      try {
        setDetailLoading(true);
        const detail = await donationInvoicesApi.getDonationInvoiceByPk(idDonacion, idFactura, {
          force: true,
        });
        setCurrentDonationInvoice(detail);
        reset(mapDonationInvoiceToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar la relacion donacion-factura",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/donaciones-factura");
      } finally {
        setDetailLoading(false);
      }
    };

    loadDonationInvoice();
  }, [idDonacion, idFactura, isEditing, navigate, reset]);

  const onSubmit = async (values) => {
    if (!isAdmin || !hasRequiredData) {
      return;
    }

    try {
      setSaving(true);

      if (isEditing) {
        await donationInvoicesApi.updateDonationInvoice(
          idDonacion,
          idFactura,
          buildUpdatePayload(values),
        );
      } else {
        await donationInvoicesApi.createDonationInvoice(buildCreatePayload(values));
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Relacion actualizada" : "Relacion creada",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "La relacion donacion-factura fue creada correctamente.",
      });

      navigate("/dashboard/donaciones-factura");
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
          <h1>Donaciones-factura</h1>
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
          <h1>{isEditing ? "Actualizar donacion-factura" : "Crear donacion-factura"}</h1>
          <p className="dashboard-page__lede">
            Vincula una donacion con una factura existente. La factura recalcula sus montos cuando la
            relacion se crea, se desactiva o cambia de estado.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/donaciones-factura">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Solo se muestran donaciones y facturas activas al crear una relacion nueva. Si estas
          editando, se conserva la relacion actual aunque alguno de los dos registros haya quedado
          inactivo despues. El estado inicial siempre sera Activo.
        </div>

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasRequiredData ? (
          <div className="dashboard-empty-state">
            Debe existir al menos una donacion activa, una factura activa y estados disponibles para
            completar este formulario.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              <div className="dashboard-form-grid">
                <label className="dashboard-input">
                  <span>Donacion</span>
                  <select
                    className="form-select"
                    disabled={isEditing || formDisabled}
                    {...register("idDonacion", { required: "La donacion es obligatoria" })}
                  >
                    <option value="">Selecciona una donacion</option>
                    {donationOptions.map((donation) => (
                      <option key={donation.idDonacion} value={donation.idDonacion}>
                        {buildDonationLabel(donation)}
                      </option>
                    ))}
                  </select>
                  {errors.idDonacion ? <small>{errors.idDonacion.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Factura</span>
                  <select
                    className="form-select"
                    disabled={isEditing || formDisabled}
                    {...register("idFactura", { required: "La factura es obligatoria" })}
                  >
                    <option value="">Selecciona una factura</option>
                    {invoiceOptions.map((invoice) => (
                      <option key={invoice.idFactura} value={invoice.idFactura}>
                        {buildInvoiceLabel(invoice)}
                      </option>
                    ))}
                  </select>
                  {errors.idFactura ? <small>{errors.idFactura.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Donador</span>
                  <input
                    className="form-control"
                    readOnly
                    type="text"
                    value={selectedDonation?.donador || selectedDonation?.identificacion || ""}
                  />
                </label>

                <label className="dashboard-input">
                  <span>Campania</span>
                  <input
                    className="form-control"
                    readOnly
                    type="text"
                    value={selectedDonation?.campania || ""}
                  />
                </label>

                <label className="dashboard-input">
                  <span>Monto de la donacion</span>
                  <input
                    className="form-control"
                    readOnly
                    type="text"
                    value={formatMoney(selectedDonation?.monto)}
                  />
                </label>

                <label className="dashboard-input">
                  <span>Fecha de la donacion</span>
                  <input
                    className="form-control"
                    readOnly
                    type="text"
                    value={formatDate(selectedDonation?.fechaDonacion)}
                  />
                </label>

                <label className="dashboard-input">
                  <span>Total actual de la factura</span>
                  <input
                    className="form-control"
                    readOnly
                    type="text"
                    value={formatMoney(selectedInvoice?.total, selectedInvoice?.simbolo)}
                  />
                  <small>Este valor puede cambiar despues de guardar la relacion.</small>
                </label>

                <label className="dashboard-input">
                  <span>Fecha de la factura</span>
                  <input
                    className="form-control"
                    readOnly
                    type="text"
                    value={formatDateTime(selectedInvoice?.fechaFactura)}
                  />
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
                    <small>La relacion se crea activa por defecto desde este formulario.</small>
                  </label>
                )}
              </div>
            </fieldset>

            <div className="dashboard-form__actions">
              <button className="dashboard-btn dashboard-btn--primary" disabled={saving} type="submit">
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear relacion"}
              </button>
              <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/donaciones-factura">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default DonationInvoiceFormPage;
