import { useEffect, useRef, useState } from "react";
import { IconWifi, IconCheck, IconEye, IconEyeOff } from "../../components/icons";
import {
  crearCluster,
  listarClusters,
  listarDatacenters,
  probarConexionSnmp,
  registrarConexionSnmp,
} from "../../api/client";
import "./AdministrarEquipos.css";

const EMPTY_FORM = {
  ipGestion: "",
  usuario: "",
  clave: "",
  confirmarClave: "",
  frecuenciaActualizacion: "300",
};

const EMPTY_CLUSTER = { nombre: "", ambiente: "", datacenter: "" };

function SnmpConexionForm({ onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [cluster, setCluster] = useState("");
  const [clusterMode, setClusterMode] = useState("existing");
  const [nuevoCluster, setNuevoCluster] = useState(EMPTY_CLUSTER);
  const [clusters, setClusters] = useState([]);
  const [clusterSearch, setClusterSearch] = useState("");
  const [datacenters, setDatacenters] = useState([]);
  const [catalogError, setCatalogError] = useState("");
  const [error, setError] = useState("");
  const [clusterError, setClusterError] = useState("");
  const [prueba, setPrueba] = useState(null);
  const [creado, setCreado] = useState(null);
  const [busy, setBusy] = useState("");
  const [showClave, setShowClave] = useState(false);
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const revision = useRef(0);

  useEffect(() => {
    let activo = true;
    Promise.all([listarClusters(), listarDatacenters()])
      .then(([listaClusters, listaDatacenters]) => {
        if (!activo) return;
        setClusters(listaClusters);
        setDatacenters(listaDatacenters);
      })
      .catch((err) => { if (activo) setCatalogError(err.message); });
    return () => { activo = false; };
  }, []);

  const setField = (key) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
    if (key !== "frecuenciaActualizacion" && key !== "confirmarClave") {
      revision.current += 1;
      setPrueba(null);
    }
  };

  const credencialesValidas = form.ipGestion.trim() && form.usuario.trim() && form.clave &&
    form.clave === form.confirmarClave;
  const normalizarNombre = (nombre) => nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
  const clustersFiltrados = clusters.filter((item) =>
    normalizarNombre(item.nombre).includes(normalizarNombre(clusterSearch.trim()))
  );

  const probar = async (event) => {
    event.preventDefault();
    if (busy) return;
    if (!form.ipGestion.trim()) {
      setError("La IP de gestión es obligatoria.");
      return;
    }
    if (!form.usuario.trim()) {
      setError("El usuario SNMPv3 es obligatorio.");
      return;
    }
    if (!form.clave) {
      setError("La clave de autenticación SNMPv3 es obligatoria.");
      return;
    }
    if (form.clave.length < 8) {
      setError("La clave SNMPv3 debe tener al menos 8 caracteres.");
      return;
    }
    if (!form.confirmarClave) {
      setError("Debes confirmar la clave de autenticación.");
      return;
    }
    if (form.clave !== form.confirmarClave) {
      setError("Las claves no coinciden.");
      return;
    }
    const version = revision.current;
    setBusy("probar");
    setError("");
    setPrueba(null);
    try {
      const respuesta = await probarConexionSnmp({
        ipGestion: form.ipGestion.trim(),
        usuario: form.usuario.trim(),
        clave: form.clave,
      });
      if (version !== revision.current) return;
      if (!respuesta.ok) throw new Error(respuesta.mensaje || "La prueba SNMP falló.");
      setPrueba(respuesta);
    } catch (err) {
      if (version === revision.current) setError(err.message);
    } finally {
      setBusy("");
    }
  };

  const guardarCluster = async (event) => {
    event.preventDefault();
    if (busy) return;
    if (!nuevoCluster.nombre.trim()) {
      setClusterError("El nombre del clúster es obligatorio.");
      return;
    }
    if (!nuevoCluster.ambiente) {
      setClusterError("Selecciona un ambiente para el clúster.");
      return;
    }
    if (!nuevoCluster.datacenter) {
      setClusterError("Selecciona un datacenter para el clúster.");
      return;
    }
    setBusy("cluster");
    setClusterError("");
    setError("");
    try {
      const respuesta = await crearCluster({ ...nuevoCluster, nombre: nuevoCluster.nombre.trim() });
      setClusters((prev) => [...prev, respuesta]);
      setCluster(respuesta.nombre);
      setClusterSearch("");
      setClusterMode("existing");
      setNuevoCluster(EMPTY_CLUSTER);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  };

  const registrar = async (event) => {
    event.preventDefault();
    if (!prueba || !credencialesValidas || !cluster || clusterMode !== "existing" || busy) return;
    setBusy("registrar");
    setError("");
    try {
      const respuesta = await registrarConexionSnmp({
        ipGestion: form.ipGestion.trim(),
        usuario: form.usuario.trim(),
        clave: form.clave,
        frecuenciaActualizacion: Number(form.frecuenciaActualizacion),
        clusterId: cluster,
      });
      if (!respuesta.ok) throw new Error("No se pudo crear el activo.");
      setCreado(respuesta);
      setForm(EMPTY_FORM);
      setPrueba(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  };

  const reiniciar = () => {
    setCreado(null);
    setCluster("");
    setClusterSearch("");
    setClusterMode("existing");
    setError("");
    setPrueba(null);
    setForm(EMPTY_FORM);
  };

  return (
    <>
      <div className="admin-snmp__header">
        <div className="admin-snmp__header-icon"><IconWifi /></div>
        <div>
          <h2>Registrar activo por SNMP</h2>
          <p>Primero probaremos la conexión. Después podrás asignar el activo a un clúster.</p>
        </div>
      </div>

      {creado ? (
        <div className="admin-snmp__exito">
          <div className="admin-snmp__exito-icon"><IconCheck /></div>
          <h3>Activo y conexión registrados</h3>
          <p>Activo <span>#{creado.activoId}</span> ({creado.tipoActivo || "equipo"}) en el clúster <span>{creado.clusterId}</span>.</p>
          <p>Conexión #{creado.conexionId}{creado.hostname ? ` · ${creado.hostname}` : ""}</p>
          <div className="admin-snmp__exito-actions">
            <button type="button" className="admin-snmp__reset admin-snmp__reset--primary" onClick={reiniciar}>Registrar otro equipo</button>
            {onCancel && <button type="button" className="admin-snmp__reset" onClick={onCancel}>Cerrar</button>}
          </div>
        </div>
      ) : (
        <>
          <form onSubmit={probar} noValidate>
            <div className="admin-snmp__grid">
              <label className="admin-snmp__field admin-snmp__field--full">
                <span>IP de gestión (puerto opcional)</span>
                <input value={form.ipGestion} onChange={setField("ipGestion")} placeholder="10.10.1.24 o 127.0.0.12:16200" required disabled={!!busy} />
              </label>
              <label className="admin-snmp__field">
                <span>Usuario SNMPv3</span>
                <input value={form.usuario} onChange={setField("usuario")} placeholder="snmp_admin" required disabled={!!busy} />
              </label>
              <label className="admin-snmp__field">
                <span>Frecuencia de actualización</span>
                <select value={form.frecuenciaActualizacion} onChange={setField("frecuenciaActualizacion")} disabled={!!busy}>
                  <option value="120">Cada 2 minutos (pruebas)</option>
                  <option value="300">Cada 5 minutos</option>
                  <option value="1800">Cada 30 minutos</option>
                  <option value="86400">Una vez al día</option>
                </select>
              </label>
              <label className="admin-snmp__field">
                <span>Clave de autenticación</span>
                <div className="admin-snmp__password-wrap">
                  <input type={showClave ? "text" : "password"} value={form.clave} onChange={setField("clave")} required minLength={8} disabled={!!busy} autoComplete="new-password" />
                  <button type="button" className="admin-snmp__password-toggle" onClick={() => setShowClave(!showClave)} aria-label={showClave ? "Ocultar clave" : "Mostrar clave"}>{showClave ? <IconEyeOff /> : <IconEye />}</button>
                </div>
              </label>
              <label className="admin-snmp__field">
                <span>Confirmar clave</span>
                <div className="admin-snmp__password-wrap">
                  <input type={showConfirmacion ? "text" : "password"} value={form.confirmarClave} onChange={setField("confirmarClave")} required disabled={!!busy} autoComplete="new-password" />
                  <button type="button" className="admin-snmp__password-toggle" onClick={() => setShowConfirmacion(!showConfirmacion)} aria-label={showConfirmacion ? "Ocultar confirmación" : "Mostrar confirmación"}>{showConfirmacion ? <IconEyeOff /> : <IconEye />}</button>
                </div>
                {form.confirmarClave && form.clave !== form.confirmarClave && <span className="admin-snmp__field-error">Las claves no coinciden.</span>}
              </label>
            </div>
            <div className="admin-snmp__footer">
              <p>La conexión se registra solo después de una prueba satisfactoria.</p>
              <div className="admin-snmp__footer-actions">
                {onCancel && <button type="button" className="admin-snmp__cancel" onClick={onCancel}>Cancelar</button>}
                <button type="submit" className="admin-snmp__submit" disabled={!!busy}>{busy === "probar" ? "Probando…" : prueba ? "Volver a probar" : "Probar conexión"}</button>
              </div>
            </div>
          </form>

          {prueba && (
            <section className="admin-snmp__cluster-section" aria-labelledby="admin-snmp-cluster-title">
              <div className="admin-snmp__cluster-heading">
                <span className="admin-snmp__step-number">02</span>
                <div>
                  <span className="admin-snmp__eyebrow">CONEXIÓN VERIFICADA</span>
                  <h3 id="admin-snmp-cluster-title">¿Dónde estará este activo?</h3>
                  <p>Elige un clúster existente o crea uno para organizar el equipo en tu inventario.</p>
                </div>
              </div>

              <div className="admin-snmp__probe-details" role="status">
                <span className="admin-snmp__probe-icon"><IconCheck /></span>
                <span><strong>Equipo detectado</strong><small>{prueba.sysName || form.ipGestion.trim()}{prueba.tipoDetectado ? ` · ${prueba.tipoDetectado}` : ""}</small></span>
                <span className="admin-snmp__probe-tag">SNMP activo</span>
              </div>

              <div className="admin-snmp__mode-switch" role="group" aria-label="Forma de asignar el clúster">
                <button type="button" className={clusterMode === "existing" ? "is-active" : ""} aria-pressed={clusterMode === "existing"} onClick={() => setClusterMode("existing")} disabled={!!busy}>Seleccionar existente</button>
                <button type="button" className={clusterMode === "new" ? "is-active" : ""} aria-pressed={clusterMode === "new"} onClick={() => setClusterMode("new")} disabled={!!busy}>+ Crear nuevo</button>
              </div>

              {catalogError && <p className="admin-snmp__error" role="alert">No se pudo cargar clústeres y datacenters: {catalogError}</p>}

              {clusterMode === "existing" ? (
                <div className="admin-snmp__cluster-picker">
                  <div className="admin-snmp__cluster-search">
                    <label htmlFor="admin-snmp-cluster-search">Buscar clúster por nombre</label>
                    <div className="admin-snmp__cluster-search-input">
                      <input id="admin-snmp-cluster-search" type="search" value={clusterSearch} onChange={(event) => setClusterSearch(event.target.value)} placeholder="Escribe el nombre del clúster" autoComplete="off" disabled={!!busy || !!catalogError} />
                    </div>
                    <small>{clusterSearch.trim() ? `${clustersFiltrados.length} de ${clusters.length} clústeres` : `${clusters.length} clústeres disponibles`}</small>
                  </div>
                  <div className="admin-snmp__cluster-list" role="radiogroup" aria-label="Clústeres disponibles">
                    {clustersFiltrados.length > 0 ? clustersFiltrados.map((item) => (
                      <label key={item.nombre} className={`admin-snmp__cluster-option${cluster === item.nombre ? " is-selected" : ""}`}>
                        <input type="radio" name="cluster-snmp" value={item.nombre} checked={cluster === item.nombre} onChange={() => setCluster(item.nombre)} disabled={!!busy || !!catalogError} />
                        <span className="admin-snmp__radio-mark" aria-hidden="true" />
                        <span className="admin-snmp__cluster-copy"><strong>{item.nombre}</strong><small>Datacenter: {item.datacenter}</small></span>
                        <span className="admin-snmp__cluster-env">{item.ambiente}</span>
                      </label>
                    )) : <p className="admin-snmp__empty-clusters">{clusters.length === 0 ? "Aún no hay clústeres. Selecciona «Crear nuevo» para agregar el primero." : "No hay clústeres que coincidan con ese nombre."}</p>}
                  </div>
                </div>
              ) : (
                <form onSubmit={guardarCluster} className="admin-snmp__new-cluster" noValidate>
                  <div className="admin-snmp__new-cluster-head">
                    <strong>Nuevo clúster</strong>
                    <span>Define el ambiente y el datacenter donde estará este equipo.</span>
                  </div>
                  <div className="admin-snmp__grid">
                    <label className="admin-snmp__field admin-snmp__field--full"><span>Nombre del clúster</span><input value={nuevoCluster.nombre} onChange={(e) => { setNuevoCluster((prev) => ({ ...prev, nombre: e.target.value })); setClusterError(""); }} placeholder="Ej. CLUSTER-PRODUCCION-01" required aria-invalid={clusterError.includes("nombre") || undefined} disabled={!!busy} /></label>
                    <label className="admin-snmp__field"><span>Ambiente</span><select value={nuevoCluster.ambiente} onChange={(e) => { setNuevoCluster((prev) => ({ ...prev, ambiente: e.target.value })); setClusterError(""); }} required disabled={!!busy}><option value="">Seleccionar ambiente</option><option value="PRODUCCION">Producción</option><option value="QA">QA</option><option value="DESARROLLO">Desarrollo</option></select></label>
                    <label className="admin-snmp__field"><span>Datacenter</span><select value={nuevoCluster.datacenter} onChange={(e) => { setNuevoCluster((prev) => ({ ...prev, datacenter: e.target.value })); setClusterError(""); }} required disabled={!!busy}><option value="">Seleccionar datacenter</option>{datacenters.map((item) => <option key={item.nombre} value={item.nombre}>{item.nombre}</option>)}</select></label>
                  </div>
                  {clusterError && <p className="admin-snmp__field-error" role="alert">{clusterError}</p>}
                  {datacenters.length === 0 && <p className="admin-snmp__hint">No hay datacenters disponibles. Crea uno en el sistema antes de registrar el clúster.</p>}
                  <div className="admin-snmp__new-cluster-actions"><button type="submit" className="admin-snmp__submit" disabled={!!busy}>{busy === "cluster" ? "Creando clúster…" : "Crear y seleccionar clúster"}</button></div>
                </form>
              )}

              {clusterMode === "existing" && (
                <form onSubmit={registrar} className="admin-snmp__register-form">
                  <div className="admin-snmp__register-copy"><strong>{cluster || "Selecciona un clúster"}</strong><span>{cluster ? "El activo quedará asociado a este clúster." : "Elige una opción para continuar."}</span></div>
                  <button type="submit" className="admin-snmp__submit" disabled={!!busy || !credencialesValidas || !cluster}>{busy === "registrar" ? "Registrando activo…" : "Registrar activo"}</button>
                </form>
              )}
            </section>
          )}
          {error && <p className="admin-snmp__error" role="alert">{error}</p>}
        </>
      )}
    </>
  );
}

export default SnmpConexionForm;
