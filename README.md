# Client de Adopciones Kalo

Frontend principal de la plataforma Adopciones Kalo. Este repositorio implementa la experiencia publica y administrativa del proyecto: inicio, autenticacion, flujo de adopcion, seguimiento, campanas con donacion PayPal, tienda, perfil de usuario y dashboard admin.

## Que cubre este repo

El frontend esta construido para hablar con la API del proyecto y orquestar los flujos reales del negocio:

- Registro, login, verificacion de email y recuperacion de password
- Navegacion publica de perritos disponibles para adopcion
- Solicitud de adopcion con preguntas dinamicas
- Seguimiento post adopcion con carga de evidencias y aprobacion administrativa
- Campanas con donacion por PayPal
- Tienda solidaria con carrito y checkout PayPal
- Perfil del usuario con compras, solicitudes y seguimientos
- Dashboard administrativo con CRUDs y reportes PDF

## Stack tecnico

- React 19
- Vite
- React Router
- Redux Toolkit
- Axios
- React Hook Form
- PayPal React SDK
- Bootstrap
- SweetAlert2

## Como esta organizado

- `src/main.jsx`: punto de entrada de React y montaje del store Redux.
- `src/App.jsx`: `BrowserRouter`, layout global, inicializacion de auth y escucha de forced logout por SSE.
- `src/routes/AppRouter.jsx`: rutas publicas, autenticadas y admin.
- `src/api/`: capa de consumo HTTP por dominio.
- `src/store/`: slices de auth y carrito.
- `src/hooks/useAuth.js`: ergonomia de login, registro y logout.
- `src/pages/public/`: home, tienda, perfil, adopcion, seguimiento y campanas.
- `src/pages/auth/`: login, signup, verify email y forgot password.
- `src/pages/dashboard/`: dashboard admin y modulos CRUD.
- `src/components/payments/PayPalProvider.jsx`: configuracion del SDK de PayPal.
- `src/data/`: metadatos de navegacion del dashboard y reportes.

## Arquitectura del frontend

El frontend mezcla rutas publicas, auth y admin sobre un solo `BrowserRouter`.

### Layout y bootstrap de sesion

`src/App.jsx` hace cuatro cosas clave al cargar:

1. Monta `Header`, `Footer` y el `AppRouter`.
2. Ejecuta `initializeAuth()` para reconstruir la sesion desde `localStorage`.
3. Escucha el evento global `auth:expired` para limpiar estado si la API revoca la sesion.
4. Si hay usuario autenticado, abre un `EventSource` hacia `/auth/events` para recibir forced logout por SSE.

### Rutas y guards

`src/routes/AppRouter.jsx` separa la experiencia en:

- rutas publicas: `/`, `/adopciones`, `/tienda`, `/campanias`
- rutas autenticadas: `/seguimiento`, `/carrito`, `/perfil`
- rutas de auth: `/login`, `/signup`, `/verify-email`, `/forgot-password`
- rutas admin: `/dashboard/*`

Los guards principales son:

- `AuthenticatedRoute`: exige sesion activa
- `ProtectedRoute`: exige sesion activa y rol admin
- `VerifyEmailRoute`: evita que usuarios ya verificados vuelvan al flujo de verificacion

### Store Redux

El store actual tiene dos slices:

- `auth`: guarda usuario autenticado y estado de carga
- `cart`: guarda items del carrito

Persistencia real:

- `auth` guarda access token y usuario en `localStorage`
- `cart` guarda los productos del carrito en `localStorage`

### Capa `src/api`

Cada dominio expone funciones pequenas sobre Axios:

- `auth.js`
- `adoptionRequests.js`
- `profile.js`
- `storeCheckout.js`
- `paypalCheckout.js`
- `catalogs.js`
- `dogs.js`
- `evidences.js`
- `adminReports.js`

Dos detalles importantes:

- `src/api/requestCache.js` deduplica requests en vuelo para evitar llamadas duplicadas.
- varios modulos mantienen caches locales en memoria del browser para listas y detalles frecuentes.

### Axios, refresh automatico y forced logout

`src/api/axiosConfig.js` es una de las piezas mas importantes del frontend:

- usa `VITE_API_URL` como base URL
- envia `withCredentials: true` para que viaje la cookie del refresh token
- adjunta automaticamente el access token desde `localStorage`
- si una peticion protegida responde `401`, intenta `POST /auth/refresh`
- si el refresh falla, limpia la auth local y dispara `auth:expired`

