import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as catalogsApi from "../../api/catalogs";
import * as inventoriesApi from "../../api/inventories";
import * as inventoryMovementsApi from "../../api/inventoryMovements";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  idProducto: "",
  idTipoMovimiento: "",
  cantidad: "1",
  fechaMovimiento: "",
  idEstado: "",
};

const MOVEMENT_DIRECTION_KEYWORDS = {
  ingreso: ["ingreso", "entrada", "reposicion", "abastecimiento", "ajustepositivo"],
  egreso: ["egreso", "salida", "venta", "ajustenegativo"],
};

const pad = (value) => String(value).padStart(2, "0");

const formatDateTimeLocal = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const mapMovementToForm = (movement) => ({
  idProducto: String(movement?.idProducto ?? ""),
  idTipoMovimiento: String(movement?.idTipoMovimiento ?? ""),
  cantidad: String(movement?.cantidad ?? 1),
  fechaMovimiento: formatDateTimeLocal(movement?.fechaMovimiento),
  idEstado: String(movement?.idEstado ?? ""),
});

const buildPayload = (values) => ({
  idProducto: Number(values.idProducto),
  idTipoMovimiento: Number(values.idTipoMovimiento),
  cantidad: Number(values.cantidad),
  fechaMovimiento: values.fechaMovimiento ? new Date(values.fechaMovimiento).toISOString() : null,
  idEstado: Number(values.idEstado),
});

const normalizeKeyword = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const resolveDirection = (movementTypeName) => {
  const normalizedName = normalizeKeyword(movementTypeName);

  if (MOVEMENT_DIRECTION_KEYWORDS.ingreso.some((keyword) => normalizedName.includes(keyword))) {
    return "ingreso";
  }

  if (MOVEMENT_DIRECTION_KEYWORDS.egreso.some((keyword) => normalizedName.includes(keyword))) {
    return "egreso";
  }

  return null;
};

