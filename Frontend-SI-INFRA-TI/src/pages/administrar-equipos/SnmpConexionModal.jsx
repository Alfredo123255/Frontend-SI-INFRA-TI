import { IconClose } from "../../components/icons";
import SnmpConexionForm from "./SnmpConexionForm";
import EditarConexionSnmp from "./EditarConexionSnmp";
import "./SnmpConexionModal.css";

function SnmpConexionModal({ open, onClose, activoId, onSaved }) {
  if (!open) return null;

  return (
    <div className="snmp-modal__overlay" onClick={onClose}>
      <div className="snmp-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="snmp-modal__close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <IconClose />
        </button>
        <div className="snmp-modal__body">
          {activoId ? (
            <EditarConexionSnmp activoId={activoId} onCancel={onClose} onSaved={onSaved} />
          ) : (
            <SnmpConexionForm onCancel={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}

export default SnmpConexionModal;
