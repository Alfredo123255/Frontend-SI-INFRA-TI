import { useState } from "react";
import { actualizarAdministrativosActivo, listarClusters } from "../../api/client";
import DetailInfoGrid from "./DetailInfoGrid";
import ClusterPicker from "./ClusterPicker";
import "./DatosGeneralesEditables.css";

const COMUNES = [
  { label: "Cluster", key: "cluster", dato: "cluster", type: "cluster" },
  { label: "Responsable", key: "responsable", dato: "responsable", type: "text" },
  { label: "Orden de Compra", key: "ordenCompra", dato: "orden_compra", type: "text" },
  { label: "Fecha EOS", key: "fechaEos", dato: "fecha_eos", type: "date" },
  { label: "Fecha EOL", key: "fechaEol", dato: "fechaEol", type: "date" },
];

const ESPECIFICOS = {
  servidor: [{ label: "Fecha de Soporte SO", key: "fechaSoporteSo", dato: "fecha_soporte_so", type: "date" }],
  switch: [
    { label: "Tipo de Red", key: "tipoRed", dato: "tipoRED", type: "text" },
    { label: "Modo de Operación", key: "modoOperacion", dato: "modo_operacion", type: "text" },
  ],
  storage: [],
  chasis: [],
};

const HUAWEI_SO = [
  { label: "IP del Sistema Operativo", key: "ipSistemaOperativo", dato: "ip_sistema_operativo", type: "text" },
  { label: "Versión de SO", key: "versionSo", dato: "version_so", type: "text" },
];

function DatosGeneralesEditables({ activoId, tipo, fabricante, items, onSaved }) {
  const [editando, setEditando] = useState(false);
  const [inicial, setInicial] = useState({});
  const [formulario, setFormulario] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [cargandoClusters, setCargandoClusters] = useState(false);
  const [clusters, setClusters] = useState([]);
  const [error, setError] = useState("");
  const campos = [...COMUNES, ...(ESPECIFICOS[tipo] ?? []),
    ...(tipo === "servidor" && fabricante?.toLowerCase() === "huawei" ? HUAWEI_SO : [])];

  const iniciar = async () => {
    setError("");
    setCargandoClusters(true);
    try {
      const disponibles = await listarClusters();
      setClusters(disponibles);
      const valores = Object.fromEntries(campos.map((campo) => {
        const item = items.find((fila) => fila.label === campo.label);
        return [campo.key, String(item?.value ?? "")];
      }));
      setInicial(valores);
      setFormulario(valores);
      setEditando(true);
    } catch (err) {
      setError(`No se pudieron cargar los clústeres: ${err.message}`);
    } finally {
      setCargandoClusters(false);
    }
  };

  const cancelar = () => {
    if (!guardando) {
      setEditando(false);
      setError("");
    }
  };

  const guardar = async (evento) => {
    evento.preventDefault();
    if (guardando) return;
    const cambios = {};
    for (const campo of campos) {
      const nuevo = formulario[campo.key].trim();
      if (nuevo === inicial[campo.key].trim()) continue;
      if (campo.type === "date" && nuevo === "") {
        setError(`Introduce un valor para ${campo.label}; dejarlo vacío conservaría el anterior.`);
        return;
      }
      if ((campo.key === "ipSistemaOperativo" || campo.key === "versionSo") && nuevo === "") {
        setError(`Introduce un valor para ${campo.label}.`);
        return;
      }
      if (campo.key === "ipSistemaOperativo" && !/^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/.test(nuevo)) {
        setError("Introduce una dirección IPv4 válida para el sistema operativo.");
        return;
      }
      if (campo.type === "cluster" && !clusters.some((item) => item.nombre === nuevo)) {
        setError("Selecciona un clúster existente de la lista.");
        return;
      }
      cambios[campo.key] = nuevo;
    }
    if (Object.keys(cambios).length === 0) {
      cancelar();
      return;
    }
    setGuardando(true);
    setError("");
    try {
      const respuesta = await actualizarAdministrativosActivo(activoId, cambios);
      onSaved(Object.fromEntries(campos.map((campo) => [campo.dato, respuesta[campo.key]])));
      setEditando(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const filas = editando ? items.map((item) => {
    const campo = campos.find((fila) => fila.label === item.label);
    if (!campo) return item;
    return { ...item, editElement: campo.type === "cluster" ? (
      <ClusterPicker value={formulario.cluster} clusters={clusters}
        onChange={(cluster) => setFormulario((anterior) => ({ ...anterior, cluster }))}
        disabled={guardando} />
    ) : (
      <input
        aria-label={item.label}
        className="admin-edit__input"
        type={campo.type}
        value={formulario[campo.key]}
        onChange={(evento) => setFormulario((anterior) => ({ ...anterior, [campo.key]: evento.target.value }))}
        disabled={guardando}
      />
    ) };
  }) : items;

  return (
    <div className="admin-edit">
      <div className="admin-edit__toolbar">
        <p>{editando ? "Edita los campos administrativos y guarda los cambios." : "Los datos administrativos se pueden modificar aquí."}</p>
        {!editando && (
          <button type="button" className="admin-edit__edit-button" onClick={iniciar}
            disabled={cargandoClusters} aria-label="Editar datos administrativos">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L9 17l-4 1 1-4Z" />
            </svg>
            {cargandoClusters ? "Cargando..." : "Editar datos"}
          </button>
        )}
      </div>
      {editando ? (
        <form onSubmit={guardar}>
          <DetailInfoGrid items={filas} />
          <p className="admin-edit__model-note">Busca y selecciona un clúster existente. La fecha EOL pertenece al modelo y cambiará para todos los activos de ese modelo.</p>
          {error && <p className="admin-edit__error" role="alert">{error}</p>}
          <div className="admin-edit__actions">
            <button type="button" onClick={cancelar} disabled={guardando}>Cancelar</button>
            <button type="submit" className="admin-edit__save" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      ) : <>
        {error && <p className="admin-edit__error" role="alert">{error}</p>}
        <DetailInfoGrid items={items} />
      </>}
    </div>
  );
}

export default DatosGeneralesEditables;
