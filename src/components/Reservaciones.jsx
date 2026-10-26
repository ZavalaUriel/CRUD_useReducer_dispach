import { useEffect, useReducer, useState } from "react";
import { ReservacionesReducer } from "../reducers/ReservacionesReducer";
import FormularioReservacion from "./FormularioReservacion";
import TablaReservaciones from "./TablaReservaciones";

const API_URL = "http://localhost:3001/reservaciones";

const HORARIOS = ["14:30", "17:00", "19:45", "22:10"];

const Reservaciones = ({ peliculas, peliculaInicial }) => {
    const [state, dispatch] = useReducer(ReservacionesReducer, []);
    const [editando, setEditando] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [alerta, setAlerta] = useState(null);

    const mostrarAlerta = (tipo, mensaje) => {
        setAlerta({ tipo, mensaje });
        setTimeout(() => setAlerta(null), 3500);
    };

    // GET
    useEffect(() => {
        fetch(API_URL)
            .then(res => res.json())
            .then(data => dispatch({ type: "load", payload: data }))
            .catch(err => {
                console.error("Error en la carga de reservaciones:" + err);
                mostrarAlerta("error", "No se pudo conectar con el servidor");
            })
            .finally(() => setCargando(false));
    }, []);

    // POST y PUT
    const guardarReservacion = async (form) => {
        const esEdicion = form.id !== null;
        const metodo = esEdicion ? "PUT" : "POST";
        const urlFinal = esEdicion ? `${API_URL}/${form.id}` : API_URL;

        const datos = {
            nombre: form.nombre,
            correo: form.correo,
            pelicula: form.pelicula,
            horario: form.horario,
            boletos: parseInt(form.boletos),
        };

        try {
            const respuesta = await fetch(urlFinal, {
                method: metodo,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });

            if (!respuesta.ok) throw new Error("Error en la operacion del servidor");

            const dataServidor = await respuesta.json();

            if (esEdicion) {
                dispatch({ type: "update", payload: dataServidor });
                mostrarAlerta("exito", "Reservación actualizada");
            } else {
                dispatch({ type: "add", payload: dataServidor });
                mostrarAlerta("exito", `Listo ${form.nombre}, tu reservación quedó registrada`);
            }

            setEditando(null);
            return true;
        } catch (err) {
            console.log("error: " + err);
            mostrarAlerta("error", "Hubo un error al procesar la solicitud");
            return false;
        }
    };

    // DELETE
    const eliminarReservacion = async (reservacion) => {
        if (!window.confirm(`¿Seguro que quieres cancelar la reservación de ${reservacion.nombre}?`)) return;

        try {
            const respuesta = await fetch(`${API_URL}/${reservacion.id}`, { method: "DELETE" });

            if (!respuesta.ok) throw new Error("No se puede eliminar el recurso");

            dispatch({ type: "delete", payload: reservacion.id });
            if (editando && editando.id === reservacion.id) setEditando(null);
            mostrarAlerta("exito", "Reservación cancelada");
        } catch (err) {
            console.log("error: " + err);
            mostrarAlerta("error", "Hubo un error al procesar la solicitud");
        }
    };

    const totalBoletos = state.reduce((total, r) => total + r.boletos, 0);

    return (
        <>
            <section className="hero hero-chico">
                <div className="container text-center">
                    <h1 className="hero-titulo">Aparta tus lugares</h1>
                    <p className="hero-texto">
                        Registra, cambia o cancela las reservaciones de la sala
                    </p>
                    <p className="hero-dato">
                        <strong>{totalBoletos}</strong> boletos apartados en {state.length} reservaciones
                    </p>
                </div>
            </section>

            {alerta && (
                <div className={`alerta alerta-${alerta.tipo}`} role="alert">
                    <span className="alerta-icono">{alerta.tipo === "exito" ? "✓" : "!"}</span>
                    {alerta.mensaje}
                    <button className="alerta-cerrar" onClick={() => setAlerta(null)}>×</button>
                </div>
            )}

            <main className="container my-5">
                <div className="row g-4">
                    <div className="col-lg-5">
                        <FormularioReservacion
                            key={editando ? editando.id : "nueva"}
                            peliculas={peliculas}
                            peliculaInicial={peliculaInicial}
                            horarios={HORARIOS}
                            editando={editando}
                            onGuardar={guardarReservacion}
                            onCancelar={() => setEditando(null)}
                        />
                    </div>
                    <div className="col-lg-7">
                        <TablaReservaciones
                            reservaciones={state}
                            peliculas={peliculas}
                            cargando={cargando}
                            editandoId={editando ? editando.id : null}
                            onEditar={setEditando}
                            onEliminar={eliminarReservacion}
                        />
                    </div>
                </div>
            </main>
        </>
    );
};

export default Reservaciones;
