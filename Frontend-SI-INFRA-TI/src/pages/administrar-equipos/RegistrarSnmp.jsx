import SnmpConexionForm from "./SnmpConexionForm";
import "./AdministrarEquipos.css";

function RegistrarSnmp() {
  return (
    <div className="admin-equipos">
      <section className="panel admin-snmp">
        <SnmpConexionForm />
      </section>
    </div>
  );
}

export default RegistrarSnmp;
