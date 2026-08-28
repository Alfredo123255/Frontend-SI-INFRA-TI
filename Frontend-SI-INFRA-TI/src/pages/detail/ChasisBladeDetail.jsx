import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { IconChevronLeft, IconChevronDown } from "../../components/icons";
import SectionSideNav from "../../components/SectionSideNav";
import DetailInfoGrid from "./DetailInfoGrid";
import DetailTable from "./DetailTable";
import DetailExpandableTable from "./DetailExpandableTable";
import "./DetailPlaceholder.css";
import "./ServerRackDetail.css";

const sections = [
  { key: "general", title: "Detalle General" },
  { key: "slots", title: "Slots Blades" },
  { key: "red", title: "Red" },
  { key: "energia", title: "Energía" },
  { key: "fans", title: "Fans" },
];

const energiaInfo = [
  { label: "Temperatura Actual", value: "24°C" },
  { label: "Consumo Energético", value: "410 W" },
];

const fuentesPoderColumns = [
  { key: "modelo", label: "Modelo" },
  { key: "consumoW", label: "Consumo (W)" },
  { key: "tipoCorriente", label: "Tipo de Corriente" },
  { key: "estado", label: "Estado" },
];

const fuentesPoderRows = [
  { modelo: "HPE 2650W Platinum Hot Plug PSU", consumoW: 2650, tipoCorriente: "AC", estado: "Operativo" },
  { modelo: "HPE 2650W Platinum Hot Plug PSU", consumoW: 2650, tipoCorriente: "AC", estado: "Standby" },
];

const fansColumns = [
  { key: "modelo", label: "Modelo" },
  { key: "velocidadRpm", label: "Velocidad (RPM)" },
  { key: "estado", label: "Estado" },
];

const fansRows = [
  { modelo: "HPE Active Cool 200 Fan", velocidadRpm: 8400, estado: "Operativo" },
  { modelo: "HPE Active Cool 200 Fan", velocidadRpm: 8300, estado: "Operativo" },
];

const redColumns = [
  { key: "nombreTarjeta", label: "Tarjeta" },
  { key: "marca", label: "Marca" },
  { key: "modelo", label: "Modelo" },
  { key: "tipoConexion", label: "Tipo de Conexión" },
  { key: "cantidadPuertos", label: "Puertos" },
  { key: "estado", label: "Estado" },
];

const redPuertosColumns = [
  { key: "numeroPuerto", label: "Puerto" },
  { key: "macAddress", label: "Dirección MAC" },
  { key: "velocidadGbps", label: "Velocidad (Gbps)" },
  { key: "estado", label: "Estado" },
];

const redRows = [
  {
    id: "ic-1",
    nombreTarjeta: "Interconnect 1",
    marca: "HPE",
    modelo: "Virtual Connect SE 100Gb F32",
    tipoConexion: "100GbE QSFP28",
    cantidadPuertos: 2,
    estado: "Operativo",
    puertos: [
      { numeroPuerto: "Puerto 1", macAddress: "94:F1:28:0A:11:20", velocidadGbps: 100, estado: "Operativo" },
      { numeroPuerto: "Puerto 2", macAddress: "94:F1:28:0A:11:21", velocidadGbps: 100, estado: "Operativo" },
    ],
  },
  {
    id: "ic-2",
    nombreTarjeta: "Interconnect 2",
    marca: "HPE",
    modelo: "Virtual Connect SE 100Gb F32",
    tipoConexion: "100GbE QSFP28",
    cantidadPuertos: 2,
    estado: "Operativo",
    puertos: [
      { numeroPuerto: "Puerto 1", macAddress: "94:F1:28:0A:22:20", velocidadGbps: 100, estado: "Operativo" },
      { numeroPuerto: "Puerto 2", macAddress: "94:F1:28:0A:22:21", velocidadGbps: 100, estado: "Operativo" },
    ],
  },
];

const SLOT_ESTADO_LABEL = { libre: "Libre", ocupado: "Ocupado", alertado: "Alertado" };

