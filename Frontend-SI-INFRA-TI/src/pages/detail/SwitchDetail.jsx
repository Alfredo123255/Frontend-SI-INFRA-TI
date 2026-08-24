import { Link, useParams } from "react-router-dom";
import { IconChevronLeft } from "../../components/icons";
import "./DetailPlaceholder.css";

function SwitchDetail() {
  const { id } = useParams();

  return (
    <div className="detail-placeholder">
      <Link to="/inventario/switches" className="detail-placeholder__back">
        <IconChevronLeft />
        Volver a Switches
      </Link>
      <h1>Switch {id}</h1>
      <p>Página de detalle en construcción.</p>
    </div>
  );
}

export default SwitchDetail;
