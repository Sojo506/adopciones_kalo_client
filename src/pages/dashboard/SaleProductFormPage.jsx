import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as catalogsApi from "../../api/catalogs";
import * as inventoriesApi from "../../api/inventories";
import * as movementTypesApi from "../../api/movementTypes";
import * as productsApi from "../../api/products";
import * as saleProductsApi from "../../api/saleProducts";
import * as salesApi from "../../api/sales";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  idVenta: "",
  idProducto: "",
  idTipoMovimiento: "",
  cantidad: "1",
  precioUnitario: "0.00",
  idEstado: "",
};

const EGRESO_KEYWORDS = ["egreso", "salida", "venta", "ajustenegativo"];

const normalizeKeyword = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const isEgresoMovementType = (movementTypeName) => {
  const normalizedName = normalizeKeyword(movementTypeName);
  return EGRESO_KEYWORDS.some((keyword) => normalizedName.includes(keyword));
};

const buildSaleLabel = (sale) => {
  const clientLabel = sale?.cliente || sale?.identificacion || "Venta sin cliente";
  return clientLabel;
};

const buildProductLabel = (product, inventory) => {
  const name = product?.nombre || "Producto sin nombre";

  if (!inventory) {
    return name;
  }

  return `${name} (stock: ${inventory.cantidad ?? 0})`;
};

const mapSaleProductToForm = (saleProduct) => ({
  idVenta: String(saleProduct?.idVenta ?? ""),
  idProducto: String(saleProduct?.idProducto ?? ""),
  idTipoMovimiento: String(saleProduct?.idTipoMovimiento ?? ""),
  cantidad: String(saleProduct?.cantidad ?? "1"),
  precioUnitario: String(saleProduct?.precioUnitario ?? "0.00"),
  idEstado: String(saleProduct?.idEstado ?? ""),
});

const buildCreatePayload = (values) => ({
  idVenta: Number(values.idVenta),
  idProducto: Number(values.idProducto),
  idTipoMovimiento: Number(values.idTipoMovimiento),
  cantidad: Number(values.cantidad),
  precioUnitario: Number(values.precioUnitario),
  idEstado: Number(values.idEstado),
});

const buildUpdatePayload = (values) => ({
  idTipoMovimiento: Number(values.idTipoMovimiento),
  cantidad: Number(values.cantidad),
  precioUnitario: Number(values.precioUnitario),
  idEstado: Number(values.idEstado),
});

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

