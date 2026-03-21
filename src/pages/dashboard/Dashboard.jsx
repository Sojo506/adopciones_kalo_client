import { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import AccountsDashboard from "./AccountsDashboard";
import AccountFormPage from "./AccountFormPage";
import AddressFormPage from "./AddressFormPage";
import AddressesDashboard from "./AddressesDashboard";
import AdoptionFormPage from "./AdoptionFormPage";
import AdoptionsDashboard from "./AdoptionsDashboard";
import BrandFormPage from "./BrandFormPage";
import BrandsDashboard from "./BrandsDashboard";
import BreedFormPage from "./BreedFormPage";
import BreedsDashboard from "./BreedsDashboard";
import CampaignFormPage from "./CampaignFormPage";
import CampaignsDashboard from "./CampaignsDashboard";
import CategoriesDashboard from "./CategoriesDashboard";
import CantonsDashboard from "./CantonsDashboard";
import CantonFormPage from "./CantonFormPage";
import CategoryFormPage from "./CategoryFormPage";
import CurrenciesDashboard from "./CurrenciesDashboard";
import CurrencyFormPage from "./CurrencyFormPage";
import Sidebar from "../../components/layout/Sidebar";
import CountriesDashboard from "./CountriesDashboard";
import CountryFormPage from "./CountryFormPage";
import DashboardHome from "./DashboardHome";
import DashboardPlaceholder from "./DashboardPlaceholder";
import DistrictFormPage from "./DistrictFormPage";
import DistrictsDashboard from "./DistrictsDashboard";
import DonationInvoiceFormPage from "./DonationInvoiceFormPage";
import DonationInvoicesDashboard from "./DonationInvoicesDashboard";
import DonationFormPage from "./DonationFormPage";
import DonationsDashboard from "./DonationsDashboard";
import DogEventFormPage from "./DogEventFormPage";
import DogEventsDashboard from "./DogEventsDashboard";
import DogImageFormPage from "./DogImageFormPage";
import DogImagesDashboard from "./DogImagesDashboard";
import DogFormPage from "./DogFormPage";
import DogsDashboard from "./DogsDashboard";
import EvidenceFormPage from "./EvidenceFormPage";
import EvidencesDashboard from "./EvidencesDashboard";
import EmailFormPage from "./EmailFormPage";
import EmailsDashboard from "./EmailsDashboard";
import EventDetailFormPage from "./EventDetailFormPage";
import EventDetailsDashboard from "./EventDetailsDashboard";
import EventTypeFormPage from "./EventTypeFormPage";
import EventTypesDashboard from "./EventTypesDashboard";
import FollowUpFormPage from "./FollowUpFormPage";
import FollowUpsDashboard from "./FollowUpsDashboard";
import FosterHomeFormPage from "./FosterHomeFormPage";
import FosterHomesDashboard from "./FosterHomesDashboard";
import HouseDogFormPage from "./HouseDogFormPage";
import HouseDogsDashboard from "./HouseDogsDashboard";
import InventoriesDashboard from "./InventoriesDashboard";
import InventoryFormPage from "./InventoryFormPage";
import InventoryMovementFormPage from "./InventoryMovementFormPage";
import InventoryMovementsDashboard from "./InventoryMovementsDashboard";
import InvoiceFormPage from "./InvoiceFormPage";
import InvoicesDashboard from "./InvoicesDashboard";
import MovementTypeFormPage from "./MovementTypeFormPage";
import MovementTypesDashboard from "./MovementTypesDashboard";
import OtpFormPage from "./OtpFormPage";
import OtpTypeFormPage from "./OtpTypeFormPage";
import OtpTypesDashboard from "./OtpTypesDashboard";
import OtpsDashboard from "./OtpsDashboard";
import PayPalPaymentFormPage from "./PayPalPaymentFormPage";
import PayPalPaymentsDashboard from "./PayPalPaymentsDashboard";
import PhoneFormPage from "./PhoneFormPage";
import PhonesDashboard from "./PhonesDashboard";
import ProductImageFormPage from "./ProductImageFormPage";
import ProductImagesDashboard from "./ProductImagesDashboard";
import ProductFormPage from "./ProductFormPage";
import ProductsDashboard from "./ProductsDashboard";
import ProvinceFormPage from "./ProvinceFormPage";
import ProvincesDashboard from "./ProvincesDashboard";
import QuestionFormPage from "./QuestionFormPage";
import QuestionsDashboard from "./QuestionsDashboard";
import RefreshTokenFormPage from "./RefreshTokenFormPage";
import RefreshTokensDashboard from "./RefreshTokensDashboard";
import RequestFormPage from "./RequestFormPage";
import RequestQuestionFormPage from "./RequestQuestionFormPage";
import RequestQuestionsDashboard from "./RequestQuestionsDashboard";
import RequestsDashboard from "./RequestsDashboard";
import ResponseFormPage from "./ResponseFormPage";
import ResponsesDashboard from "./ResponsesDashboard";
import ResponseTypeFormPage from "./ResponseTypeFormPage";
import ResponseTypesDashboard from "./ResponseTypesDashboard";
import RequestTypeFormPage from "./RequestTypeFormPage";
import RequestTypesDashboard from "./RequestTypesDashboard";
import StateFormPage from "./StateFormPage";
import StatesDashboard from "./StatesDashboard";
import SexFormPage from "./SexFormPage";
import SexesDashboard from "./SexesDashboard";
import SaleFormPage from "./SaleFormPage";
import SaleInvoiceFormPage from "./SaleInvoiceFormPage";
import SaleInvoicesDashboard from "./SaleInvoicesDashboard";
import SaleProductFormPage from "./SaleProductFormPage";
import SaleProductsDashboard from "./SaleProductsDashboard";
import SalesDashboard from "./SalesDashboard";
import TrackingTypeFormPage from "./TrackingTypeFormPage";
import TrackingTypesDashboard from "./TrackingTypesDashboard";
import UserTypeFormPage from "./UserTypeFormPage";
import UserTypesDashboard from "./UserTypesDashboard";
import UsersDashboard from "./UsersDashboard";
import UserFormPage from "./UserFormPage";
const Dashboard = () => {
  const [menuOpenPath, setMenuOpenPath] = useState(null);
  const location = useLocation();
  const menuOpen = menuOpenPath === location.pathname;

  const closeMenu = () => setMenuOpenPath(null);
  const toggleMenu = () => {
    setMenuOpenPath((currentPath) => (currentPath === location.pathname ? null : location.pathname));
  };

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
          <Routes>
            <Route index element={<DashboardHome />} />
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
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
