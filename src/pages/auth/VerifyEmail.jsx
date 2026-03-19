import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as authApi from "../../api/auth";
import { useAuth } from "../../hooks/useAuth";
import { initializeAuth } from "../../store/authSlice";

const VerifyEmail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [searchParams] = useSearchParams();
  const emailFromQuery = searchParams.get("correo") || user?.correo || "";
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      correo: emailFromQuery,
      code: "",
    },
  });

  useEffect(() => {
    document.title = "Verificar correo | Adopciones Kalö";
    if (emailFromQuery) {
      setValue("correo", emailFromQuery);
    }
  }, [emailFromQuery, setValue]);

  const onSubmit = async (values) => {
    try {
      await authApi.verifyEmail(values);
      Swal.fire({
        icon: "success",
        title: "Correo verificado",
        text: isAuthenticated
          ? "Tu correo ya esta verificado. Te llevaremos al dashboard."
          : "Tu cuenta ya esta verificada. Ahora puedes iniciar sesion.",
      });

      if (isAuthenticated) {
        await dispatch(initializeAuth());
        navigate("/dashboard", { replace: true });
        return;
      }

      navigate("/login");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo verificar",
        text: error?.response?.data?.message || "El codigo no es valido o ya expiro.",
      });
    }
  };

  const handleResend = async () => {
    const correo = getValues("correo");
    if (!correo) {
      Swal.fire({
        icon: "warning",
        title: "Correo requerido",
        text: "Ingresa tu correo antes de solicitar un nuevo codigo.",
      });
      return;
    }

    try {
      await authApi.resendVerificationEmail({ correo });
      Swal.fire({
        icon: "success",
        title: "Correo reenviado",
        text: "Te enviamos un nuevo codigo de verificacion.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo reenviar",
        text: error?.response?.data?.message || "No pudimos reenviar el correo en este momento.",
      });
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title mb-3">Verificar correo</h2>
              <p className="text-muted">
                Ingresa el correo y el codigo que te enviamos. Si no te llego, puedes reenviarlo.
              </p>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                  <label className="form-label">Correo electronico</label>
                  <input
                    {...register("correo", {
                      required: "El correo es obligatorio",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Ingrese un correo valido",
                      },
                    })}
                    className={`form-control ${errors.correo ? "is-invalid" : ""}`}
                    type="email"
                    autoComplete="email"
                  />
                  {errors.correo && <div className="invalid-feedback">{errors.correo.message}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label">Codigo de verificacion</label>
                  <input
                    {...register("code", {
                      required: "El codigo es obligatorio",
                      minLength: { value: 6, message: "Debe tener 6 digitos" },
                      maxLength: { value: 6, message: "Debe tener 6 digitos" },
                    })}
                    className={`form-control ${errors.code ? "is-invalid" : ""}`}
                    type="text"
                    inputMode="numeric"
                  />
                  {errors.code && <div className="invalid-feedback">{errors.code.message}</div>}
                </div>

                <button className="btn btn-primary w-100 mb-3" type="submit" disabled={isSubmitting}>
                  Verificar correo
                </button>
              </form>

              <button
                className="btn btn-outline-secondary w-100"
                type="button"
                onClick={handleResend}
                disabled={isSubmitting}
              >
                Reenviar codigo
              </button>

              <div className="text-center mt-4">
                <Link to={isAuthenticated ? "/dashboard" : "/login"}>
                  {isAuthenticated ? "Volver al dashboard" : "Volver a iniciar sesion"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
