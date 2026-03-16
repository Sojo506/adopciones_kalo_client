import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import {
  getCantons,
  getCountries,
  getDistricts,
  getProvinces,
} from "../../api/locations";

const Signup = () => {
  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cantons, setCantons] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCantons, setLoadingCantons] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const { register, handleSubmit, formState, reset, setValue } = useForm({
    defaultValues: {
      identificacion: "",
      nombre: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      password: "",
      correo: "",
      telefono: "",
      idPais: "",
      idProvincia: "",
      idCanton: "",
      idDistrito: "",
      calle: "",
      numero: "",
    },
  });

  const { errors } = formState;
  const { register: signUp } = useAuth();

  const onSubmit = async (values) => {
    await signUp({
      identificacion: values.identificacion,
      nombre: values.nombre,
      apellidoPaterno: values.apellidoPaterno,
      apellidoMaterno: values.apellidoMaterno,
      password: values.password,
      correo: values.correo,
      telefono: values.telefono,
      idPais: Number(values.idPais),
      idProvincia: Number(values.idProvincia),
      idCanton: Number(values.idCanton),
      idDistrito: Number(values.idDistrito),
      calle: values.calle.trim(),
      numero: values.numero.trim(),
    });
    reset();
    setProvinces([]);
    setCantons([]);
    setDistricts([]);
  };

  useEffect(() => {
    document.title = "Registro | Adopciones Kalö";
  }, []);

  useEffect(() => {
    const loadCountries = async () => {
      setLoadingCountries(true);
      try {
        const data = await getCountries();
        setCountries(data);
      } catch (error) {
        console.error("Countries error", error);
        Swal.fire({
          icon: "error",
          title: "Ubicaciones no disponibles",
          text: error?.response?.data?.message || "No se pudieron cargar los paises.",
        });
      } finally {
        setLoadingCountries(false);
      }
    };

    loadCountries();
  }, []);

  const handleCountryChange = async (event) => {
    const selectedCountryId = event.target.value;
    setValue("idProvincia", "");
    setValue("idCanton", "");
    setValue("idDistrito", "");
    setProvinces([]);
    setCantons([]);
    setDistricts([]);

    if (!selectedCountryId) {
      return;
    }

    setLoadingProvinces(true);
    try {
      const data = await getProvinces(selectedCountryId);
      setProvinces(data);
    } catch (error) {
      console.error("Provinces error", error);
      Swal.fire({
        icon: "error",
        title: "Provincias no disponibles",
        text: error?.response?.data?.message || "No se pudieron cargar las provincias.",
      });
    } finally {
      setLoadingProvinces(false);
    }
  };

  const handleProvinceChange = async (event) => {
    const selectedProvinceId = event.target.value;
    setValue("idCanton", "");
    setValue("idDistrito", "");
    setCantons([]);
    setDistricts([]);

    if (!selectedProvinceId) {
      return;
    }

    setLoadingCantons(true);
    try {
      const data = await getCantons(selectedProvinceId);
      setCantons(data);
    } catch (error) {
      console.error("Cantons error", error);
      Swal.fire({
        icon: "error",
        title: "Cantones no disponibles",
        text: error?.response?.data?.message || "No se pudieron cargar los cantones.",
      });
    } finally {
      setLoadingCantons(false);
    }
  };

  const handleCantonChange = async (event) => {
    const selectedCantonId = event.target.value;
    setValue("idDistrito", "");
    setDistricts([]);

    if (!selectedCantonId) {
      return;
    }

    setLoadingDistricts(true);
    try {
      const data = await getDistricts(selectedCantonId);
      setDistricts(data);
    } catch (error) {
      console.error("Districts error", error);
      Swal.fire({
        icon: "error",
        title: "Distritos no disponibles",
        text: error?.response?.data?.message || "No se pudieron cargar los distritos.",
      });
    } finally {
      setLoadingDistricts(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title mb-4">Crear cuenta</h2>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Identificación</label>
                    <input
                      {...register("identificacion", { required: "La identificación es obligatoria" })}
                      className={`form-control ${errors.identificacion ? "is-invalid" : ""}`}
                      type="text"
                    />
                    {errors.identificacion && (
                      <div className="invalid-feedback">{errors.identificacion.message}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Correo electrónico</label>
                    <input
                      {...register("correo", {
                        required: "El correo es obligatorio",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Ingrese un correo válido",
                        },
                      })}
                      className={`form-control ${errors.correo ? "is-invalid" : ""}`}
                      type="email"
                      autoComplete="email"
                    />
                    {errors.correo && <div className="invalid-feedback">{errors.correo.message}</div>}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                      {...register("nombre", { required: "El nombre es obligatorio" })}
                      className={`form-control ${errors.nombre ? "is-invalid" : ""}`}
                      type="text"
                    />
                    {errors.nombre && <div className="invalid-feedback">{errors.nombre.message}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Apellido paterno</label>
                    <input
                      {...register("apellidoPaterno", {
                        required: "El apellido paterno es obligatorio",
                      })}
                      className={`form-control ${errors.apellidoPaterno ? "is-invalid" : ""}`}
                      type="text"
                    />
                    {errors.apellidoPaterno && (
                      <div className="invalid-feedback">{errors.apellidoPaterno.message}</div>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Apellido materno</label>
                    <input
                      {...register("apellidoMaterno", {
                        required: "El apellido materno es obligatorio",
                      })}
                      className={`form-control ${errors.apellidoMaterno ? "is-invalid" : ""}`}
                      type="text"
                    />
                    {errors.apellidoMaterno && (
                      <div className="invalid-feedback">{errors.apellidoMaterno.message}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Teléfono</label>
                    <input
                      {...register("telefono", {
                        required: "El teléfono es obligatorio",
                        pattern: {
                          value: /^[0-9()+\s-]{6,20}$/,
                          message: "Ingrese un teléfono válido",
                        },
                      })}
                      className={`form-control ${errors.telefono ? "is-invalid" : ""}`}
                      type="text"
                    />
                    {errors.telefono && <div className="invalid-feedback">{errors.telefono.message}</div>}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Contraseña</label>
                    <input
                      {...register("password", {
                        required: "La contraseña es obligatoria",
                        minLength: { value: 8, message: "Mínimo 8 caracteres" },
                      })}
                      className={`form-control ${errors.password ? "is-invalid" : ""}`}
                      type="password"
                      autoComplete="new-password"
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Pais</label>
                    <select
                      {...register("idPais", {
                        required: "El pais es obligatorio",
                        onChange: handleCountryChange,
                      })}
                      className={`form-control ${errors.idPais ? "is-invalid" : ""}`}
                      disabled={loadingCountries || countries.length === 0}
                    >
                      <option value="">
                        {loadingCountries ? "Cargando paises..." : "Seleccione un pais"}
                      </option>
                      {countries.map((country) => (
                        <option key={country.idPais} value={country.idPais}>
                          {country.nombre}
                        </option>
                      ))}
                    </select>
                    {errors.idPais && (
                      <div className="invalid-feedback">{errors.idPais.message}</div>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Provincia</label>
                    <select
                      {...register("idProvincia", {
                        required: "La provincia es obligatoria",
                        onChange: handleProvinceChange,
                      })}
                      className={`form-control ${errors.idProvincia ? "is-invalid" : ""}`}
                      disabled={!provinces.length && !loadingProvinces}
                    >
                      <option value="">
                        {loadingProvinces ? "Cargando provincias..." : "Seleccione una provincia"}
                      </option>
                      {provinces.map((province) => (
                        <option key={province.idProvincia} value={province.idProvincia}>
                          {province.nombre}
                        </option>
                      ))}
                    </select>
                    {errors.idProvincia && (
                      <div className="invalid-feedback">{errors.idProvincia.message}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Canton</label>
                    <select
                      {...register("idCanton", {
                        required: "El canton es obligatorio",
                        onChange: handleCantonChange,
                      })}
                      className={`form-control ${errors.idCanton ? "is-invalid" : ""}`}
                      disabled={!cantons.length && !loadingCantons}
                    >
                      <option value="">
                        {loadingCantons ? "Cargando cantones..." : "Seleccione un canton"}
                      </option>
                      {cantons.map((canton) => (
                        <option key={canton.idCanton} value={canton.idCanton}>
                          {canton.nombre}
                        </option>
                      ))}
                    </select>
                    {errors.idCanton && (
                      <div className="invalid-feedback">{errors.idCanton.message}</div>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Distrito</label>
                    <select
                      {...register("idDistrito", {
                        required: "El distrito es obligatorio",
                      })}
                      className={`form-control ${errors.idDistrito ? "is-invalid" : ""}`}
                      disabled={!districts.length && !loadingDistricts}
                    >
                      <option value="">
                        {loadingDistricts ? "Cargando distritos..." : "Seleccione un distrito"}
                      </option>
                      {districts.map((district) => (
                        <option key={district.idDistrito} value={district.idDistrito}>
                          {district.nombre}
                        </option>
                      ))}
                    </select>
                    {errors.idDistrito && (
                      <div className="invalid-feedback">{errors.idDistrito.message}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Calle o detalle adicional</label>
                    <input
                      {...register("calle")}
                      className={`form-control ${errors.calle ? "is-invalid" : ""}`}
                      type="text"
                      placeholder="Opcional"
                    />
                    {errors.calle && <div className="invalid-feedback">{errors.calle.message}</div>}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Numero, casa o referencia</label>
                    <input
                      {...register("numero")}
                      className={`form-control ${errors.numero ? "is-invalid" : ""}`}
                      type="text"
                      placeholder="Opcional"
                    />
                    {errors.numero && <div className="invalid-feedback">{errors.numero.message}</div>}
                  </div>
                </div>

                <button className="btn btn-primary w-100" type="submit">
                  Crear cuenta
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
