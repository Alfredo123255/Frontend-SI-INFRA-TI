import { useEffect, useMemo, useState } from "react";
import { IconClose, IconPencil, IconPlus } from "../../components/icons";
import "../administrar-equipos/AdministrarEquipos.css";
import "../../components/CicloVidaActivo.css";
import "../administrar-entornos/AdministrarEntornos.css";
import { actualizarUmbral, listarUmbrales } from "../../api/client";
import "./ConfigurarAlertas.css";

const CATALOGO = [
  { id: "cpu_uso_ghz", nombre: "Uso de CPU", tipo: "metrica", unidad: "%", max: 100 },
  { id: "ram_uso_gb", nombre: "Uso de memoria RAM", tipo: "metrica", unidad: "%", max: 100 },
  { id: "disco_uso_gb", nombre: "Uso de disco", tipo: "metrica", unidad: "%", max: 100 },
  { id: "equipo_temperatura_c", nombre: "Temperatura", tipo: "metrica", unidad: "°C", max: null },
  { id: "dias_para_eos", nombre: "Fin de soporte (EOS)", tipo: "fecha", unidad: "días" },
  { id: "almacenamiento_uso_tb", nombre: "Capacidad de almacenamiento usada", tipo: "metrica", unidad: "%", max: 100 },
  { id: "equipo_consumo_w", nombre: "Consumo eléctrico", tipo: "metrica", unidad: "W", max: null },
  { id: "red_trafico_entrada_mbps", nombre: "Tráfico de red (entrada)", tipo: "metrica", unidad: "Mbps", max: null },
  { id: "red_trafico_salida_mbps", nombre: "Tráfico de red (salida)", tipo: "metrica", unidad: "Mbps", max: null },
  { id: "almacenamiento_iops", nombre: "IOPS", tipo: "metrica", unidad: "IOPS", max: null },
  { id: "almacenamiento_latencia_ms", nombre: "Latencia", tipo: "metrica", unidad: "ms", max: null },
  { id: "almacenamiento_throughput_lectura_mbps", nombre: "Throughput (lectura)", tipo: "metrica", unidad: "Mbps", max: null },
  { id: "almacenamiento_throughput_escritura_mbps", nombre: "Throughput (escritura)", tipo: "metrica", unidad: "Mbps", max: null },
  { id: "red_utilizacion_pct", nombre: "Utilización de enlaces", tipo: "metrica", unidad: "%", max: 100 },
];

const textoAdvertencia = (u) => (u.tipo === "fecha" ? `Faltan ≤ ${u.advertencia} días` : `≥ ${u.advertencia} ${u.unidad}`);
const textoCritico = (u) => (u.tipo === "fecha" ? "Fecha vencida" : `≥ ${u.critico} ${u.unidad}`);

