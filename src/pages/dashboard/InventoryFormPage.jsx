import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as catalogsApi from "../../api/catalogs";
import * as inventoriesApi from "../../api/inventories";
import * as productsApi from "../../api/products";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  idProducto: "",
  cantidad: "0",
  idEstado: "",
};

const mapInventoryToForm = (inventory) => ({
  idProducto: String(inventory?.idProducto ?? ""),
  cantidad: String(inventory?.cantidad ?? 0),
  idEstado: String(inventory?.idEstado ?? ""),
});

const buildPayload = (values) => ({
  idProducto: Number(values.idProducto),
  cantidad: Number(values.cantidad),
  idEstado: Number(values.idEstado),
});

const InventoryFormPage = () => {
  const { idInventario } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [states, setStates] = useState([]);
  const [currentInventory, setCurrentInventory] = useState(null);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(idInventario);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  const watchedQuantity = Number(watch("cantidad") || 0);
  const currentQuantity = Number(currentInventory?.cantidad || 0);
  const quantityDelta = isEditing ? watchedQuantity - currentQuantity : watchedQuantity;

  const availableProducts = useMemo(() => {
    if (isEditing) {
      return products;
    }

    const productIdsWithInventory = new Set(
      inventories.map((inventory) => Number(inventory.idProducto))
    );

    return products.filter((product) => !productIdsWithInventory.has(Number(product.idProducto)));
  }, [inventories, isEditing, products]);

  const hasDependencies = states.length > 0 && (isEditing || availableProducts.length > 0);
  const formDisabled = catalogsLoading || detailLoading || saving || !hasDependencies;

  useEffect(() => {
    document.title = isEditing ? "Editar inventario | Dashboard Kalö" : "Nuevo inventario | Dashboard Kalö";
  }, [isEditing]);

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        setCatalogsLoading(true);
        const [productsData, statesData, inventoriesData] = await Promise.all([
          productsApi.getProducts({ force: true }),
          catalogsApi.getStates(),
          inventoriesApi.getInventories({ force: true }),
        ]);

        const availableStates = Array.isArray(statesData) ? statesData : [];
        const allProducts = Array.isArray(productsData) ? productsData : [];
        const allInventories = Array.isArray(inventoriesData) ? inventoriesData : [];
        const activeState = availableStates.find((state) => Number(state.idEstado) === 1);

        setProducts(allProducts);
        setStates(availableStates);
        setInventories(allInventories);

        if (!isEditing) {
          const productIdsWithInventory = new Set(
            allInventories.map((inventory) => Number(inventory.idProducto))
          );
          const firstAvailableProduct = allProducts.find(
            (product) => !productIdsWithInventory.has(Number(product.idProducto))
          );

          reset({
            ...EMPTY_FORM,
            idProducto: String(firstAvailableProduct?.idProducto ?? ""),
            cantidad: "0",
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

    const loadInventory = async () => {
      try {
        setDetailLoading(true);
        const detail = await inventoriesApi.getInventoryById(idInventario, { force: true });
        setCurrentInventory(detail);
        reset(mapInventoryToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar el inventario",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/inventario");
      } finally {
        setDetailLoading(false);
      }
    };

    loadInventory();
  }, [idInventario, isEditing, navigate, reset]);

  const onSubmit = async (values) => {
    if (!isAdmin || !hasDependencies) {
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload(values);

      if (isEditing) {
        await inventoriesApi.updateInventory(idInventario, payload);
      } else {
        await inventoriesApi.createInventory(payload);
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Inventario actualizado" : "Inventario creado",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "El inventario fue creado correctamente.",
      });

      navigate("/dashboard/inventario");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos guardar el inventario",
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
          <h1>Inventario</h1>
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
          <p className="dashboard-page__eyebrow">{isEditing ? "Editar inventario" : "Nuevo inventario"}</p>
          <h1>{isEditing ? "Actualizar inventario" : "Crear inventario"}</h1>
          <p className="dashboard-page__lede">
            Define el stock actual por producto. El sistema registra automaticamente el movimiento
            que corresponda cuando la cantidad cambia.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/inventario">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Cada producto solo puede tener un inventario. Una vez creado, el inventario permanece
          ligado al mismo producto.
        </div>

        <div className="dashboard-alert">
          Si prefieres registrar ajustes manuales de entrada o salida, puedes hacerlo desde{" "}
          <Link to="/dashboard/movimientos-inventario">movimientos de inventario</Link>.
        </div>

        {quantityDelta > 0 ? (
          <div className="dashboard-alert">
            Se registrara un movimiento automatico de <strong>INGRESO</strong> por{" "}
            <strong>{quantityDelta}</strong> unidades.
          </div>
        ) : quantityDelta < 0 ? (
          <div className="dashboard-alert">
            Se registrara un movimiento automatico de <strong>EGRESO</strong> por{" "}
            <strong>{Math.abs(quantityDelta)}</strong> unidades.
          </div>
        ) : isEditing ? (
          <div className="dashboard-alert">
            Mientras mantengas la misma cantidad, no se generara un movimiento adicional.
          </div>
        ) : null}

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasDependencies ? (
          <div className="dashboard-empty-state">
            {!isEditing && availableProducts.length === 0
              ? "Todos los productos ya tienen un inventario asignado."
              : "Necesitas productos y estados disponibles para completar este formulario."}
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
                          currentInventory
                            ? `#${currentInventory.idProducto} - ${currentInventory.producto}`
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
                    <span>Producto</span>
                    <select
                      className="form-select"
                      {...register("idProducto", { required: "El producto es obligatorio" })}
                    >
                      <option value="">Selecciona un producto</option>
                      {availableProducts.map((product) => (
                        <option key={product.idProducto} value={product.idProducto}>
                          #{product.idProducto} - {product.nombre}
                        </option>
                      ))}
                    </select>
                    {errors.idProducto ? <small>{errors.idProducto.message}</small> : null}
                  </label>
                )}

                <label className="dashboard-input">
                  <span>{isEditing ? "Stock actual" : "Cantidad inicial"}</span>
                  <input
                    className="form-control"
                    min="0"
                    step="1"
                    type="number"
                    {...register("cantidad", {
                      required: "La cantidad es obligatoria",
                      min: {
                        value: 0,
                        message: "La cantidad no puede ser negativa",
                      },
                      validate: (value) =>
                        Number.isInteger(Number(value)) || "La cantidad debe ser un entero",
                    })}
                  />
                  {errors.cantidad ? <small>{errors.cantidad.message}</small> : null}
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

            <div className="dashboard-form__actions">
              <button className="dashboard-btn dashboard-btn--primary" disabled={saving} type="submit">
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear inventario"}
              </button>
              <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/inventario">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default InventoryFormPage;
