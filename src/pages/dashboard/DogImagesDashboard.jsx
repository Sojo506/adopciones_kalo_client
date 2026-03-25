import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as dogImagesApi from "../../api/dogImages";
import * as dogsApi from "../../api/dogs";
import { useAuth } from "../../hooks/useAuth";

const imageStyle = {
  width: "72px",
  height: "72px",
  borderRadius: "18px",
  objectFit: "cover",
  display: "block",
};

const DogImagesDashboard = () => {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dogs, setDogs] = useState([]);
  const [images, setImages] = useState([]);
  const [dogsLoading, setDogsLoading] = useState(true);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const selectedDogId = searchParams.get("perrito") || "";
  const selectedDog = useMemo(
    () => dogs.find((dog) => String(dog.idPerrito) === String(selectedDogId)) || null,
    [dogs, selectedDogId],
  );

  const filteredImages = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return images;
    }

    return images.filter((image) =>
      [image.idImagen, image.nombrePerrito, image.imageUrl, image.estado]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [images, search]);

  const loadDogs = async () => {
    try {
      setDogsLoading(true);
      const data = await dogsApi.getDogs({ force: true });
      setDogs(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar los perritos",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setDogsLoading(false);
    }
  };

  const loadImages = async (idPerrito) => {
    if (!idPerrito) {
      setImages([]);
      return;
    }

    try {
      setImagesLoading(true);
      const data = await dogImagesApi.getDogImagesByDog(idPerrito, { force: true });
      setImages(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar las imagenes",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
      setImages([]);
    } finally {
      setImagesLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Imagenes de perrito | Dashboard Kalo";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setDogsLoading(false);
      return;
    }

    loadDogs();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin || !selectedDogId) {
      setImages([]);
      setImagesLoading(false);
      return;
    }

    loadImages(selectedDogId);
  }, [isAdmin, selectedDogId]);

  const onSelectDog = (event) => {
    const nextDogId = event.target.value;
    const nextSearchParams = new URLSearchParams(searchParams);

    if (nextDogId) {
      nextSearchParams.set("perrito", nextDogId);
    } else {
      nextSearchParams.delete("perrito");
    }

    setSearchParams(nextSearchParams);
  };

  const onDelete = async (image) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Desactivar imagen",
      text: `Se desactivara la imagen ${image.idImagen} del perrito "${image.nombrePerrito}".`,
      showCancelButton: true,
      confirmButtonText: "Desactivar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(image.idImagen);
      await dogImagesApi.deleteDogImage(image.idImagen, {
        idPerrito: image.idPerrito,
      });
      await loadImages(image.idPerrito);

      Swal.fire({
        icon: "success",
        title: "Imagen desactivada",
        text: "La imagen fue desactivada correctamente.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos desactivar la imagen",
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
          <h1>Imagenes de perrito</h1>
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
          <h1>Imagenes de perrito</h1>
          <p className="dashboard-page__lede">
            Sube recursos a Cloudinary, revisa las imagenes asociadas a cada perrito y desactiva
            las que ya no deban mostrarse como imagen principal o en galerias internas.
          </p>
        </div>
        <Link
          className={`dashboard-btn dashboard-btn--primary${!selectedDogId ? " is-disabled" : ""}`}
          onClick={(event) => {
            if (!selectedDogId) {
              event.preventDefault();
            }
          }}
          to={
            selectedDogId
              ? `/dashboard/imagenes-perrito/nuevo?perrito=${encodeURIComponent(selectedDogId)}`
              : "/dashboard/imagenes-perrito/nuevo"
          }
        >
          Subir imagen
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Selecciona un perrito para listar sus imagenes. La imagen principal es la que el
          backend usa como referencia principal en el CRUD de perritos.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <label className="dashboard-input" style={{ minWidth: "320px", marginBottom: 0 }}>
            <span>Perrito</span>
            <select
              className="form-select"
              disabled={dogsLoading || deletingId !== null}
              onChange={onSelectDog}
              value={selectedDogId}
            >
              <option value="">Selecciona un perrito</option>
              {dogs.map((dog) => (
                <option key={dog.idPerrito} value={dog.idPerrito}>
                  #{dog.idPerrito} - {dog.nombre}
                </option>
              ))}
            </select>
          </label>

          <div className="dashboard-toolbar dashboard-toolbar--between" style={{ gap: "0.75rem" }}>
            <input
              className="form-control dashboard-search"
              disabled={!selectedDogId || imagesLoading || deletingId !== null}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por ID, URL o estado"
              value={search}
            />
            <span className="dashboard-muted">
              {filteredImages.length} de {images.length} imagenes
            </span>
          </div>
        </div>

        {dogsLoading ? (
          <div className="dashboard-empty-state">Cargando perritos...</div>
        ) : !selectedDogId ? (
          <div className="dashboard-empty-state">
            Selecciona un perrito para ver sus imagenes.
          </div>
        ) : imagesLoading ? (
          <div className="dashboard-empty-state">Cargando imagenes...</div>
        ) : filteredImages.length === 0 ? (
          <div className="dashboard-empty-state">
            {selectedDog ? (
              <>
                No hay imagenes registradas para <strong>{selectedDog.nombre}</strong>.
              </>
            ) : (
              "No hay imagenes registradas para este perrito."
            )}
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Vista previa</th>
                  <th>Perrito</th>
                  <th>URL</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredImages.map((image) => {
                  const isDeletingCurrent = deletingId === image.idImagen;

                  return (
                    <tr key={image.idImagen}>
                      <td>
                        {image.imageUrl ? (
                          <img
                            alt={`Imagen ${image.idImagen} del perrito ${image.nombrePerrito}`}
                            loading="lazy"
                            src={image.imageUrl}
                            style={imageStyle}
                          />
                        ) : (
                          <span className="dashboard-muted">Sin imagen</span>
                        )}
                      </td>
                      <td>{image.nombrePerrito || image.idPerrito}</td>
                      <td>
                        {image.imageUrl ? (
                          <a href={image.imageUrl} rel="noreferrer" target="_blank">
                            Abrir recurso
                          </a>
                        ) : (
                          <span className="dashboard-muted">Sin URL</span>
                        )}
                      </td>
                      <td>{image.estado || image.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/imagenes-perrito/${image.idImagen}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingId !== null}
                            onClick={() => onDelete(image)}
                            type="button"
                          >
                            {isDeletingCurrent ? "Desactivando..." : "Desactivar"}
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

export default DogImagesDashboard;
