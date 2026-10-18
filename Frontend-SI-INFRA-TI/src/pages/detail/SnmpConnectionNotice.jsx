import { useEffect, useState } from "react";
import { IconAlert } from "../../components/icons";
import { obtenerConexionSnmp } from "../../api/client";
import { EVENTO_CONEXION_SNMP } from "../../api/actualizacionSnmp";
import "./SnmpConnectionNotice.css";

const TEXTOS = {
  "Sin conexión": {
    titulo: "Se perdió la conexión con el dispositivo",
    detalle: "Datos desactualizados: se muestra la última lectura exitosa hasta que se restablezca la conexión SNMP.",
  },
  Inactivo: {
    titulo: "Monitoreo SNMP inactivo",
    detalle: "Este equipo no se está consultando. Los datos mostrados pueden estar desactualizados.",
  },
  "No registrada": {
    titulo: "Sin conexión SNMP registrada",
    detalle: "Este equipo no tiene una conexión vinculada. Los datos mostrados pueden estar desactualizados.",
  },
};

function SnmpConnectionNotice({ activoId, enMantenimiento = false }) {
  const [estado, setEstado] = useState(null);

  useEffect(() => {
    let active = true;
    const consultar = () => {
      obtenerConexionSnmp(activoId)
        .then((conexion) => { if (active) setEstado(conexion.estadoConexion); })
        .catch((error) => { if (active) setEstado(error.status === 404 ? "No registrada" : null); });
    };
    consultar();
    const recibirActualizacion = (event) => {
      if (String(event.detail?.activoId) === String(activoId)) {
        setEstado(event.detail.estadoConexion);
      }
    };
    window.addEventListener(EVENTO_CONEXION_SNMP, recibirActualizacion);
    const timer = window.setInterval(consultar, 30_000);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener(EVENTO_CONEXION_SNMP, recibirActualizacion);
    };
  }, [activoId]);

  const mensaje = TEXTOS[estado];
  if (enMantenimiento && estado === "Inactivo") return null;
  if (!mensaje) return null;

  return (
    <div className="server-detail__connection-notice" role="alert">
      <span className="server-detail__connection-icon" aria-hidden="true"><IconAlert /></span>
      <div>
        <strong>{mensaje.titulo}</strong>
        <p>{mensaje.detalle}</p>
      </div>
    </div>
  );
}

export default SnmpConnectionNotice;
