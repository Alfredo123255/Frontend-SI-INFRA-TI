import { Link, useParams } from "react-router-dom";
import { IconChevronLeft } from "../../components/icons";
import "./DetailPlaceholder.css";

function StorageDetail() {
  const { id } = useParams();

  return (
    <div className="detail-placeholder">
      <Link to="/inventario/storage" className="detail-placeholder__back">
        <IconChevronLeft />
        Volver a Storage
      </Link>
      <h1>Storage {id}</h1>
      <p>Página de detalle en construcción.</p>
    </div>
  );
}

export default StorageDetail;
