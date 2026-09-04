const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`API ${path} respondió ${res.status}`);
  }
  return res.json();
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
