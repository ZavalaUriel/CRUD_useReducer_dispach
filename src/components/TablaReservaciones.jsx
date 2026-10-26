const TablaReservaciones = ({ reservaciones = [], peliculas, cargando, editandoId, onEditar, onEliminar }) => {
    const buscarPelicula = (titulo) => peliculas.find((p) => p.titulo === titulo);

    const iniciales = (nombre) =>
        nombre.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

    if (cargando) {
        return <p className="texto-gris">Cargando reservaciones...</p>;
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-end mb-3">
                <h2 className="seccion-titulo mb-0">Reservaciones</h2>
                <span className="texto-gris">{reservaciones.length} registradas</span>
            </div>

            {reservaciones.length === 0 ? (
                <div className="vacio">
                    <p className="mb-0">Todavía no hay reservaciones. Haz la primera con el formulario.</p>
                </div>
            ) : (
                <ul className="lista-reservas">
                    {reservaciones.map((reservacion) => {
                        const pelicula = buscarPelicula(reservacion.pelicula);
                        const total = pelicula ? pelicula.precio * reservacion.boletos : 0;

                        return (
                            <li
                                key={reservacion.id}
                                className={editandoId === reservacion.id ? "reserva reserva-activa" : "reserva"}
                            >
                                {pelicula ? (
                                    <img src={pelicula.imagen} alt={pelicula.titulo} className="reserva-img" />
                                ) : (
                                    <div className="reserva-img reserva-avatar">{iniciales(reservacion.nombre)}</div>
                                )}

                                <div className="reserva-info">
                                    <h3 className="reserva-nombre">{reservacion.nombre}</h3>
                                    <p className="reserva-detalle">{reservacion.correo}</p>
                                    <p className="reserva-detalle">
                                        <strong>{reservacion.pelicula}</strong> · {reservacion.horario} · {reservacion.boletos} {reservacion.boletos === 1 ? "boleto" : "boletos"}
                                    </p>
                                </div>

                                <div className="reserva-acciones">
                                    <span className="reserva-total">${total.toFixed(2)}</span>
                                    <div className="d-flex gap-2">
                                        <button onClick={() => onEditar(reservacion)} className="btn-borde btn-chico">
                                            Editar
                                        </button>
                                        <button onClick={() => onEliminar(reservacion)} className="btn-borde btn-chico btn-peligro">
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default TablaReservaciones;
