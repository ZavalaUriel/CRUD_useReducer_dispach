import { useState } from "react";

const formVacio = { id: null, nombre: "", correo: "", pelicula: "", horario: "", boletos: 1 };

const FormularioReservacion = ({ peliculas, peliculaInicial = "", horarios, editando, onGuardar, onCancelar }) => {
    const [form, setForm] = useState(editando ? editando : { ...formVacio, pelicula: peliculaInicial });
    const [errores, setErrores] = useState({});
    const [cargando, setCargando] = useState(false);

    const validarFormulario = () => {
        let nuevosErrores = {};

        if (!form.nombre.trim()) {
            nuevosErrores.nombre = "El nombre es obligatorio";
        } else if (form.nombre.trim().length < 3) {
            nuevosErrores.nombre = "El nombre debe tener al menos 3 letras";
        }

        if (!form.correo.trim()) {
            nuevosErrores.correo = "El correo electronico es obligatorio";
        } else {
            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regexEmail.test(form.correo)) {
                nuevosErrores.correo = "El formato del correo electronico no es valido";
            }
        }

        if (!form.pelicula) {
            nuevosErrores.pelicula = "Elige una película";
        }

        if (!form.horario) {
            nuevosErrores.horario = "Elige un horario";
        }

        const boletos = parseInt(form.boletos);
        if (isNaN(boletos) || boletos < 1 || boletos > 10) {
            nuevosErrores.boletos = "Puedes apartar de 1 a 10 boletos";
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        if (errores[name]) {
            setErrores({ ...errores, [name]: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validarFormulario()) return;

        setCargando(true);
        const ok = await onGuardar(form);
        setCargando(false);

        if (ok) setForm(formVacio);
    };

    const esEdicion = form.id !== null;

    return (
        <div className="panel panel-form">
            <h2 className="panel-titulo">
                {esEdicion ? "Editar reservación" : "Nueva reservación"}
            </h2>
            <p className="panel-sub">
                {esEdicion ? "Cambia los datos y guarda" : "Llena los datos para apartar tus lugares"}
            </p>

            <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                    <label htmlFor="nombre" className="form-label">Nombre</label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        className={`form-control ${errores.nombre ? "is-invalid" : ""}`}
                        value={form.nombre}
                        onChange={handleChange}
                        placeholder="Ej. Juan Pérez"
                        autoComplete="off"
                    />
                    <div className="invalid-feedback">{errores.nombre}</div>
                </div>

                <div className="mb-3">
                    <label htmlFor="correo" className="form-label">Correo electrónico</label>
                    <input
                        type="email"
                        id="correo"
                        name="correo"
                        className={`form-control ${errores.correo ? "is-invalid" : ""}`}
                        value={form.correo}
                        onChange={handleChange}
                        placeholder="Ej. usuario@correo.com"
                        autoComplete="off"
                    />
                    <div className="invalid-feedback">{errores.correo}</div>
                </div>

                <div className="mb-3">
                    <label htmlFor="pelicula" className="form-label">Película</label>
                    <select
                        id="pelicula"
                        name="pelicula"
                        className={`form-select ${errores.pelicula ? "is-invalid" : ""}`}
                        value={form.pelicula}
                        onChange={handleChange}
                    >
                        <option value="">Selecciona una película</option>
                        {peliculas.map((p) => (
                            <option key={p.id} value={p.titulo}>{p.titulo}</option>
                        ))}
                    </select>
                    <div className="invalid-feedback">{errores.pelicula}</div>
                </div>

                <div className="mb-3">
                    <span className="form-label d-block">Horario</span>
                    <div className={`horarios ${errores.horario ? "is-invalid" : ""}`}>
                        {horarios.map((h) => (
                            <button
                                type="button"
                                key={h}
                                className={form.horario === h ? "chip chip-activo" : "chip"}
                                onClick={() => handleChange({ target: { name: "horario", value: h } })}
                            >
                                {h}
                            </button>
                        ))}
                    </div>
                    <div className="invalid-feedback">{errores.horario}</div>
                </div>

                <div className="mb-4">
                    <label htmlFor="boletos" className="form-label">Boletos</label>
                    <input
                        type="number"
                        id="boletos"
                        name="boletos"
                        min="1"
                        max="10"
                        className={`form-control ${errores.boletos ? "is-invalid" : ""}`}
                        value={form.boletos}
                        onChange={handleChange}
                    />
                    <div className="invalid-feedback">{errores.boletos}</div>
                </div>

                <div className="d-flex gap-2">
                    <button type="submit" disabled={cargando} className="btn-negro flex-fill">
                        {cargando ? "Procesando..." : esEdicion ? "Guardar cambios" : "Reservar"}
                    </button>
                    {esEdicion && (
                        <button type="button" onClick={onCancelar} className="btn-borde">
                            Cancelar
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default FormularioReservacion;
