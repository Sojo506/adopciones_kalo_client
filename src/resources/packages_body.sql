CREATE OR REPLACE PACKAGE BODY FIDE_INSERT_PKG AS
    /* PROCEDURE FIDE_ESTADO_TB INSERT */
    PROCEDURE FIDE_ESTADO_INSERT_SP(
        P_ID_ESTADO IN FIDE_ESTADO_TB.ID_ESTADO%TYPE,
        P_NOMBRE_ESTADO IN FIDE_ESTADO_TB.NOMBRE_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_ESTADO_TB (
            ID_ESTADO,
            NOMBRE_ESTADO
        )
        VALUES (
            P_ID_ESTADO,
            P_NOMBRE_ESTADO
        );

        COMMIT;
        
    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El ID ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_ESTADO_INSERT_SP;

    /* PROCEDURE FIDE_TIPO_USUARIO_TB INSERT */
    PROCEDURE FIDE_TIPO_USUARIO_INSERT_SP(
        P_ID_TIPO_USUARIO IN FIDE_TIPO_USUARIO_TB.ID_TIPO_USUARIO%TYPE,
        P_NOMBRE_ESTADO   IN FIDE_TIPO_USUARIO_TB.NOMBRE%TYPE,
        P_ID_ESTADO       IN FIDE_TIPO_USUARIO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_TIPO_USUARIO_TB (
            ID_TIPO_USUARIO,
            NOMBRE,
            ID_ESTADO
        )
        VALUES (
            P_ID_TIPO_USUARIO,
            P_NOMBRE,
            P_ID_ESTADO
        );

        COMMIT;
        
    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El ID ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_TIPO_USUARIO_INSERT_SP;

    /* PROCEDURE FIDE_USUARIO_TB INSERT */
    PROCEDURE FIDE_USUARIO_INSERT_SP(
        P_IDENTIFICACION     IN FIDE_USUARIO_TB.IDENTIFICACION%TYPE,
        P_NOMBRE             IN FIDE_USUARIO_TB.NOMBRE%TYPE,
        P_APELLIDO_PATERNO   IN FIDE_USUARIO_TB.APELLIDO_PATERNO%TYPE,
        P_APELLIDO_MATERNO   IN FIDE_USUARIO_TB.APELLIDO_MATERNO%TYPE,
        P_ID_DIRECCION       IN FIDE_USUARIO_TB.ID_DIRECCION%TYPE,
        P_ID_TIPO_USUARIO    IN FIDE_USUARIO_TB.ID_TIPO_USUARIO%TYPE,
        P_ID_ESTADO          IN FIDE_USUARIO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_USUARIO_TB(
            IDENTIFICACION,
            NOMBRE,
            APELLIDO_PATERNO,
            APELLIDO_MATERNO,
            ID_DIRECCION,
            ID_TIPO_USUARIO,
            ID_ESTADO
        )
        VALUES(
            P_IDENTIFICACION,
            P_NOMBRE,
            P_APELLIDO_PATERNO,
            P_APELLIDO_MATERNO,
            P_ID_DIRECCION,
            P_ID_TIPO_USUARIO,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La identificaciÃ³n ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_USUARIO_INSERT_SP;

    /* PROCEDURE FIDE_CORREO_TB INSERT */
    PROCEDURE FIDE_CORREO_INSERT_SP(
        P_IDENTIFICACION IN FIDE_CORREO_TB.IDENTIFICACION%TYPE,
        P_CORREO         IN FIDE_CORREO_TB.CORREO%TYPE,
        P_ID_ESTADO      IN FIDE_CORREO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_CORREO_TB(
            IDENTIFICACION,
            CORREO,
            ID_ESTADO
        )
        VALUES(
            P_IDENTIFICACION,
            P_CORREO,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El correo ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_CORREO_INSERT_SP;

    /* PROCEDURE FIDE_TELEFONO_TB INSERT */
    PROCEDURE FIDE_TELEFONO_INSERT_SP(
        P_IDENTIFICACION IN FIDE_TELEFONO_TB.IDENTIFICACION%TYPE,
        P_TELEFONO       IN FIDE_TELEFONO_TB.TELEFONO%TYPE,
        P_ID_ESTADO      IN FIDE_TELEFONO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_TELEFONO_TB(
            IDENTIFICACION,
            TELEFONO,
            ID_ESTADO
        )
        VALUES(
            P_IDENTIFICACION,
            P_TELEFONO,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El telÃ©fono ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_TELEFONO_INSERT_SP;

    /* PROCEDURE FIDE_CUENTA_TB INSERT */
    PROCEDURE FIDE_CUENTA_INSERT_SP(
        P_ID_CUENTA        IN FIDE_CUENTA_TB.ID_CUENTA%TYPE,
        P_IDENTIFICACION   IN FIDE_CUENTA_TB.IDENTIFICACION%TYPE,
        P_USUARIO          IN FIDE_CUENTA_TB.USUARIO%TYPE,
        P_PASSWORD_HASH    IN FIDE_CUENTA_TB.PASSWORD_HASH%TYPE,
        P_ID_ESTADO        IN FIDE_CUENTA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_CUENTA_TB(
            ID_CUENTA,
            IDENTIFICACION,
            USUARIO,
            PASSWORD_HASH,
            ID_ESTADO
        )
        VALUES(
            P_ID_CUENTA,
            P_IDENTIFICACION,
            P_USUARIO,
            P_PASSWORD_HASH,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La cuenta ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_CUENTA_INSERT_SP;

    /* PROCEDURE FIDE_TIPO_OTP_TB INSERT */
    PROCEDURE FIDE_TIPO_OTP_INSERT_SP(
        P_ID_TIPO_OTP IN FIDE_TIPO_OTP_TB.ID_TIPO_OTP%TYPE,
        P_NOMBRE      IN FIDE_TIPO_OTP_TB.NOMBRE%TYPE,
        P_ID_ESTADO   IN FIDE_TIPO_OTP_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_TIPO_OTP_TB(
            ID_TIPO_OTP,
            NOMBRE,
            ID_ESTADO
        )
        VALUES(
            P_ID_TIPO_OTP,
            P_NOMBRE,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El tipo OTP ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_TIPO_OTP_INSERT_SP;

    /* PROCEDURE FIDE_CODIGO_OTP_TB INSERT */
    PROCEDURE FIDE_CODIGO_OTP_INSERT_SP(
        P_ID_CODIGO_OTP     IN FIDE_CODIGO_OTP_TB.ID_CODIGO_OTP%TYPE,
        P_ID_CUENTA         IN FIDE_CODIGO_OTP_TB.ID_CUENTA%TYPE,
        P_ID_TIPO_OTP       IN FIDE_CODIGO_OTP_TB.ID_TIPO_OTP%TYPE,
        P_CODIGO_HASH       IN FIDE_CODIGO_OTP_TB.CODIGO_HASH%TYPE,
        P_FECHA_EXPIRACION  IN FIDE_CODIGO_OTP_TB.FECHA_EXPIRACION%TYPE,
        P_FECHA_USO         IN FIDE_CODIGO_OTP_TB.FECHA_USO%TYPE,
        P_INTENTOS          IN FIDE_CODIGO_OTP_TB.INTENTOS%TYPE,
        P_FECHA_CREACION    IN FIDE_CODIGO_OTP_TB.FECHA_CREACION%TYPE,
        P_ID_ESTADO         IN FIDE_CODIGO_OTP_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_CODIGO_OTP_TB(
            ID_CODIGO_OTP,
            ID_CUENTA,
            ID_TIPO_OTP,
            CODIGO_HASH,
            FECHA_EXPIRACION,
            FECHA_USO,
            INTENTOS,
            FECHA_CREACION,
            ID_ESTADO
        )
        VALUES(
            P_ID_CODIGO_OTP,
            P_ID_CUENTA,
            P_ID_TIPO_OTP,
            P_CODIGO_HASH,
            P_FECHA_EXPIRACION,
            P_FECHA_USO,
            P_INTENTOS,
            P_FECHA_CREACION,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El cÃ³digo OTP ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_CODIGO_OTP_INSERT_SP;

    /* PROCEDURE FIDE_REFRESH_TOKEN_TB INSERT */
    PROCEDURE FIDE_REFRESH_TOKEN_INSERT_SP(
        P_ID_REFRESH_TOKEN   IN FIDE_REFRESH_TOKEN_TB.ID_REFRESH_TOKEN%TYPE,
        P_ID_CUENTA          IN FIDE_REFRESH_TOKEN_TB.ID_CUENTA%TYPE,
        P_TOKEN_HASH         IN FIDE_REFRESH_TOKEN_TB.TOKEN_HASH%TYPE,
        P_JTI                IN FIDE_REFRESH_TOKEN_TB.JTI%TYPE,
        P_IP_ADDRESS         IN FIDE_REFRESH_TOKEN_TB.IP_ADDRESS%TYPE,
        P_USER_AGENT         IN FIDE_REFRESH_TOKEN_TB.USER_AGENT%TYPE,
        P_FECHA_EXPIRACION   IN FIDE_REFRESH_TOKEN_TB.FECHA_EXPIRACION%TYPE,
        P_FECHA_REVOCACION   IN FIDE_REFRESH_TOKEN_TB.FECHA_REVOCACION%TYPE,
        P_ID_ESTADO          IN FIDE_REFRESH_TOKEN_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_REFRESH_TOKEN_TB(
            ID_REFRESH_TOKEN,
            ID_CUENTA,
            TOKEN_HASH,
            JTI,
            IP_ADDRESS,
            USER_AGENT,
            FECHA_EXPIRACION,
            FECHA_REVOCACION,
            ID_ESTADO
        )
        VALUES(
            P_ID_REFRESH_TOKEN,
            P_ID_CUENTA,
            P_TOKEN_HASH,
            P_JTI,
            P_IP_ADDRESS,
            P_USER_AGENT,
            P_FECHA_EXPIRACION,
            P_FECHA_REVOCACION,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El refresh token ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_REFRESH_TOKEN_INSERT_SP;

    /* PROCEDURE FIDE_PAIS_TB INSERT */
    PROCEDURE FIDE_PAIS_INSERT_SP(
        P_ID_PAIS    IN FIDE_PAIS_TB.ID_PAIS%TYPE,
        P_NOMBRE     IN FIDE_PAIS_TB.NOMBRE%TYPE,
        P_ID_ESTADO  IN FIDE_PAIS_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_PAIS_TB(
            ID_PAIS,
            NOMBRE,
            ID_ESTADO
        )
        VALUES(
            P_ID_PAIS,
            P_NOMBRE,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El paÃ­s ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_PAIS_INSERT_SP;

    /* PROCEDURE FIDE_PROVINCIA_TB INSERT */
    PROCEDURE FIDE_PROVINCIA_INSERT_SP(
        P_ID_PROVINCIA IN FIDE_PROVINCIA_TB.ID_PROVINCIA%TYPE,
        P_NOMBRE       IN FIDE_PROVINCIA_TB.NOMBRE%TYPE,
        P_ID_PAIS      IN FIDE_PROVINCIA_TB.ID_PAIS%TYPE,
        P_ID_ESTADO    IN FIDE_PROVINCIA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_PROVINCIA_TB(
            ID_PROVINCIA,
            NOMBRE,
            ID_PAIS,
            ID_ESTADO
        )
        VALUES(
            P_ID_PROVINCIA,
            P_NOMBRE,
            P_ID_PAIS,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La provincia ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_PROVINCIA_INSERT_SP;

    /* PROCEDURE FIDE_CANTON_TB INSERT */
    PROCEDURE FIDE_CANTON_INSERT_SP(
        P_ID_CANTON     IN FIDE_CANTON_TB.ID_CANTON%TYPE,
        P_NOMBRE        IN FIDE_CANTON_TB.NOMBRE%TYPE,
        P_ID_PROVINCIA  IN FIDE_CANTON_TB.ID_PROVINCIA%TYPE,
        P_ID_ESTADO     IN FIDE_CANTON_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_CANTON_TB(
            ID_CANTON,
            NOMBRE,
            ID_PROVINCIA,
            ID_ESTADO
        )
        VALUES(
            P_ID_CANTON,
            P_NOMBRE,
            P_ID_PROVINCIA,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El cantÃ³n ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_CANTON_INSERT_SP;

    /* PROCEDURE FIDE_DISTRITO_TB INSERT */
    PROCEDURE FIDE_DISTRITO_INSERT_SP(
        P_ID_DISTRITO  IN FIDE_DISTRITO_TB.ID_DISTRITO%TYPE,
        P_NOMBRE       IN FIDE_DISTRITO_TB.NOMBRE%TYPE,
        P_ID_CANTON    IN FIDE_DISTRITO_TB.ID_CANTON%TYPE,
        P_ID_ESTADO    IN FIDE_DISTRITO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_DISTRITO_TB(
            ID_DISTRITO,
            NOMBRE,
            ID_CANTON,
            ID_ESTADO
        )
        VALUES(
            P_ID_DISTRITO,
            P_NOMBRE,
            P_ID_CANTON,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El distrito ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_DISTRITO_INSERT_SP;

    /* PROCEDURE FIDE_DIRECCION_TB INSERT */
    PROCEDURE FIDE_DIRECCION_INSERT_SP(
        P_ID_DIRECCION IN FIDE_DIRECCION_TB.ID_DIRECCION%TYPE,
        P_ID_DISTRITO  IN FIDE_DIRECCION_TB.ID_DISTRITO%TYPE,
        P_CALLE        IN FIDE_DIRECCION_TB.CALLE%TYPE,
        P_NUMERO       IN FIDE_DIRECCION_TB.NUMERO%TYPE,
        P_ID_ESTADO    IN FIDE_DIRECCION_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_DIRECCION_TB(
            ID_DIRECCION,
            ID_DISTRITO,
            CALLE,
            NUMERO,
            ID_ESTADO
        )
        VALUES(
            P_ID_DIRECCION,
            P_ID_DISTRITO,
            P_CALLE,
            P_NUMERO,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La direcciÃ³n ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_DIRECCION_INSERT_SP;

    /* PROCEDURE FIDE_CATEGORIA_TB INSERT */
    PROCEDURE FIDE_CATEGORIA_INSERT_SP(
        P_ID_CATEGORIA IN FIDE_CATEGORIA_TB.ID_CATEGORIA%TYPE,
        P_NOMBRE       IN FIDE_CATEGORIA_TB.NOMBRE%TYPE,
        P_ID_ESTADO    IN FIDE_CATEGORIA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_CATEGORIA_TB(
            ID_CATEGORIA,
            NOMBRE,
            ID_ESTADO
        )
        VALUES(
            P_ID_CATEGORIA,
            P_NOMBRE,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La categorÃ­a ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_CATEGORIA_INSERT_SP;

    /* PROCEDURE FIDE_PRODUCTO_TB INSERT */
    PROCEDURE FIDE_PRODUCTO_INSERT_SP(
        P_ID_PRODUCTO  IN FIDE_PRODUCTO_TB.ID_PRODUCTO%TYPE,
        P_NOMBRE       IN FIDE_PRODUCTO_TB.NOMBRE%TYPE,
        P_DESCRIPCION  IN FIDE_PRODUCTO_TB.DESCRIPCION%TYPE,
        P_PRECIO       IN FIDE_PRODUCTO_TB.PRECIO%TYPE,
        P_ID_CATEGORIA IN FIDE_PRODUCTO_TB.ID_CATEGORIA%TYPE,
        P_ID_ESTADO    IN FIDE_PRODUCTO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_PRODUCTO_TB(
            ID_PRODUCTO,
            NOMBRE,
            DESCRIPCION,
            PRECIO,
            ID_CATEGORIA,
            ID_ESTADO
        )
        VALUES(
            P_ID_PRODUCTO,
            P_NOMBRE,
            P_DESCRIPCION,
            P_PRECIO,
            P_ID_CATEGORIA,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El producto ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_PRODUCTO_INSERT_SP;

    /* PROCEDURE FIDE_VENTA_TB INSERT */
    PROCEDURE FIDE_VENTA_INSERT_SP(
        P_ID_VENTA        IN FIDE_VENTA_TB.ID_VENTA%TYPE,
        P_IDENTIFICACION  IN FIDE_VENTA_TB.IDENTIFICACION%TYPE,
        P_TOTAL_VENTA     IN FIDE_VENTA_TB.TOTAL_VENTA%TYPE,
        P_FECHA_VENTA     IN FIDE_VENTA_TB.FECHA_VENTA%TYPE,
        P_ID_ESTADO       IN FIDE_VENTA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_VENTA_TB(
            ID_VENTA,
            IDENTIFICACION,
            TOTAL_VENTA,
            FECHA_VENTA,
            ID_ESTADO
        )
        VALUES(
            P_ID_VENTA,
            P_IDENTIFICACION,
            P_TOTAL_VENTA,
            P_FECHA_VENTA,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La venta ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_VENTA_INSERT_SP;

    /* PROCEDURE FIDE_VENTA_PRODUCTO_TB INSERT */
    PROCEDURE FIDE_VENTA_PRODUCTO_INSERT_SP(
        P_ID_VENTA           IN FIDE_VENTA_PRODUCTO_TB.ID_VENTA%TYPE,
        P_ID_PRODUCTO        IN FIDE_VENTA_PRODUCTO_TB.ID_PRODUCTO%TYPE,
        P_ID_TIPO_MOVIMIENTO IN FIDE_VENTA_PRODUCTO_TB.ID_TIPO_MOVIMIENTO%TYPE,
        P_CANTIDAD           IN FIDE_VENTA_PRODUCTO_TB.CANTIDAD%TYPE,
        P_TOTAL              IN FIDE_VENTA_PRODUCTO_TB.TOTAL%TYPE,
        P_ID_ESTADO          IN FIDE_VENTA_PRODUCTO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_VENTA_PRODUCTO_TB(
            ID_VENTA,
            ID_PRODUCTO,
            ID_TIPO_MOVIMIENTO,
            CANTIDAD,
            TOTAL,
            ID_ESTADO
        )
        VALUES(
            P_ID_VENTA,
            P_ID_PRODUCTO,
            P_ID_TIPO_MOVIMIENTO,
            P_CANTIDAD,
            P_TOTAL,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El detalle de venta ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_VENTA_PRODUCTO_INSERT_SP;

    /* PROCEDURE FIDE_INVENTARIO_TB INSERT */
    PROCEDURE FIDE_INVENTARIO_INSERT_SP(
        P_ID_INVENTARIO IN FIDE_INVENTARIO_TB.ID_INVENTARIO%TYPE,
        P_ID_PRODUCTO   IN FIDE_INVENTARIO_TB.ID_PRODUCTO%TYPE,
        P_CANTIDAD      IN FIDE_INVENTARIO_TB.CANTIDAD%TYPE,
        P_ID_ESTADO     IN FIDE_INVENTARIO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_INVENTARIO_TB(
            ID_INVENTARIO,
            ID_PRODUCTO,
            CANTIDAD,
            ID_ESTADO
        )
        VALUES(
            P_ID_INVENTARIO,
            P_ID_PRODUCTO,
            P_CANTIDAD,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El inventario ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_INVENTARIO_INSERT_SP;

    /* PROCEDURE FIDE_TIPO_MOVIMIENTO_TB INSERT */
    PROCEDURE FIDE_TIPO_MOVIMIENTO_INSERT_SP(
        P_ID_TIPO_MOVIMIENTO IN FIDE_TIPO_MOVIMIENTO_TB.ID_TIPO_MOVIMIENTO%TYPE,
        P_NOMBRE             IN FIDE_TIPO_MOVIMIENTO_TB.NOMBRE%TYPE,
        P_ID_ESTADO          IN FIDE_TIPO_MOVIMIENTO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_TIPO_MOVIMIENTO_TB(
            ID_TIPO_MOVIMIENTO,
            NOMBRE,
            ID_ESTADO
        )
        VALUES(
            P_ID_TIPO_MOVIMIENTO,
            P_NOMBRE,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El tipo de movimiento ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_TIPO_MOVIMIENTO_INSERT_SP;

    /* PROCEDURE FIDE_MOVIMIENTO_INVENTARIO_TB INSERT */
    PROCEDURE FIDE_MOVIMIENTO_INVENTARIO_INSERT_SP(
        P_ID_MOVIMIENTO       IN FIDE_MOVIMIENTO_INVENTARIO_TB.ID_MOVIMIENTO%TYPE,
        P_ID_PRODUCTO         IN FIDE_MOVIMIENTO_INVENTARIO_TB.ID_PRODUCTO%TYPE,
        P_ID_TIPO_MOVIMIENTO  IN FIDE_MOVIMIENTO_INVENTARIO_TB.ID_TIPO_MOVIMIENTO%TYPE,
        P_CANTIDAD            IN FIDE_MOVIMIENTO_INVENTARIO_TB.CANTIDAD%TYPE,
        P_FECHA_MOVIMIENTO    IN FIDE_MOVIMIENTO_INVENTARIO_TB.FECHA_MOVIMIENTO%TYPE,
        P_ID_ESTADO           IN FIDE_MOVIMIENTO_INVENTARIO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_MOVIMIENTO_INVENTARIO_TB(
            ID_MOVIMIENTO,
            ID_PRODUCTO,
            ID_TIPO_MOVIMIENTO,
            CANTIDAD,
            FECHA_MOVIMIENTO,
            ID_ESTADO
        )
        VALUES(
            P_ID_MOVIMIENTO,
            P_ID_PRODUCTO,
            P_ID_TIPO_MOVIMIENTO,
            P_CANTIDAD,
            P_FECHA_MOVIMIENTO,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El movimiento de inventario ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_MOVIMIENTO_INVENTARIO_INSERT_SP;

    /* PROCEDURE FIDE_MONEDA_TB INSERT */
    PROCEDURE FIDE_MONEDA_INSERT_SP(
        P_ID_MONEDA  IN FIDE_MONEDA_TB.ID_MONEDA%TYPE,
        P_NOMBRE     IN FIDE_MONEDA_TB.NOMBRE%TYPE,
        P_SIMBOLO    IN FIDE_MONEDA_TB.SIMBOLO%TYPE,
        P_ID_ESTADO  IN FIDE_MONEDA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_MONEDA_TB(
            ID_MONEDA,
            NOMBRE,
            SIMBOLO,
            ID_ESTADO
        )
        VALUES(
            P_ID_MONEDA,
            P_NOMBRE,
            P_SIMBOLO,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La moneda ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_MONEDA_INSERT_SP;

    /* PROCEDURE FIDE_FACTURA_TB INSERT */
    PROCEDURE FIDE_FACTURA_INSERT_SP(
        P_ID_FACTURA  IN FIDE_FACTURA_TB.ID_FACTURA%TYPE,
        P_ID_MONEDA   IN FIDE_FACTURA_TB.ID_MONEDA%TYPE,
        P_TOTAL       IN FIDE_FACTURA_TB.TOTAL%TYPE,
        P_FECHA       IN FIDE_FACTURA_TB.FECHA_FACTURA%TYPE,
        P_ID_ESTADO   IN FIDE_FACTURA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_FACTURA_TB(
            ID_FACTURA,
            ID_MONEDA,
            TOTAL,
            FECHA_FACTURA,
            ID_ESTADO
        )
        VALUES(
            P_ID_FACTURA,
            P_ID_MONEDA,
            P_TOTAL,
            P_FECHA,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La factura ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_FACTURA_INSERT_SP;

    /* PROCEDURE FIDE_VENTA_FACTURA_TB INSERT */
    PROCEDURE FIDE_VENTA_FACTURA_INSERT_SP(
        P_ID_VENTA   IN FIDE_VENTA_FACTURA_TB.ID_VENTA%TYPE,
        P_ID_FACTURA IN FIDE_VENTA_FACTURA_TB.ID_FACTURA%TYPE,
        P_ID_ESTADO  IN FIDE_VENTA_FACTURA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_VENTA_FACTURA_TB(
            ID_VENTA,
            ID_FACTURA,
            ID_ESTADO
        )
        VALUES(
            P_ID_VENTA,
            P_ID_FACTURA,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La relaciÃ³n venta-factura ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_VENTA_FACTURA_INSERT_SP;

    /* PROCEDURE FIDE_DONACION_FACTURA_TB INSERT */
    PROCEDURE FIDE_DONACION_FACTURA_INSERT_SP(
        P_ID_DONACION IN FIDE_DONACION_FACTURA_TB.ID_DONACION%TYPE,
        P_ID_FACTURA  IN FIDE_DONACION_FACTURA_TB.ID_FACTURA%TYPE,
        P_ID_ESTADO   IN FIDE_DONACION_FACTURA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_DONACION_FACTURA_TB(
            ID_DONACION,
            ID_FACTURA,
            ID_ESTADO
        )
        VALUES(
            P_ID_DONACION,
            P_ID_FACTURA,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La relaciÃ³n donaciÃ³n-factura ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_DONACION_FACTURA_INSERT_SP;

    /* PROCEDURE FIDE_PAGO_PAYPAL_TB INSERT */
    PROCEDURE FIDE_PAGO_PAYPAL_INSERT_SP(
        P_ID_PAGO           IN FIDE_PAGO_PAYPAL_TB.ID_PAGO%TYPE,
        P_ID_FACTURA        IN FIDE_PAGO_PAYPAL_TB.ID_FACTURA%TYPE,
        P_PAYPAL_ORDER_ID   IN FIDE_PAGO_PAYPAL_TB.PAYPAL_ORDER_ID%TYPE,
        P_PAYPAL_CAPTURE_ID IN FIDE_PAGO_PAYPAL_TB.PAYPAL_CAPTURE_ID%TYPE,
        P_FECHA_PAGO        IN FIDE_PAGO_PAYPAL_TB.FECHA_PAGO%TYPE,
        P_ID_ESTADO         IN FIDE_PAGO_PAYPAL_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_PAGO_PAYPAL_TB(
            ID_PAGO,
            ID_FACTURA,
            PAYPAL_ORDER_ID,
            PAYPAL_CAPTURE_ID,
            FECHA_PAGO,
            ID_ESTADO
        )
        VALUES(
            P_ID_PAGO,
            P_ID_FACTURA,
            P_PAYPAL_ORDER_ID,
            P_PAYPAL_CAPTURE_ID,
            P_FECHA_PAGO,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El pago ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_PAGO_PAYPAL_INSERT_SP;

    /* PROCEDURE FIDE_RAZA_TB INSERT */
    PROCEDURE FIDE_RAZA_INSERT_SP(
        P_ID_RAZA   IN FIDE_RAZA_TB.ID_RAZA%TYPE,
        P_NOMBRE    IN FIDE_RAZA_TB.NOMBRE%TYPE,
        P_ID_ESTADO IN FIDE_RAZA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_RAZA_TB(
            ID_RAZA,
            NOMBRE,
            ID_ESTADO
        )
        VALUES(
            P_ID_RAZA,
            P_NOMBRE,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La raza ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_RAZA_INSERT_SP;

    /* PROCEDURE FIDE_SEXO_TB INSERT */
    PROCEDURE FIDE_SEXO_INSERT_SP(
        P_ID_SEXO   IN FIDE_SEXO_TB.ID_SEXO%TYPE,
        P_NOMBRE    IN FIDE_SEXO_TB.NOMBRE%TYPE,
        P_ID_ESTADO IN FIDE_SEXO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_SEXO_TB(
            ID_SEXO,
            NOMBRE,
            ID_ESTADO
        )
        VALUES(
            P_ID_SEXO,
            P_NOMBRE,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El sexo ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_SEXO_INSERT_SP;

    /* PROCEDURE FIDE_PERRITO_TB INSERT */
    PROCEDURE FIDE_PERRITO_INSERT_SP(
        P_ID_PERRITO   IN FIDE_PERRITO_TB.ID_PERRITO%TYPE,
        P_NOMBRE       IN FIDE_PERRITO_TB.NOMBRE%TYPE,
        P_FECHA_INGRESO IN FIDE_PERRITO_TB.FECHA_INGRESO%TYPE,
        P_EDAD         IN FIDE_PERRITO_TB.EDAD%TYPE,
        P_PESO         IN FIDE_PERRITO_TB.PESO%TYPE,
        P_ESTATURA     IN FIDE_PERRITO_TB.ESTATURA%TYPE,
        P_ID_SEXO      IN FIDE_PERRITO_TB.ID_SEXO%TYPE,
        P_ID_RAZA      IN FIDE_PERRITO_TB.ID_RAZA%TYPE,
        P_ID_ESTADO    IN FIDE_PERRITO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_PERRITO_TB(
            ID_PERRITO,
            NOMBRE,
            FECHA_INGRESO,
            EDAD,
            PESO,
            ESTATURA,
            ID_SEXO,
            ID_RAZA,
            ID_ESTADO
        )
        VALUES(
            P_ID_PERRITO,
            P_NOMBRE,
            P_FECHA_INGRESO,
            P_EDAD,
            P_PESO,
            P_ESTATURA,
            P_ID_SEXO,
            P_ID_RAZA,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El perrito ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_PERRITO_INSERT_SP;

    /* PROCEDURE FIDE_PERRITO_IMAGE_TB INSERT */
    PROCEDURE FIDE_PERRITO_IMAGE_INSERT_SP(
        P_ID_IMAGEN   IN FIDE_PERRITO_IMAGE_TB.ID_IMAGEN%TYPE,
        P_ID_PERRITO  IN FIDE_PERRITO_IMAGE_TB.ID_PERRITO%TYPE,
        P_IMAGE_URL   IN FIDE_PERRITO_IMAGE_TB.IMAGE_URL%TYPE,
        P_ID_ESTADO   IN FIDE_PERRITO_IMAGE_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_PERRITO_IMAGE_TB(
            ID_IMAGEN,
            ID_PERRITO,
            IMAGE_URL,
            ID_ESTADO
        )
        VALUES(
            P_ID_IMAGEN,
            P_ID_PERRITO,
            P_IMAGE_URL,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La imagen del perrito ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_PERRITO_IMAGE_INSERT_SP;

    /* PROCEDURE FIDE_TIPO_SOLICITUD_TB INSERT */
    PROCEDURE FIDE_TIPO_SOLICITUD_INSERT_SP(
        P_ID_TIPO_SOLICITUD IN FIDE_TIPO_SOLICITUD_TB.ID_TIPO_SOLICITUD%TYPE,
        P_NOMBRE            IN FIDE_TIPO_SOLICITUD_TB.NOMBRE%TYPE,
        P_ID_ESTADO         IN FIDE_TIPO_SOLICITUD_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_TIPO_SOLICITUD_TB(
            ID_TIPO_SOLICITUD,
            NOMBRE,
            ID_ESTADO
        )
        VALUES(
            P_ID_TIPO_SOLICITUD,
            P_NOMBRE,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El tipo de solicitud ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_TIPO_SOLICITUD_INSERT_SP;

    /* PROCEDURE FIDE_SOLICITUD_TB INSERT */
    PROCEDURE FIDE_SOLICITUD_INSERT_SP(
        P_ID_SOLICITUD      IN FIDE_SOLICITUD_TB.ID_SOLICITUD%TYPE,
        P_IDENTIFICACION    IN FIDE_SOLICITUD_TB.IDENTIFICACION%TYPE,
        P_ID_PERRITO        IN FIDE_SOLICITUD_TB.ID_PERRITO%TYPE,
        P_ID_TIPO_SOLICITUD IN FIDE_SOLICITUD_TB.ID_TIPO_SOLICITUD%TYPE,
        P_ID_ESTADO         IN FIDE_SOLICITUD_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_SOLICITUD_TB(
            ID_SOLICITUD,
            IDENTIFICACION,
            ID_PERRITO,
            ID_TIPO_SOLICITUD,
            ID_ESTADO
        )
        VALUES(
            P_ID_SOLICITUD,
            P_IDENTIFICACION,
            P_ID_PERRITO,
            P_ID_TIPO_SOLICITUD,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La solicitud ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_SOLICITUD_INSERT_SP;

    /* PROCEDURE FIDE_TIPO_RESPUESTA_TB INSERT */
    PROCEDURE FIDE_TIPO_RESPUESTA_INSERT_SP(
        P_ID_TIPO_RESPUESTA IN FIDE_TIPO_RESPUESTA_TB.ID_TIPO_RESPUESTA%TYPE,
        P_NOMBRE            IN FIDE_TIPO_RESPUESTA_TB.NOMBRE%TYPE,
        P_ID_ESTADO         IN FIDE_TIPO_RESPUESTA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_TIPO_RESPUESTA_TB(
            ID_TIPO_RESPUESTA,
            NOMBRE,
            ID_ESTADO
        )
        VALUES(
            P_ID_TIPO_RESPUESTA,
            P_NOMBRE,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El tipo de respuesta ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_TIPO_RESPUESTA_INSERT_SP;

    /* PROCEDURE FIDE_PREGUNTA_TB INSERT */
    PROCEDURE FIDE_PREGUNTA_INSERT_SP(
        P_ID_PREGUNTA       IN FIDE_PREGUNTA_TB.ID_PREGUNTA%TYPE,
        P_PREGUNTA          IN FIDE_PREGUNTA_TB.PREGUNTA%TYPE,
        P_ID_TIPO_RESPUESTA IN FIDE_PREGUNTA_TB.ID_TIPO_RESPUESTA%TYPE,
        P_ID_ESTADO         IN FIDE_PREGUNTA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_PREGUNTA_TB(
            ID_PREGUNTA,
            PREGUNTA,
            ID_TIPO_RESPUESTA,
            ID_ESTADO
        )
        VALUES(
            P_ID_PREGUNTA,
            P_PREGUNTA,
            P_ID_TIPO_RESPUESTA,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La pregunta ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_PREGUNTA_INSERT_SP;

    /* PROCEDURE FIDE_RESPUESTA_TB INSERT */
    PROCEDURE FIDE_RESPUESTA_INSERT_SP(
        P_ID_RESPUESTA IN FIDE_RESPUESTA_TB.ID_RESPUESTA%TYPE,
        P_ID_SOLICITUD IN FIDE_RESPUESTA_TB.ID_SOLICITUD%TYPE,
        P_ID_PREGUNTA  IN FIDE_RESPUESTA_TB.ID_PREGUNTA%TYPE,
        P_RESPUESTA    IN FIDE_RESPUESTA_TB.RESPUESTA%TYPE,
        P_ID_ESTADO    IN FIDE_RESPUESTA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_RESPUESTA_TB(
            ID_RESPUESTA,
            ID_SOLICITUD,
            ID_PREGUNTA,
            RESPUESTA,
            ID_ESTADO
        )
        VALUES(
            P_ID_RESPUESTA,
            P_ID_SOLICITUD,
            P_ID_PREGUNTA,
            P_RESPUESTA,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La respuesta ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_RESPUESTA_INSERT_SP;

    /* PROCEDURE FIDE_CASA_CUNA_TB INSERT */
    PROCEDURE FIDE_CASA_CUNA_INSERT_SP(
        P_ID_CASA_CUNA   IN FIDE_CASA_CUNA_TB.ID_CASA_CUNA%TYPE,
        P_NOMBRE         IN FIDE_CASA_CUNA_TB.NOMBRE%TYPE,
        P_ID_DIRECCION   IN FIDE_CASA_CUNA_TB.ID_DIRECCION%TYPE,
        P_IDENTIFICACION IN FIDE_CASA_CUNA_TB.IDENTIFICACION%TYPE,
        P_ID_SOLICITUD   IN FIDE_CASA_CUNA_TB.ID_SOLICITUD%TYPE,
        P_ID_ESTADO      IN FIDE_CASA_CUNA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_CASA_CUNA_TB(
            ID_CASA_CUNA,
            NOMBRE,
            ID_DIRECCION,
            IDENTIFICACION,
            ID_SOLICITUD,
            ID_ESTADO
        )
        VALUES(
            P_ID_CASA_CUNA,
            P_NOMBRE,
            P_ID_DIRECCION,
            P_IDENTIFICACION,
            P_ID_SOLICITUD,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La casa cuna ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_CASA_CUNA_INSERT_SP;

    /* PROCEDURE FIDE_CASA_PERRITO_TB INSERT */
    PROCEDURE FIDE_CASA_PERRITO_INSERT_SP(
        P_ID_CASA_CUNA IN FIDE_CASA_PERRITO_TB.ID_CASA_CUNA%TYPE,
        P_ID_PERRITO   IN FIDE_CASA_PERRITO_TB.ID_PERRITO%TYPE,
        P_ID_ESTADO    IN FIDE_CASA_PERRITO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_CASA_PERRITO_TB(
            ID_CASA_CUNA,
            ID_PERRITO,
            ID_ESTADO
        )
        VALUES(
            P_ID_CASA_CUNA,
            P_ID_PERRITO,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La relaciÃ³n casa-perrito ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_CASA_PERRITO_INSERT_SP;

    /* PROCEDURE FIDE_ADOPCION_TB INSERT */
    PROCEDURE FIDE_ADOPCION_INSERT_SP(
        P_ID_ADOPCION     IN FIDE_ADOPCION_TB.ID_ADOPCION%TYPE,
        P_IDENTIFICACION  IN FIDE_ADOPCION_TB.IDENTIFICACION%TYPE,
        P_ID_SOLICITUD    IN FIDE_ADOPCION_TB.ID_SOLICITUD%TYPE,
        P_FECHA_ADOPCION  IN FIDE_ADOPCION_TB.FECHA_ADOPCION%TYPE,
        P_ID_ESTADO       IN FIDE_ADOPCION_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_ADOPCION_TB(
            ID_ADOPCION,
            IDENTIFICACION,
            ID_SOLICITUD,
            FECHA_ADOPCION,
            ID_ESTADO
        )
        VALUES(
            P_ID_ADOPCION,
            P_IDENTIFICACION,
            P_ID_SOLICITUD,
            P_FECHA_ADOPCION,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La adopciÃ³n ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_ADOPCION_INSERT_SP;

    /* PROCEDURE FIDE_TIPO_SEGUIMIENTO INSERT */
    PROCEDURE FIDE_TIPO_SEGUIMIENTO_INSERT_SP(
        P_ID_TIPO_SEGUIMIENTO IN FIDE_TIPO_SEGUIMIENTO.ID_TIPO_SEGUIMIENTO%TYPE,
        P_NOMBRE              IN FIDE_TIPO_SEGUIMIENTO.NOMBRE%TYPE,
        P_ID_ESTADO           IN FIDE_TIPO_SEGUIMIENTO.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_TIPO_SEGUIMIENTO(
            ID_TIPO_SEGUIMIENTO,
            NOMBRE,
            ID_ESTADO
        )
        VALUES(
            P_ID_TIPO_SEGUIMIENTO,
            P_NOMBRE,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El tipo de seguimiento ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_TIPO_SEGUIMIENTO_INSERT_SP;

    /* PROCEDURE FIDE_SEGUIMIENTO_TB INSERT */
    PROCEDURE FIDE_SEGUIMIENTO_INSERT_SP(
        P_ID_SEGUIMIENTO      IN FIDE_SEGUIMIENTO_TB.ID_SEGUIMIENTO%TYPE,
        P_ID_ADOPCION         IN FIDE_SEGUIMIENTO_TB.ID_ADOPCION%TYPE,
        P_ID_TIPO_SEGUIMIENTO IN FIDE_SEGUIMIENTO_TB.ID_TIPO_SEGUIMIENTO%TYPE,
        P_FECHA_INICIO        IN FIDE_SEGUIMIENTO_TB.FECHA_INICIO%TYPE,
        P_FECHA_FIN           IN FIDE_SEGUIMIENTO_TB.FECHA_FIN%TYPE,
        P_COMENTARIOS         IN FIDE_SEGUIMIENTO_TB.COMENTARIOS%TYPE,
        P_ID_ESTADO           IN FIDE_SEGUIMIENTO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_SEGUIMIENTO_TB(
            ID_SEGUIMIENTO,
            ID_ADOPCION,
            ID_TIPO_SEGUIMIENTO,
            FECHA_INICIO,
            FECHA_FIN,
            COMENTARIOS,
            ID_ESTADO
        )
        VALUES(
            P_ID_SEGUIMIENTO,
            P_ID_ADOPCION,
            P_ID_TIPO_SEGUIMIENTO,
            P_FECHA_INICIO,
            P_FECHA_FIN,
            P_COMENTARIOS,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El seguimiento ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_SEGUIMIENTO_INSERT_SP;

    /* PROCEDURE FIDE_EVIDENCIA_TB INSERT */
    PROCEDURE FIDE_EVIDENCIA_INSERT_SP(
        P_ID_EVIDENCIA   IN FIDE_EVIDENCIA_TB.ID_EVIDENCIA%TYPE,
        P_ID_SEGUIMIENTO IN FIDE_EVIDENCIA_TB.ID_SEGUIMIENTO%TYPE,
        P_IMAGEN_URL     IN FIDE_EVIDENCIA_TB.IMAGEN_URL%TYPE,
        P_COMENTARIOS    IN FIDE_EVIDENCIA_TB.COMENTARIOS%TYPE,
        P_FECHA          IN FIDE_EVIDENCIA_TB.FECHA_EVIDENCIA%TYPE,
        P_ID_ESTADO      IN FIDE_EVIDENCIA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_EVIDENCIA_TB(
            ID_EVIDENCIA,
            ID_SEGUIMIENTO,
            IMAGEN_URL,
            COMENTARIOS,
            FECHA_EVIDENCIA,
            ID_ESTADO
        )
        VALUES(
            P_ID_EVIDENCIA,
            P_ID_SEGUIMIENTO,
            P_IMAGEN_URL,
            P_COMENTARIOS,
            P_FECHA,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La evidencia ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_EVIDENCIA_INSERT_SP;

    /* PROCEDURE FIDE_CAMPANIA_TB INSERT */
    PROCEDURE FIDE_CAMPANIA_INSERT_SP(
        P_ID_CAMPANIA   IN FIDE_CAMPANIA_TB.ID_CAMPANIA%TYPE,
        P_NOMBRE        IN FIDE_CAMPANIA_TB.NOMBRE%TYPE,
        P_DESCRIPCION   IN FIDE_CAMPANIA_TB.DESCRIPCION%TYPE,
        P_FECHA_INICIO  IN FIDE_CAMPANIA_TB.FECHA_INICIO%TYPE,
        P_FECHA_FIN     IN FIDE_CAMPANIA_TB.FECHA_FIN%TYPE,
        P_ID_ESTADO     IN FIDE_CAMPANIA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_CAMPANIA_TB(
            ID_CAMPANIA,
            NOMBRE,
            DESCRIPCION,
            FECHA_INICIO,
            FECHA_FIN,
            ID_ESTADO
        )
        VALUES(
            P_ID_CAMPANIA,
            P_NOMBRE,
            P_DESCRIPCION,
            P_FECHA_INICIO,
            P_FECHA_FIN,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La campaÃ±a ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_CAMPANIA_INSERT_SP;

    /* PROCEDURE FIDE_DONACION_TB INSERT */
    PROCEDURE FIDE_DONACION_INSERT_SP(
        P_ID_DONACION      IN FIDE_DONACION_TB.ID_DONACION%TYPE,
        P_IDENTIFICACION   IN FIDE_DONACION_TB.IDENTIFICACION%TYPE,
        P_ID_CAMPANIA      IN FIDE_DONACION_TB.ID_CAMPANIA%TYPE,
        P_MONTO            IN FIDE_DONACION_TB.MONTO%TYPE,
        P_FECHA_DONACION   IN FIDE_DONACION_TB.FECHA_DONACION%TYPE,
        P_MENSAJE          IN FIDE_DONACION_TB.MENSAJE%TYPE,
        P_ID_ESTADO        IN FIDE_DONACION_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_DONACION_TB(
            ID_DONACION,
            IDENTIFICACION,
            ID_CAMPANIA,
            MONTO,
            FECHA_DONACION,
            MENSAJE,
            ID_ESTADO
        )
        VALUES(
            P_ID_DONACION,
            P_IDENTIFICACION,
            P_ID_CAMPANIA,
            P_MONTO,
            P_FECHA_DONACION,
            P_MENSAJE,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La donaciÃ³n ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_DONACION_INSERT_SP;

    /* PROCEDURE FIDE_TIPO_EVENTO_TB INSERT */
    PROCEDURE FIDE_TIPO_EVENTO_INSERT_SP( 
        P_ID_TIPO_EVENTO IN FIDE_TIPO_EVENTO_TB.ID_TIPO_EVENTO%TYPE,
        P_NOMBRE         IN FIDE_TIPO_EVENTO_TB.NOMBRE%TYPE,
        P_ID_ESTADO      IN FIDE_TIPO_EVENTO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_TIPO_EVENTO_TB(
            ID_TIPO_EVENTO,
            NOMBRE,
            ID_ESTADO
        )
        VALUES(
            P_ID_TIPO_EVENTO,
            P_NOMBRE,
            P_ID_ESTADO
        );

        COMMIT; 
    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El tipo de evento ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_TIPO_EVENTO_INSERT_SP;

    /* PROCEDURE FIDE_EVENTO_PERRITO_TB INSERT */
    PROCEDURE FIDE_EVENTO_PERRITO_INSERT_SP(
        P_ID_EVENTO      IN FIDE_EVENTO_PERRITO_TB.ID_EVENTO%TYPE,
        P_ID_PERRITO     IN FIDE_EVENTO_PERRITO_TB.ID_PERRITO%TYPE,
        P_ID_TIPO_EVENTO IN FIDE_EVENTO_PERRITO_TB.ID_TIPO_EVENTO%TYPE,
        P_FECHA_EVENTO   IN FIDE_EVENTO_PERRITO_TB.FECHA_EVENTO%TYPE,
        P_DETALLE        IN FIDE_EVENTO_PERRITO_TB.DETALLE%TYPE,
        P_TOTAL_GASTO    IN FIDE_EVENTO_PERRITO_TB.TOTAL_GASTO%TYPE,
        P_ID_ESTADO      IN FIDE_EVENTO_PERRITO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_EVENTO_PERRITO_TB(
            ID_EVENTO,
            ID_PERRITO,
            ID_TIPO_EVENTO,
            FECHA_EVENTO,
            DETALLE,
            TOTAL_GASTO,
            ID_ESTADO
        )
        VALUES(
            P_ID_EVENTO,
            P_ID_PERRITO,
            P_ID_TIPO_EVENTO,
            P_FECHA_EVENTO,
            P_DETALLE,
            P_TOTAL_GASTO,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El evento ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_EVENTO_PERRITO_INSERT_SP;

    /* PROCEDURE FIDE_DETALLE_EVENTO_TB INSERT */
    PROCEDURE FIDE_DETALLE_EVENTO_INSERT_SP(
        P_ID_DETALLE_EVENTO IN FIDE_DETALLE_EVENTO_TB.ID_DETALLE_EVENTO%TYPE,
        P_ID_EVENTO         IN FIDE_DETALLE_EVENTO_TB.ID_EVENTO%TYPE,
        P_COMPROBANTE_URL   IN FIDE_DETALLE_EVENTO_TB.COMPROBANTE_URL%TYPE,
        P_DESCRIPCION       IN FIDE_DETALLE_EVENTO_TB.DESCRIPCION%TYPE,
        P_MONTO             IN FIDE_DETALLE_EVENTO_TB.MONTO%TYPE,
        P_ID_ESTADO         IN FIDE_DETALLE_EVENTO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_DETALLE_EVENTO_TB(
            ID_DETALLE_EVENTO,
            ID_EVENTO,
            COMPROBANTE_URL,
            DESCRIPCION,
            MONTO,
            ID_ESTADO
        )
        VALUES(
            P_ID_DETALLE_EVENTO,
            P_ID_EVENTO,
            P_COMPROBANTE_URL,
            P_DESCRIPCION,
            P_MONTO,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El detalle del evento ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_DETALLE_EVENTO_INSERT_SP;
END FIDE_INSERT_PKG;
/

CREATE OR REPLACE PACKAGE BODY FIDE_UPDATE_PKG AS
    /* PROCEDURE FIDE_ESTADO_TB UPDATE */
    PROCEDURE FIDE_ESTADO_UPDATE_SP(
        P_ID_ESTADO IN FIDE_ESTADO_TB.ID_ESTADO%TYPE,
        P_NOMBRE_ESTADO IN FIDE_ESTADO_TB.NOMBRE_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN
        UPDATE FIDE_ESTADO_TB
        SET 
            NOMBRE = P_NOMBRE
        WHERE ID_ESTADO = P_ID_ESTADO;
        
        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el estado con ese ID.');
        END IF;
        
        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_ESTADO_UPDATE_SP;

    /* PROCEDURE FIDE_TIPO_USUARIO_TB UPDATE */
    PROCEDURE FIDE_TIPO_USUARIO_UPDATE_SP(
        P_ID_TIPO_USUARIO IN FIDE_TIPO_USUARIO_TB.ID_TIPO_USUARIO%TYPE,
        P_NOMBRE          IN FIDE_TIPO_USUARIO_TB.NOMBRE%TYPE,
        P_ID_ESTADO       IN FIDE_TIPO_USUARIO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN
        UPDATE FIDE_TIPO_USUARIO_TB
        SET 
            NOMBRE = P_NOMBRE,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_TIPO_USUARIO = P_ID_TIPO_USUARIO;
        
        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el tipo de usuario con ese ID.');
        END IF;
        
        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_TIPO_USUARIO_UPDATE_SP;

    /* PROCEDURE FIDE_USUARIO_TB UPDATE */
    PROCEDURE FIDE_USUARIO_UPDATE_SP(
        P_IDENTIFICACION     IN FIDE_USUARIO_TB.IDENTIFICACION%TYPE,
        P_NOMBRE             IN FIDE_USUARIO_TB.NOMBRE%TYPE,
        P_APELLIDO_PATERNO   IN FIDE_USUARIO_TB.APELLIDO_PATERNO%TYPE,
        P_APELLIDO_MATERNO   IN FIDE_USUARIO_TB.APELLIDO_MATERNO%TYPE,
        P_ID_DIRECCION       IN FIDE_USUARIO_TB.ID_DIRECCION%TYPE,
        P_ID_TIPO_USUARIO    IN FIDE_USUARIO_TB.ID_TIPO_USUARIO%TYPE,
        P_ID_ESTADO          IN FIDE_USUARIO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_USUARIO_TB
        SET
            NOMBRE = P_NOMBRE,
            APELLIDO_PATERNO = P_APELLIDO_PATERNO,
            APELLIDO_MATERNO = P_APELLIDO_MATERNO,
            ID_DIRECCION = P_ID_DIRECCION,
            ID_TIPO_USUARIO = P_ID_TIPO_USUARIO,
            ID_ESTADO = P_ID_ESTADO
        WHERE IDENTIFICACION = P_IDENTIFICACION;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el usuario con esa identificaciÃ³n.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_USUARIO_UPDATE_SP;

    /* PROCEDURE FIDE_CORREO_TB UPDATE */
    PROCEDURE FIDE_CORREO_UPDATE_SP(
        P_IDENTIFICACION IN FIDE_CORREO_TB.IDENTIFICACION%TYPE,
        P_CORREO         IN FIDE_CORREO_TB.CORREO%TYPE,
        P_ID_ESTADO      IN FIDE_CORREO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_CORREO_TB
        SET ID_ESTADO = P_ID_ESTADO
        WHERE IDENTIFICACION = P_IDENTIFICACION
        AND CORREO = P_CORREO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el correo.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_CORREO_UPDATE_SP;

    /* PROCEDURE FIDE_TELEFONO_TB UPDATE */
    PROCEDURE FIDE_TELEFONO_UPDATE_SP(
        P_IDENTIFICACION IN FIDE_TELEFONO_TB.IDENTIFICACION%TYPE,
        P_TELEFONO       IN FIDE_TELEFONO_TB.TELEFONO%TYPE,
        P_ID_ESTADO      IN FIDE_TELEFONO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_TELEFONO_TB
        SET ID_ESTADO = P_ID_ESTADO
        WHERE IDENTIFICACION = P_IDENTIFICACION
        AND TELEFONO = P_TELEFONO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el telÃ©fono.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_TELEFONO_UPDATE_SP;

    /* PROCEDURE FIDE_CUENTA_TB UPDATE */
    PROCEDURE FIDE_CUENTA_UPDATE_SP(
        P_ID_CUENTA        IN FIDE_CUENTA_TB.ID_CUENTA%TYPE,
        P_IDENTIFICACION   IN FIDE_CUENTA_TB.IDENTIFICACION%TYPE,
        P_USUARIO          IN FIDE_CUENTA_TB.USUARIO%TYPE,
        P_PASSWORD_HASH    IN FIDE_CUENTA_TB.PASSWORD_HASH%TYPE,
        P_ID_ESTADO        IN FIDE_CUENTA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_CUENTA_TB
        SET
            IDENTIFICACION = P_IDENTIFICACION,
            USUARIO = P_USUARIO,
            PASSWORD_HASH = P_PASSWORD_HASH,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_CUENTA = P_ID_CUENTA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la cuenta con ese ID.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_CUENTA_UPDATE_SP;

    /* PROCEDURE FIDE_TIPO_OTP_TB UPDATE */
    PROCEDURE FIDE_TIPO_OTP_UPDATE_SP(
        P_ID_TIPO_OTP IN FIDE_TIPO_OTP_TB.ID_TIPO_OTP%TYPE,
        P_NOMBRE      IN FIDE_TIPO_OTP_TB.NOMBRE%TYPE,
        P_ID_ESTADO   IN FIDE_TIPO_OTP_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_TIPO_OTP_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_TIPO_OTP = P_ID_TIPO_OTP;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el tipo OTP.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_TIPO_OTP_UPDATE_SP;

    /* PROCEDURE FIDE_CODIGO_OTP_TB UPDATE */
    PROCEDURE FIDE_CODIGO_OTP_UPDATE_SP(
        P_ID_CODIGO_OTP     IN FIDE_CODIGO_OTP_TB.ID_CODIGO_OTP%TYPE,
        P_ID_CUENTA         IN FIDE_CODIGO_OTP_TB.ID_CUENTA%TYPE,
        P_ID_TIPO_OTP       IN FIDE_CODIGO_OTP_TB.ID_TIPO_OTP%TYPE,
        P_CODIGO_HASH       IN FIDE_CODIGO_OTP_TB.CODIGO_HASH%TYPE,
        P_FECHA_EXPIRACION  IN FIDE_CODIGO_OTP_TB.FECHA_EXPIRACION%TYPE,
        P_FECHA_USO         IN FIDE_CODIGO_OTP_TB.FECHA_USO%TYPE,
        P_INTENTOS          IN FIDE_CODIGO_OTP_TB.INTENTOS%TYPE,
        P_FECHA_CREACION    IN FIDE_CODIGO_OTP_TB.FECHA_CREACION%TYPE,
        P_ID_ESTADO         IN FIDE_CODIGO_OTP_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_CODIGO_OTP_TB
        SET
            ID_CUENTA = P_ID_CUENTA,
            ID_TIPO_OTP = P_ID_TIPO_OTP,
            CODIGO_HASH = P_CODIGO_HASH,
            FECHA_EXPIRACION = P_FECHA_EXPIRACION,
            FECHA_USO = P_FECHA_USO,
            INTENTOS = P_INTENTOS,
            FECHA_CREACION = P_FECHA_CREACION,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_CODIGO_OTP = P_ID_CODIGO_OTP;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el cÃ³digo OTP.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_CODIGO_OTP_UPDATE_SP;

    /* PROCEDURE FIDE_REFRESH_TOKEN_TB UPDATE */
    PROCEDURE FIDE_REFRESH_TOKEN_UPDATE_SP(
        P_ID_REFRESH_TOKEN   IN FIDE_REFRESH_TOKEN_TB.ID_REFRESH_TOKEN%TYPE,
        P_ID_CUENTA          IN FIDE_REFRESH_TOKEN_TB.ID_CUENTA%TYPE,
        P_TOKEN_HASH         IN FIDE_REFRESH_TOKEN_TB.TOKEN_HASH%TYPE,
        P_JTI                IN FIDE_REFRESH_TOKEN_TB.JTI%TYPE,
        P_IP_ADDRESS         IN FIDE_REFRESH_TOKEN_TB.IP_ADDRESS%TYPE,
        P_USER_AGENT         IN FIDE_REFRESH_TOKEN_TB.USER_AGENT%TYPE,
        P_FECHA_EXPIRACION   IN FIDE_REFRESH_TOKEN_TB.FECHA_EXPIRACION%TYPE,
        P_FECHA_REVOCACION   IN FIDE_REFRESH_TOKEN_TB.FECHA_REVOCACION%TYPE,
        P_ID_ESTADO          IN FIDE_REFRESH_TOKEN_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_REFRESH_TOKEN_TB
        SET
            ID_CUENTA = P_ID_CUENTA,
            TOKEN_HASH = P_TOKEN_HASH,
            JTI = P_JTI,
            IP_ADDRESS = P_IP_ADDRESS,
            USER_AGENT = P_USER_AGENT,
            FECHA_EXPIRACION = P_FECHA_EXPIRACION,
            FECHA_REVOCACION = P_FECHA_REVOCACION,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_REFRESH_TOKEN = P_ID_REFRESH_TOKEN;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el refresh token.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_REFRESH_TOKEN_UPDATE_SP;

    /* PROCEDURE FIDE_PAIS_TB UPDATE */
    PROCEDURE FIDE_PAIS_UPDATE_SP(
        P_ID_PAIS    IN FIDE_PAIS_TB.ID_PAIS%TYPE,
        P_NOMBRE     IN FIDE_PAIS_TB.NOMBRE%TYPE,
        P_ID_ESTADO  IN FIDE_PAIS_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_PAIS_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_PAIS = P_ID_PAIS;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el paÃ­s.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_PAIS_UPDATE_SP;

    /* PROCEDURE FIDE_PROVINCIA_TB UPDATE */
    PROCEDURE FIDE_PROVINCIA_UPDATE_SP(
        P_ID_PROVINCIA IN FIDE_PROVINCIA_TB.ID_PROVINCIA%TYPE,
        P_NOMBRE       IN FIDE_PROVINCIA_TB.NOMBRE%TYPE,
        P_ID_PAIS      IN FIDE_PROVINCIA_TB.ID_PAIS%TYPE,
        P_ID_ESTADO    IN FIDE_PROVINCIA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_PROVINCIA_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_PAIS = P_ID_PAIS,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_PROVINCIA = P_ID_PROVINCIA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la provincia.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_PROVINCIA_UPDATE_SP;

    /* PROCEDURE FIDE_CANTON_TB UPDATE */
    PROCEDURE FIDE_CANTON_UPDATE_SP(
        P_ID_CANTON     IN FIDE_CANTON_TB.ID_CANTON%TYPE,
        P_NOMBRE        IN FIDE_CANTON_TB.NOMBRE%TYPE,
        P_ID_PROVINCIA  IN FIDE_CANTON_TB.ID_PROVINCIA%TYPE,
        P_ID_ESTADO     IN FIDE_CANTON_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_CANTON_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_PROVINCIA = P_ID_PROVINCIA,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_CANTON = P_ID_CANTON;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el cantÃ³n.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_CANTON_UPDATE_SP;

    /* PROCEDURE FIDE_DISTRITO_TB UPDATE */
    PROCEDURE FIDE_DISTRITO_UPDATE_SP(
        P_ID_DISTRITO  IN FIDE_DISTRITO_TB.ID_DISTRITO%TYPE,
        P_NOMBRE       IN FIDE_DISTRITO_TB.NOMBRE%TYPE,
        P_ID_CANTON    IN FIDE_DISTRITO_TB.ID_CANTON%TYPE,
        P_ID_ESTADO    IN FIDE_DISTRITO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_DISTRITO_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_CANTON = P_ID_CANTON,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_DISTRITO = P_ID_DISTRITO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el distrito.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_DISTRITO_UPDATE_SP;

    /* PROCEDURE FIDE_DIRECCION_TB UPDATE */
    PROCEDURE FIDE_DIRECCION_UPDATE_SP(
        P_ID_DIRECCION IN FIDE_DIRECCION_TB.ID_DIRECCION%TYPE,
        P_ID_DISTRITO  IN FIDE_DIRECCION_TB.ID_DISTRITO%TYPE,
        P_CALLE        IN FIDE_DIRECCION_TB.CALLE%TYPE,
        P_NUMERO       IN FIDE_DIRECCION_TB.NUMERO%TYPE,
        P_ID_ESTADO    IN FIDE_DIRECCION_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_DIRECCION_TB
        SET
            ID_DISTRITO = P_ID_DISTRITO,
            CALLE = P_CALLE,
            NUMERO = P_NUMERO,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_DIRECCION = P_ID_DIRECCION;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la direcciÃ³n.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_DIRECCION_UPDATE_SP;

    /* PROCEDURE FIDE_CATEGORIA_TB UPDATE */
    PROCEDURE FIDE_CATEGORIA_UPDATE_SP(
        P_ID_CATEGORIA IN FIDE_CATEGORIA_TB.ID_CATEGORIA%TYPE,
        P_NOMBRE       IN FIDE_CATEGORIA_TB.NOMBRE%TYPE,
        P_ID_ESTADO    IN FIDE_CATEGORIA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_CATEGORIA_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_CATEGORIA = P_ID_CATEGORIA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la categorÃ­a.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_CATEGORIA_UPDATE_SP;

    /* PROCEDURE FIDE_PRODUCTO_TB UPDATE */
    PROCEDURE FIDE_PRODUCTO_UPDATE_SP(
        P_ID_PRODUCTO  IN FIDE_PRODUCTO_TB.ID_PRODUCTO%TYPE,
        P_NOMBRE       IN FIDE_PRODUCTO_TB.NOMBRE%TYPE,
        P_DESCRIPCION  IN FIDE_PRODUCTO_TB.DESCRIPCION%TYPE,
        P_PRECIO       IN FIDE_PRODUCTO_TB.PRECIO%TYPE,
        P_ID_CATEGORIA IN FIDE_PRODUCTO_TB.ID_CATEGORIA%TYPE,
        P_ID_ESTADO    IN FIDE_PRODUCTO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_PRODUCTO_TB
        SET
            NOMBRE = P_NOMBRE,
            DESCRIPCION = P_DESCRIPCION,
            PRECIO = P_PRECIO,
            ID_CATEGORIA = P_ID_CATEGORIA,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_PRODUCTO = P_ID_PRODUCTO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el producto.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_PRODUCTO_UPDATE_SP;

    /* PROCEDURE FIDE_VENTA_TB UPDATE */
    PROCEDURE FIDE_VENTA_UPDATE_SP(
        P_ID_VENTA        IN FIDE_VENTA_TB.ID_VENTA%TYPE,
        P_IDENTIFICACION  IN FIDE_VENTA_TB.IDENTIFICACION%TYPE,
        P_TOTAL_VENTA     IN FIDE_VENTA_TB.TOTAL_VENTA%TYPE,
        P_FECHA_VENTA     IN FIDE_VENTA_TB.FECHA_VENTA%TYPE,
        P_ID_ESTADO       IN FIDE_VENTA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_VENTA_TB
        SET
            IDENTIFICACION = P_IDENTIFICACION,
            TOTAL_VENTA = P_TOTAL_VENTA,
            FECHA_VENTA = P_FECHA_VENTA,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_VENTA = P_ID_VENTA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la venta.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_VENTA_UPDATE_SP;

    /* PROCEDURE FIDE_VENTA_PRODUCTO_TB UPDATE */
    PROCEDURE FIDE_VENTA_PRODUCTO_UPDATE_SP(
        P_ID_VENTA           IN FIDE_VENTA_PRODUCTO_TB.ID_VENTA%TYPE,
        P_ID_PRODUCTO        IN FIDE_VENTA_PRODUCTO_TB.ID_PRODUCTO%TYPE,
        P_ID_TIPO_MOVIMIENTO IN FIDE_VENTA_PRODUCTO_TB.ID_TIPO_MOVIMIENTO%TYPE,
        P_CANTIDAD           IN FIDE_VENTA_PRODUCTO_TB.CANTIDAD%TYPE,
        P_TOTAL              IN FIDE_VENTA_PRODUCTO_TB.TOTAL%TYPE,
        P_ID_ESTADO          IN FIDE_VENTA_PRODUCTO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_VENTA_PRODUCTO_TB
        SET
            ID_TIPO_MOVIMIENTO = P_ID_TIPO_MOVIMIENTO,
            CANTIDAD = P_CANTIDAD,
            TOTAL = P_TOTAL,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_VENTA = P_ID_VENTA
        AND ID_PRODUCTO = P_ID_PRODUCTO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el detalle de venta.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_VENTA_PRODUCTO_UPDATE_SP;

    /* PROCEDURE FIDE_INVENTARIO_TB UPDATE */
    PROCEDURE FIDE_INVENTARIO_UPDATE_SP(
        P_ID_INVENTARIO IN FIDE_INVENTARIO_TB.ID_INVENTARIO%TYPE,
        P_ID_PRODUCTO   IN FIDE_INVENTARIO_TB.ID_PRODUCTO%TYPE,
        P_CANTIDAD      IN FIDE_INVENTARIO_TB.CANTIDAD%TYPE,
        P_ID_ESTADO     IN FIDE_INVENTARIO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_INVENTARIO_TB
        SET
            ID_PRODUCTO = P_ID_PRODUCTO,
            CANTIDAD = P_CANTIDAD,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_INVENTARIO = P_ID_INVENTARIO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el inventario.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_INVENTARIO_UPDATE_SP;

    /* PROCEDURE FIDE_TIPO_MOVIMIENTO_TB UPDATE */
    PROCEDURE FIDE_TIPO_MOVIMIENTO_UPDATE_SP(
        P_ID_TIPO_MOVIMIENTO IN FIDE_TIPO_MOVIMIENTO_TB.ID_TIPO_MOVIMIENTO%TYPE,
        P_NOMBRE             IN FIDE_TIPO_MOVIMIENTO_TB.NOMBRE%TYPE,
        P_ID_ESTADO          IN FIDE_TIPO_MOVIMIENTO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_TIPO_MOVIMIENTO_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_TIPO_MOVIMIENTO = P_ID_TIPO_MOVIMIENTO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el tipo de movimiento.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_TIPO_MOVIMIENTO_UPDATE_SP;

    /* PROCEDURE FIDE_MOVIMIENTO_INVENTARIO_TB UPDATE */
    PROCEDURE FIDE_MOVIMIENTO_INVENTARIO_UPDATE_SP(
        P_ID_MOVIMIENTO       IN FIDE_MOVIMIENTO_INVENTARIO_TB.ID_MOVIMIENTO%TYPE,
        P_ID_PRODUCTO         IN FIDE_MOVIMIENTO_INVENTARIO_TB.ID_PRODUCTO%TYPE,
        P_ID_TIPO_MOVIMIENTO  IN FIDE_MOVIMIENTO_INVENTARIO_TB.ID_TIPO_MOVIMIENTO%TYPE,
        P_CANTIDAD            IN FIDE_MOVIMIENTO_INVENTARIO_TB.CANTIDAD%TYPE,
        P_FECHA_MOVIMIENTO    IN FIDE_MOVIMIENTO_INVENTARIO_TB.FECHA_MOVIMIENTO%TYPE,
        P_ID_ESTADO           IN FIDE_MOVIMIENTO_INVENTARIO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_MOVIMIENTO_INVENTARIO_TB
        SET
            ID_PRODUCTO = P_ID_PRODUCTO,
            ID_TIPO_MOVIMIENTO = P_ID_TIPO_MOVIMIENTO,
            CANTIDAD = P_CANTIDAD,
            FECHA_MOVIMIENTO = P_FECHA_MOVIMIENTO,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_MOVIMIENTO = P_ID_MOVIMIENTO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el movimiento de inventario.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_MOVIMIENTO_INVENTARIO_UPDATE_SP;

    /* PROCEDURE FIDE_MONEDA_TB UPDATE */
    PROCEDURE FIDE_MONEDA_UPDATE_SP(
        P_ID_MONEDA  IN FIDE_MONEDA_TB.ID_MONEDA%TYPE,
        P_NOMBRE     IN FIDE_MONEDA_TB.NOMBRE%TYPE,
        P_SIMBOLO    IN FIDE_MONEDA_TB.SIMBOLO%TYPE,
        P_ID_ESTADO  IN FIDE_MONEDA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_MONEDA_TB
        SET
            NOMBRE = P_NOMBRE,
            SIMBOLO = P_SIMBOLO,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_MONEDA = P_ID_MONEDA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la moneda.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_MONEDA_UPDATE_SP;

    /* PROCEDURE FIDE_FACTURA_TB UPDATE */
    PROCEDURE FIDE_FACTURA_UPDATE_SP(
        P_ID_FACTURA  IN FIDE_FACTURA_TB.ID_FACTURA%TYPE,
        P_ID_MONEDA   IN FIDE_FACTURA_TB.ID_MONEDA%TYPE,
        P_TOTAL       IN FIDE_FACTURA_TB.TOTAL%TYPE,
        P_FECHA       IN FIDE_FACTURA_TB.FECHA_FACTURA%TYPE,
        P_ID_ESTADO   IN FIDE_FACTURA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_FACTURA_TB
        SET
            ID_MONEDA = P_ID_MONEDA,
            TOTAL = P_TOTAL,
            FECHA_FACTURA = P_FECHA,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_FACTURA = P_ID_FACTURA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la factura.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_FACTURA_UPDATE_SP;

    /* PROCEDURE FIDE_VENTA_FACTURA_TB UPDATE */
    PROCEDURE FIDE_VENTA_FACTURA_UPDATE_SP(
        P_ID_VENTA   IN FIDE_VENTA_FACTURA_TB.ID_VENTA%TYPE,
        P_ID_FACTURA IN FIDE_VENTA_FACTURA_TB.ID_FACTURA%TYPE,
        P_ID_ESTADO  IN FIDE_VENTA_FACTURA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_VENTA_FACTURA_TB
        SET
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_VENTA = P_ID_VENTA
        AND ID_FACTURA = P_ID_FACTURA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la relaciÃ³n venta-factura.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_VENTA_FACTURA_UPDATE_SP;

    /* PROCEDURE FIDE_DONACION_FACTURA_TB UPDATE */
    PROCEDURE FIDE_DONACION_FACTURA_UPDATE_SP(
        P_ID_DONACION IN FIDE_DONACION_FACTURA_TB.ID_DONACION%TYPE,
        P_ID_FACTURA  IN FIDE_DONACION_FACTURA_TB.ID_FACTURA%TYPE,
        P_ID_ESTADO   IN FIDE_DONACION_FACTURA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_DONACION_FACTURA_TB
        SET
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_DONACION = P_ID_DONACION
        AND ID_FACTURA = P_ID_FACTURA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la relaciÃ³n donaciÃ³n-factura.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_DONACION_FACTURA_UPDATE_SP;

    /* PROCEDURE FIDE_PAGO_PAYPAL_TB UPDATE */
    PROCEDURE FIDE_PAGO_PAYPAL_UPDATE_SP(
        P_ID_PAGO           IN FIDE_PAGO_PAYPAL_TB.ID_PAGO%TYPE,
        P_ID_FACTURA        IN FIDE_PAGO_PAYPAL_TB.ID_FACTURA%TYPE,
        P_PAYPAL_ORDER_ID   IN FIDE_PAGO_PAYPAL_TB.PAYPAL_ORDER_ID%TYPE,
        P_PAYPAL_CAPTURE_ID IN FIDE_PAGO_PAYPAL_TB.PAYPAL_CAPTURE_ID%TYPE,
        P_FECHA_PAGO        IN FIDE_PAGO_PAYPAL_TB.FECHA_PAGO%TYPE,
        P_ID_ESTADO         IN FIDE_PAGO_PAYPAL_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_PAGO_PAYPAL_TB
        SET
            ID_FACTURA = P_ID_FACTURA,
            PAYPAL_ORDER_ID = P_PAYPAL_ORDER_ID,
            PAYPAL_CAPTURE_ID = P_PAYPAL_CAPTURE_ID,
            FECHA_PAGO = P_FECHA_PAGO,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_PAGO = P_ID_PAGO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el pago.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_PAGO_PAYPAL_UPDATE_SP;

    /* PROCEDURE FIDE_RAZA_TB UPDATE */
    PROCEDURE FIDE_RAZA_UPDATE_SP(
        P_ID_RAZA   IN FIDE_RAZA_TB.ID_RAZA%TYPE,
        P_NOMBRE    IN FIDE_RAZA_TB.NOMBRE%TYPE,
        P_ID_ESTADO IN FIDE_RAZA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN
        UPDATE FIDE_RAZA_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_RAZA = P_ID_RAZA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la raza.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_RAZA_UPDATE_SP;

    /* PROCEDURE FIDE_SEXO_TB UPDATE */
    PROCEDURE FIDE_SEXO_UPDATE_SP(
        P_ID_SEXO   IN FIDE_SEXO_TB.ID_SEXO%TYPE,
        P_NOMBRE    IN FIDE_SEXO_TB.NOMBRE%TYPE,
        P_ID_ESTADO IN FIDE_SEXO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN
        UPDATE FIDE_SEXO_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_SEXO = P_ID_SEXO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el sexo.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_SEXO_UPDATE_SP;

    /* PROCEDURE FIDE_PERRITO_TB UPDATE */
    PROCEDURE FIDE_PERRITO_UPDATE_SP(
        P_ID_PERRITO IN FIDE_PERRITO_TB.ID_PERRITO%TYPE,
        P_NOMBRE     IN FIDE_PERRITO_TB.NOMBRE%TYPE,
        P_EDAD       IN FIDE_PERRITO_TB.EDAD%TYPE,
        P_PESO       IN FIDE_PERRITO_TB.PESO%TYPE,
        P_ESTATURA   IN FIDE_PERRITO_TB.ESTATURA%TYPE,
        P_ID_SEXO    IN FIDE_PERRITO_TB.ID_SEXO%TYPE,
        P_ID_RAZA    IN FIDE_PERRITO_TB.ID_RAZA%TYPE,
        P_ID_ESTADO  IN FIDE_PERRITO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN
        UPDATE FIDE_PERRITO_TB
        SET
            NOMBRE = P_NOMBRE,
            EDAD = P_EDAD,
            PESO = P_PESO,
            ESTATURA = P_ESTATURA,
            ID_SEXO = P_ID_SEXO,
            ID_RAZA = P_ID_RAZA,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_PERRITO = P_ID_PERRITO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el perrito.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_PERRITO_UPDATE_SP;

    /* PROCEDURE FIDE_PERRITO_IMAGE_TB UPDATE */
    PROCEDURE FIDE_PERRITO_IMAGE_UPDATE_SP(
        P_ID_IMAGEN   IN FIDE_PERRITO_IMAGE_TB.ID_IMAGEN%TYPE,
        P_ID_PERRITO  IN FIDE_PERRITO_IMAGE_TB.ID_PERRITO%TYPE,
        P_IMAGE_URL   IN FIDE_PERRITO_IMAGE_TB.IMAGE_URL%TYPE,
        P_ID_ESTADO   IN FIDE_PERRITO_IMAGE_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_PERRITO_IMAGE_TB
        SET
            ID_PERRITO = P_ID_PERRITO,
            IMAGE_URL = P_IMAGE_URL,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_IMAGEN = P_ID_IMAGEN;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la imagen del perrito.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_PERRITO_IMAGE_UPDATE_SP;

    /* PROCEDURE FIDE_TIPO_SOLICITUD_TB UPDATE */
    PROCEDURE FIDE_TIPO_SOLICITUD_UPDATE_SP(
        P_ID_TIPO_SOLICITUD IN FIDE_TIPO_SOLICITUD_TB.ID_TIPO_SOLICITUD%TYPE,
        P_NOMBRE            IN FIDE_TIPO_SOLICITUD_TB.NOMBRE%TYPE,
        P_ID_ESTADO         IN FIDE_TIPO_SOLICITUD_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_TIPO_SOLICITUD_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_TIPO_SOLICITUD = P_ID_TIPO_SOLICITUD;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el tipo de solicitud.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_TIPO_SOLICITUD_UPDATE_SP;

    /* PROCEDURE FIDE_SOLICITUD_TB UPDATE */
    PROCEDURE FIDE_SOLICITUD_UPDATE_SP(
        P_ID_SOLICITUD      IN FIDE_SOLICITUD_TB.ID_SOLICITUD%TYPE,
        P_IDENTIFICACION    IN FIDE_SOLICITUD_TB.IDENTIFICACION%TYPE,
        P_ID_PERRITO        IN FIDE_SOLICITUD_TB.ID_PERRITO%TYPE,
        P_ID_TIPO_SOLICITUD IN FIDE_SOLICITUD_TB.ID_TIPO_SOLICITUD%TYPE,
        P_ID_ESTADO         IN FIDE_SOLICITUD_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_SOLICITUD_TB
        SET
            IDENTIFICACION = P_IDENTIFICACION,
            ID_PERRITO = P_ID_PERRITO,
            ID_TIPO_SOLICITUD = P_ID_TIPO_SOLICITUD,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_SOLICITUD = P_ID_SOLICITUD;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la solicitud.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_SOLICITUD_UPDATE_SP;

    /* PROCEDURE FIDE_TIPO_RESPUESTA_TB UPDATE */
    PROCEDURE FIDE_TIPO_RESPUESTA_UPDATE_SP(
        P_ID_TIPO_RESPUESTA IN FIDE_TIPO_RESPUESTA_TB.ID_TIPO_RESPUESTA%TYPE,
        P_NOMBRE            IN FIDE_TIPO_RESPUESTA_TB.NOMBRE%TYPE,
        P_ID_ESTADO         IN FIDE_TIPO_RESPUESTA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_TIPO_RESPUESTA_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_TIPO_RESPUESTA = P_ID_TIPO_RESPUESTA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el tipo de respuesta.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_TIPO_RESPUESTA_UPDATE_SP;

    /* PROCEDURE FIDE_PREGUNTA_TB UPDATE */
    PROCEDURE FIDE_PREGUNTA_UPDATE_SP(
        P_ID_PREGUNTA       IN FIDE_PREGUNTA_TB.ID_PREGUNTA%TYPE,
        P_PREGUNTA          IN FIDE_PREGUNTA_TB.PREGUNTA%TYPE,
        P_ID_TIPO_RESPUESTA IN FIDE_PREGUNTA_TB.ID_TIPO_RESPUESTA%TYPE,
        P_ID_ESTADO         IN FIDE_PREGUNTA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_PREGUNTA_TB
        SET
            PREGUNTA = P_PREGUNTA,
            ID_TIPO_RESPUESTA = P_ID_TIPO_RESPUESTA,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_PREGUNTA = P_ID_PREGUNTA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la pregunta.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_PREGUNTA_UPDATE_SP;

    /* PROCEDURE FIDE_RESPUESTA_TB UPDATE */
    PROCEDURE FIDE_RESPUESTA_UPDATE_SP(
        P_ID_RESPUESTA IN FIDE_RESPUESTA_TB.ID_RESPUESTA%TYPE,
        P_ID_SOLICITUD IN FIDE_RESPUESTA_TB.ID_SOLICITUD%TYPE,
        P_ID_PREGUNTA  IN FIDE_RESPUESTA_TB.ID_PREGUNTA%TYPE,
        P_RESPUESTA    IN FIDE_RESPUESTA_TB.RESPUESTA%TYPE,
        P_ID_ESTADO    IN FIDE_RESPUESTA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_RESPUESTA_TB
        SET
            ID_SOLICITUD = P_ID_SOLICITUD,
            ID_PREGUNTA = P_ID_PREGUNTA,
            RESPUESTA = P_RESPUESTA,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_RESPUESTA = P_ID_RESPUESTA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la respuesta.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_RESPUESTA_UPDATE_SP;

    /* PROCEDURE FIDE_CASA_CUNA_TB UPDATE */
    PROCEDURE FIDE_CASA_CUNA_UPDATE_SP(
        P_ID_CASA_CUNA   IN FIDE_CASA_CUNA_TB.ID_CASA_CUNA%TYPE,
        P_NOMBRE         IN FIDE_CASA_CUNA_TB.NOMBRE%TYPE,
        P_ID_DIRECCION   IN FIDE_CASA_CUNA_TB.ID_DIRECCION%TYPE,
        P_IDENTIFICACION IN FIDE_CASA_CUNA_TB.IDENTIFICACION%TYPE,
        P_ID_SOLICITUD   IN FIDE_CASA_CUNA_TB.ID_SOLICITUD%TYPE,
        P_ID_ESTADO      IN FIDE_CASA_CUNA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_CASA_CUNA_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_DIRECCION = P_ID_DIRECCION,
            IDENTIFICACION = P_IDENTIFICACION,
            ID_SOLICITUD = P_ID_SOLICITUD,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_CASA_CUNA = P_ID_CASA_CUNA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la casa cuna.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_CASA_CUNA_UPDATE_SP;

    /* PROCEDURE FIDE_CASA_PERRITO_TB UPDATE */
    PROCEDURE FIDE_CASA_PERRITO_UPDATE_SP(
        P_ID_CASA_CUNA IN FIDE_CASA_PERRITO_TB.ID_CASA_CUNA%TYPE,
        P_ID_PERRITO   IN FIDE_CASA_PERRITO_TB.ID_PERRITO%TYPE,
        P_ID_ESTADO    IN FIDE_CASA_PERRITO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_CASA_PERRITO_TB
        SET
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_CASA_CUNA = P_ID_CASA_CUNA
        AND ID_PERRITO = P_ID_PERRITO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la relaciÃ³n casa-perrito.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_CASA_PERRITO_UPDATE_SP;

    /* PROCEDURE FIDE_ADOPCION_TB UPDATE */
    PROCEDURE FIDE_ADOPCION_UPDATE_SP(
        P_ID_ADOPCION     IN FIDE_ADOPCION_TB.ID_ADOPCION%TYPE,
        P_IDENTIFICACION  IN FIDE_ADOPCION_TB.IDENTIFICACION%TYPE,
        P_ID_SOLICITUD    IN FIDE_ADOPCION_TB.ID_SOLICITUD%TYPE,
        P_FECHA_ADOPCION  IN FIDE_ADOPCION_TB.FECHA_ADOPCION%TYPE,
        P_ID_ESTADO       IN FIDE_ADOPCION_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_ADOPCION_TB
        SET
            IDENTIFICACION = P_IDENTIFICACION,
            ID_SOLICITUD = P_ID_SOLICITUD,
            FECHA_ADOPCION = P_FECHA_ADOPCION,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_ADOPCION = P_ID_ADOPCION;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la adopciÃ³n.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_ADOPCION_UPDATE_SP;

    /* PROCEDURE FIDE_TIPO_SEGUIMIENTO UPDATE */
    PROCEDURE FIDE_TIPO_SEGUIMIENTO_UPDATE_SP(
        P_ID_TIPO_SEGUIMIENTO IN FIDE_TIPO_SEGUIMIENTO.ID_TIPO_SEGUIMIENTO%TYPE,
        P_NOMBRE              IN FIDE_TIPO_SEGUIMIENTO.NOMBRE%TYPE,
        P_ID_ESTADO           IN FIDE_TIPO_SEGUIMIENTO.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_TIPO_SEGUIMIENTO
        SET
            NOMBRE = P_NOMBRE,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_TIPO_SEGUIMIENTO = P_ID_TIPO_SEGUIMIENTO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el tipo de seguimiento.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_TIPO_SEGUIMIENTO_UPDATE_SP;

    /* PROCEDURE FIDE_SEGUIMIENTO_TB UPDATE */
    PROCEDURE FIDE_SEGUIMIENTO_UPDATE_SP(
        P_ID_SEGUIMIENTO      IN FIDE_SEGUIMIENTO_TB.ID_SEGUIMIENTO%TYPE,
        P_ID_ADOPCION         IN FIDE_SEGUIMIENTO_TB.ID_ADOPCION%TYPE,
        P_ID_TIPO_SEGUIMIENTO IN FIDE_SEGUIMIENTO_TB.ID_TIPO_SEGUIMIENTO%TYPE,
        P_FECHA_INICIO        IN FIDE_SEGUIMIENTO_TB.FECHA_INICIO%TYPE,
        P_FECHA_FIN           IN FIDE_SEGUIMIENTO_TB.FECHA_FIN%TYPE,
        P_COMENTARIOS         IN FIDE_SEGUIMIENTO_TB.COMENTARIOS%TYPE,
        P_ID_ESTADO           IN FIDE_SEGUIMIENTO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_SEGUIMIENTO_TB
        SET
            ID_ADOPCION = P_ID_ADOPCION,
            ID_TIPO_SEGUIMIENTO = P_ID_TIPO_SEGUIMIENTO,
            FECHA_INICIO = P_FECHA_INICIO,
            FECHA_FIN = P_FECHA_FIN,
            COMENTARIOS = P_COMENTARIOS,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_SEGUIMIENTO = P_ID_SEGUIMIENTO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el seguimiento.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_SEGUIMIENTO_UPDATE_SP;

    /* PROCEDURE FIDE_EVIDENCIA_TB UPDATE */
    PROCEDURE FIDE_EVIDENCIA_UPDATE_SP(
        P_ID_EVIDENCIA   IN FIDE_EVIDENCIA_TB.ID_EVIDENCIA%TYPE,
        P_ID_SEGUIMIENTO IN FIDE_EVIDENCIA_TB.ID_SEGUIMIENTO%TYPE,
        P_IMAGEN_URL     IN FIDE_EVIDENCIA_TB.IMAGEN_URL%TYPE,
        P_COMENTARIOS    IN FIDE_EVIDENCIA_TB.COMENTARIOS%TYPE,
        P_FECHA          IN FIDE_EVIDENCIA_TB.FECHA_EVIDENCIA%TYPE,
        P_ID_ESTADO      IN FIDE_EVIDENCIA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_EVIDENCIA_TB
        SET
            ID_SEGUIMIENTO = P_ID_SEGUIMIENTO,
            IMAGEN_URL = P_IMAGEN_URL,
            COMENTARIOS = P_COMENTARIOS,
            FECHA_EVIDENCIA = P_FECHA,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_EVIDENCIA = P_ID_EVIDENCIA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la evidencia.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_EVIDENCIA_UPDATE_SP;

    /* PROCEDURE FIDE_CAMPANIA_TB UPDATE */
    PROCEDURE FIDE_CAMPANIA_UPDATE_SP(
        P_ID_CAMPANIA   IN FIDE_CAMPANIA_TB.ID_CAMPANIA%TYPE,
        P_NOMBRE        IN FIDE_CAMPANIA_TB.NOMBRE%TYPE,
        P_DESCRIPCION   IN FIDE_CAMPANIA_TB.DESCRIPCION%TYPE,
        P_FECHA_INICIO  IN FIDE_CAMPANIA_TB.FECHA_INICIO%TYPE,
        P_FECHA_FIN     IN FIDE_CAMPANIA_TB.FECHA_FIN%TYPE,
        P_ID_ESTADO     IN FIDE_CAMPANIA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_CAMPANIA_TB
        SET
            NOMBRE = P_NOMBRE,
            DESCRIPCION = P_DESCRIPCION,
            FECHA_INICIO = P_FECHA_INICIO,
            FECHA_FIN = P_FECHA_FIN,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_CAMPANIA = P_ID_CAMPANIA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la campaÃ±a.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_CAMPANIA_UPDATE_SP;

    /* PROCEDURE FIDE_DONACION_TB UPDATE */
    PROCEDURE FIDE_DONACION_UPDATE_SP(
        P_ID_DONACION      IN FIDE_DONACION_TB.ID_DONACION%TYPE,
        P_IDENTIFICACION   IN FIDE_DONACION_TB.IDENTIFICACION%TYPE,
        P_ID_CAMPANIA      IN FIDE_DONACION_TB.ID_CAMPANIA%TYPE,
        P_MONTO            IN FIDE_DONACION_TB.MONTO%TYPE,
        P_FECHA_DONACION   IN FIDE_DONACION_TB.FECHA_DONACION%TYPE,
        P_MENSAJE          IN FIDE_DONACION_TB.MENSAJE%TYPE,
        P_ID_ESTADO        IN FIDE_DONACION_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_DONACION_TB
        SET
            IDENTIFICACION = P_IDENTIFICACION,
            ID_CAMPANIA = P_ID_CAMPANIA,
            MONTO = P_MONTO,
            FECHA_DONACION = P_FECHA_DONACION,
            MENSAJE = P_MENSAJE,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_DONACION = P_ID_DONACION;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la donaciÃ³n.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_DONACION_UPDATE_SP;

    /* PROCEDURE FIDE_TIPO_EVENTO_TB UPDATE */
    PROCEDURE FIDE_TIPO_EVENTO_UPDATE_SP(
        P_ID_TIPO_EVENTO IN FIDE_TIPO_EVENTO_TB.ID_TIPO_EVENTO%TYPE,
        P_NOMBRE         IN FIDE_TIPO_EVENTO_TB.NOMBRE%TYPE,
        P_ID_ESTADO      IN FIDE_TIPO_EVENTO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN
        UPDATE FIDE_TIPO_EVENTO_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_TIPO_EVENTO = P_ID_TIPO_EVENTO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el tipo de evento.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_TIPO_EVENTO_UPDATE_SP;

    /* PROCEDURE FIDE_EVENTO_PERRITO_TB UPDATE */
    PROCEDURE FIDE_EVENTO_PERRITO_UPDATE_SP(
        P_ID_EVENTO      IN FIDE_EVENTO_PERRITO_TB.ID_EVENTO%TYPE,
        P_ID_PERRITO     IN FIDE_EVENTO_PERRITO_TB.ID_PERRITO%TYPE,
        P_ID_TIPO_EVENTO IN FIDE_EVENTO_PERRITO_TB.ID_TIPO_EVENTO%TYPE,
        P_FECHA_EVENTO   IN FIDE_EVENTO_PERRITO_TB.FECHA_EVENTO%TYPE,
        P_DETALLE        IN FIDE_EVENTO_PERRITO_TB.DETALLE%TYPE,
        P_TOTAL_GASTO    IN FIDE_EVENTO_PERRITO_TB.TOTAL_GASTO%TYPE,
        P_ID_ESTADO      IN FIDE_EVENTO_PERRITO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN
        UPDATE FIDE_EVENTO_PERRITO_TB
        SET
            ID_PERRITO = P_ID_PERRITO,
            ID_TIPO_EVENTO = P_ID_TIPO_EVENTO,
            FECHA_EVENTO = P_FECHA_EVENTO,
            DETALLE = P_DETALLE,
            TOTAL_GASTO = P_TOTAL_GASTO,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_EVENTO = P_ID_EVENTO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el evento.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_EVENTO_PERRITO_UPDATE_SP;

    /* PROCEDURE FIDE_DETALLE_EVENTO_TB UPDATE */
    PROCEDURE FIDE_DETALLE_EVENTO_UPDATE_SP(
        P_ID_DETALLE_EVENTO IN FIDE_DETALLE_EVENTO_TB.ID_DETALLE_EVENTO%TYPE,
        P_ID_EVENTO         IN FIDE_DETALLE_EVENTO_TB.ID_EVENTO%TYPE,
        P_COMPROBANTE_URL   IN FIDE_DETALLE_EVENTO_TB.COMPROBANTE_URL%TYPE,
        P_DESCRIPCION       IN FIDE_DETALLE_EVENTO_TB.DESCRIPCION%TYPE,
        P_MONTO             IN FIDE_DETALLE_EVENTO_TB.MONTO%TYPE,
        P_ID_ESTADO         IN FIDE_DETALLE_EVENTO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN
        UPDATE FIDE_DETALLE_EVENTO_TB
        SET
            ID_EVENTO = P_ID_EVENTO,
            COMPROBANTE_URL = P_COMPROBANTE_URL,
            DESCRIPCION = P_DESCRIPCION,
            MONTO = P_MONTO,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_DETALLE_EVENTO = P_ID_DETALLE_EVENTO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el detalle del evento.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_DETALLE_EVENTO_UPDATE_SP;
END FIDE_UPDATE_PKG;
/

CREATE OR REPLACE PACKAGE BODY FIDE_DELETE_PKG AS
    /* PROCEDURE FIDE_TIPO_USUARIO_TB DELETE LOGICO */
    PROCEDURE FIDE_TIPO_USUARIO_DELETE_SP(
        P_ID_TIPO_USUARIO IN FIDE_TIPO_USUARIO_TB.ID_TIPO_USUARIO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN
        UPDATE FIDE_TIPO_USUARIO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_TIPO_USUARIO = P_ID_TIPO_USUARIO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el tipo de usuario o ya estÃ¡ eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_TIPO_USUARIO_DELETE_SP;

    /* PROCEDURE FIDE_USUARIO_TB DELETE LOGICO */
    PROCEDURE FIDE_USUARIO_DELETE_SP(
        P_IDENTIFICACION IN FIDE_USUARIO_TB.IDENTIFICACION%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_USUARIO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE IDENTIFICACION = P_IDENTIFICACION
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el usuario o ya estÃ¡ eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_USUARIO_DELETE_SP;

    /* PROCEDURE FIDE_CORREO_TB DELETE LOGICO */
    PROCEDURE FIDE_CORREO_DELETE_SP(
        P_IDENTIFICACION IN FIDE_CORREO_TB.IDENTIFICACION%TYPE,
        P_CORREO         IN FIDE_CORREO_TB.CORREO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_CORREO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE IDENTIFICACION = P_IDENTIFICACION
        AND CORREO = P_CORREO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el correo o ya estÃ¡ eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_CORREO_DELETE_SP;

    /* PROCEDURE FIDE_TELEFONO_TB DELETE LOGICO */
    PROCEDURE FIDE_TELEFONO_DELETE_SP(
        P_IDENTIFICACION IN FIDE_TELEFONO_TB.IDENTIFICACION%TYPE,
        P_TELEFONO       IN FIDE_TELEFONO_TB.TELEFONO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_TELEFONO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE IDENTIFICACION = P_IDENTIFICACION
        AND TELEFONO = P_TELEFONO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el telÃ©fono o ya estÃ¡ eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_TELEFONO_DELETE_SP;

    /* PROCEDURE FIDE_CUENTA_TB DELETE LOGICO */
    PROCEDURE FIDE_CUENTA_DELETE_SP(
        P_ID_CUENTA IN FIDE_CUENTA_TB.ID_CUENTA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_CUENTA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_CUENTA = P_ID_CUENTA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la cuenta o ya estÃ¡ eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_CUENTA_DELETE_SP;

    /* PROCEDURE FIDE_TIPO_OTP_TB DELETE LOGICO */
    PROCEDURE FIDE_TIPO_OTP_DELETE_SP(
        P_ID_TIPO_OTP IN FIDE_TIPO_OTP_TB.ID_TIPO_OTP%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_TIPO_OTP_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_TIPO_OTP = P_ID_TIPO_OTP
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el tipo OTP o ya estÃ¡ eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_TIPO_OTP_DELETE_SP;

    /* PROCEDURE FIDE_CODIGO_OTP_TB DELETE LOGICO */
    PROCEDURE FIDE_CODIGO_OTP_DELETE_SP(
        P_ID_CODIGO_OTP IN FIDE_CODIGO_OTP_TB.ID_CODIGO_OTP%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_CODIGO_OTP_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_CODIGO_OTP = P_ID_CODIGO_OTP
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el OTP o ya estÃ¡ eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_CODIGO_OTP_DELETE_SP;

    /* PROCEDURE FIDE_REFRESH_TOKEN_TB DELETE LOGICO */
    PROCEDURE FIDE_REFRESH_TOKEN_DELETE_SP(
        P_ID_REFRESH_TOKEN IN FIDE_REFRESH_TOKEN_TB.ID_REFRESH_TOKEN%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_REFRESH_TOKEN_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_REFRESH_TOKEN = P_ID_REFRESH_TOKEN
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el token o ya estÃ¡ eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_REFRESH_TOKEN_DELETE_SP;

    /* PROCEDURE FIDE_PAIS_TB DELETE LOGICO */
    PROCEDURE FIDE_PAIS_DELETE_SP(
        P_ID_PAIS IN FIDE_PAIS_TB.ID_PAIS%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_PAIS_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_PAIS = P_ID_PAIS
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el paÃ­s o ya estÃ¡ eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_PAIS_DELETE_SP;

    /* PROCEDURE FIDE_PROVINCIA_TB DELETE LOGICO */
    PROCEDURE FIDE_PROVINCIA_DELETE_SP(
        P_ID_PROVINCIA IN FIDE_PROVINCIA_TB.ID_PROVINCIA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_PROVINCIA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_PROVINCIA = P_ID_PROVINCIA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la provincia o ya estÃ¡ eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_PROVINCIA_DELETE_SP;

    /* PROCEDURE FIDE_CANTON_TB DELETE LOGICO */
    PROCEDURE FIDE_CANTON_DELETE_SP(
        P_ID_CANTON IN FIDE_CANTON_TB.ID_CANTON%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_CANTON_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_CANTON = P_ID_CANTON
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el cantÃ³n o ya estÃ¡ eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_CANTON_DELETE_SP;

    /* PROCEDURE FIDE_DISTRITO_TB DELETE LOGICO */
    PROCEDURE FIDE_DISTRITO_DELETE_SP(
        P_ID_DISTRITO IN FIDE_DISTRITO_TB.ID_DISTRITO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_DISTRITO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_DISTRITO = P_ID_DISTRITO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el distrito o ya estÃ¡ eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_DISTRITO_DELETE_SP;

    /* PROCEDURE FIDE_DIRECCION_TB DELETE LOGICO */
    PROCEDURE FIDE_DIRECCION_DELETE_SP(
        P_ID_DIRECCION IN FIDE_DIRECCION_TB.ID_DIRECCION%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_DIRECCION_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_DIRECCION = P_ID_DIRECCION
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la direcciÃ³n o ya estÃ¡ eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_DIRECCION_DELETE_SP;

    /* PROCEDURE FIDE_CATEGORIA_TB DELETE LOGICO */
    PROCEDURE FIDE_CATEGORIA_DELETE_SP(
        P_ID_CATEGORIA IN FIDE_CATEGORIA_TB.ID_CATEGORIA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_CATEGORIA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_CATEGORIA = P_ID_CATEGORIA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la categorÃ­a o ya estÃ¡ eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_CATEGORIA_DELETE_SP;

    /* PROCEDURE FIDE_PRODUCTO_TB DELETE LOGICO */
    PROCEDURE FIDE_PRODUCTO_DELETE_SP(
        P_ID_PRODUCTO IN FIDE_PRODUCTO_TB.ID_PRODUCTO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_PRODUCTO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_PRODUCTO = P_ID_PRODUCTO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el producto o ya estÃ¡ eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_PRODUCTO_DELETE_SP;

    /* PROCEDURE FIDE_VENTA_TB DELETE LOGICO */
    PROCEDURE FIDE_VENTA_DELETE_SP(
        P_ID_VENTA IN FIDE_VENTA_TB.ID_VENTA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_VENTA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_VENTA = P_ID_VENTA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la venta o ya estÃ¡ eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_VENTA_DELETE_SP;

    /* PROCEDURE FIDE_VENTA_PRODUCTO_TB DELETE LOGICO */
    PROCEDURE FIDE_VENTA_PRODUCTO_DELETE_SP(
        P_ID_VENTA    IN FIDE_VENTA_PRODUCTO_TB.ID_VENTA%TYPE,
        P_ID_PRODUCTO IN FIDE_VENTA_PRODUCTO_TB.ID_PRODUCTO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_VENTA_PRODUCTO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_VENTA = P_ID_VENTA
        AND ID_PRODUCTO = P_ID_PRODUCTO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el detalle de venta o ya estÃ¡ eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_VENTA_PRODUCTO_DELETE_SP;

    /* PROCEDURE FIDE_INVENTARIO_TB DELETE LOGICO */
    PROCEDURE FIDE_INVENTARIO_DELETE_SP(
        P_ID_INVENTARIO IN FIDE_INVENTARIO_TB.ID_INVENTARIO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_INVENTARIO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_INVENTARIO = P_ID_INVENTARIO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el inventario o ya estÃ¡ eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_INVENTARIO_DELETE_SP;

    /* PROCEDURE FIDE_TIPO_MOVIMIENTO_TB DELETE LOGICO */
    PROCEDURE FIDE_TIPO_MOVIMIENTO_DELETE_SP(
        P_ID_TIPO_MOVIMIENTO IN FIDE_TIPO_MOVIMIENTO_TB.ID_TIPO_MOVIMIENTO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_TIPO_MOVIMIENTO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_TIPO_MOVIMIENTO = P_ID_TIPO_MOVIMIENTO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el tipo de movimiento o ya estÃ¡ eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_TIPO_MOVIMIENTO_DELETE_SP;

    /* PROCEDURE FIDE_MOVIMIENTO_INVENTARIO_TB DELETE LOGICO */
    PROCEDURE FIDE_MOVIMIENTO_INVENTARIO_DELETE_SP(
        P_ID_MOVIMIENTO IN FIDE_MOVIMIENTO_INVENTARIO_TB.ID_MOVIMIENTO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_MOVIMIENTO_INVENTARIO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_MOVIMIENTO = P_ID_MOVIMIENTO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el movimiento de inventario o ya estÃ¡ eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_MOVIMIENTO_INVENTARIO_DELETE_SP;

    /* PROCEDURE FIDE_MONEDA_TB DELETE LOGICO */
    PROCEDURE FIDE_MONEDA_DELETE_SP(
        P_ID_MONEDA IN FIDE_MONEDA_TB.ID_MONEDA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_MONEDA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_MONEDA = P_ID_MONEDA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la moneda o ya estÃ¡ eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_MONEDA_DELETE_SP;

    /* PROCEDURE FIDE_FACTURA_TB DELETE LOGICO */
    PROCEDURE FIDE_FACTURA_DELETE_SP(
        P_ID_FACTURA IN FIDE_FACTURA_TB.ID_FACTURA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_FACTURA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_FACTURA = P_ID_FACTURA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la factura o ya estÃ¡ eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_FACTURA_DELETE_SP;

    /* PROCEDURE FIDE_VENTA_FACTURA_TB DELETE LOGICO */
    PROCEDURE FIDE_VENTA_FACTURA_DELETE_SP(
        P_ID_VENTA   IN FIDE_VENTA_FACTURA_TB.ID_VENTA%TYPE,
        P_ID_FACTURA IN FIDE_VENTA_FACTURA_TB.ID_FACTURA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_VENTA_FACTURA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_VENTA = P_ID_VENTA
        AND ID_FACTURA = P_ID_FACTURA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la relaciÃ³n o ya estÃ¡ eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_VENTA_FACTURA_DELETE_SP;

    /* PROCEDURE FIDE_DONACION_FACTURA_TB DELETE LOGICO */
    PROCEDURE FIDE_DONACION_FACTURA_DELETE_SP(
        P_ID_DONACION IN FIDE_DONACION_FACTURA_TB.ID_DONACION%TYPE,
        P_ID_FACTURA  IN FIDE_DONACION_FACTURA_TB.ID_FACTURA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_DONACION_FACTURA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_DONACION = P_ID_DONACION
        AND ID_FACTURA = P_ID_FACTURA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la relaciÃ³n o ya estÃ¡ eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_DONACION_FACTURA_DELETE_SP;

    /* PROCEDURE FIDE_PAGO_PAYPAL_TB DELETE LOGICO */
    PROCEDURE FIDE_PAGO_PAYPAL_DELETE_SP(
        P_ID_PAGO IN FIDE_PAGO_PAYPAL_TB.ID_PAGO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_PAGO_PAYPAL_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_PAGO = P_ID_PAGO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el pago o ya estÃ¡ eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_PAGO_PAYPAL_DELETE_SP;

    /* PROCEDURE FIDE_RAZA_TB DELETE LOGICO */
    PROCEDURE FIDE_RAZA_DELETE_SP(
        P_ID_RAZA IN FIDE_RAZA_TB.ID_RAZA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN
        UPDATE FIDE_RAZA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_RAZA = P_ID_RAZA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la raza o ya estÃ¡ eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_RAZA_DELETE_SP;

    /* PROCEDURE FIDE_SEXO_TB DELETE LOGICO */
    PROCEDURE FIDE_SEXO_DELETE_SP(
        P_ID_SEXO IN FIDE_SEXO_TB.ID_SEXO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN
        UPDATE FIDE_SEXO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_SEXO = P_ID_SEXO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el sexo o ya estÃ¡ eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_SEXO_DELETE_SP;

    /* PROCEDURE FIDE_PERRITO_TB DELETE LOGICO */
    PROCEDURE FIDE_PERRITO_DELETE_SP(
        P_ID_PERRITO IN FIDE_PERRITO_TB.ID_PERRITO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN
        UPDATE FIDE_PERRITO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_PERRITO = P_ID_PERRITO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el perrito o ya estÃ¡ eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_PERRITO_DELETE_SP;

    /* PROCEDURE FIDE_PERRITO_IMAGE_TB DELETE LOGICO */
    PROCEDURE FIDE_PERRITO_IMAGE_DELETE_SP(
        P_ID_IMAGEN IN FIDE_PERRITO_IMAGE_TB.ID_IMAGEN%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_PERRITO_IMAGE_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_IMAGEN = P_ID_IMAGEN
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la imagen o ya estÃ¡ eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_PERRITO_IMAGE_DELETE_SP;

    /* PROCEDURE FIDE_TIPO_SOLICITUD_TB DELETE LOGICO */
    PROCEDURE FIDE_TIPO_SOLICITUD_DELETE_SP(
        P_ID_TIPO_SOLICITUD IN FIDE_TIPO_SOLICITUD_TB.ID_TIPO_SOLICITUD%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_TIPO_SOLICITUD_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_TIPO_SOLICITUD = P_ID_TIPO_SOLICITUD
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el tipo de solicitud o ya estÃ¡ eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_TIPO_SOLICITUD_DELETE_SP;

    /* PROCEDURE FIDE_SOLICITUD_TB DELETE LOGICO */
    PROCEDURE FIDE_SOLICITUD_DELETE_SP(
        P_ID_SOLICITUD IN FIDE_SOLICITUD_TB.ID_SOLICITUD%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_SOLICITUD_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_SOLICITUD = P_ID_SOLICITUD
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la solicitud o ya estÃ¡ eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_SOLICITUD_DELETE_SP;

    /* PROCEDURE FIDE_TIPO_RESPUESTA_TB DELETE LOGICO */
    PROCEDURE FIDE_TIPO_RESPUESTA_DELETE_SP(
        P_ID_TIPO_RESPUESTA IN FIDE_TIPO_RESPUESTA_TB.ID_TIPO_RESPUESTA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_TIPO_RESPUESTA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_TIPO_RESPUESTA = P_ID_TIPO_RESPUESTA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe o ya estÃ¡ eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_TIPO_RESPUESTA_DELETE_SP;

    /* PROCEDURE FIDE_PREGUNTA_TB DELETE LOGICO */
    PROCEDURE FIDE_PREGUNTA_DELETE_SP(
        P_ID_PREGUNTA IN FIDE_PREGUNTA_TB.ID_PREGUNTA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_PREGUNTA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_PREGUNTA = P_ID_PREGUNTA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe o ya estÃ¡ eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_PREGUNTA_DELETE_SP;

    /* PROCEDURE FIDE_RESPUESTA_TB DELETE LOGICO */
    PROCEDURE FIDE_RESPUESTA_DELETE_SP(
        P_ID_RESPUESTA IN FIDE_RESPUESTA_TB.ID_RESPUESTA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_RESPUESTA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_RESPUESTA = P_ID_RESPUESTA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe o ya estÃ¡ eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_RESPUESTA_DELETE_SP;

    /* PROCEDURE FIDE_CASA_CUNA_TB DELETE LOGICO */
    PROCEDURE FIDE_CASA_CUNA_DELETE_SP(
        P_ID_CASA_CUNA IN FIDE_CASA_CUNA_TB.ID_CASA_CUNA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_CASA_CUNA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_CASA_CUNA = P_ID_CASA_CUNA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la casa cuna o ya estÃ¡ eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_CASA_CUNA_DELETE_SP;

    /* PROCEDURE FIDE_CASA_PERRITO_TB DELETE LOGICO */
    PROCEDURE FIDE_CASA_PERRITO_DELETE_SP(
        P_ID_CASA_CUNA IN FIDE_CASA_PERRITO_TB.ID_CASA_CUNA%TYPE,
        P_ID_PERRITO   IN FIDE_CASA_PERRITO_TB.ID_PERRITO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_CASA_PERRITO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_CASA_CUNA = P_ID_CASA_CUNA
        AND ID_PERRITO = P_ID_PERRITO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la relaciÃ³n o ya estÃ¡ eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_CASA_PERRITO_DELETE_SP;

    /* PROCEDURE FIDE_ADOPCION_TB DELETE LOGICO */
    PROCEDURE FIDE_ADOPCION_DELETE_SP(
        P_ID_ADOPCION IN FIDE_ADOPCION_TB.ID_ADOPCION%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_ADOPCION_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_ADOPCION = P_ID_ADOPCION
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la adopciÃ³n o ya estÃ¡ eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_ADOPCION_DELETE_SP;

    /* PROCEDURE FIDE_TIPO_SEGUIMIENTO DELETE LOGICO */
    PROCEDURE FIDE_TIPO_SEGUIMIENTO_DELETE_SP(
        P_ID_TIPO_SEGUIMIENTO IN FIDE_TIPO_SEGUIMIENTO.ID_TIPO_SEGUIMIENTO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_TIPO_SEGUIMIENTO
        SET ID_ESTADO = V_ESTADO
        WHERE ID_TIPO_SEGUIMIENTO = P_ID_TIPO_SEGUIMIENTO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe o ya estÃ¡ eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_TIPO_SEGUIMIENTO_DELETE_SP;

    /* PROCEDURE FIDE_SEGUIMIENTO_TB DELETE LOGICO */
    PROCEDURE FIDE_SEGUIMIENTO_DELETE_SP(
        P_ID_SEGUIMIENTO IN FIDE_SEGUIMIENTO_TB.ID_SEGUIMIENTO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_SEGUIMIENTO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_SEGUIMIENTO = P_ID_SEGUIMIENTO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe o ya estÃ¡ eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_SEGUIMIENTO_DELETE_SP;

    /* PROCEDURE FIDE_CAMPANIA_TB DELETE LOGICO */
    PROCEDURE FIDE_CAMPANIA_DELETE_SP(
        P_ID_CAMPANIA IN FIDE_CAMPANIA_TB.ID_CAMPANIA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_CAMPANIA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_CAMPANIA = P_ID_CAMPANIA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la campaÃ±a o ya estÃ¡ eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_CAMPANIA_DELETE_SP;

    /* PROCEDURE FIDE_DONACION_TB DELETE LOGICO */
    PROCEDURE FIDE_DONACION_DELETE_SP(
        P_ID_DONACION IN FIDE_DONACION_TB.ID_DONACION%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_DONACION_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_DONACION = P_ID_DONACION
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la donaciÃ³n o ya estÃ¡ eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_DONACION_DELETE_SP;

    /* PROCEDURE FIDE_TIPO_EVENTO_TB DELETE LOGICO */
    PROCEDURE FIDE_TIPO_EVENTO_DELETE_SP(
        P_ID_TIPO_EVENTO IN FIDE_TIPO_EVENTO_TB.ID_TIPO_EVENTO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN
        UPDATE FIDE_TIPO_EVENTO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_TIPO_EVENTO = P_ID_TIPO_EVENTO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el tipo de evento o ya estÃ¡ eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_TIPO_EVENTO_DELETE_SP;

    /* PROCEDURE FIDE_EVENTO_PERRITO_TB DELETE LOGICO */
    PROCEDURE FIDE_EVENTO_PERRITO_DELETE_SP(
        P_ID_EVENTO IN FIDE_EVENTO_PERRITO_TB.ID_EVENTO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN
        UPDATE FIDE_EVENTO_PERRITO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_EVENTO = P_ID_EVENTO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el evento o ya estÃ¡ eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_EVENTO_PERRITO_DELETE_SP;

    /* PROCEDURE FIDE_DETALLE_EVENTO_TB DELETE LOGICO */
    PROCEDURE FIDE_DETALLE_EVENTO_DELETE_SP(
        P_ID_DETALLE_EVENTO IN FIDE_DETALLE_EVENTO_TB.ID_DETALLE_EVENTO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN
        UPDATE FIDE_DETALLE_EVENTO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_DETALLE_EVENTO = P_ID_DETALLE_EVENTO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el detalle o ya estÃ¡ eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaÃ±o de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'NÃºmero invÃ¡lido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_DETALLE_EVENTO_DELETE_SP;
END FIDE_DELETE_PKG;
/

CREATE OR REPLACE PACKAGE BODY FIDE_PERRITOS_PKG AS
    /*
        1. Llama a los perritos qque estan disponibles para adopcion
    */
    FUNCTION FIDE_OBTENER_PERRO_DISPONIBLES_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_PERRITOS SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_PERRITOS FOR
            SELECT  P.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    P.EDAD,
                    P.PESO,
                    R.NOMBRE AS RAZA,
                    S.NOMBRE AS SEXO
            FROM FIDE_PERRITO_TB P
            JOIN FIDE_RAZA_TB R ON P.ID_RAZA = R.ID_RAZA
            JOIN FIDE_SEXO_TB S ON P.ID_SEXO = S.ID_SEXO
            WHERE P.ID_ESTADO = 1;
        RETURN V_CURSOR_PERRITOS;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('NO SE ENCONTRO DATOS CON EL ID INDICADO');
        WHEN TOO_MANY_ROWS THEN
        DBMS_OUTPUT.PUT_LINE('DATOS DUPLICADOS');
        WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('ERROR' || SQLERRM);
    END FIDE_OBTENER_PERRO_DISPONIBLES_FN;

    /*
        2. Busca al perrito y muestra su historial medico
    */
    FUNCTION FIDE_HISTORIAL_MEDICO_PERRITO_FN(
        P_ID_PERRITO IN FIDE_PERRITO_TB.ID_PERRITO%TYPE)
    RETURN VARCHAR2
    IS
        CURSOR C_HISTORIAL IS
            SELECT TE.NOMBRE AS TIPO, EP.FECHA_EVENTO, EP.DETALLE
            FROM FIDE_EVENTO_PERRITO_TB EP
            JOIN FIDE_TIPO_EVENTO_TB TE ON EP.ID_TIPO_EVENTO = TE.ID_TIPO_EVENTO
            WHERE EP.ID_PERRITO = P_ID_PERRITO
            AND EP.ID_ESTADO = 1
            ORDER BY EP.FECHA_EVENTO DESC;

        V_HISTORIAL_COMPLETO VARCHAR2(4000) := '';
        V_REGISTRO C_HISTORIAL%ROWTYPE;
    BEGIN
        OPEN C_HISTORIAL;
        LOOP
            FETCH C_HISTORIAL INTO V_REGISTRO;
            EXIT WHEN C_HISTORIAL%NOTFOUND;
            V_HISTORIAL_COMPLETO := V_HISTORIAL_COMPLETO || 
                                    TO_CHAR(V_REGISTRO.FECHA_EVENTO, 'DD/MM/YYYY') || ' - ' || 
                                    V_REGISTRO.TIPO || ': ' || 
                                    V_REGISTRO.DETALLE || ' | ';
        END LOOP;
        CLOSE C_HISTORIAL;

        IF V_HISTORIAL_COMPLETO IS NULL OR V_HISTORIAL_COMPLETO = '' THEN
            RETURN 'Sin historial mÃ©dico registrado.';
        END IF;

        RETURN V_HISTORIAL_COMPLETO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('NO SE ENCONTRO DATOS CON EL ID INDICADO');
        WHEN TOO_MANY_ROWS THEN
        DBMS_OUTPUT.PUT_LINE('DATOS DUPLICADOS');
        WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('ERROR' || SQLERRM);
    END FIDE_HISTORIAL_MEDICO_PERRITO_FN;

    /*
        3. Busca todos los gastos que ha generado el perrito
    */
    FUNCTION FIDE_GASTOS_POR_PERRO_FN(
        P_ID_PERRITO IN FIDE_PERRITO_TB.ID_PERRITO%TYPE)
    RETURN NUMBER
    IS
        V_TOTAL_GASTOS NUMBER(10,2) := 0;
    BEGIN
        FOR REC_GASTO IN (
            SELECT TOTAL_GASTO 
            FROM FIDE_EVENTO_PERRITO_TB 
            WHERE ID_PERRITO = P_ID_PERRITO 
            AND ID_ESTADO = 1
        ) 
        LOOP
            V_TOTAL_GASTOS := V_TOTAL_GASTOS + NVL(REC_GASTO.TOTAL_GASTO, 0);
        END LOOP;
        RETURN V_TOTAL_GASTOS;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('NO SE ENCONTRO DATOS CON EL ID INDICADO');
        WHEN TOO_MANY_ROWS THEN
        DBMS_OUTPUT.PUT_LINE('DATOS DUPLICADOS');
        WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('ERROR' || SQLERRM);
    END FIDE_GASTOS_POR_PERRO_FN;

    /*
        4. Busca perritos por filtros
    */
    FUNCTION FIDE_BUSCAR_PERROS_FILTROS_FN(
        P_EDAD_MAX IN NUMBER,
        P_PESO_MAX IN NUMBER,
        P_ID_SEXO  IN NUMBER)
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_FILTRO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_FILTRO FOR
            SELECT P.ID_PERRITO, P.NOMBRE, P.EDAD, P.PESO, R.NOMBRE AS RAZA, S.NOMBRE AS SEXO
            FROM FIDE_PERRITO_TB P
            JOIN FIDE_RAZA_TB R ON P.ID_RAZA = R.ID_RAZA
            JOIN FIDE_SEXO_TB S ON P.ID_SEXO = S.ID_SEXO
            WHERE P.ID_ESTADO = 1
              AND (P.EDAD <= P_EDAD_MAX OR P_EDAD_MAX IS NULL)
              AND (P.PESO <= P_PESO_MAX OR P_PESO_MAX IS NULL)
              AND (P.ID_SEXO = P_ID_SEXO OR P_ID_SEXO IS NULL);
              
        RETURN V_CURSOR_FILTRO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('NO SE ENCONTRO DATOS CON EL ID INDICADO');
        WHEN TOO_MANY_ROWS THEN
        DBMS_OUTPUT.PUT_LINE('DATOS DUPLICADOS');
        WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('ERROR' || SQLERRM);
    END FIDE_BUSCAR_PERROS_FILTROS_FN;

    /*
        5. Da cuantos dias de albergue tiene el perrito
    */
    FUNCTION FIDE_CALCULAR_DIAS_ALBERGUE_FN(
        P_ID_PERRITO IN FIDE_PERRITO_TB.ID_PERRITO%TYPE)
    RETURN NUMBER
    IS
        V_DIAS NUMBER := 0;
        V_FECHA_INGRESO DATE;
    BEGIN
        SELECT FECHA_INGRESO INTO V_FECHA_INGRESO
        FROM FIDE_PERRITO_TB
        WHERE ID_PERRITO = P_ID_PERRITO AND ID_ESTADO = 1;

        V_DIAS := TRUNC(SYSDATE) - TRUNC(V_FECHA_INGRESO);
        
        RETURN V_DIAS;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN -1;
        WHEN TOO_MANY_ROWS THEN
        DBMS_OUTPUT.PUT_LINE('DATOS DUPLICADOS');
        WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('ERROR' || SQLERRM);
    END FIDE_CALCULAR_DIAS_ALBERGUE_FN;

    /*
        11. DA cuantos perritos tiene actualmente una casa cuna
    */
    FUNCTION FIDE_PERRITOS_EN_CASA_CUNA_FN(
        P_IDENTIFICACION IN FIDE_USUARIO_TB.IDENTIFICACION%TYPE)
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_PERRITOS SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_PERRITOS FOR
            SELECT  P.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    P.PESO,
                    CC.NOMBRE AS NOMBRE_CASA_CUNA
            FROM FIDE_CASA_CUNA_TB CC
            JOIN FIDE_CASA_PERRITO_TB CP ON CC.ID_CASA_CUNA = CP.ID_CASA_CUNA
            JOIN FIDE_PERRITO_TB P ON CP.ID_PERRITO = P.ID_PERRITO
            WHERE CC.IDENTIFICACION = P_IDENTIFICACION
              AND CC.ID_ESTADO = 1 
              AND CP.ID_ESTADO = 1;
              
        RETURN V_CURSOR_PERRITOS;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('NO SE ENCONTRO DATOS CON EL ID INDICADO');
        WHEN TOO_MANY_ROWS THEN
        DBMS_OUTPUT.PUT_LINE('DATOS DUPLICADOS');
        WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('ERROR' || SQLERRM);
    END FIDE_PERRITOS_EN_CASA_CUNA_FN;
END FIDE_PERRITOS_PKG;
/

CREATE OR REPLACE PACKAGE BODY FIDE_ADOPCIONES_PKG AS
    /*
        6. Informa su un adoptante es elegible
    */
    FUNCTION FIDE_ELEGIBILIDAD_ADOPTANTE_FN(
        P_IDENTIFICACION IN FIDE_USUARIO_TB.IDENTIFICACION%TYPE)
    RETURN BOOLEAN
    IS
        V_ES_APTO BOOLEAN := TRUE;
    BEGIN
        FOR REC_SEGUIMIENTO IN (
            SELECT S.ID_ESTADO
            FROM FIDE_ADOPCION_TB A
            JOIN FIDE_SEGUIMIENTO_TB S ON A.ID_ADOPCION = S.ID_ADOPCION
            WHERE A.IDENTIFICACION = P_IDENTIFICACION
        ) LOOP
            IF REC_SEGUIMIENTO.ID_ESTADO = 3 THEN
                V_ES_APTO := FALSE;
            END IF;
        END LOOP;

        RETURN V_ES_APTO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('NO SE ENCONTRO DATOS CON EL ID INDICADO');
        WHEN TOO_MANY_ROWS THEN
        DBMS_OUTPUT.PUT_LINE('DATOS DUPLICADOS');
        WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('ERROR' || SQLERRM);
    END FIDE_ELEGIBILIDAD_ADOPTANTE_FN;

    /*
        10. Alerta para dar seguimiento a un perrito
    */
    FUNCTION FIDE_ALERTAS_SEGUIMIENTO_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_ALERTAS SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_ALERTAS FOR
            SELECT  S.ID_SEGUIMIENTO,
                    A.FECHA_ADOPCION,
                    U.NOMBRE || ' ' || U.APELLIDO_PATERNO AS ADOPTANTE,
                    U.IDENTIFICACION,
                    S.FECHA_FIN
            FROM FIDE_SEGUIMIENTO_TB S
            JOIN FIDE_ADOPCION_TB A ON S.ID_ADOPCION = A.ID_ADOPCION
            JOIN FIDE_USUARIO_TB U ON A.IDENTIFICACION = U.IDENTIFICACION
            WHERE S.ID_ESTADO = 1 
              AND S.FECHA_FIN BETWEEN TRUNC(SYSDATE) AND TRUNC(SYSDATE) + 7
            ORDER BY S.FECHA_FIN ASC;
            
        RETURN V_CURSOR_ALERTAS;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('NO SE ENCONTRO DATOS CON EL ID INDICADO');
        WHEN TOO_MANY_ROWS THEN
        DBMS_OUTPUT.PUT_LINE('DATOS DUPLICADOS');
        WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('ERROR' || SQLERRM);
    END FIDE_ALERTAS_SEGUIMIENTO_FN;

    /*
        13. Da un reporte de adopciones por aÃ±o
    */
    FUNCTION FIDE_ESTADISTICAS_ADOPCION_ANUAL_FN(
        P_YEAR IN NUMBER)
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_ESTADISTICAS SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_ESTADISTICAS FOR
            SELECT  EXTRACT(MONTH FROM FECHA_ADOPCION) AS MES,
                    COUNT(ID_ADOPCION) AS TOTAL_ADOPCIONES
            FROM FIDE_ADOPCION_TB
            WHERE EXTRACT(YEAR FROM FECHA_ADOPCION) = P_YEAR
              AND ID_ESTADO = 1
            GROUP BY EXTRACT(MONTH FROM FECHA_ADOPCION)
            ORDER BY MES ASC;
            
        RETURN V_CURSOR_ESTADISTICAS;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('NO SE ENCONTRO DATOS CON EL ID INDICADO');
        WHEN TOO_MANY_ROWS THEN
        DBMS_OUTPUT.PUT_LINE('DATOS DUPLICADOS');
        WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('ERROR' || SQLERRM);
    END FIDE_ESTADISTICAS_ADOPCION_ANUAL_FN;
END FIDE_ADOPCIONES_PKG;
/

CREATE OR REPLACE PACKAGE BODY FIDE_FINANZAS_PKG AS
    /*
        7. Da el total de donaciones de un mes
    */
    FUNCTION FIDE_TOTAL_DONACIONES_MES_FN(
        P_MES IN NUMBER,
        P_YEAR IN NUMBER)
    RETURN NUMBER
    IS
        V_TOTAL NUMBER(10,2) := 0;
    BEGIN
        FOR REC IN (
            SELECT MONTO 
            FROM FIDE_DONACION_TB
            WHERE EXTRACT(MONTH FROM FECHA_DONACION) = P_MES
              AND EXTRACT(YEAR FROM FECHA_DONACION) = P_YEAR
              AND ID_ESTADO = 1
        ) LOOP
            V_TOTAL := V_TOTAL + REC.MONTO;
        END LOOP;
        
        RETURN V_TOTAL;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('NO SE ENCONTRO DATOS CON EL ID INDICADO');
        WHEN TOO_MANY_ROWS THEN
        DBMS_OUTPUT.PUT_LINE('DATOS DUPLICADOS');
        WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('ERROR' || SQLERRM);
    END FIDE_TOTAL_DONACIONES_MES_FN;

    /*
        8. Da el total recaudado de una campaÃ±a
    */
    FUNCTION FIDE_TOTAL_RECAUDADO_CAMPANIA_FN(
        P_ID_CAMPANIA IN FIDE_CAMPANIA_TB.ID_CAMPANIA%TYPE
    )
    RETURN NUMBER
    IS
        V_TOTAL NUMBER(10,2) := 0;
    BEGIN
        FOR REC IN (
            SELECT MONTO 
            FROM FIDE_DONACION_TB
            WHERE ID_CAMPANIA = P_ID_CAMPANIA
              AND ID_ESTADO = 1
        ) LOOP
            V_TOTAL := V_TOTAL + REC.MONTO;
        END LOOP;
        
        RETURN V_TOTAL;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('NO SE ENCONTRO DATOS CON EL ID INDICADO');
        WHEN TOO_MANY_ROWS THEN
        DBMS_OUTPUT.PUT_LINE('DATOS DUPLICADOS');
        WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('ERROR' || SQLERRM);
    END FIDE_TOTAL_RECAUDADO_CAMPANIA_FN;

    /*
        9. Verifica si hay stock suficiente de un producto
    */
    FUNCTION FIDE_VERIFICAR_STOCK_TIENDA_FN(
        P_ID_PRODUCTO IN FIDE_INVENTARIO_TB.ID_PRODUCTO%TYPE,
        P_CANTIDAD_REQUERIDA IN NUMBER
    )
    RETURN BOOLEAN
    IS
        V_STOCK_ACTUAL NUMBER := 0;
    BEGIN
        SELECT CANTIDAD INTO V_STOCK_ACTUAL
        FROM FIDE_INVENTARIO_TB
        WHERE ID_PRODUCTO = P_ID_PRODUCTO AND ID_ESTADO = 1;

        IF V_STOCK_ACTUAL >= P_CANTIDAD_REQUERIDA THEN
            RETURN TRUE;
        ELSE
            RETURN FALSE;
        END IF;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
        WHEN TOO_MANY_ROWS THEN
        DBMS_OUTPUT.PUT_LINE('DATOS DUPLICADOS');
        WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('ERROR' || SQLERRM);
    END FIDE_VERIFICAR_STOCK_TIENDA_FN;

    /*
        15. Da un reporte financiero mensual
    */
    FUNCTION FIDE_BALANCE_FINANCIERO_MENSUAL_FN(
        P_MES IN NUMBER,
        P_YEAR IN NUMBER
    )
    RETURN NUMBER
    IS
        V_TOTAL_DONACIONES NUMBER(10,2) := 0;
        V_TOTAL_VENTAS     NUMBER(10,2) := 0;
        V_TOTAL_GASTOS     NUMBER(10,2) := 0;
        V_BALANCE_NETO     NUMBER(10,2) := 0;
    BEGIN
        SELECT NVL(SUM(MONTO), 0) INTO V_TOTAL_DONACIONES
        FROM FIDE_DONACION_TB
        WHERE EXTRACT(MONTH FROM FECHA_DONACION) = P_MES
          AND EXTRACT(YEAR FROM FECHA_DONACION) = P_YEAR AND ID_ESTADO = 1;

        SELECT NVL(SUM(TOTAL_VENTA), 0) INTO V_TOTAL_VENTAS
        FROM FIDE_VENTA_TB
        WHERE EXTRACT(MONTH FROM FECHA_VENTA) = P_MES
          AND EXTRACT(YEAR FROM FECHA_VENTA) = P_YEAR AND ID_ESTADO = 1;

        SELECT NVL(SUM(TOTAL_GASTO), 0) INTO V_TOTAL_GASTOS
        FROM FIDE_EVENTO_PERRITO_TB
        WHERE EXTRACT(MONTH FROM FECHA_EVENTO) = P_MES
          AND EXTRACT(YEAR FROM FECHA_EVENTO) = P_YEAR AND ID_ESTADO = 1;

        V_BALANCE_NETO := (V_TOTAL_DONACIONES + V_TOTAL_VENTAS) - V_TOTAL_GASTOS;

        RETURN V_BALANCE_NETO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('NO SE ENCONTRO DATOS CON EL ID INDICADO');
        WHEN TOO_MANY_ROWS THEN
        DBMS_OUTPUT.PUT_LINE('DATOS DUPLICADOS');
        WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('ERROR' || SQLERRM);
    END FIDE_BALANCE_FINANCIERO_MENSUAL_FN;
END FIDE_FINANZAS_PKG;
/

CREATE OR REPLACE PACKAGE BODY FIDE_ADMINISTRACION_PKG AS
    /*
        12. Verifica si el usuario es administrador o no
    */
    FUNCTION FIDE_VERIFICAR_PERMISO_ADMIN_FN(
        P_IDENTIFICACION IN FIDE_USUARIO_TB.IDENTIFICACION%TYPE)
    RETURN BOOLEAN
    IS
        V_ID_TIPO_USUARIO NUMBER;
    BEGIN
        SELECT ID_TIPO_USUARIO INTO V_ID_TIPO_USUARIO
        FROM FIDE_USUARIO_TB
        WHERE IDENTIFICACION = P_IDENTIFICACION AND ID_ESTADO = 1;

        IF V_ID_TIPO_USUARIO = 1 THEN
            RETURN TRUE;
        ELSE
            RETURN FALSE;
        END IF;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
        WHEN TOO_MANY_ROWS THEN
        DBMS_OUTPUT.PUT_LINE('DATOS DUPLICADOS');
        WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('ERROR' || SQLERRM);
    END FIDE_VERIFICAR_PERMISO_ADMIN_FN;

    /*
        14. Da un reporte de quien modifico un registro
    */
    FUNCTION FIDE_ULTIMO_EDITOR_REGISTRO_FN(
        P_ENTIDAD IN FIDE_AUDITORIA_TB.ENTIDAD%TYPE
    )
    RETURN VARCHAR2
    IS
        V_USUARIO FIDE_AUDITORIA_TB.USUARIO%TYPE;
    BEGIN
        SELECT USUARIO INTO V_USUARIO
        FROM FIDE_AUDITORIA_TB
        WHERE ENTIDAD = P_ENTIDAD
        ORDER BY FECHA DESC
        FETCH FIRST 1 ROW ONLY;

        RETURN V_USUARIO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN 'Sin registros de auditorÃ­a';
        WHEN TOO_MANY_ROWS THEN
        DBMS_OUTPUT.PUT_LINE('DATOS DUPLICADOS');
        WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('ERROR' || SQLERRM);
    END FIDE_ULTIMO_EDITOR_REGISTRO_FN;
END FIDE_ADMINISTRACION_PKG;
/