const SaleProductFormPage = () => {
  const { idVenta, idProducto } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [movementTypes, setMovementTypes] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentSaleProduct, setCurrentSaleProduct] = useState(null);

  const isEditing = Boolean(idVenta && idProducto);

  const saleOptions = useMemo(() => {
    return sales.filter(
      (sale) =>
        Number(sale.idEstado) === 1 ||
        Number(sale.idVenta) === Number(currentSaleProduct?.idVenta),
    );
  }, [currentSaleProduct?.idVenta, sales]);

  const productOptions = useMemo(() => {
    const sellableProductIds = new Set(
      inventories
        .filter(
          (inventory) => Number(inventory.idEstado) === 1 && Number(inventory.cantidad || 0) > 0,
        )
        .map((inventory) => Number(inventory.idProducto)),
    );

    return products.filter(
      (product) =>
        (Number(product.idEstado) === 1 &&
          sellableProductIds.has(Number(product.idProducto))) ||
        Number(product.idProducto) === Number(currentSaleProduct?.idProducto),
    );
  }, [currentSaleProduct?.idProducto, inventories, products]);

  const inventoryByProductId = useMemo(() => {
    return new Map(inventories.map((inventory) => [Number(inventory.idProducto), inventory]));
  }, [inventories]);

  const movementTypeOptions = useMemo(() => {
    return movementTypes.filter(
      (movementType) =>
        Number(movementType.idEstado) === 1 ||
        Number(movementType.idTipoMovimiento) === Number(currentSaleProduct?.idTipoMovimiento),
    );
  }, [currentSaleProduct?.idTipoMovimiento, movementTypes]);

  const hasAvailableEgresoMovementType = useMemo(() => {
    return movementTypeOptions.some((movementType) => isEgresoMovementType(movementType.nombre));
  }, [movementTypeOptions]);

  const hasRequiredData =
    states.length > 0 &&
    saleOptions.length > 0 &&
    productOptions.length > 0 &&
    movementTypeOptions.length > 0 &&
    (isEditing || hasAvailableEgresoMovementType);

  const formDisabled = catalogsLoading || detailLoading || saving || !hasRequiredData;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  const watchedCantidad = Number(watch("cantidad") || 0);
  const watchedPrecioUnitario = Number(watch("precioUnitario") || 0);

  const lineTotalPreview = useMemo(() => {
    return Math.round(watchedCantidad * watchedPrecioUnitario * 100) / 100;
  }, [watchedCantidad, watchedPrecioUnitario]);

  useEffect(() => {
    document.title = isEditing
      ? "Editar detalle venta-producto | Dashboard Kalö"
      : "Nuevo detalle venta-producto | Dashboard Kalö";
  }, [isEditing]);

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        setCatalogsLoading(true);
        const [statesData, salesData, productsData, inventoriesData, movementTypesData] =
          await Promise.all([
          catalogsApi.getStates(),
          salesApi.getSales({ force: true }),
          productsApi.getProducts({ force: true }),
          inventoriesApi.getInventories({ force: true }),
          movementTypesApi.getMovementTypes({ force: true }),
        ]);

        const availableStates = Array.isArray(statesData) ? statesData : [];
        const availableSales = Array.isArray(salesData) ? salesData : [];
        const availableProducts = Array.isArray(productsData) ? productsData : [];
        const availableInventories = Array.isArray(inventoriesData) ? inventoriesData : [];
        const availableMovementTypes = Array.isArray(movementTypesData) ? movementTypesData : [];
        const sellableProductIds = new Set(
          availableInventories
            .filter(
              (inventory) =>
                Number(inventory.idEstado) === 1 && Number(inventory.cantidad || 0) > 0,
            )
            .map((inventory) => Number(inventory.idProducto)),
        );

        const activeState = availableStates.find((state) => Number(state.idEstado) === 1);
        const activeSale = availableSales.find((sale) => Number(sale.idEstado) === 1);
        const activeProduct = availableProducts.find(
          (product) =>
            Number(product.idEstado) === 1 && sellableProductIds.has(Number(product.idProducto)),
        );
        const egresoMovementType = availableMovementTypes.find(
          (movementType) =>
            Number(movementType.idEstado) === 1 && isEgresoMovementType(movementType.nombre),
        );

        setStates(availableStates);
        setSales(availableSales);
        setProducts(availableProducts);
        setInventories(availableInventories);
        setMovementTypes(availableMovementTypes);

        if (!isEditing) {
          reset({
            ...EMPTY_FORM,
            idVenta: String(activeSale?.idVenta ?? ""),
            idProducto: String(activeProduct?.idProducto ?? ""),
            idTipoMovimiento: String(egresoMovementType?.idTipoMovimiento ?? ""),
            cantidad: "1",
            precioUnitario: String(activeProduct?.precio ?? "0.00"),
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

    const loadSaleProduct = async () => {
      try {
        setDetailLoading(true);
        const detail = await saleProductsApi.getSaleProductByPk(idVenta, idProducto, { force: true });
        setCurrentSaleProduct(detail);
        reset(mapSaleProductToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar la linea de venta",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/ventas-producto");
      } finally {
        setDetailLoading(false);
      }
    };

    loadSaleProduct();
  }, [idProducto, idVenta, isEditing, navigate, reset]);

  const onSubmit = async (values) => {
    if (!isAdmin || !hasRequiredData) {
      return;
    }

    try {
      setSaving(true);

      if (isEditing) {
        await saleProductsApi.updateSaleProduct(
          idVenta,
          idProducto,
          buildUpdatePayload(values),
        );
      } else {
        await saleProductsApi.createSaleProduct(buildCreatePayload(values));
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Linea actualizada" : "Linea creada",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "La linea de venta fue creada correctamente.",
      });

      navigate("/dashboard/ventas-producto");
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
          <h1>Detalle venta-producto</h1>
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
            {isEditing ? "Editar detalle" : "Nuevo detalle"}
          </p>
          <h1>{isEditing ? "Actualizar detalle venta-producto" : "Crear detalle venta-producto"}</h1>
          <p className="dashboard-page__lede">
            Define el producto vendido, su cantidad, el precio unitario aplicado y el tipo de
            movimiento comercial que describe la linea.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/ventas-producto">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Las lineas activas deben usar un tipo de movimiento de egreso. El total de la linea se
          calcula como cantidad por precio unitario, y cada cambio recalcula el total de la venta.
          Solo se muestran productos con inventario activo y stock disponible. No se permite
          editar si la venta ya tiene facturas activas.
        </div>

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasRequiredData ? (
          <div className="dashboard-empty-state">
            {isEditing
              ? "Debe existir al menos la venta, el producto, estados disponibles y el tipo de movimiento asociado para editar este registro."
              : "Debe existir al menos una venta activa, un producto con inventario activo y stock disponible, estados disponibles y un tipo de movimiento activo configurado como egreso."}
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              <div className="dashboard-form-grid">
                <label className="dashboard-input">
                  <span>Venta</span>
                  <select
                    className="form-select"
                    disabled={isEditing || formDisabled}
                    {...register("idVenta", { required: "La venta es obligatoria" })}
                  >
                    <option value="">Selecciona una venta</option>
                    {saleOptions.map((sale) => (
                      <option key={sale.idVenta} value={sale.idVenta}>
                        {buildSaleLabel(sale)}
                      </option>
                    ))}
                  </select>
                  {errors.idVenta ? <small>{errors.idVenta.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Producto</span>
                  <select
                    className="form-select"
                    disabled={isEditing || formDisabled}
                    {...register("idProducto", { required: "El producto es obligatorio" })}
                  >
                    <option value="">Selecciona un producto</option>
                    {productOptions.map((product) => (
                      <option key={product.idProducto} value={product.idProducto}>
                        {buildProductLabel(
                          product,
                          inventoryByProductId.get(Number(product.idProducto)),
                        )}
                      </option>
                    ))}
                  </select>
                  {errors.idProducto ? <small>{errors.idProducto.message}</small> : null}
                </label>

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
                      <option key={movementType.idTipoMovimiento} value={movementType.idTipoMovimiento}>
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
                        message: "La cantidad debe ser mayor a cero",
                      },
                    })}
                  />
                  {errors.cantidad ? <small>{errors.cantidad.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Precio unitario</span>
                  <input
                    className="form-control"
                    min="0"
                    step="0.01"
                    type="number"
                    {...register("precioUnitario", {
                      required: "El precio unitario es obligatorio",
                      min: {
                        value: 0,
                        message: "El precio unitario no puede ser negativo",
                      },
                    })}
                  />
                  {errors.precioUnitario ? <small>{errors.precioUnitario.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Total calculado</span>
                  <input
                    className="form-control"
                    readOnly
                    type="text"
                    value={formatCurrency(lineTotalPreview)}
                  />
                  <small>Se calcula automaticamente con la cantidad y el precio unitario.</small>
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
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear linea"}
              </button>
              <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/ventas-producto">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default SaleProductFormPage;
