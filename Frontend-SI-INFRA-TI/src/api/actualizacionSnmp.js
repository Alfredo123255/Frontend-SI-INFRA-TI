export const EVENTO_CONEXION_SNMP = "conexion-snmp-actualizada";

function comprobarCancelacion(signal) {
  if (signal?.aborted) throw new DOMException("Consulta cancelada", "AbortError");
}

function esperar(signal) {
  comprobarCancelacion(signal);
  return new Promise((resolve, reject) => {
    const cancelar = () => {
      clearTimeout(temporizador);
      reject(new DOMException("Consulta cancelada", "AbortError"));
    };
    const temporizador = setTimeout(() => {
      signal?.removeEventListener("abort", cancelar);
      resolve();
    }, 1000);
    signal?.addEventListener("abort", cancelar, { once: true });
  });
}

/** Una prueba de credenciales no sustituye una lectura completa guardada por el ETL. */
export async function esperarActualizacionSnmp(consultar, anterior, {
  limite = 30, pausa = esperar, signal,
} = {}) {
  let conexion = anterior;
  for (let intento = 0; intento < limite; intento += 1) {
    comprobarCancelacion(signal);
    await pausa(signal);
    comprobarCancelacion(signal);
    try {
      conexion = await consultar();
    } catch {
      comprobarCancelacion(signal);
      return { conexion, actualizada: false };
    }
    comprobarCancelacion(signal);
    if (conexion.estadoConexion === "Inactivo") return { conexion, actualizada: false };
    if (conexion.estadoConexion === "Activo" && conexion.fechaUltimaActualizacion &&
        conexion.fechaUltimaActualizacion !== anterior.fechaUltimaActualizacion) {
      return { conexion, actualizada: true };
    }
  }
  return { conexion, actualizada: false };
}
