import { useEffect, useRef, useState } from "react";
import { IconWifi, IconEye, IconEyeOff, IconCheck } from "../../components/icons";
import { actualizarConexionSnmp, obtenerConexionSnmp } from "../../api/client";
import { esperarActualizacionSnmp, EVENTO_CONEXION_SNMP } from "../../api/actualizacionSnmp";
import "./AdministrarEquipos.css";
import "./EditarConexionSnmp.css";

function EditarConexionSnmp({ activoId, onCancel, onSaved }) {
  const [conexion, setConexion] = useState(null);
  const [form, setForm] = useState({ ipGestion: "", usuario: "", frecuenciaActualizacion: "", clave: "", confirmarClave: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [confirmacion, setConfirmacion] = useState("");
  const [actualizando, setActualizando] = useState(false);
  const peticion = useRef(null);
  const [showClave, setShowClave] = useState(false);
  const duraciones = ["60", "120", "300", "1800", "86400"];

  useEffect(() => {
    let active = true;
    setLoading(true);
    obtenerConexionSnmp(activoId)
      .then((data) => {
        if (!active) return;
        setConexion(data);
        setForm({ ipGestion: data.ipGestion ?? "", usuario: data.usuario ?? "",
          frecuenciaActualizacion: String(data.frecuenciaActualizacion ?? ""), clave: "", confirmarClave: "" });
        setError("");
        setLoading(false);
      })
      .catch((err) => { if (active) { setError(err.message); setLoading(false); } });
    return () => { active = false; peticion.current?.abort(); };
  }, [activoId]);

  const setField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setSaved(false);
    setError("");
  };

  const guardar = async (event) => {
    event.preventDefault();
    if (saving) return;
    if (!form.ipGestion.trim()) {
      setError("La IP de gestión es obligatoria.");
      return;
    }
    if (!form.usuario.trim()) {
      setError("El usuario SNMPv3 es obligatorio.");
      return;
    }
    if (!Number.isInteger(Number(form.frecuenciaActualizacion)) || Number(form.frecuenciaActualizacion) <= 0) {
      setError("Selecciona una frecuencia de actualización válida.");
      return;
    }
    if (form.clave && form.clave.length < 8) {
      setError("La nueva clave SNMPv3 debe tener al menos 8 caracteres.");
      return;
    }
    if (form.clave !== form.confirmarClave) {
      setError("Las claves nuevas no coinciden.");
      return;
    }
    if (form.ipGestion.trim() === conexion.ipGestion &&
        form.usuario.trim() === conexion.usuario &&
        Number(form.frecuenciaActualizacion) === conexion.frecuenciaActualizacion &&
        !form.clave) {
      setError("No hay cambios en la conexión SNMP para guardar.");
      return;
    }
    setSaving(true);
    setError("");
    const controlador = new AbortController();
    peticion.current?.abort();
    peticion.current = controlador;
    try {
      const data = await actualizarConexionSnmp(activoId, {
        ipGestion: form.ipGestion.trim(),
        usuario: form.usuario.trim(),
        frecuenciaActualizacion: Number(form.frecuenciaActualizacion),
        ...(form.clave ? { clave: form.clave } : {}),
      });
      if (controlador.signal.aborted) return;
      setForm((current) => ({ ...current, clave: "", confirmarClave: "" }));
      setActualizando(true);
      const resultado = await esperarActualizacionSnmp(() => obtenerConexionSnmp(activoId), data,
        { signal: controlador.signal });
      if (controlador.signal.aborted) return;
      setConexion(resultado.conexion);
      setConfirmacion(resultado.actualizada
        ? "Los cambios se guardaron y los datos del equipo ya están actualizados."
        : resultado.conexion.estadoConexion === "Inactivo"
          ? "Los cambios se guardaron. El equipo tiene el monitoreo inactivo."
          : "Los cambios se guardaron. La lectura del equipo sigue pendiente; todavía se conservan sus últimos datos conocidos.");
      setSaved(true);
      window.dispatchEvent(new CustomEvent(EVENTO_CONEXION_SNMP,
        { detail: { activoId, estadoConexion: resultado.conexion.estadoConexion } }));
      onSaved?.(resultado.conexion);
    } catch (err) {
      if (!controlador.signal.aborted) setError(err.message);
    } finally {
      if (!controlador.signal.aborted) {
        setSaving(false);
        setActualizando(false);
      }
    }
  };

  return (
    <div className="snmp-edit">
      {saved ? (
        <div className="snmp-edit__confirmation" role="status">
          <div className="snmp-edit__confirmation-icon"><IconCheck /></div>
          <h2>Conexión SNMP actualizada</h2>
          <p>{confirmacion}</p>
          <button type="button" className="admin-snmp__submit" onClick={onCancel}>
            Volver a la ficha
          </button>
        </div>
      ) : (
        <>
          <div className="admin-snmp__header">
            <div className="admin-snmp__header-icon"><IconWifi /></div>
            <div>
              <h2>Editar conexión SNMP</h2>
              <p>Actualiza la conexión vinculada a este activo sin crear otro equipo.</p>
            </div>
          </div>
          {loading && <p className="snmp-edit__message">Cargando conexión…</p>}
          {!loading && !conexion && <p className="admin-snmp__error" role="alert">{error}</p>}
          {!loading && conexion && (
        <form onSubmit={guardar}>
          <p className="snmp-edit__identity">Conexión #{conexion.id} · Estado: <strong>{conexion.estadoConexion}</strong></p>
          <div className="admin-snmp__grid">
            <label className="admin-snmp__field admin-snmp__field--full">
              <span>IP de gestión y puerto</span>
              <input value={form.ipGestion} onChange={setField("ipGestion")} disabled={saving} />
            </label>
            <label className="admin-snmp__field">
              <span>Usuario SNMPv3</span>
              <input value={form.usuario} onChange={setField("usuario")} disabled={saving} />
            </label>
            <label className="admin-snmp__field">
              <span>Frecuencia de actualización</span>
              <select value={form.frecuenciaActualizacion} onChange={setField("frecuenciaActualizacion")}
                disabled={saving}>
                {!duraciones.includes(form.frecuenciaActualizacion) && form.frecuenciaActualizacion && (
                  <option value={form.frecuenciaActualizacion}>Actual: cada {form.frecuenciaActualizacion} segundos</option>
                )}
                <option value="60">Cada 1 minuto</option>
                <option value="120">Cada 2 minutos (pruebas)</option>
                <option value="300">Cada 5 minutos</option>
                <option value="1800">Cada 30 minutos</option>
                <option value="86400">Una vez al día</option>
              </select>
            </label>
            <label className="admin-snmp__field">
              <span>Nueva clave de autenticación</span>
              <div className="admin-snmp__password-wrap">
                <input type={showClave ? "text" : "password"} value={form.clave} onChange={setField("clave")}
                  autoComplete="new-password" disabled={saving} />
                <button type="button" className="admin-snmp__password-toggle"
                  onClick={() => setShowClave((value) => !value)} aria-label={showClave ? "Ocultar clave" : "Mostrar clave"}>
                  {showClave ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </label>
            <label className="admin-snmp__field">
              <span>Confirmar nueva clave</span>
              <input type="password" value={form.confirmarClave} onChange={setField("confirmarClave")}
                autoComplete="new-password" disabled={saving} />
            </label>
          </div>
          <p className="snmp-edit__hint">Deja la nueva clave vacía para conservar la actual. Si cambias la IP, el usuario o la clave, se probará la conexión antes de guardar.</p>
          {error && <p className="admin-snmp__error" role="alert">{error}</p>}
          {actualizando && <p className="snmp-edit__message" role="status">Conexión guardada. Actualizando los datos del equipo…</p>}
          <div className="admin-snmp__footer-actions snmp-edit__actions">
            <button type="button" className="admin-snmp__cancel" onClick={onCancel} disabled={saving}>Cerrar</button>
            <button type="submit" className="admin-snmp__submit" disabled={saving}>
              {saving ? (actualizando ? "Actualizando datos…" : "Guardando…") : "Guardar cambios"}
            </button>
          </div>
        </form>
          )}
        </>
      )}
    </div>
  );
}

export default EditarConexionSnmp;