const slotsRows = [
  { numeroSlot: 1, estado: "ocupado", hostname: "esxi-node-01", servidorId: "SRV-0160", ipGestion: "10.40.2.21" },
  { numeroSlot: 2, estado: "ocupado", hostname: "esxi-node-02", servidorId: "SRV-0161", ipGestion: "10.40.2.22" },
  { numeroSlot: 3, estado: "ocupado", hostname: "app-web-03", servidorId: "SRV-0153", ipGestion: "10.40.2.23" },
  { numeroSlot: 4, estado: "alertado", hostname: "db-blade-01", servidorId: "SRV-0162", ipGestion: "10.40.2.24" },
  { numeroSlot: 5, estado: "ocupado", hostname: "esxi-node-05", servidorId: "SRV-0163", ipGestion: "10.40.2.25" },
  { numeroSlot: 6, estado: "libre" },
  { numeroSlot: 7, estado: "ocupado", hostname: "hyperv-node-03", servidorId: "SRV-0147", ipGestion: "10.40.2.27" },
  { numeroSlot: 8, estado: "libre" },
  { numeroSlot: 9, estado: "ocupado", hostname: "esxi-node-07", servidorId: "SRV-0148", ipGestion: "10.40.2.29" },
  { numeroSlot: 10, estado: "alertado", hostname: "app-cache-02", servidorId: "SRV-0164", ipGestion: "10.40.2.30" },
  { numeroSlot: 11, estado: "libre" },
  { numeroSlot: 12, estado: "ocupado", hostname: "esxi-node-12", servidorId: "SRV-0165", ipGestion: "10.40.2.32" },
  { numeroSlot: 13, estado: "libre" },
  { numeroSlot: 14, estado: "libre" },
  { numeroSlot: 15, estado: "ocupado", hostname: "bkp-blade-01", servidorId: "SRV-0166", ipGestion: "10.40.2.35" },
  { numeroSlot: 16, estado: "libre" },
];

function renderSectionBody(key) {
  switch (key) {
    case "slots":
      return (
        <ul className="slot-list">
          {slotsRows.map((slot) => (
            <li key={slot.numeroSlot} className="slot-list__row">
              <span className="slot-list__num">
                Slot {String(slot.numeroSlot).padStart(2, "0")}
              </span>
              <span className={`slot-list__state slot-list__state--${slot.estado}`}>
                <span className="slot-list__dot" aria-hidden="true" />
                {SLOT_ESTADO_LABEL[slot.estado]}
              </span>
              {slot.servidorId ? (
                <Link
                  to={`/inventario/servidores/blade/${slot.servidorId}`}
                  className="slot-list__host"
                >
                  {slot.hostname}
                </Link>
              ) : (
                <span className="slot-list__host slot-list__host--empty">Sin servidor</span>
              )}
              <span className="slot-list__ip">{slot.ipGestion ?? "—"}</span>
            </li>
          ))}
        </ul>
      );
    case "energia":
      return (
        <>
          <DetailInfoGrid items={energiaInfo} />
          <span className="detail-subtitle">Fuentes de Poder</span>
          <DetailTable columns={fuentesPoderColumns} rows={fuentesPoderRows} />
        </>
      );
    case "fans":
      return <DetailTable columns={fansColumns} rows={fansRows} />;
    case "red":
      return (
        <DetailExpandableTable
          columns={redColumns}
          rows={redRows}
          nestedColumns={redPuertosColumns}
          nestedKey="puertos"
          nestedLabel="Puertos"
        />
      );
    default:
      return null;
  }
}

function ChasisBladeDetail() {
  const { id } = useParams();
  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(sections.map((section) => [section.key, true]))
  );

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="server-detail">
      <Link to="/inventario/chasis-blades" className="detail-placeholder__back">
        <IconChevronLeft />
        Volver a Chasis Blades
      </Link>
      <h1 className="server-detail__title">Chasis Blade {id}</h1>

      <div className="server-detail__sections">
        {sections.map((section) => {
          const isOpen = openSections[section.key];
          return (
            <div key={section.key} id={section.key} className="panel server-detail__section">
              <button
                type="button"
                className="server-detail__section-header"
                onClick={() => toggleSection(section.key)}
                aria-expanded={isOpen}
              >
                <h2>{section.title}</h2>
                <IconChevronDown
                  className={`server-detail__section-caret ${isOpen ? "is-open" : ""}`}
                />
              </button>
              {isOpen && (
                <div className="server-detail__section-body">{renderSectionBody(section.key)}</div>
              )}
            </div>
          );
        })}
      </div>

      <SectionSideNav
        items={sections.map((section) => ({ id: section.key, label: section.title }))}
        onNavigate={(key) => setOpenSections((prev) => ({ ...prev, [key]: true }))}
      />
    </div>
  );
}

export default ChasisBladeDetail;
