const BASE_URL = import.meta.env.VITE_API_URL ?? "";

async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`API ${path} respondió ${res.status}`);
  }
  return res.json();
}

async function apiJson(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch {
    throw new Error("No se pudo contactar el backend. Comprueba que esté iniciado.");
  }
  const body = await res.text();
  let data;
  try {
    data = body ? JSON.parse(body) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const detail = data?.message ?? (typeof data?.detail === "string" ? data.detail : null);
    const error = new Error(detail ?? `La API respondió ${res.status}.`);
    error.status = res.status;
    throw error;
  }
  return data;
}

export function probarConexionSnmp(datos) {
  return apiJson("/api/conexiones-snmp/probar", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function registrarConexionSnmp(datos) {
  return apiJson("/api/conexiones-snmp", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function obtenerConexionSnmp(activoId) {
  return apiJson(`/api/conexiones-snmp/activos/${activoId}`);
}

export function actualizarConexionSnmp(activoId, datos) {
  return apiJson(`/api/conexiones-snmp/activos/${activoId}`, {
    method: "PATCH",
    body: JSON.stringify(datos),
  });
}

export function listarClusters() {
  return apiJson("/api/clusters");
}

export function crearCluster(datos) {
  return apiJson("/api/clusters", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function listarDatacenters() {
  return apiJson("/api/datacenters");
}

export function listarServidores() {
  return apiGet("/api/servidores");
}

export function obtenerServidor(id) {
  return apiGet(`/api/servidores/${id}`);
}

export function listarStorage() {
  return apiGet("/api/storage");
}

export function obtenerStorage(id) {
  return apiGet(`/api/storage/${id}`);
}

export function listarSwitches() {
  return apiGet("/api/switches");
}

export function obtenerSwitch(id) {
  return apiGet(`/api/switches/${id}`);
}

export function listarChasisBlades() {
  return apiGet("/api/chasis-blade");
}

export function obtenerChasisBlade(id) {
  return apiGet(`/api/chasis-blade/${id}`);
}

export function listarMantenimientos() {
  return apiGet("/api/activos/mantenimiento");
}

export function cambiarMantenimiento(activoId, datos) {
  return apiJson(`/api/activos/${activoId}/mantenimiento`, {
    method: "PATCH",
    body: JSON.stringify(datos),
  });
}

export function darDeBajaActivo(activoId, datos) {
  return apiJson(`/api/activos/${activoId}/baja`, {
    method: "PATCH",
    body: JSON.stringify(datos),
  });
}

export function listarHistorialActivo(activoId) {
  return apiGet(`/api/activos/${activoId}/historial`);
}

export function listarAlertas() {
  return apiGet("/api/alertas");
}

export function actualizarAdministrativosActivo(activoId, datos) {
  return apiJson(`/api/activos/${activoId}/administrativos`, {
    method: "PATCH",
    body: JSON.stringify(datos),
  });
}
