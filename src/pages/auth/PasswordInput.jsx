import { useState } from "react";
import { BiHide, BiShow } from "react-icons/bi";

const PasswordInput = ({
    name,
    label,
    register,
    error,
    validation = {},
    watch,
    compareWith, // nombre del campo a comparar (ej: "password")
}) => {
    const [show, setShow] = useState(false);

    return (
        <div className="mb-3">
            <label className="form-label">{label}</label>

            <div className={`password-field ${error ? "password-field--invalid" : ""}`}>
                <input
                    {...register(name, {
                        ...validation,
                        validate: (value) => {
                            // Si hay comparación (confirm password)
                            if (compareWith && watch) {
                                return (
                                    value === watch(compareWith) ||
                                    "Las contraseñas no coinciden"
                                );
                            }
                            return true;
                        },
                    })}
                    type={show ? "text" : "password"}
                    className="password-field__input"
                    autoComplete="new-password"
                />

                <button
                    type="button"
                    className="password-field__toggle"
                    onClick={() => setShow(!show)}
                    aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                    aria-pressed={show}
                >
                    {show ? <BiHide /> : <BiShow />}
                </button>
            </div>

            {error && (
                <div className="invalid-feedback d-block">
                    {error.message}
                </div>
            )}
        </div>
    );
};

export default PasswordInput;
