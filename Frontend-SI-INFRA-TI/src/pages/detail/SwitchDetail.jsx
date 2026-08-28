import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { IconChevronLeft, IconChevronDown } from "../../components/icons";
import SectionSideNav from "../../components/SectionSideNav";
import DetailInfoGrid from "./DetailInfoGrid";
import DetailTable from "./DetailTable";
import "./DetailPlaceholder.css";
import "./ServerRackDetail.css";

const sections = [
  { key: "general", title: "Detalle General" },
  { key: "puertos", title: "Puertos" },
  { key: "energia", title: "Energía" },
  { key: "fans", title: "Fans" },
  { key: "cpu", title: "CPU" },
  { key: "ram", title: "RAM" },
];

const generalInfo = [
  { label: "Hostname", value: "core-sw-lim-01" },
  { label: "Número de Serie", value: "FDO2451TUVW" },
  { label: "Fabricante", value: "Cisco" },
  { label: "Modelo", value: "Nexus 9336C-FX2" },
  { label: "Generación", value: "9336C-FX2" },
  { label: "Ubicación", value: "DC Lima Central · Rack C01 · U20" },
  { label: "IP de Gestión", value: "10.10.1.1" },
  { label: "Estado Operativo", value: "Operativo" },
  { label: "Uso de RAM", value: "44%" },
  { label: "Cluster", value: "Red Core" },
  { label: "Responsable", value: "Equipo de Infraestructura TI" },
  { label: "Tipo de Red", value: "Core" },
  { label: "Modo de Operación", value: "Spine-Leaf" },
  { label: "Puertos Totales", value: "36" },
  { label: "Puertos Ocupados", value: "31" },
  { label: "Puertos Libres", value: "5" },
  { label: "Transceivers Instalados", value: "31" },
  { label: "Velocidad de Puertos", value: "100 Gbps" },
];

const puertosColumns = [
  { key: "numeroPuerto", label: "Puerto" },
  { key: "velocidad", label: "Velocidad" },
  { key: "tipoTransceiver", label: "Tipo de Transceiver" },
  { key: "estadoPuerto", label: "Estado" },
];

const puertosRows = [
  { numeroPuerto: "Eth1/1", velocidad: "100 Gbps", tipoTransceiver: "QSFP28", estadoPuerto: "Conectado" },
  { numeroPuerto: "Eth1/2", velocidad: "100 Gbps", tipoTransceiver: "QSFP28", estadoPuerto: "Conectado" },
  { numeroPuerto: "Eth1/3", velocidad: "100 Gbps", tipoTransceiver: "QSFP28", estadoPuerto: "Conectado" },
  { numeroPuerto: "Eth1/4", velocidad: "100 Gbps", tipoTransceiver: "—", estadoPuerto: "Libre" },
];

const fuentesPoderColumns = [
  { key: "modelo", label: "Modelo" },
  { key: "estado", label: "Estado" },
];

const fuentesPoderRows = [
  { modelo: "Cisco Nexus 930W AC PSU", estado: "Operativo" },
  { modelo: "Cisco Nexus 930W AC PSU", estado: "Standby" },
];

const fansColumns = [
  { key: "modelo", label: "Modelo" },
  { key: "velocidadRpm", label: "Velocidad (RPM)" },
  { key: "estado", label: "Estado" },
];

const fansRows = [
  { modelo: "Cisco Nexus Fan Module", velocidadRpm: 8200, estado: "Operativo" },
  { modelo: "Cisco Nexus Fan Module", velocidadRpm: 8150, estado: "Operativo" },
];

const cpuColumns = [
  { key: "marca", label: "Marca" },
  { key: "familia", label: "Familia" },
  { key: "modelo", label: "Modelo" },
  { key: "velocidadGhz", label: "Velocidad" },
  { key: "cantidadNucleos", label: "Núcleos" },
  { key: "cantidadHilos", label: "Hilos" },
  { key: "cacheL1L2L3", label: "Caché L1/L2/L3" },
  { key: "usoCpuPorcentaje", label: "Uso de CPU" },
  { key: "estado", label: "Estado" },
];

const cpuRows = [
  { marca: "Cisco", familia: "UADP", modelo: "UADP 2.0 XL", velocidadGhz: "1.2 GHz", cantidadNucleos: 4, cantidadHilos: 4, cacheL1L2L3: "256 KB / 2 MB / N/A", usoCpuPorcentaje: "22%", estado: "Operativo" },
];

const ramColumns = [
  { key: "marca", label: "Marca" },
  { key: "modelo", label: "Modelo" },
  { key: "generacion", label: "Generación" },
  { key: "velocidadMhz", label: "Velocidad (MHz)" },
  { key: "capacidadGb", label: "Capacidad (GB)" },
  { key: "estado", label: "Estado" },
];

const ramRows = [
  { marca: "Cisco", modelo: "MEM-C9K-8G", generacion: "DDR4", velocidadMhz: 2400, capacidadGb: 4, estado: "Operativo" },
  { marca: "Cisco", modelo: "MEM-C9K-8G", generacion: "DDR4", velocidadMhz: 2400, capacidadGb: 4, estado: "Operativo" },
];

function renderSectionBody(key) {
  switch (key) {
    case "general":
      return <DetailInfoGrid items={generalInfo} />;
    case "puertos":
      return <DetailTable columns={puertosColumns} rows={puertosRows} />;
    case "energia":
      return <DetailTable columns={fuentesPoderColumns} rows={fuentesPoderRows} />;
    case "fans":
      return <DetailTable columns={fansColumns} rows={fansRows} />;
    case "cpu":
      return <DetailTable columns={cpuColumns} rows={cpuRows} />;
    case "ram":
      return <DetailTable columns={ramColumns} rows={ramRows} />;
    default:
      return null;
  }
}

function SwitchDetail() {
  const { id } = useParams();
  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(sections.map((section) => [section.key, true]))
  );

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="server-detail">
      <Link to="/inventario/switches" className="detail-placeholder__back">
        <IconChevronLeft />
        Volver a Switches
      </Link>
      <h1 className="server-detail__title">Switch {id}</h1>

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

export default SwitchDetail;
