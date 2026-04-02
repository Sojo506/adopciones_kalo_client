import { Suspense, useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import {
  AccountsDashboard,
  AccountFormPage,
  AddressFormPage,
  AddressesDashboard,
  AdoptionFormPage,
  AdoptionsDashboard,
  BrandFormPage,
  BrandsDashboard,
  BreedFormPage,
  BreedsDashboard,
  CampaignFormPage,
  CampaignsDashboard,
  CategoriesDashboard,
  CantonsDashboard,
  CantonFormPage,
  CategoryFormPage,
  CurrenciesDashboard,
  CurrencyFormPage,
  CountriesDashboard,
  CountryFormPage,
  DashboardHome,
  DashboardPlaceholder,
  DistrictFormPage,
  DistrictsDashboard,
  DonationInvoiceFormPage,
  DonationInvoicesDashboard,
  DonationFormPage,
  DonationsDashboard,
  DogEventFormPage,
  DogEventsDashboard,
  DogImageFormPage,
  DogImagesDashboard,
  DogFormPage,
  DogsDashboard,
  EvidenceFormPage,
  EvidencesDashboard,
  EmailFormPage,
  EmailsDashboard,
  EventDetailFormPage,
  EventDetailsDashboard,
  EventTypeFormPage,
  EventTypesDashboard,
  FollowUpFormPage,
  FollowUpsDashboard,
  FosterHomeFormPage,
  FosterHomesDashboard,
  HouseDogFormPage,
  HouseDogsDashboard,
  InventoriesDashboard,
  InventoryFormPage,
  InventoryMovementFormPage,
  InventoryMovementsDashboard,
  InvoiceFormPage,
  InvoicesDashboard,
  MovementTypeFormPage,
  MovementTypesDashboard,
  OtpFormPage,
  OtpTypeFormPage,
  OtpTypesDashboard,
  OtpsDashboard,
  PayPalPaymentFormPage,
  PayPalPaymentsDashboard,
  PhoneFormPage,
  PhonesDashboard,
  ProductImageFormPage,
  ProductImagesDashboard,
  ProductFormPage,
  ProductsDashboard,
  ProvinceFormPage,
  ProvincesDashboard,
  QuestionFormPage,
  QuestionsDashboard,
  RefreshTokenFormPage,
  RefreshTokensDashboard,
  ReportsDashboard,
  RequestFormPage,
  RequestQuestionFormPage,
  RequestQuestionsDashboard,
  RequestsDashboard,
  RequestTypeFormPage,
  RequestTypesDashboard,
  ResponseFormPage,
  ResponsesDashboard,
  ResponseTypeFormPage,
  ResponseTypesDashboard,
  SaleFormPage,
  SaleInvoiceFormPage,
  SaleInvoicesDashboard,
  SaleProductFormPage,
  SaleProductsDashboard,
  SalesDashboard,
  SexFormPage,
  SexesDashboard,
  StateFormPage,
  StatesDashboard,
  TrackingTypeFormPage,
  TrackingTypesDashboard,
  UserTypeFormPage,
  UserTypesDashboard,
  UsersDashboard,
  UserFormPage,
} from "./lazyPages";

const DashboardRouteFallback = () => (
  <div className="dashboard-empty-state">Cargando modulo...</div>
);
const Dashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, left: 0 });
  }, [location.pathname]);

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen((currentValue) => !currentValue);

  return (
    <main className="dashboard-layout">
      <Sidebar isOpen={menuOpen} onClose={closeMenu} />

      <section className="dashboard-layout__content">
        <header className="dashboard-topbar">
          <button
            aria-expanded={menuOpen}
            className="dashboard-topbar__toggle"
            onClick={toggleMenu}
            type="button"
          >
            {menuOpen ? "Ocultar menu" : "Mostrar menu"}
          </button>
          <div>
            <p className="dashboard-topbar__label">Centro administrativo</p>
          </div>
        </header>

        <div className="dashboard-layout__body">
          <Suspense fallback={<DashboardRouteFallback />}>
            <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="reportes" element={<ReportsDashboard />} />
            <Route path="usuarios" element={<UsersDashboard />} />
            <Route path="usuarios/nuevo" element={<UserFormPage />} />
            <Route path="usuarios/:identificacion/editar" element={<UserFormPage />} />
            <Route path="paises" element={<CountriesDashboard />} />
            <Route path="paises/nuevo" element={<CountryFormPage />} />
            <Route path="paises/:idPais/editar" element={<CountryFormPage />} />
            <Route path="provincias" element={<ProvincesDashboard />} />
            <Route path="provincias/nuevo" element={<ProvinceFormPage />} />
            <Route path="provincias/:idProvincia/editar" element={<ProvinceFormPage />} />
            <Route path="cantones" element={<CantonsDashboard />} />
            <Route path="cantones/nuevo" element={<CantonFormPage />} />
            <Route path="cantones/:idCanton/editar" element={<CantonFormPage />} />
            <Route path="distritos" element={<DistrictsDashboard />} />
            <Route path="distritos/nuevo" element={<DistrictFormPage />} />
            <Route path="distritos/:idDistrito/editar" element={<DistrictFormPage />} />
            <Route path="direcciones" element={<AddressesDashboard />} />
            <Route path="direcciones/nuevo" element={<AddressFormPage />} />
            <Route path="direcciones/:idDireccion/editar" element={<AddressFormPage />} />
            <Route path="estados" element={<StatesDashboard />} />
            <Route path="estados/nuevo" element={<StateFormPage />} />
            <Route path="estados/:idEstado/editar" element={<StateFormPage />} />
            <Route path="categorias" element={<CategoriesDashboard />} />
            <Route path="categorias/nuevo" element={<CategoryFormPage />} />
            <Route path="categorias/:idCategoria/editar" element={<CategoryFormPage />} />
            <Route path="marcas" element={<BrandsDashboard />} />
            <Route path="marcas/nuevo" element={<BrandFormPage />} />
            <Route path="marcas/:idMarca/editar" element={<BrandFormPage />} />
            <Route path="campanias" element={<CampaignsDashboard />} />
            <Route path="campanias/nuevo" element={<CampaignFormPage />} />
            <Route path="campanias/:idCampania/editar" element={<CampaignFormPage />} />
            <Route path="donaciones" element={<DonationsDashboard />} />
            <Route path="donaciones/nuevo" element={<DonationFormPage />} />
            <Route path="donaciones/:idDonacion/editar" element={<DonationFormPage />} />
            <Route path="donaciones-factura" element={<DonationInvoicesDashboard />} />
            <Route path="donaciones-factura/nuevo" element={<DonationInvoiceFormPage />} />
            <Route
              path="donaciones-factura/:idDonacion/:idFactura/editar"
              element={<DonationInvoiceFormPage />}
            />
            <Route path="productos" element={<ProductsDashboard />} />
            <Route path="productos/nuevo" element={<ProductFormPage />} />
            <Route path="productos/:idProducto/editar" element={<ProductFormPage />} />
            <Route path="imagenes-producto" element={<ProductImagesDashboard />} />
            <Route path="imagenes-producto/nuevo" element={<ProductImageFormPage />} />
            <Route path="imagenes-producto/:idImagen/editar" element={<ProductImageFormPage />} />
            <Route path="inventario" element={<InventoriesDashboard />} />
            <Route path="inventario/nuevo" element={<InventoryFormPage />} />
            <Route path="inventario/:idInventario/editar" element={<InventoryFormPage />} />
            <Route path="movimientos-inventario" element={<InventoryMovementsDashboard />} />
            <Route
              path="movimientos-inventario/nuevo"
              element={<InventoryMovementFormPage />}
            />
            <Route
              path="movimientos-inventario/:idMovimiento/editar"
              element={<InventoryMovementFormPage />}
            />
            <Route path="tipos-movimiento" element={<MovementTypesDashboard />} />
            <Route path="tipos-movimiento/nuevo" element={<MovementTypeFormPage />} />
            <Route
              path="tipos-movimiento/:idTipoMovimiento/editar"
              element={<MovementTypeFormPage />}
            />
            <Route path="ventas" element={<SalesDashboard />} />
            <Route path="ventas/nuevo" element={<SaleFormPage />} />
            <Route path="ventas/:idVenta/editar" element={<SaleFormPage />} />
            <Route path="facturas" element={<InvoicesDashboard />} />
            <Route path="facturas/nuevo" element={<InvoiceFormPage />} />
            <Route path="facturas/:idFactura/editar" element={<InvoiceFormPage />} />
            <Route path="pagos-paypal" element={<PayPalPaymentsDashboard />} />
            <Route path="pagos-paypal/nuevo" element={<PayPalPaymentFormPage />} />
            <Route path="pagos-paypal/:idPago/editar" element={<PayPalPaymentFormPage />} />
            <Route path="ventas-factura" element={<SaleInvoicesDashboard />} />
            <Route path="ventas-factura/nuevo" element={<SaleInvoiceFormPage />} />
            <Route
              path="ventas-factura/:idVenta/:idFactura/editar"
              element={<SaleInvoiceFormPage />}
            />
            <Route path="ventas-producto" element={<SaleProductsDashboard />} />
            <Route path="ventas-producto/nuevo" element={<SaleProductFormPage />} />
            <Route
              path="ventas-producto/:idVenta/:idProducto/editar"
              element={<SaleProductFormPage />}
            />
            <Route path="razas" element={<BreedsDashboard />} />
            <Route path="razas/nuevo" element={<BreedFormPage />} />
            <Route path="razas/:idRaza/editar" element={<BreedFormPage />} />
            <Route path="sexos" element={<SexesDashboard />} />
            <Route path="sexos/nuevo" element={<SexFormPage />} />
            <Route path="sexos/:idSexo/editar" element={<SexFormPage />} />
            <Route path="eventos-perrito" element={<DogEventsDashboard />} />
            <Route path="eventos-perrito/nuevo" element={<DogEventFormPage />} />
            <Route path="eventos-perrito/:idEvento/editar" element={<DogEventFormPage />} />
            <Route path="detalle-evento" element={<EventDetailsDashboard />} />
            <Route path="detalle-evento/nuevo" element={<EventDetailFormPage />} />
            <Route
              path="detalle-evento/:idDetalleEvento/editar"
              element={<EventDetailFormPage />}
            />
            <Route path="casas-cuna" element={<FosterHomesDashboard />} />
            <Route path="casas-cuna/nuevo" element={<FosterHomeFormPage />} />
            <Route path="casas-cuna/:idCasaCuna/editar" element={<FosterHomeFormPage />} />
            <Route path="casas-perrito" element={<HouseDogsDashboard />} />
            <Route path="casas-perrito/nuevo" element={<HouseDogFormPage />} />
            <Route
              path="casas-perrito/:idCasaCuna/:idPerrito/editar"
              element={<HouseDogFormPage />}
            />
            <Route path="imagenes-perrito" element={<DogImagesDashboard />} />
            <Route path="imagenes-perrito/nuevo" element={<DogImageFormPage />} />
            <Route path="imagenes-perrito/:idImagen/editar" element={<DogImageFormPage />} />
            <Route path="perritos" element={<DogsDashboard />} />
            <Route path="perritos/nuevo" element={<DogFormPage />} />
            <Route path="perritos/:idPerrito/editar" element={<DogFormPage />} />
            <Route path="monedas" element={<CurrenciesDashboard />} />
            <Route path="monedas/nuevo" element={<CurrencyFormPage />} />
            <Route path="monedas/:idMoneda/editar" element={<CurrencyFormPage />} />
            <Route path="tipos-otp" element={<OtpTypesDashboard />} />
            <Route path="tipos-otp/nuevo" element={<OtpTypeFormPage />} />
            <Route path="tipos-otp/:idTipoOtp/editar" element={<OtpTypeFormPage />} />
            <Route path="tipos-usuario" element={<UserTypesDashboard />} />
            <Route path="tipos-usuario/nuevo" element={<UserTypeFormPage />} />
            <Route path="tipos-usuario/:idTipoUsuario/editar" element={<UserTypeFormPage />} />
            <Route path="tipos-solicitud" element={<RequestTypesDashboard />} />
            <Route path="tipos-solicitud/nuevo" element={<RequestTypeFormPage />} />
            <Route
              path="tipos-solicitud/:idTipoSolicitud/editar"
              element={<RequestTypeFormPage />}
            />
            <Route path="solicitudes" element={<RequestsDashboard />} />
            <Route path="solicitudes/nuevo" element={<RequestFormPage />} />
            <Route path="solicitudes/:idSolicitud/editar" element={<RequestFormPage />} />
            <Route path="adopciones" element={<AdoptionsDashboard />} />
            <Route path="adopciones/nuevo" element={<AdoptionFormPage />} />
            <Route path="adopciones/:idAdopcion/editar" element={<AdoptionFormPage />} />
            <Route path="seguimientos" element={<FollowUpsDashboard />} />
            <Route path="seguimientos/nuevo" element={<FollowUpFormPage />} />
            <Route
              path="seguimientos/:idSeguimiento/editar"
              element={<FollowUpFormPage />}
            />
            <Route path="evidencias" element={<EvidencesDashboard />} />
            <Route path="evidencias/nuevo" element={<EvidenceFormPage />} />
            <Route path="evidencias/:idEvidencia/editar" element={<EvidenceFormPage />} />
            <Route path="tipos-solicitud-pregunta" element={<RequestQuestionsDashboard />} />
            <Route
              path="tipos-solicitud-pregunta/nuevo"
              element={<RequestQuestionFormPage />}
            />
            <Route
              path="tipos-solicitud-pregunta/:idTipoSolicitud/:idPregunta/editar"
              element={<RequestQuestionFormPage />}
            />
            <Route path="respuestas" element={<ResponsesDashboard />} />
            <Route path="respuestas/nuevo" element={<ResponseFormPage />} />
            <Route path="respuestas/:idRespuesta/editar" element={<ResponseFormPage />} />
            <Route path="tipos-respuesta" element={<ResponseTypesDashboard />} />
            <Route path="tipos-respuesta/nuevo" element={<ResponseTypeFormPage />} />
            <Route
              path="tipos-respuesta/:idTipoRespuesta/editar"
              element={<ResponseTypeFormPage />}
            />
            <Route path="tipos-seguimiento" element={<TrackingTypesDashboard />} />
            <Route path="tipos-seguimiento/nuevo" element={<TrackingTypeFormPage />} />
            <Route
              path="tipos-seguimiento/:idTipoSeguimiento/editar"
              element={<TrackingTypeFormPage />}
            />
            <Route path="tipos-evento" element={<EventTypesDashboard />} />
            <Route path="tipos-evento/nuevo" element={<EventTypeFormPage />} />
            <Route
              path="tipos-evento/:idTipoEvento/editar"
              element={<EventTypeFormPage />}
            />
            <Route path="preguntas" element={<QuestionsDashboard />} />
            <Route path="preguntas/nuevo" element={<QuestionFormPage />} />
            <Route path="preguntas/:idPregunta/editar" element={<QuestionFormPage />} />
            <Route path="correos" element={<EmailsDashboard />} />
            <Route path="correos/nuevo" element={<EmailFormPage />} />
            <Route path="correos/:identificacion/:correo/editar" element={<EmailFormPage />} />
            <Route path="telefonos" element={<PhonesDashboard />} />
            <Route path="telefonos/nuevo" element={<PhoneFormPage />} />
            <Route path="telefonos/:identificacion/:telefono/editar" element={<PhoneFormPage />} />
            <Route path="cuentas" element={<AccountsDashboard />} />
            <Route path="cuentas/nuevo" element={<AccountFormPage />} />
            <Route path="cuentas/:idCuenta/editar" element={<AccountFormPage />} />
            <Route path="codigos-otp" element={<OtpsDashboard />} />
            <Route path="codigos-otp/nuevo" element={<OtpFormPage />} />
            <Route path="codigos-otp/:idCodigoOtp/editar" element={<OtpFormPage />} />
            <Route path="refresh-tokens" element={<RefreshTokensDashboard />} />
            <Route path="refresh-tokens/nuevo" element={<RefreshTokenFormPage />} />
              <Route path="refresh-tokens/:idRefreshToken/editar" element={<RefreshTokenFormPage />} />
              <Route path="*" element={<DashboardPlaceholder />} />
            </Routes>
          </Suspense>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