function ConfigurarAlertas() {
  const [umbrales, setUmbrales] = useState([]);
  const [form, setForm] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorCarga, setErrorCarga] = useState("");
  const [errorGuardar, setErrorGuardar] = useState("");

  useEffect(() => {
    let activo = true;
    listarUmbrales().then((filas) => {
      if (!activo) return;
      const porNombre = new Map(filas.map((fila) => [fila.nombre, fila]));
      setUmbrales(CATALOGO.filter((u) => porNombre.has(u.id)).map((u) => ({
        ...u, advertencia: porNombre.get(u.id).advertencia, critico: porNombre.get(u.id).critico,
      })));
    }).catch((error) => {
      if (activo) setErrorCarga(error.message);
    }).finally(() => {
      if (activo) setCargando(false);
    });
    return () => { activo = false; };
  }, []);

  const cerrar = () => {
    if (guardando) return;
    setForm(null);
    setErrorGuardar("");
  };
  const guardar = async (quitar = false) => {
    if (guardando || (!quitar && errorForm !== null)) return;
    setGuardando(true);
    setErrorGuardar("");
    try {
      const fila = await actualizarUmbral(form.id, {
        advertencia: quitar ? null : Number(form.advertencia),
        critico: quitar || form.tipo === "fecha" ? null : Number(form.critico),
      });
      setUmbrales((actuales) => actuales.map((u) => u.id === fila.nombre
        ? { ...u, advertencia: fila.advertencia, critico: fila.critico } : u));
      setForm(null);
    } catch (error) {
      setErrorGuardar(error.message);
    } finally {
      setGuardando(false);
    }
  };

  const errorForm = useMemo(() => {
    if (!form) return null;
    if (form.tipo === "fecha") {
      return /^\d+$/.test(form.advertencia) && Number.isFinite(Number(form.advertencia))
        ? null : "Los días de aviso deben ser un entero mayor o igual a cero.";
    }
    if (form.advertencia === "" || form.critico === "") return "";
    const adv = Number(form.advertencia);
    const cri = Number(form.critico);
    if (!Number.isFinite(adv) || !Number.isFinite(cri) || adv < 0 || cri < 0) return "Los valores deben ser mayores o iguales a cero.";
    if (form.max && (adv > form.max || cri > form.max)) return `Los valores no pueden superar ${form.max} ${form.unidad}.`;
    if (cri < adv) return "El valor crítico debe ser mayor o igual al de advertencia.";
    return null;
  }, [form]);

  return (
    <div className="admin-equipos admin-equipos--wide">
      <section className="panel admin-mant-tabla">
        <div className="admin-mant-tabla__head">
          <div>
            <h3>Umbrales de alerta</h3>
            <p>Define a partir de qué valor cada métrica genera una alerta media o crítica.</p>
          </div>
          <div className="umbral-leyenda">
            <span><i className="umbral-dot umbral-dot--warn" />Advertencia (alerta media)</span>
            <span><i className="umbral-dot umbral-dot--crit" />Crítico (alerta crítica)</span>
          </div>
        </div>
        {cargando && <p role="status">Cargando umbrales…</p>}
        {errorCarga && <p className="entornos-error" role="alert">{errorCarga}</p>}
        <div className="admin-mant-tabla__wrap">
          <table className="admin-mant-tabla__table">
            <thead><tr><th>Umbral</th><th>Advertencia</th><th>Crítico</th><th></th></tr></thead>
            <tbody>
              {umbrales.map((u) => {
                const tiene = u.advertencia != null;
                return (
                  <tr key={u.id}>
                    <td><span className="admin-mant-tabla__equipo-name">{u.nombre}</span></td>
                    {tiene ? (
                      <>
                        <td className="tabular"><span className="umbral-valor umbral-valor--warn">{textoAdvertencia(u)}</span></td>
                        <td className="tabular"><span className="umbral-valor umbral-valor--crit">{textoCritico(u)}</span></td>
                      </>
                    ) : (
                      <td colSpan={2}><span className="umbral-sin">Sin umbral</span></td>
                    )}
                    <td>
                      <div className="entornos-acciones">
                        {tiene ? (
                          <button type="button" className="entornos-icon-btn entornos-icon-btn--edit" title="Editar umbral" aria-label={`Editar umbral de ${u.nombre}`}
                            onClick={() => setForm({ ...u, advertencia: String(u.advertencia), critico: String(u.critico), modo: "editar" })}><IconPencil /></button>
                        ) : (
                          <button type="button" className="entornos-btn umbral-definir" aria-label={`Definir umbral de ${u.nombre}`}
                            onClick={() => setForm({ ...u, advertencia: "", critico: "", modo: "nuevo" })}><IconPlus /> Definir</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {form && (
        <div className="ciclo-vida-modal__overlay" onClick={cerrar}>
          <div className="ciclo-vida-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="ciclo-vida-modal__bar ciclo-vida-modal__bar--accent" />
            <div className="ciclo-vida-modal__head">
              <h3>{form.modo === "nuevo" ? "Definir umbral" : "Editar umbral"} — {form.nombre}</h3>
              <button type="button" className="ciclo-vida-modal__close" onClick={cerrar}><IconClose /></button>
            </div>
            <div className="ciclo-vida-modal__body">
              {form.tipo === "fecha" ? (
                <>
                  <label className="ciclo-vida-modal__field"><span>Advertencia: días de aviso antes de la fecha</span>
                    <input value={form.advertencia} onChange={(e) => setForm({ ...form, advertencia: e.target.value })} placeholder="Ej. 30" />
                  </label>
                  {errorForm && <small className="entornos-error">{errorForm}</small>}
                  <p className="entornos-ayuda">El nivel crítico es fijo: se genera una alerta crítica cuando la fecha ya venció.</p>
                </>
              ) : (
                <>
                  <div className="entornos-grid-2">
                    <label className="ciclo-vida-modal__field"><span>Advertencia ({form.unidad})</span>
                      <input value={form.advertencia} onChange={(e) => setForm({ ...form, advertencia: e.target.value })} placeholder="Ej. 80" />
                    </label>
                    <label className="ciclo-vida-modal__field"><span>Crítico ({form.unidad})</span>
                      <input value={form.critico} onChange={(e) => setForm({ ...form, critico: e.target.value })} placeholder="Ej. 90" />
                    </label>
                  </div>
                  {errorForm && <small className="entornos-error">{errorForm}</small>}
                </>
              )}
              <p className="entornos-ayuda">Alcanzar la advertencia genera una alerta media, y el nivel crítico, una alerta crítica. El cambio se aplica en la siguiente consulta.</p>
              {errorGuardar && <p className="entornos-error" role="alert">{errorGuardar}</p>}
              <div className="ciclo-vida-modal__actions">
                {form.tipo !== "fecha" && form.modo === "editar" && (
                  <button type="button" className="ciclo-vida-modal__cancel" disabled={guardando} onClick={() => guardar(true)}>Quitar umbral</button>
                )}
                <button type="button" className="ciclo-vida-modal__cancel" onClick={cerrar}>Cancelar</button>
                <button type="button" className="ciclo-vida-modal__confirm ciclo-vida-modal__confirm--accent" disabled={guardando || errorForm !== null} onClick={() => guardar()}>{guardando ? "Guardando…" : "Guardar umbral"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ConfigurarAlertas;
