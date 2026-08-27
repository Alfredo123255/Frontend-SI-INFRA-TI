import { Link, useParams } from "react-router-dom";
import { IconChevronLeft } from "../../components/icons";
import "./DetailPlaceholder.css";

function ServerRackDetail() {
  const { id } = useParams();

  return (
    <div className="detail-placeholder">
      <Link to="/inventario/servidores" className="detail-placeholder__back">
        <IconChevronLeft />
        Volver a Servidores
      </Link>
      <h1>Servidor Rackeable {id}</h1>
      <p>Página de detalle en construcción.</p>
    </div>
  );
}

export default ServerRackDetail;
