import { useMemo, useState } from "react";
import { IconClose, IconPencil, IconPlus } from "../../components/icons";
import "../administrar-equipos/AdministrarEquipos.css";
import "../../components/CicloVidaActivo.css";
import "../administrar-entornos/AdministrarEntornos.css";
import "./ConfigurarAlertas.css";

// Datos de ejemplo: reemplazar por GET /api/umbrales.
// tipo "metrica": se compara con la última lectura (más alto es peor).
// tipo "fecha": se compara con los días que faltan para EOS/EOL; el nivel crítico es fijo (fecha vencida).
const UMBRALES = [
  { id: "cpu_uso_ghz", nombre: "Uso de CPU", tipo: "metrica", unidad: "%", max: 100, advertencia: 80, critico: 95 },
  { id: "ram_uso_gb", nombre: "Uso de memoria RAM", tipo: "metrica", unidad: "%", max: 100, advertencia: 80, critico: 95 },
  { id: "disco_uso_gb", nombre: "Uso de disco", tipo: "metrica", unidad: "%", max: 100, advertencia: 80, critico: 90 },
  { id: "equipo_temperatura_c", nombre: "Temperatura", tipo: "metrica", unidad: "°C", max: 120, advertencia: 75, critico: 85 },
  { id: "dias_para_eos", nombre: "Fin de soporte (EOS)", tipo: "fecha", unidad: "días", advertencia: 30, critico: 0 },
  { id: "dias_para_eol", nombre: "Fin de vida (EOL)", tipo: "fecha", unidad: "días", advertencia: 30, critico: 0 },
  { id: "almacenamiento_uso_tb", nombre: "Capacidad de almacenamiento usada", tipo: "metrica", unidad: "%", max: 100, advertencia: null, critico: null },
  { id: "equipo_consumo_w", nombre: "Consumo eléctrico", tipo: "metrica", unidad: "W", max: null, advertencia: null, critico: null },
  { id: "red_trafico_mbps", nombre: "Tráfico de red", tipo: "metrica", unidad: "Mbps", max: null, advertencia: null, critico: null },
  { id: "almacenamiento_iops", nombre: "IOPS", tipo: "metrica", unidad: "IOPS", max: null, advertencia: null, critico: null },
  { id: "almacenamiento_latencia_ms", nombre: "Latencia", tipo: "metrica", unidad: "ms", max: null, advertencia: null, critico: null },
  { id: "almacenamiento_throughput_mbps", nombre: "Throughput", tipo: "metrica", unidad: "Mbps", max: null, advertencia: null, critico: null },
  { id: "red_utilizacion_pct", nombre: "Utilización de enlaces", tipo: "metrica", unidad: "%", max: 100, advertencia: null, critico: null },
];

const textoAdvertencia = (u) => (u.tipo === "fecha" ? `Faltan ≤ ${u.advertencia} días` : `≥ ${u.advertencia} ${u.unidad}`);
const textoCritico = (u) => (u.tipo === "fecha" ? "Fecha vencida" : `≥ ${u.critico} ${u.unidad}`);

function ConfigurarAlertas() {
  const [form, setForm] = useState(null);

  const errorForm = useMemo(() => {
    if (!form) return null;
    if (form.tipo === "fecha") {
      return /^\d+$/.test(form.advertencia) && Number(form.advertencia) >= 1 && Number(form.advertencia) <= 365
        ? null : "Ingresa un número entero de días entre 1 y 365.";
    }
    if (form.advertencia === "" || form.critico === "") return "";
    const adv = Number(form.advertencia);
    const cri = Number(form.critico);
    if (Number.isNaN(adv) || Number.isNaN(cri) || adv < 0 || cri < 0) return "Los valores deben ser números positivos.";
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
        <div className="admin-mant-tabla__wrap">
          <table className="admin-mant-tabla__table">
            <thead><tr><th>Umbral</th><th>Advertencia</th><th>Crítico</th><th></th></tr></thead>
            <tbody>
              {UMBRALES.map((u) => {
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
        <div className="ciclo-vida-modal__overlay" onClick={() => setForm(null)}>
          <div className="ciclo-vida-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="ciclo-vida-modal__bar ciclo-vida-modal__bar--accent" />
            <div className="ciclo-vida-modal__head">
              <h3>{form.modo === "nuevo" ? "Definir umbral" : "Editar umbral"} — {form.nombre}</h3>
              <button type="button" className="ciclo-vida-modal__close" onClick={() => setForm(null)}><IconClose /></button>
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
                      <input value={form.critico} onChange={(e) => setForm({ ...form, critico: e.target.value })} placeholder="Ej. 95" />
                    </label>
                  </div>
                  {errorForm && <small className="entornos-error">{errorForm}</small>}
                </>
              )}
              <p className="entornos-ayuda">Alcanzar la advertencia genera una alerta media, y el nivel crítico, una alerta crítica. El cambio se aplica en la siguiente consulta.</p>
              <div className="ciclo-vida-modal__actions">
                <button type="button" className="ciclo-vida-modal__cancel" onClick={() => setForm(null)}>Cancelar</button>
                <button type="button" className="ciclo-vida-modal__confirm ciclo-vida-modal__confirm--accent" disabled={errorForm !== null}>Guardar umbral</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ConfigurarAlertas;
