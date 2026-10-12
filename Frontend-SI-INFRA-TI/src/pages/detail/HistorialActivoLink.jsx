import { Link, useLocation } from "react-router-dom";

function HistorialActivoLink({ activoId }) {
  const { pathname } = useLocation();
  return (
    <Link
      to={`/activos/${activoId}/historial?volver=${encodeURIComponent(pathname)}`}
      className="detail-general-actions__btn"
    >
      Ver historial de eventos
    </Link>
  );
}

export default HistorialActivoLink;
