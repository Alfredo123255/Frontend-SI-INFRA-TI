import { IconWrench } from "../../components/icons";

function MaintenanceNotice({ active }) {
  if (!active) return null;

  return (
    <div className="server-detail__maintenance-notice" role="status">
      <span className="server-detail__maintenance-icon" aria-hidden="true"><IconWrench /></span>
      <div>
        <strong>Equipo en modo mantenimiento</strong>
        <p>Este activo está marcado para mantenimiento. Tenlo en cuenta al revisar su estado y sus métricas.</p>
      </div>
    </div>
  );
}

export default MaintenanceNotice;