const InventoryMovementFormPage = () => {
  const { idMovimiento } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [inventories, setInventories] = useState([]);
  const [movementTypes, setMovementTypes] = useState([]);
  const [states, setStates] = useState([]);
  const [currentMovement, setCurrentMovement] = useState(null);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(idMovimiento);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  const watchedMovementTypeId = watch("idTipoMovimiento");
  const watchedStateId = Number(watch("idEstado") || 0);
  const watchedQuantity = Number(watch("cantidad") || 0);

  const movementTypeOptions = useMemo(() => {
    if (!currentMovement) {
      return movementTypes;
    }

    const alreadyExists = movementTypes.some(
      (movementType) =>
        Number(movementType.idTipoMovimiento) === Number(currentMovement.idTipoMovimiento)
    );

    if (alreadyExists) {
      return movementTypes;
    }

    return [
      ...movementTypes,
      {
        idTipoMovimiento: currentMovement.idTipoMovimiento,
        nombre: currentMovement.tipoMovimiento,
        idEstado: currentMovement.idEstado,
        estado: currentMovement.estado,
      },
    ];
  }, [currentMovement, movementTypes]);

  const selectedMovementType = useMemo(() => {
    return movementTypeOptions.find(
      (movementType) => Number(movementType.idTipoMovimiento) === Number(watchedMovementTypeId)
    );
  }, [movementTypeOptions, watchedMovementTypeId]);

  const selectedDirection = resolveDirection(selectedMovementType?.nombre);

  useEffect(() => {
    document.title = isEditing
      ? "Editar movimiento de inventario | Dashboard Kalö"
      : "Nuevo movimiento de inventario | Dashboard Kalö";
  }, [isEditing]);

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        setCatalogsLoading(true);
        const [inventoriesData, movementTypesData, statesData] = await Promise.all([
          inventoriesApi.getInventories({ force: true }),
          inventoryMovementsApi.getInventoryMovementTypes({ force: true }),
          catalogsApi.getStates(),
        ]);

        const availableInventories = Array.isArray(inventoriesData) ? inventoriesData : [];
        const availableMovementTypes = Array.isArray(movementTypesData) ? movementTypesData : [];
        const availableStates = Array.isArray(statesData) ? statesData : [];
        const activeState = availableStates.find((state) => Number(state.idEstado) === 1);
        const firstInventory = availableInventories[0];
        const firstMovementType = availableMovementTypes[0];

        setInventories(availableInventories);
        setMovementTypes(availableMovementTypes);
        setStates(availableStates);

        if (!isEditing) {
          reset({
            ...EMPTY_FORM,
            idProducto: String(firstInventory?.idProducto ?? ""),
            idTipoMovimiento: String(firstMovementType?.idTipoMovimiento ?? ""),
            cantidad: "1",
            fechaMovimiento: formatDateTimeLocal(new Date()),
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

    const loadMovement = async () => {
      try {
        setDetailLoading(true);
        const detail = await inventoryMovementsApi.getInventoryMovementById(idMovimiento, {
          force: true,
        });

        setCurrentMovement(detail);
        reset(mapMovementToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar el movimiento",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/movimientos-inventario");
      } finally {
        setDetailLoading(false);
      }
    };

    loadMovement();
  }, [idMovimiento, isEditing, navigate, reset]);

  const onSubmit = async (values) => {
    if (!isAdmin) {
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload(values);

      if (isEditing) {
        await inventoryMovementsApi.updateInventoryMovement(idMovimiento, payload);
      } else {
        await inventoryMovementsApi.createInventoryMovement(payload);
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Movimiento actualizado" : "Movimiento creado",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "El movimiento fue creado correctamente.",
      });

      navigate("/dashboard/movimientos-inventario");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos guardar el movimiento",
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
          <h1>Movimientos de inventario</h1>
          <p className="dashboard-page__lede">
            Solo un administrador puede crear o actualizar esta informacion.
          </p>
        </section>
      </div>
    );
  }

  const hasDependencies =
    states.length > 0 && movementTypeOptions.length > 0 && (isEditing || inventories.length > 0);
  const formDisabled = catalogsLoading || detailLoading || saving || !hasDependencies;

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header mt-4">
        <div>
          <p className="dashboard-page__eyebrow">
            {isEditing ? "Editar movimiento" : "Nuevo movimiento"}
          </p>
          <h1>{isEditing ? "Actualizar movimiento de inventario" : "Crear movimiento de inventario"}</h1>
          <p className="dashboard-page__lede">
            Registra entradas y salidas ligadas a un producto con inventario existente. El backend
            recalcula automaticamente la cantidad del inventario segun el tipo de movimiento.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/movimientos-inventario">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          El movimiento queda asociado al mismo producto durante toda su vida util para no alterar
          el historial del inventario.
        </div>

        {watchedStateId !== 1 ? (
          <div className="dashboard-alert">
            Mientras el movimiento este inactivo, no impactara el stock del inventario.
          </div>
        ) : selectedDirection === "ingreso" ? (
          <div className="dashboard-alert">
            Este movimiento sumara <strong>{watchedQuantity || 0}</strong> unidades al inventario.
          </div>
        ) : selectedDirection === "egreso" ? (
          <div className="dashboard-alert">
            Este movimiento restara <strong>{watchedQuantity || 0}</strong> unidades al inventario.
          </div>
        ) : watchedMovementTypeId ? (
          <div className="dashboard-alert">
            El tipo seleccionado no se reconoce como ingreso o egreso; el backend validara esta
            configuracion antes de guardar.
          </div>
        ) : null}

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasDependencies ? (
          <div className="dashboard-empty-state">
            Necesitas inventarios, tipos de movimiento y estados disponibles para completar este
            formulario.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              <div className="dashboard-form-grid">
                {isEditing ? (
                  <>
                    <label className="dashboard-input">
                      <span>Producto</span>
                      <input
                        className="form-control"
                        disabled
                        value={
                          currentMovement
                            ? `#${currentMovement.idProducto} - ${currentMovement.producto}`
                            : ""
                        }
                      />
                    </label>
                    <input
                      type="hidden"
                      {...register("idProducto", { required: "El producto es obligatorio" })}
                    />
                  </>
                ) : (
                  <label className="dashboard-input">
                    <span>Producto con inventario</span>
                    <select
                      className="form-select"
                      {...register("idProducto", { required: "El producto es obligatorio" })}
                    >
                      <option value="">Selecciona un producto</option>
                      {inventories.map((inventory) => (
                        <option key={inventory.idInventario} value={inventory.idProducto}>
                          #{inventory.idProducto} - {inventory.producto} (stock {inventory.cantidad})
                        </option>
                      ))}
                    </select>
                    {errors.idProducto ? <small>{errors.idProducto.message}</small> : null}
                  </label>
                )}

                <label className="dashboard-input">
                  <span>Tipo de movimiento</span>
                  <select
                    className="form-select"
                    {...register("idTipoMovimiento", {
                      required: "El tipo de movimiento es obligatorio",
                    })}
                  >
                    <option value="">Selecciona un tipo</option>
                    {movementTypeOptions.map((movementType) => (
                      <option
                        key={movementType.idTipoMovimiento}
                        value={movementType.idTipoMovimiento}
                      >
                        {movementType.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.idTipoMovimiento ? <small>{errors.idTipoMovimiento.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Cantidad</span>
                  <input
                    className="form-control"
                    min="1"
                    step="1"
                    type="number"
                    {...register("cantidad", {
                      required: "La cantidad es obligatoria",
                      min: {
                        value: 1,
                        message: "La cantidad debe ser mayor que cero",
                      },
                      validate: (value) =>
                        Number.isInteger(Number(value)) || "La cantidad debe ser un entero",
                    })}
                  />
                  {errors.cantidad ? <small>{errors.cantidad.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Fecha y hora del movimiento</span>
                  <input
                    className="form-control"
                    type="datetime-local"
                    {...register("fechaMovimiento", {
                      required: "La fecha del movimiento es obligatoria",
                    })}
                  />
                  {errors.fechaMovimiento ? <small>{errors.fechaMovimiento.message}</small> : null}
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
            </fieldset>

            <div className="dashboard-form__footer">
              <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/movimientos-inventario">
                Cancelar
              </Link>
              <button className="dashboard-btn dashboard-btn--primary" disabled={formDisabled} type="submit">
                {saving
                  ? isEditing
                    ? "Guardando..."
                    : "Creando..."
                  : isEditing
                    ? "Guardar cambios"
                    : "Crear movimiento"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default InventoryMovementFormPage;