En paralelo, `App.jsx` escucha `force-logout` por SSE para cerrar sesion en tiempo real cuando el backend revoca la cuenta o la sesion.

## Instalacion paso a paso

### 1. Instalar dependencias

```bash
cd client
npm install
```

### 2. Preparar `.env`

Ejemplo seguro:

```env
VITE_API_URL=http://localhost:3000/api
VITE_PAYPAL_CLIENT_ID=replace_me
VITE_PAYPAL_CURRENCY=USD
```

### 3. Levantar el entorno de desarrollo

```bash
npm run dev
```

Por defecto Vite quedara disponible en `http://localhost:5173`.

### 4. Build de produccion

```bash
npm run build
```

### 5. Preview local del build

```bash
npm run preview
```

### 6. Requisito de integracion con la API

Para que el frontend funcione de verdad, la API debe estar levantada y su CORS debe aceptar `http://localhost:5173`. El backend actual ya viene preparado para ese origen en desarrollo.

## Scripts disponibles

| Script | Que hace |
| --- | --- |
| `npm run dev` | Levanta Vite en desarrollo. |
| `npm run build` | Genera el build de produccion. |
| `npm run lint` | Ejecuta ESLint. |
| `npm run preview` | Sirve el build generado para validacion local. |

## Variables de entorno

| Variable | Uso |
| --- | --- |
| `VITE_API_URL` | Base URL de la API, normalmente `http://localhost:3000/api`. |
| `VITE_PAYPAL_CLIENT_ID` | Client ID del SDK de PayPal. Si falta, los botones PayPal no se renderizan. |
| `VITE_PAYPAL_CURRENCY` | Moneda del SDK de PayPal; por defecto `USD`. |

## Flujo general de la aplicacion

1. El usuario entra por una ruta publica.
2. Si necesita autenticacion, `useAuth` orquesta login/registro/logout.
3. La capa `src/api` consume la API con Axios.
4. Si el access token expira, Axios intenta refresh automatico.
5. Si el backend revoca sesiones, el cliente recibe `force-logout` por SSE.
6. El dashboard admin lazy-load cada modulo para no cargar todo el sistema de una sola vez.

## Flujos completos desde la UI

### 1. Signup y verificacion de email

Pantallas involucradas:

- `src/pages/auth/Signup.jsx`
- `src/pages/auth/VerifyEmail.jsx`

Recorrido:

1. El usuario llena identificacion, username, password, correo, telefono y direccion.
2. El formulario carga paises, provincias, cantones y distritos desde la API.
3. `useAuth().register()` envia `POST /auth/register`.
4. Si el backend responde bien, el usuario es redirigido a `/verify-email?correo=...`.
5. En `VerifyEmail`, el usuario ingresa el codigo OTP.
6. Tambien puede reenviar el correo si no llego.
7. Si la verificacion ocurre estando autenticado, el cliente refresca auth y navega al dashboard.
8. Si la verificacion ocurre sin sesion, redirige a login.

### 2. Login y restauracion de sesion

Pantallas y piezas clave:

- `src/pages/auth/Login.jsx`
- `src/hooks/useAuth.js`
- `src/store/authSlice.js`
- `src/api/axiosConfig.js`

Recorrido:

1. El usuario inicia sesion con username o correo.
2. El backend devuelve `accessToken` y deja el refresh token en cookie httpOnly.
3. El cliente guarda el access token y el usuario normalizado en `localStorage`.
4. Si el rol es admin, navega a `/dashboard`; si no, vuelve al home.
5. Al recargar la pagina, `initializeAuth()` consulta `/auth/me` y recompone la sesion.
6. Si una request protegida falla por expiracion, Axios intenta refresh automaticamente.
7. Si el refresh o la sesion remota fallan, el estado local se limpia y la app expira la sesion.

### 3. Forgot password

Pantalla involucrada:

- `src/pages/auth/ForgotPassword.jsx`

Recorrido:

1. Paso 1: usuario o correo para solicitar OTP.
2. Paso 2: codigo de 6 digitos y nueva password.
3. Si el backend acepta el cambio, el usuario vuelve a login.

Este flujo es intencionalmente de dos pasos y no depende de estar logueado.

### 4. Navegacion de adopciones

Pantalla involucrada:

- `src/pages/public/DogAdoptionPage.jsx`

Recorrido:

1. La pagina carga bootstrap del formulario con perros disponibles y preguntas activas.
2. El usuario puede filtrar perritos, seleccionar uno y ver su detalle.
3. Si esta autenticado, la UI revisa si ya existe adopcion pendiente para ese perrito.
4. El formulario arma `respuestas` por pregunta.
5. Al enviar, el backend crea solicitud, respuestas y adopcion pendiente.
6. La UI muestra confirmacion con el estado devuelto por la API.

