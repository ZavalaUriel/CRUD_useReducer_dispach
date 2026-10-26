import { useState, useRef } from 'react'
import peliculasIniciales from './cartelera.json'
import Reservaciones from './components/Reservaciones'

const GRUPO = "IDGS1003";

const crearPelicula = (titulo, genero, precio, duracion) => ({
    id: Date.now(),
    titulo,
    genero,
    precio,
    duracion,
    imagen: `https://picsum.photos/seed/${Date.now()}/300/420`
});

const conFormato = (numero) => `$${numero.toFixed(2)}`;

const enHoras = (minutos) => `${Math.floor(minutos / 60)}h ${minutos % 60}min`;

const buscarEnCartelera = (lista, genero, texto) => {
    let resultado = lista.slice();
    if (genero !== "todas") {
        resultado = resultado.filter(p => p.genero === genero);
    }
    if (texto !== "") {
        resultado = resultado.filter(p => p.titulo.toLowerCase().includes(texto.toLowerCase()));
    }
    return resultado;
};

const ordenarPorPrecio = (lista) => lista.slice().sort((a, b) => a.precio - b.precio);

const aplicarDescuento = (lista, porcentaje) =>
    lista.map(p => ({ ...p, precio: Math.round(p.precio * (1 - porcentaje / 100)) }));

const quitarPorId = (lista, id) => {
    const copia = lista.slice();
    const i = copia.findIndex(p => p.id === id);
    if (i !== -1) copia.splice(i, 1);
    return copia;
};

const precioPromedio = (lista) => {
    if (lista.length === 0) return 0;
    return lista.reduce((total, p) => total + p.precio, 0) / lista.length;
};


function Navegacion({ vista, onCambiar }) {
    return (
        <nav className="barra">
            <div className="container d-flex justify-content-between align-items-center">
                <span className="logo" onClick={() => onCambiar("cartelera")}>cinemax</span>
                <div className="d-flex gap-2 align-items-center">
                    <button className={vista === "cartelera" ? "pill pill-activo" : "pill"} onClick={() => onCambiar("cartelera")}>
                        Cartelera
                    </button>
                    <button className={vista === "reservaciones" ? "pill pill-activo" : "pill"} onClick={() => onCambiar("reservaciones")}>
                        Reservaciones
                    </button>
                    <span className="pill pill-grupo d-none d-md-inline-block">{GRUPO}</span>
                </div>
            </div>
        </nav>
    );
}


function Encabezado({ total, children }) {
    return (
        <header className="hero">
            <div className="container text-center">
                <h1 className="hero-titulo">Tu próxima función<br />empieza aquí</h1>
                <p className="hero-texto">Encuentra los estrenos de la semana y aparta tus boletos en segundos</p>
                {children}
                <p className="hero-dato"><strong>{total}</strong> películas en pantalla esta semana</p>
            </div>
        </header>
    );
}


function Destacada({ pelicula }) {
    return (
        <section className="destacada mb-5">
            <img src={pelicula.imagen} alt={pelicula.titulo} className="destacada-img" />
            <div className="destacada-info">
                <span className="etiqueta">Estreno de la semana</span>
                <h2 className="destacada-titulo">{pelicula.titulo}</h2>
                <p className="texto-gris mb-0">
                    {enHoras(pelicula.duracion)} · {pelicula.genero} · desde {conFormato(pelicula.precio)}
                </p>
            </div>
        </section>
    );
}


function Filtros({ genero, onFiltrar, onBuscar, onOrdenar }) {
    return (
        <div className="buscador">
            <div className="buscador-campo">
                <i className="bi bi-search buscador-icono"></i>
                <input type="text" placeholder="Buscar película..." onChange={onBuscar} />
            </div>
            <div className="buscador-campo">
                <i className="bi bi-film buscador-icono"></i>
                <select value={genero} onChange={(e) => onFiltrar(e.target.value)}>
                    <option value="todas">Todos los géneros</option>
                    <option value="accion">Acción</option>
                    <option value="comedia">Comedia</option>
                    <option value="terror">Terror</option>
                </select>
            </div>
            <button className="btn-negro" onClick={onOrdenar}>Ordenar por precio</button>
        </div>
    );
}


function TarjetaPelicula({ pelicula, onComprar, onQuitar }) {
    const { id, titulo, genero, precio, duracion, imagen } = pelicula;

    return (
        <div className="col-12 col-sm-6 col-lg-4">
            <div className="tarjeta">
                <div className="tarjeta-foto">
                    <img src={imagen} alt={titulo} />
                    <button className="tarjeta-quitar" title="Quitar de cartelera" onClick={() => onQuitar(id)}>×</button>
                </div>
                <div className="d-flex justify-content-between align-items-start mt-2">
                    <h3 className="tarjeta-titulo">{titulo}</h3>
                    <span className="tarjeta-precio">{conFormato(precio)}</span>
                </div>
                <p className="tarjeta-detalle">{enHoras(duracion)}</p>
                <div className="d-flex justify-content-between align-items-center">
                    <span className={`genero genero-${genero}`}>{genero}</span>
                    <button className="btn-borde btn-chico" onClick={() => onComprar(pelicula)}>Comprar boleto</button>
                </div>
            </div>
        </div>
    );
}


function ListaPeliculas({ peliculas, onComprar, onQuitar }) {
    if (peliculas.length === 0) {
        return <div className="vacio"><p className="mb-0">No hay películas con esos datos.</p></div>;
    }
    return (
        <div className="row g-4">
            {peliculas.map(p => <TarjetaPelicula key={p.id} pelicula={p} onComprar={onComprar} onQuitar={onQuitar} />)}
        </div>
    );
}


