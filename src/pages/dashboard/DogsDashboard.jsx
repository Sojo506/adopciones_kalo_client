import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as dogsApi from "../../api/dogs";
import { useAuth } from "../../hooks/useAuth";

const imageStyle = {
  width: "56px",
  height: "56px",
  borderRadius: "16px",
  objectFit: "cover",
  display: "block",
};

const numberFormatter = new Intl.NumberFormat("es-CR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
  }).format(date);
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return numberFormatter.format(Number(value));
};

const DogsDashboard = () => {
  const { isAdmin } = useAuth();
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredDogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return dogs;
    }

    return dogs.filter((dog) =>
      [
        dog.idPerrito,
        dog.nombre,
        dog.fechaIngreso,
        dog.edad,
        dog.peso,
        dog.estatura,
        dog.sexo,
        dog.raza,
        dog.imageUrl,
        dog.estado,
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [dogs, search]);

  const loadDogs = async () => {
    try {
      setLoading(true);
      const data = await dogsApi.getDogs({ force: true });
      setDogs(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar los perritos",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Perritos | Dashboard Kalo";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadDogs();
  }, [isAdmin]);

  const onDelete = async (dog) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar perrito",
      text: `Se desactivara el perrito "${dog.nombre}".`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(dog.idPerrito);
      await dogsApi.deleteDog(dog.idPerrito);
      await loadDogs();

      Swal.fire({
        icon: "success",
        title: "Perrito eliminado",
        text: "El perrito fue desactivado correctamente.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos eliminar",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="dashboard-page">
        <section className="dashboard-card">
          <p className="dashboard-page__eyebrow">Acceso restringido</p>
          <h1>Perritos</h1>
          <p className="dashboard-page__lede">
            Solo un administrador puede gestionar esta tabla desde el dashboard.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header mt-4">
        <div>
          <p className="dashboard-page__eyebrow">Perritos y adopciones</p>
          <h1>Perritos</h1>
          <p className="dashboard-page__lede">
            Administra la ficha principal de cada perrito con fecha de ingreso, datos fisicos,
            sexo, raza y estado actual.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/perritos/nuevo">
          Crear perrito
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Los perritos no se pueden desactivar si
          todavia tienen imagenes, eventos, solicitudes o asignaciones de casa activas.
        </div>

        <div className="dashboard-alert">
          La imagen principal de cada perrito se muestra aqui como referencia visual y se
          administra desde el CRUD de imagenes de perrito.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por ID, nombre, fecha, edad, peso, raza, sexo o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredDogs.length} de {dogs.length} perritos
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando perritos...</div>
        ) : filteredDogs.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay perritos que coincidan con tu busqueda.
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Fecha ingreso</th>
                  <th>Edad</th>
                  <th>Peso</th>
                  <th>Estatura</th>
                  <th>Sexo</th>
                  <th>Raza</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredDogs.map((dog) => {
                  const isDeletingCurrent = deletingId === dog.idPerrito;

                  return (
                    <tr key={dog.idPerrito}>
                      <td>
                        {dog.imageUrl ? (
                          <img
                            alt={`Perrito ${dog.nombre}`}
                            loading="lazy"
                            src={dog.imageUrl}
                            style={imageStyle}
                          />
                        ) : (
                          <span className="dashboard-muted">Sin imagen</span>
                        )}
                      </td>
                      <td>{dog.idPerrito}</td>
                      <td>{dog.nombre}</td>
                      <td>{formatDate(dog.fechaIngreso)}</td>
                      <td>{dog.edad ?? "-"}</td>
                      <td>{formatNumber(dog.peso)}</td>
                      <td>{formatNumber(dog.estatura)}</td>
                      <td>{dog.sexo || dog.idSexo}</td>
                      <td>{dog.raza || dog.idRaza}</td>
                      <td>{dog.estado || dog.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/perritos/${dog.idPerrito}/editar`}
                          >
                            Editar
                          </Link>
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/eventos-perrito?perrito=${encodeURIComponent(dog.idPerrito)}`}
                          >
                            Eventos
                          </Link>
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/imagenes-perrito?perrito=${encodeURIComponent(dog.idPerrito)}`}
                          >
                            Imagenes
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingId !== null}
                            onClick={() => onDelete(dog)}
                            type="button"
                          >
                            {isDeletingCurrent ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default DogsDashboard;