### 5. Campanas y donaciones con PayPal

Pantallas y piezas clave:

- `src/pages/public/CampaignsPage.jsx`
- `src/components/payments/PayPalProvider.jsx`
- `src/api/paypalCheckout.js`

Recorrido:

1. El usuario ve campanas activas.
2. Si no tiene sesion, la UI lo manda a login o signup antes de donar.
3. Si tiene sesion, abre un modal para ingresar monto y mensaje.
4. El SDK de PayPal crea la orden a traves del backend.
5. Tras aprobar el pago, el frontend pide la captura.
6. Si todo sale bien, la donacion queda registrada y la UI muestra exito.

### 6. Tienda, carrito y checkout

Pantallas y piezas clave:

- `src/pages/public/StorePage.jsx`
- `src/pages/public/ProductDetailPage.jsx`
- `src/pages/public/CartPage.jsx`
- `src/store/cartSlice.js`
- `src/api/storeCheckout.js`

Recorrido:

1. La tienda consume el catalogo publico de productos, categorias y marcas.
2. `ProductDetailPage` consume el detalle publico del producto y puede mostrar una galeria con las imagenes activas disponibles.
3. El usuario filtra y agrega productos al carrito.
4. El carrito se persiste en `localStorage`.
5. La ruta `/carrito` exige sesion autenticada.
6. Desde `CartPage`, PayPal crea la orden usando el total del carrito.
7. Mientras PayPal y la API confirman la compra, la UI bloquea cambios del carrito y muestra un estado visual de procesamiento.
8. Tras la aprobacion, el frontend envia `orderId` e items reales al backend.
9. La API valida stock y registra venta, factura, pago e inventario.
10. El frontend limpia el carrito, muestra compra exitosa y permite descargar el PDF de factura desde `pdfBase64`.

Notas importantes:

- La UI muestra precios en CRC.
- El backend convierte a USD para PayPal en el flujo de tienda.
- El detalle publico de producto mantiene `imageUrl` y ademas puede incluir `imagenes` para la galeria.

### 7. Perfil del usuario

Pantalla involucrada:

- `src/pages/public/ProfilePage.jsx`

El perfil no es solo una pagina de datos basicos. Consume un overview bastante rico que incluye:

- datos del perfil
- direccion
- solicitudes de adopcion
- compras
- facturas ligadas a compras
- casas cuna relacionadas
- resumen numerico

Tambien centraliza operaciones sensibles:

- actualizar datos generales
- solicitar cambio de correo y confirmarlo con OTP
- solicitar cambio de password y confirmarlo con OTP

Cuando un cambio de correo se confirma, el cliente refresca auth. Cuando un cambio de password implica limpiar sesion, la UI queda lista para reautenticacion.

### 8. Seguimiento y evidencias

Pantalla involucrada:

- `src/pages/public/FollowUpPage.jsx`

Recorrido:

1. La pagina carga seguimientos del usuario autenticado.
2. Agrupa seguimientos por perrito.
3. Solo muestra seguimientos vigentes y activos; los vencidos o inactivos no aparecen en la vista publica.
4. Permite ver historial de evidencias por seguimiento.
5. El usuario final solo puede enviar `fechaEvidencia` e imagen.
6. La vista publica no muestra comentarios administrativos ni estados internos del seguimiento.
7. Las evidencias viajan como `multipart/form-data`.
8. Toda evidencia creada desde perfil nace en estado `Pendiente`.
9. El usuario final solo ve estados publicos de evidencia cuando aplican, como `Pendiente` o `Aprobado`.
10. Tras crear evidencia, la UI invalida caches relacionadas y actualiza historial.

Reglas visibles en la UI:

- El formulario publico exige fecha e imagen.
- Los comentarios se administran solo desde dashboard.
- El estado del seguimiento no se expone al usuario final.
- La aprobacion de evidencias no ocurre en la vista publica.

### 9. Dashboard administrativo y reportes

Piezas clave:

- `src/pages/dashboard/Dashboard.jsx`
- `src/pages/dashboard/DashboardHome.jsx`
- `src/data/dashboardModules.js`
- `src/pages/dashboard/ReportsDashboard.jsx`
- `src/api/adminReports.js`

La ruta `/dashboard/*` esta reservada para admins y funciona como centro administrativo completo del sistema.

No carga todos los modulos de una sola vez; usa `lazy()` para cada pagina del dashboard.

