const CAMPOS = {
  estado: "Estado del componente",
  presencia: "Presencia del componente",
  estado_operativo: "Estado operativo",
  estado_conexion: "Conexión SNMP",
  mantenimiento_activo: "Mantenimiento",
  cluster: "Clúster",
};

export function nombreCampoEvento(campo) {
  if (!campo) return "—";
  return CAMPOS[campo] ?? campo.replaceAll("_", " ").replace(/^./, (letra) => letra.toUpperCase());
}
