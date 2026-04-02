import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import * as authApi from "../../api/auth";
import PasswordInput from "./PasswordInput";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submittedIdentifier, setSubmittedIdentifier] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      identifier: "",
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    document.title = "Recuperar contraseña | Adopciones Kalö";
  }, []);

  const handleRequestCode = async ({ identifier }) => {
    const normalizedIdentifier = identifier.trim();
    await authApi.requestPasswordRecovery({ identifier: normalizedIdentifier });
    setSubmittedIdentifier(normalizedIdentifier);
    setValue("identifier", normalizedIdentifier);
    setStep(2);
    Swal.fire({
      icon: "success",
      title: "Revisa tu correo",
      text: "Si la cuenta es recuperable, enviamos un código a tu correo registrado.",
    });
  };

  const handleConfirmRecovery = async ({ identifier, code, newPassword }) => {
    await authApi.confirmPasswordRecovery({
      identifier: identifier.trim(),
      code: code.trim(),
      newPassword,
    });

    Swal.fire({
      icon: "success",
      title: "Contraseña actualizada",
      text: "Ya puedes iniciar sesión con tu nueva contraseña.",
    });

    navigate("/login", { replace: true });
  };

  const onSubmit = async (values) => {
    try {
      if (step === 1) {
        await handleRequestCode(values);
        return;
      }

      await handleConfirmRecovery(values);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: step === 1 ? "No se pudo procesar la solicitud" : "No se pudo cambiar la contraseña",
        text:
          error?.response?.data?.message ||
          (step === 1
            ? "No pudimos procesar la solicitud en este momento."
            : "El código no es válido o ya expiró."),
      });
    }
  };

  const handleResend = async () => {
    const identifier = getValues("identifier").trim();

    if (!identifier) {
      Swal.fire({
        icon: "warning",
        title: "Identificador requerido",
        text: "Ingresa tu usuario o correo antes de reenviar el código.",
      });
      return;
    }

    try {
      await authApi.requestPasswordRecovery({ identifier });
      setSubmittedIdentifier(identifier);
      Swal.fire({
        icon: "success",
        title: "Código reenviado",
        text: "Si la cuenta es recuperable, enviamos un nuevo código a tu correo registrado.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo reenviar",
        text: error?.response?.data?.message || "No pudimos reenviar el código en este momento.",
      });
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title mb-3">Recuperar contraseña</h2>
              <p className="text-muted">
                {step === 1
                  ? "Ingresa tu usuario o correo para solicitar un código de recuperación."
                  : "Ingresa el código recibido y define tu nueva contraseña."}
              </p>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                  <label className="form-label">Usuario o correo</label>
                  <input
                    {...register("identifier", {
                      required: "El usuario o correo es obligatorio",
                    })}
                    className={`form-control ${errors.identifier ? "is-invalid" : ""}`}
                    type="text"
                    autoComplete="username"
                    disabled={step === 2}
                  />
                  {errors.identifier && (
                    <div className="invalid-feedback">{errors.identifier.message}</div>
                  )}
                </div>

                {step === 2 ? (
                  <>
                    <div className="mb-3">
                      <label className="form-label">Código de verificación</label>
                      <input
                        {...register("code", {
                          required: "El código es obligatorio",
                          minLength: { value: 6, message: "Debe tener 6 dígitos" },
                          maxLength: { value: 6, message: "Debe tener 6 dígitos" },
                          pattern: {
                            value: /^[0-9]{6}$/,
                            message: "Debe contener solo 6 dígitos",
                          },
                        })}
                        className={`form-control ${errors.code ? "is-invalid" : ""}`}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                      />
                      {errors.code && <div className="invalid-feedback">{errors.code.message}</div>}
                    </div>

                    <PasswordInput
                      name="newPassword"
                      label="Nueva contraseña"
                      register={register}
                      error={errors.newPassword}
                      validation={{
                        required: "La nueva contraseña es obligatoria",
                        minLength: { value: 8, message: "Mínimo 8 caracteres" },
                      }}
                    />

                    <PasswordInput
                      name="confirmPassword"
                      label="Confirmar nueva contraseña"
                      register={register}
                      error={errors.confirmPassword}
                      watch={watch}
                      compareWith="newPassword"
                      validation={{
                        required: "Confirma tu nueva contraseña",
                      }}
                    />
                  </>
                ) : null}

                <button className="btn btn-primary w-100" type="submit" disabled={isSubmitting}>
                  {step === 1 ? "Enviar código" : "Cambiar contraseña"}
                </button>
              </form>

              {step === 2 ? (
                <>
                  <button
                    className="btn btn-outline-secondary w-100 mt-3"
                    type="button"
                    onClick={handleResend}
                    disabled={isSubmitting}
                  >
                    Reenviar código
                  </button>
                  <button
                    className="btn btn-link w-100 mt-2"
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setSubmittedIdentifier("");
                      setValue("code", "");
                      setValue("newPassword", "");
                      setValue("confirmPassword", "");
                    }}
                    disabled={isSubmitting}
                  >
                    Cambiar identificador
                  </button>
                  {submittedIdentifier ? (
                    <p className="text-muted small text-center mt-3 mb-0">
                      Recuperando acceso para <strong>{submittedIdentifier}</strong>
                    </p>
                  ) : null}
                </>
              ) : null}

              <div className="text-center mt-4">
                <Link to="/login">Volver a iniciar sesión</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
