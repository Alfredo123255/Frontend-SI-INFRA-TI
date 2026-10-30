import { useEffect, useState } from "react";
import { IconAlert } from "../../components/icons";
import { obtenerConexionSnmp } from "../../api/client";
import { EVENTO_CONEXION_SNMP } from "../../api/actualizacionSnmp";
import "./SnmpConnectionNotice.css";

const TEXTOS = {
  titulo: "Se perdió la conexión con el dispositivo",
  detalle: "Datos desactualizados: se muestra la última lectura exitosa hasta que se restablezca la conexión SNMP.",
};

function SnmpConnectionNotice({ activoId }) {
  const [estado, setEstado] = useState(null);

  useEffect(() => {
    let active = true;
    const consultar = () => {
      obtenerConexionSnmp(activoId)
        .then((conexion) => { if (active) setEstado(conexion.estadoConexion); })
        .catch(() => { if (active) setEstado(null); });
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

  if (estado !== "Sin conexión") return null;

  return (
    <div className="server-detail__connection-notice" role="alert">
      <span className="server-detail__connection-icon" aria-hidden="true"><IconAlert /></span>
      <div>
        <strong>{TEXTOS.titulo}</strong>
        <p>{TEXTOS.detalle}</p>
      </div>
    </div>
  );
}

export default SnmpConnectionNotice;