function Promocion({ tiempo, corriendo, onActivar }) {
    return (
        <section className="promo mb-5">
            <div>
                <span className="etiqueta etiqueta-blanca">Promoción</span>
                <h2 className="promo-titulo">Función de medianoche</h2>
                <p className="mb-0">Cuando termine la cuenta todos los boletos bajan 20%.</p>
            </div>
            <span className="promo-tiempo">{tiempo}s</span>
            <button className="btn-blanco" onClick={onActivar} disabled={corriendo}>
                {corriendo ? "En cuenta..." : "Activar"}
            </button>
        </section>
    );
}


function FormularioPelicula({ onAgregar }) {
    const [titulo, setTitulo] = useState("");
    const [genero, setGenero] = useState("accion");
    const [precio, setPrecio] = useState("");
    const [duracion, setDuracion] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (titulo === "" || precio === "" || duracion === "") return;
        onAgregar(crearPelicula(titulo, genero, parseFloat(precio), parseInt(duracion)));
        setTitulo("");
        setPrecio("");
        setDuracion("");
    };

    return (
        <section className="panel h-100">
            <h2 className="panel-titulo">Programar otra función</h2>
            <p className="panel-sub">Agrega una película nueva a la cartelera</p>
            <form className="row g-2" onSubmit={handleSubmit}>
                <div className="col-12">
                    <input type="text" className="form-control" placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
                </div>
                <div className="col-md-6">
                    <select className="form-select" value={genero} onChange={(e) => setGenero(e.target.value)}>
                        <option value="accion">Acción</option>
                        <option value="comedia">Comedia</option>
                        <option value="terror">Terror</option>
                    </select>
                </div>
                <div className="col-6 col-md-3">
                    <input type="number" className="form-control" placeholder="Precio" min="0" value={precio} onChange={(e) => setPrecio(e.target.value)} />
                </div>
                <div className="col-6 col-md-3">
                    <input type="number" className="form-control" placeholder="Minutos" min="1" value={duracion} onChange={(e) => setDuracion(e.target.value)} />
                </div>
                <div className="col-12">
                    <button type="submit" className="btn-negro w-100 mt-1">Dar de alta</button>
                </div>
            </form>
        </section>
    );
}


function App() {
    const [vista, setVista] = useState("cartelera");
    const [cartelera, setCartelera] = useState(peliculasIniciales);
    const [peliculaReservar, setPeliculaReservar] = useState("");
    const [generoElegido, setGeneroElegido] = useState("todas");
    const [textoBuscado, setTextoBuscado] = useState("");
    const [segundos, setSegundos] = useState(10);
    const [cuentaCorriendo, setCuentaCorriendo] = useState(false);
    const intervaloRef = useRef(null);

    const activarPromocion = () => {
        if (cuentaCorriendo) return;
        let count = 10;
        setSegundos(count);
        setCuentaCorriendo(true);

        intervaloRef.current = setInterval(() => {
            count--;
            setSegundos(count);
            if (count === 0) {
                clearInterval(intervaloRef.current);
                intervaloRef.current = null;
                setCuentaCorriendo(false);
                setCartelera(prev => aplicarDescuento(prev, 20));
                setSegundos(10);
            }
        }, 1000);
    };

    const visibles = buscarEnCartelera(cartelera, generoElegido, textoBuscado);

    const agregarPelicula = (p) => setCartelera(prev => [...prev, p]);

    const cambiarVista = (v) => {
        setPeliculaReservar("");
        setVista(v);
        window.scrollTo(0, 0);
    };

    const reservarPelicula = (p) => {
        setPeliculaReservar(p.titulo);
        setVista("reservaciones");
        window.scrollTo(0, 0);
    };

    return (
        <div>
            <Navegacion vista={vista} onCambiar={cambiarVista} />

            {vista === "reservaciones" ? (
                <Reservaciones peliculas={cartelera} peliculaInicial={peliculaReservar} />
            ) : (
                <>
                    <Encabezado total={cartelera.length}>
                        <Filtros
                            genero={generoElegido}
                            onFiltrar={setGeneroElegido}
                            onBuscar={(e) => setTextoBuscado(e.target.value)}
                            onOrdenar={() => setCartelera(prev => ordenarPorPrecio(prev))}
                        />
                    </Encabezado>

                    <main className="container my-5">
                        {cartelera.length > 0 && <Destacada pelicula={cartelera[0]} />}

                        <div className="d-flex justify-content-between align-items-end mb-3">
                            <h2 className="seccion-titulo mb-0">Cartelera</h2>
                            <span className="texto-gris">Precio promedio: {conFormato(precioPromedio(cartelera))}</span>
                        </div>

                        <div className="mb-5">
                            <ListaPeliculas
                                peliculas={visibles}
                                onComprar={reservarPelicula}
                                onQuitar={(id) => setCartelera(prev => quitarPorId(prev, id))}
                            />
                        </div>

                        <Promocion tiempo={segundos} corriendo={cuentaCorriendo} onActivar={activarPromocion} />

                        <FormularioPelicula onAgregar={agregarPelicula} />
                    </main>
                </>
            )}

            <footer className="pie">
                <div className="container d-flex flex-wrap justify-content-between gap-2">
                    <span className="logo">cinemax</span>
                    <span className="texto-gris">Grupo {GRUPO} · Aplicaciones Web Progresivas</span>
                </div>
            </footer>
        </div>
    );
}

export default App
