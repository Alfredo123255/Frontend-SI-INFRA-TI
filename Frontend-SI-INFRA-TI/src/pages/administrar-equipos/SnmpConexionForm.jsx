import { useEffect, useState } from "react";
import { IconWifi, IconCheck, IconEye, IconEyeOff } from "../../components/icons";
import { loadFromStorage, saveToStorage } from "./storage";
import "./AdministrarEquipos.css";

const FRECUENCIAS = [
  "Cada 5 minutos — activos críticos",
  "Cada 30 minutos — activos estándar",
  "Una vez al día — datos administrativos",
];

const EMPTY_FORM = {
  ip: "",
  usuario: "",
  credencial: "",
  credencialConfirm: "",
  frecuencia: FRECUENCIAS[0],
};

const EMPTY_SNMP_STATE = {
  form: EMPTY_FORM,
  registrado: false,
  ipRegistrada: "",
  editando: false,
  fueEditado: false,
};

const SNMP_STORAGE_KEY = "administrar-equipos:snmp:v2";

const isValidSnmpState = (v) =>
  v &&
  typeof v === "object" &&
  typeof v.registrado === "boolean" &&
  v.form &&
  typeof v.form === "object" &&
  typeof v.form.ip === "string";

function SnmpConexionForm({ onCancel }) {
  const [snmp, setSnmp] = useState(() =>
    loadFromStorage(SNMP_STORAGE_KEY, EMPTY_SNMP_STATE, isValidSnmpState)
  );
  const [showCredencial, setShowCredencial] = useState(false);
  const [showCredencialConfirm, setShowCredencialConfirm] = useState(false);

  useEffect(() => {
    saveToStorage(SNMP_STORAGE_KEY, snmp);
  }, [snmp]);

  const setField = (key) => (e) =>
    setSnmp((prev) => ({ ...prev, form: { ...prev.form, [key]: e.target.value } }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!passwordsMatch) return;
    setSnmp((prev) => ({
      ...prev,
      registrado: true,
      ipRegistrada: prev.form.ip.trim() || "el equipo",
      fueEditado: prev.editando,
      editando: false,
    }));
  };

  const handleEditar = () => setSnmp((prev) => ({ ...prev, registrado: false, editando: true }));

  const handleReset = () => setSnmp(EMPTY_SNMP_STATE);

  const { form, registrado, ipRegistrada, editando, fueEditado } = snmp;
  const credencial = form.credencial ?? "";
  const credencialConfirm = form.credencialConfirm ?? "";
  const passwordsMatch = credencial === credencialConfirm;

  return (
    <>
      <div className="admin-snmp__header">
        <div className="admin-snmp__header-icon">
          <IconWifi />
        </div>
        <div>
          <h2>Registrar activo por SNMP</h2>
          <p>
            El activo se crea automáticamente en el inventario apenas el sistema logre la primera
            lectura.
          </p>
        </div>
      </div>

      {!registrado ? (
        <form onSubmit={handleSubmit}>
          <div className="admin-snmp__grid">
            <label className="admin-snmp__field admin-snmp__field--full">
              <span>IP de gestión</span>
              <input value={form.ip} onChange={setField("ip")} placeholder="10.10.1.24" />
            </label>
            <label className="admin-snmp__field">
              <span>Usuario SNMPv3</span>
              <input value={form.usuario} onChange={setField("usuario")} placeholder="snmp_admin" />
            </label>
            <label className="admin-snmp__field">
              <span>Frecuencia de actualización</span>
              <select value={form.frecuencia} onChange={setField("frecuencia")}>
                {FRECUENCIAS.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-snmp__field">
              <span>Credencial</span>
              <div className="admin-snmp__password-wrap">
                <input
                  type={showCredencial ? "text" : "password"}
                  value={credencial}
                  onChange={setField("credencial")}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="admin-snmp__password-toggle"
                  onClick={() => setShowCredencial((v) => !v)}
                  aria-label={showCredencial ? "Ocultar credencial" : "Mostrar credencial"}
                >
                  {showCredencial ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </label>
            <label className="admin-snmp__field">
              <span>Confirmar credencial</span>
              <div className="admin-snmp__password-wrap">
                <input
                  type={showCredencialConfirm ? "text" : "password"}
                  value={credencialConfirm}
                  onChange={setField("credencialConfirm")}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="admin-snmp__password-toggle"
                  onClick={() => setShowCredencialConfirm((v) => !v)}
                  aria-label={showCredencialConfirm ? "Ocultar credencial" : "Mostrar credencial"}
                >
                  {showCredencialConfirm ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              {!passwordsMatch && credencialConfirm !== "" && (
                <span className="admin-snmp__field-error">Las credenciales no coinciden.</span>
              )}
            </label>
          </div>
          <div className="admin-snmp__footer">
            <p>La credencial se almacena cifrada.</p>
            <div className="admin-snmp__footer-actions">
              {onCancel && (
                <button type="button" className="admin-snmp__cancel" onClick={onCancel}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="admin-snmp__submit" disabled={!passwordsMatch}>
                {editando ? "Guardar cambios" : "Registrar conexión"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="admin-snmp__exito">
          <div className="admin-snmp__exito-icon">
            <IconCheck />
          </div>
          <h3>{fueEditado ? "Conexión actualizada" : "Conexión registrada"}</h3>
          <p>
            El sistema consultará <span>{ipRegistrada}</span> vía SNMPv3. El activo aparecerá en
            tu inventario en cuanto se complete la primera lectura.
          </p>
          <div className="admin-snmp__pill">
            <span className="admin-snmp__pill-dot" />
            Pendiente de vinculación
          </div>
          <div className="admin-snmp__exito-actions">
            <button
              type="button"
              className="admin-snmp__reset admin-snmp__reset--primary"
              onClick={handleEditar}
            >
              Editar conexión
            </button>
            <button type="button" className="admin-snmp__reset" onClick={handleReset}>
              Registrar otro equipo
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default SnmpConexionForm;
