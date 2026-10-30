import { Link, useLocation } from "react-router-dom";
import { IconDashboard } from "../../components/icons";

function MetricasActivoLink({ activoId }) {
  const { pathname } = useLocation();
  const tipo = pathname.includes("/blade/") ? "blade" : "rackeable";
  return (
    <Link
      to={`/activos/${activoId}/metricas?tipo=${tipo}&volver=${encodeURIComponent(pathname)}`}
      className="detail-general-actions__btn"
    >
      <IconDashboard className="detail-general-actions__icon" />
      Ver métricas
    </Link>
  );
}

export default MetricasActivoLink;