## El dashboard resumido por areas de negocio

### Usuarios y acceso

Incluye modulos para:

- usuarios
- tipos de usuario
- correos
- telefonos
- cuentas
- codigos OTP
- refresh tokens

Es la capa que refleja la administracion operativa de acceso, sesiones y datos base del usuario.

### Catalogos y ubicaciones

Agrupa:

- estados
- paises, provincias, cantones y distritos
- direcciones
- tipos OTP
- categorias
- marcas
- monedas
- razas
- sexos
- tipos de solicitud
- tipos de respuesta
- tipos de seguimiento
- tipos de evento
- banco de preguntas

### Perritos, adopciones y seguimiento

Agrupa:

- perritos
- imagenes de perrito
- eventos y detalle de eventos
- solicitudes
- tipo solicitud-pregunta
- respuestas
- casas cuna
- asignacion casa-perrito
- adopciones
- seguimientos
- evidencias

En este bloque, el dashboard de evidencias es la superficie de revision del equipo:

- las evidencias creadas por usuarios finales llegan en `Pendiente`
- el equipo las revisa y aprueba desde `EvidencesDashboard`
- el formulario administrativo limita estados a `Pendiente`, `Aprobado` e `Inactivo`

### Tienda, inventario y ventas

Agrupa:

- productos
- imagenes de producto
- inventario
- movimientos de inventario
- tipos de movimiento
- ventas
- detalle venta-producto
- facturas
- venta-factura
- pagos PayPal

### Donaciones y reportes

Agrupa:

- campanas
- donaciones
- donaciones-factura
- dashboard ejecutivo
- reportes PDF descargables

Los reportes PDF actualmente consumen:

- facturas
- donaciones
- adopciones
- inventario bajo

## Contratos operativos que conviene explicitar

- `VITE_API_URL` debe apuntar a la API incluyendo `/api`.
- El cliente necesita `withCredentials` porque el refresh token no vive en JS sino en cookie httpOnly.
- Si falta `VITE_PAYPAL_CLIENT_ID`, el provider PayPal devuelve `null` y los botones no aparecen.
- El frontend asume que el backend acepta origen `http://localhost:5173`.
- La expiracion de sesion puede venir tanto por interceptor Axios como por evento SSE.

## Troubleshooting

### CORS o errores de red al llamar la API

Revisa:

- que `VITE_API_URL` apunte a la URL correcta
- que la API este levantada
- que el backend permita `http://localhost:5173` en `src/app.js`

### `VITE_API_URL` incorrecta

Sintomas tipicos:

- login no responde
- listas vacias con errores de red
- refresh token nunca funciona
- SSE a `/auth/events` falla

Valor recomendado en local:

```env
VITE_API_URL=http://localhost:3000/api
```

### La sesion expira de golpe

Puede deberse a:

- access token vencido y refresh fallido
- cookie de refresh no enviada
- cuenta desactivada
- forced logout desde el backend

El cliente limpia `localStorage` automaticamente en ese escenario.

### PayPal no aparece

Revisa:

- `VITE_PAYPAL_CLIENT_ID`
- `VITE_PAYPAL_CURRENCY`
- conexion de red
- que el backend tenga sus propias credenciales PayPal configuradas

### Redirecciones inesperadas por rol

`useAuth()` envia:

- admins -> `/dashboard`
- usuarios normales -> `/`

Si un usuario intenta abrir `/dashboard` sin rol admin, `ProtectedRoute` lo devuelve al home.

### Carrito vacio o desincronizado

El carrito se persiste en `localStorage`. Si estas cambiando productos desde la API o tocando stock manualmente, puede ser util limpiar el storage del navegador y volver a cargar la tienda.

## Recomendaciones para un developer nuevo

Si quieres entender rapido el frontend, este orden suele rendir mejor:

1. `src/App.jsx`
2. `src/routes/AppRouter.jsx`
3. `src/api/axiosConfig.js`
4. `src/store/authSlice.js`
5. `src/hooks/useAuth.js`
6. `src/pages/auth/Signup.jsx`
7. `src/pages/public/DogAdoptionPage.jsx`
8. `src/pages/public/CampaignsPage.jsx`
9. `src/pages/public/CartPage.jsx`
10. `src/pages/public/ProfilePage.jsx`
11. `src/pages/dashboard/Dashboard.jsx`
12. `src/data/dashboardModules.js`

Con eso entiendes el arranque, auth, adopcion, pagos, tienda, perfil y administracion, que son las piezas mas importantes del sistema.
