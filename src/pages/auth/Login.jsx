import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import PasswordInput from "./PasswordInput";

const Login = () => {
  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      usuario: "",
      password: "",
    },
  });

  const { errors } = formState;
  const { login, loading } = useAuth();

  const onSubmit = async (values) => {
    await login(values);
  };

  useEffect(() => {
    document.title = "Iniciar sesión | Adopciones Kalö";
  }, []);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title mb-4">Iniciar sesión</h2>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                  <label className="form-label">Usuario o correo</label>
                  <input
                    {...register("usuario", {
                      required: "El usuario es obligatorio",
                    })}
                    className={`form-control ${errors.usuario ? "is-invalid" : ""}`}
                    type="text"
                    autoComplete="username"
                  />
                  {errors.usuario && <div className="invalid-feedback">{errors.usuario.message}</div>}
                </div>

                <div className="mb-4">
                  <PasswordInput
                    name="password"
                    label="Contraseña"
                    register={register}
                    error={errors.password}
                    validation={{
                      required: "La contraseña es obligatoria",
                      minLength: { value: 8, message: "Mínimo 8 caracteres" },
                    }}
                  />
                </div>

                <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Cargando...
                    </>
                  ) : (
                    "Ingresar"
                  )}
                </button>
              </form>

              <div className="text-center mt-4">
                <span>¿No tienes cuenta? </span>
                <Link to="/signup">Regístrate aquí</Link>
              </div>
              <div className="text-center mt-2">
                <Link to="/verify-email">No me llegó el correo de verificación</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
