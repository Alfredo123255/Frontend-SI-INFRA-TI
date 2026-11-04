import { Link, useLocation } from "react-router-dom";
import { IconDashboard } from "../../components/icons";

function MetricasActivoLink({ activoId, hostname }) {
  const { pathname } = useLocation();
  const segmento = pathname.split("/").at(-2);
  const tipo = { storage: "storage", switches: "switch", "chasis-blades": "chasis", blade: "blade", rackeable: "rackeable" }[segmento];
  const parametros = new URLSearchParams({ tipo, volver: pathname });
  return (
    <Link
      to={`/activos/${activoId}/metricas?${parametros}`}
      state={{ ficha: { id: String(activoId), tipo, hostname } }}
      className="detail-general-actions__btn"
    >
      <IconDashboard className="detail-general-actions__icon" />
      Ver métricas
    </Link>
  );
}

export default MetricasActivoLink;
