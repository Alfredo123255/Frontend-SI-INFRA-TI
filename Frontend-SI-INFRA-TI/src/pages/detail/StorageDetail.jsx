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
  { key: "discos", title: "Discos" },
  { key: "red", title: "Tarjetas de Red" },
  { key: "cpu", title: "CPU" },
  { key: "ram", title: "RAM" },
  { key: "fans", title: "Ventiladores" },
  { key: "energia", title: "Energía" },
];

const generalInfo = [
  { label: "Hostname", value: "san-primary-lim" },
  { label: "Número de Serie", value: "FCH2451PQRS" },
  { label: "Fabricante", value: "Dell EMC" },
  { label: "Modelo", value: "PowerStore 5000T" },
  { label: "Generación", value: "5000T" },
  { label: "Ubicación", value: "DC Lima Central · Rack B04 · U10-U13" },
  { label: "IP de Gestión", value: "10.10.1.60" },
  { label: "Estado Operativo", value: "Operativo" },
  { label: "Uso de RAM", value: "58%" },
  { label: "Cluster", value: "Storage Producción" },
  { label: "Responsable", value: "Equipo de Infraestructura TI" },
  { label: "Protocolo de Comunicación", value: "FC 32Gb" },
  { label: "Capacidad Total", value: "420 TB" },
  { label: "Capacidad Usada", value: "318 TB" },
  { label: "IOPS Totales", value: "185,000" },
  { label: "LUNs Configuradas", value: "42" },
  { label: "Tamaño de Caché", value: "128 GB" },
  { label: "Controladoras", value: "2" },
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
  { marca: "Intel", familia: "Xeon Gold", modelo: "6248R", velocidadGhz: "3.0 GHz", cantidadNucleos: 24, cantidadHilos: 48, cacheL1L2L3: "1.9 MB / 30 MB / 35.75 MB", usoCpuPorcentaje: "38%", estado: "Operativo" },
  { marca: "Intel", familia: "Xeon Gold", modelo: "6248R", velocidadGhz: "3.0 GHz", cantidadNucleos: 24, cantidadHilos: 48, cacheL1L2L3: "1.9 MB / 30 MB / 35.75 MB", usoCpuPorcentaje: "38%", estado: "Operativo" },
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
  { marca: "Micron", modelo: "MTA36ASF4G72PZ", generacion: "DDR4", velocidadMhz: 2933, capacidadGb: 32, estado: "Operativo" },
  { marca: "Micron", modelo: "MTA36ASF4G72PZ", generacion: "DDR4", velocidadMhz: 2933, capacidadGb: 32, estado: "Operativo" },
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
  { marca: "Dell EMC", modelo: "PowerStore NVMe 3.84TB", tipoDisco: "NVMe SSD", capacidadGb: 3840, velocidadRpm: "N/A", estado: "Operativo" },
  { marca: "Dell EMC", modelo: "PowerStore NVMe 3.84TB", tipoDisco: "NVMe SSD", capacidadGb: 3840, velocidadRpm: "N/A", estado: "Operativo" },
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
    id: "hba-1",
    nombreTarjeta: "HBA1",
    marca: "Emulex",
    modelo: "LPe31002-M6",
    tipoConexion: "FC 32Gb",
    cantidadPuertos: 2,
    estado: "Operativo",
    puertos: [
      { numeroPuerto: "Puerto 1 (FC0)", macAddress: "50:0A:09:81:AC:12:34", velocidadGbps: 32, estado: "Operativo" },
      { numeroPuerto: "Puerto 2 (FC1)", macAddress: "50:0A:09:81:AC:12:35", velocidadGbps: 32, estado: "Operativo" },
    ],
  },
];

const fansColumns = [
  { key: "modelo", label: "Modelo" },
  { key: "velocidadRpm", label: "Velocidad (RPM)" },
  { key: "estado", label: "Estado" },
];

const fansRows = [
  { modelo: "Dell EMC Cooling Fan Module", velocidadRpm: 5800, estado: "Operativo" },
  { modelo: "Dell EMC Cooling Fan Module", velocidadRpm: 5750, estado: "Operativo" },
];

const fuentesPoderColumns = [
  { key: "modelo", label: "Modelo" },
  { key: "estado", label: "Estado" },
];

const fuentesPoderRows = [
  { modelo: "Dell EMC 1100W Titanium PSU", estado: "Operativo" },
  { modelo: "Dell EMC 1100W Titanium PSU", estado: "Standby" },
];

function renderSectionBody(key) {
  switch (key) {
    case "general":
      return <DetailInfoGrid items={generalInfo} />;
    case "discos":
      return <DetailTable columns={discosColumns} rows={discosRows} />;
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
    case "cpu":
      return <DetailTable columns={cpuColumns} rows={cpuRows} />;
    case "ram":
      return <DetailTable columns={ramColumns} rows={ramRows} />;
    case "fans":
      return <DetailTable columns={fansColumns} rows={fansRows} />;
    case "energia":
      return <DetailTable columns={fuentesPoderColumns} rows={fuentesPoderRows} />;
    default:
      return null;
  }
}

function StorageDetail() {
  const { id } = useParams();
  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(sections.map((section) => [section.key, true]))
  );

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="server-detail">
      <Link to="/inventario/storage" className="detail-placeholder__back">
        <IconChevronLeft />
        Volver a Storage
      </Link>
      <h1 className="server-detail__title">Storage {id}</h1>

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

export default StorageDetail;
