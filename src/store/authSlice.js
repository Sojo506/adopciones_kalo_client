import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as authApi from "../api/auth";

const ADMIN_ROLE_NAME = "administrador";
const ACTIVE_STATE_ID = 1;
const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "authUser";

const normalizeStateId = (value) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

export const normalizeUser = (rawUser) => {
  if (!rawUser) {
    return null;
  }

  const roleName = rawUser.tipoUsuario || rawUser.tipo || rawUser.rol || "";
  const roleId = Number(rawUser.idTipoUsuario || rawUser.tipoUsuarioId || rawUser.roleId || 0);
  const accountStateId = normalizeStateId(rawUser.idEstadoCuenta ?? rawUser.accountStateId);
  const emailStateId = normalizeStateId(rawUser.idEstadoCorreo ?? rawUser.emailStateId);
  const isEmailVerified =
    typeof rawUser.emailVerified === "boolean"
      ? rawUser.emailVerified
      : typeof rawUser.isEmailVerified === "boolean"
        ? rawUser.isEmailVerified
        : emailStateId === ACTIVE_STATE_ID;

  return {
    ...rawUser,
    roleName,
    roleId,
    accountStateId,
    emailStateId,
    isEmailVerified,
  };
};

export const isAdminUser = (currentUser) => {
  if (!currentUser) {
    return false;
  }

  return currentUser.roleId === 1 || currentUser.roleName.toLowerCase() === ADMIN_ROLE_NAME;
};

const persistUser = (user) => {
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return;
  }

  localStorage.removeItem(AUTH_USER_KEY);
};

const clearPersistedAuth = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};

const getPersistedUser = () => {
  const serializedUser = localStorage.getItem(AUTH_USER_KEY);

  if (!serializedUser) {
    return null;
  }

  try {
    return normalizeUser(JSON.parse(serializedUser));
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
};

export const initializeAuth = createAsyncThunk("auth/initializeAuth", async (_, { rejectWithValue }) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (!token) {
    return null;
  }

  try {
    const me = await authApi.getMe();
    return normalizeUser(me?.user || me || null);
  } catch (error) {
    clearPersistedAuth();
    return rejectWithValue(error);
  }
});

export const loginUser = createAsyncThunk("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    const data = await authApi.signIn(credentials);
    const token = data?.accessToken || data?.token;
    const userData = normalizeUser(data?.user || null);

    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    }

    if (userData) {
      persistUser(userData);
      return userData;
    }

    const me = await authApi.getMe();
    const normalizedUser = normalizeUser(me?.user || me || null);
    persistUser(normalizedUser);
    return normalizedUser;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const registerUser = createAsyncThunk("auth/registerUser", async (payload, { rejectWithValue }) => {
  try {
    return await authApi.signUp(payload);
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { rejectWithValue }) => {
  try {
    await authApi.logout();
  } catch (error) {
    clearPersistedAuth();
    return rejectWithValue(error);
  }

  clearPersistedAuth();
  return null;
});

const hasPersistedToken = Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
const persistedUser = hasPersistedToken ? getPersistedUser() : null;

const initialState = {
  user: persistedUser,
  loading: hasPersistedToken && !persistedUser,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthState: (state) => {
      state.user = null;
      state.loading = false;
      clearPersistedAuth();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        if (!state.user) {
          state.loading = true;
        }
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        persistUser(action.payload);
        state.loading = false;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.user = null;
        state.loading = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        persistUser(action.payload);
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state) => {
        state.loading = false;
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.loading = false;
      });
  },
});

export const { clearAuthState } = authSlice.actions;
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectLoading = (state) => state.auth.loading;
export const selectIsAuthenticated = (state) => Boolean(state.auth.user);
export const selectIsAdmin = (state) => isAdminUser(state.auth.user);

export default authSlice.reducer;
