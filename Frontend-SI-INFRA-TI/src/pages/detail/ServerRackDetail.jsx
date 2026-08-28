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
  { key: "general", title: "Datos generales" },
  { key: "cpu", title: "CPU" },
  { key: "ram", title: "RAM" },
  { key: "discos", title: "Discos" },
  { key: "energia", title: "Energía" },
  { key: "fans", title: "Fans" },
  { key: "red", title: "Tarjetas de Red" },
];

const generalInfo = [
  { label: "Hostname", value: "srv-app01" },
  { label: "Número de Serie", value: "MXQ34501GH" },
  { label: "Fabricante", value: "HPE" },
  { label: "Modelo", value: "ProLiant DL380 Gen10" },
  { label: "Generación", value: "Gen10" },
  { label: "Ubicación", value: "DC Lima Central · Rack A12 · U18-U19" },
  { label: "IP de Gestión", value: "10.10.1.20" },
  { label: "Estado Operativo", value: "Operativo" },
  { label: "Uso de RAM", value: "74%" },
  { label: "Cluster", value: "DB Cluster Producción" },
  { label: "Responsable", value: "Equipo de Infraestructura TI" },
  { label: "Orden de Compra", value: "OC-2023-00456" },
  { label: "Fecha de Garantía", value: "15/03/2027" },
  { label: "Fecha EOL", value: "15/03/2028" },
  { label: "Fecha EOS", value: "15/03/2029" },
  { label: "Versión de Firmware", value: "iLO 5 v2.78" },
  { label: "Fecha de Actualización de Firmware", value: "02/01/2026" },
  { label: "IP del Sistema Operativo", value: "10.10.1.21" },
  { label: "SO (Nombre y Versión)", value: "RHEL 9.3" },
  { label: "Estado de Soporte del SO", value: "Soporte activo" },
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
  { marca: "Intel", familia: "Xeon Platinum", modelo: "8358", velocidadGhz: "2.6 GHz", cantidadNucleos: 32, cantidadHilos: 64, cacheL1L2L3: "2.5 MB / 40 MB / 48 MB", usoCpuPorcentaje: "55%", estado: "Operativo" },
  { marca: "Intel", familia: "Xeon Platinum", modelo: "8358", velocidadGhz: "2.6 GHz", cantidadNucleos: 32, cantidadHilos: 64, cacheL1L2L3: "2.5 MB / 40 MB / 48 MB", usoCpuPorcentaje: "55%", estado: "Operativo" },
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
  { marca: "Samsung", modelo: "M393A2K40DB3-CWE", generacion: "DDR4", velocidadMhz: 3200, capacidadGb: 16, estado: "Operativo" },
  { marca: "Samsung", modelo: "M393A2K40DB3-CWE", generacion: "DDR4", velocidadMhz: 3200, capacidadGb: 16, estado: "Operativo" },
];

const discosColumns = [
  { key: "marca", label: "Marca" },
  { key: "modelo", label: "Modelo" },
  { key: "tipoDisco", label: "Tipo de Disco" },
  { key: "capacidadGb", label: "Capacidad (GB)" },
  { key: "velocidadRpm", label: "Velocidad (RPM)" },
  { key: "estado", label: "Estado" },
];

const discosRows = [
  { marca: "Seagate", modelo: "Exos X18", tipoDisco: "SAS HDD", capacidadGb: 18000, velocidadRpm: 7200, estado: "Operativo" },
  { marca: "Samsung", modelo: "PM1643a", tipoDisco: "SAS SSD", capacidadGb: 3840, velocidadRpm: "N/A", estado: "Operativo" },
];

const energiaInfo = [
  { label: "Temperatura Actual", value: "24°C" },
  { label: "Consumo Energético", value: "410 W" },
];

const fuentesPoderColumns = [
  { key: "modelo", label: "Modelo" },
  { key: "estado", label: "Estado" },
];

const fuentesPoderRows = [
  { modelo: "HPE 800W Flex Slot Platinum PSU", estado: "Operativo" },
  { modelo: "HPE 800W Flex Slot Platinum PSU", estado: "Standby" },
];

const fansColumns = [
  { key: "modelo", label: "Modelo" },
  { key: "velocidadRpm", label: "Velocidad (RPM)" },
  { key: "estado", label: "Estado" },
];

const fansRows = [
  { modelo: "HPE Active Cooling Fan Module", velocidadRpm: 6200, estado: "Operativo" },
  { modelo: "HPE Active Cooling Fan Module", velocidadRpm: 6100, estado: "Operativo" },
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
    id: "nic-1",
    nombreTarjeta: "NIC1",
    marca: "Broadcom",
    modelo: "BCM57414",
    tipoConexion: "10GbE SFP+",
    cantidadPuertos: 2,
    estado: "Operativo",
    puertos: [
      { numeroPuerto: "Puerto 1", macAddress: "3C:EC:EF:12:34:56", velocidadGbps: 10, estado: "Operativo" },
      { numeroPuerto: "Puerto 2", macAddress: "3C:EC:EF:12:34:57", velocidadGbps: 10, estado: "Operativo" },
    ],
  },
  {
    id: "nic-2",
    nombreTarjeta: "NIC2",
    marca: "Broadcom",
    modelo: "BCM57414",
    tipoConexion: "10GbE SFP+",
    cantidadPuertos: 2,
    estado: "Operativo",
    puertos: [
      { numeroPuerto: "Puerto 1", macAddress: "3C:EC:EF:22:34:56", velocidadGbps: 10, estado: "Operativo" },
      { numeroPuerto: "Puerto 2", macAddress: "3C:EC:EF:22:34:57", velocidadGbps: 10, estado: "Operativo" },
    ],
  },
];

function renderSectionBody(key) {
  switch (key) {
    case "general":
      return <DetailInfoGrid items={generalInfo} />;
    case "cpu":
      return <DetailTable columns={cpuColumns} rows={cpuRows} />;
    case "ram":
      return <DetailTable columns={ramColumns} rows={ramRows} />;
    case "discos":
      return <DetailTable columns={discosColumns} rows={discosRows} />;
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

function ServerRackDetail() {
  const { id } = useParams();
  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(sections.map((section) => [section.key, true]))
  );

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="server-detail">
      <Link to="/inventario/servidores" className="detail-placeholder__back">
        <IconChevronLeft />
        Volver a Servidores
      </Link>
      <h1 className="server-detail__title">Servidor Rackeable {id}</h1>

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

export default ServerRackDetail;
