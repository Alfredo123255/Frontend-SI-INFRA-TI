import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { IconChevronLeft, IconChevronDown } from "../../components/icons";
import SectionSideNav from "../../components/SectionSideNav";
import DetailInfoGrid from "./DetailInfoGrid";
import DetailTable from "./DetailTable";
import "./DetailPlaceholder.css";
import "./ServerRackDetail.css";

const sections = [
  { key: "general", title: "Datos generales" },
  { key: "cpu", title: "CPU" },
  { key: "ram", title: "RAM" },
  { key: "discos", title: "Almacenamiento" },
];

const generalInfo = [
  { label: "Hostname", value: "srv-blade01" },
  { label: "Número de Serie", value: "CZJ5501KLM" },
  { label: "Fabricante", value: "HPE" },
  { label: "Modelo", value: "ProLiant BL460c Gen10" },
  { label: "Generación", value: "Gen10" },
  { label: "Ubicación", value: "DC Arequipa Sur · Chasis CHS-0015 · Slot 3" },
  { label: "IP de Gestión", value: "10.40.1.7" },
  { label: "Estado Operativo", value: "Operativo" },
  { label: "Uso de RAM", value: "63%" },
  { label: "Cluster", value: "Virtualización VMware" },
  { label: "Responsable", value: "Equipo de Infraestructura TI" },
  { label: "Orden de Compra", value: "OC-2023-00512" },
  { label: "Fecha de Garantía", value: "22/06/2027" },
  { label: "Fecha EOL", value: "22/06/2028" },
  { label: "Fecha EOS", value: "22/06/2029" },
  { label: "Versión de Firmware", value: "iLO 5 v2.75" },
  { label: "Fecha de Actualización de Firmware", value: "18/12/2025" },
  { label: "IP del Sistema Operativo", value: "10.40.1.8" },
  { label: "SO (Nombre y Versión)", value: "VMware ESXi 8.0" },
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
  { marca: "Intel", familia: "Xeon Silver", modelo: "4316", velocidadGhz: "2.3 GHz", cantidadNucleos: 20, cantidadHilos: 40, cacheL1L2L3: "1.6 MB / 25 MB / 30 MB", usoCpuPorcentaje: "47%", estado: "Operativo" },
  { marca: "Intel", familia: "Xeon Silver", modelo: "4316", velocidadGhz: "2.3 GHz", cantidadNucleos: 20, cantidadHilos: 40, cacheL1L2L3: "1.6 MB / 25 MB / 30 MB", usoCpuPorcentaje: "47%", estado: "Operativo" },
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
  { marca: "SK Hynix", modelo: "HMA82GR7DJR8N-XN", generacion: "DDR4", velocidadMhz: 2933, capacidadGb: 32, estado: "Operativo" },
  { marca: "SK Hynix", modelo: "HMA82GR7DJR8N-XN", generacion: "DDR4", velocidadMhz: 2933, capacidadGb: 32, estado: "Operativo" },
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
  { marca: "HPE", modelo: "MO001920JWTMR", tipoDisco: "SAS SSD", capacidadGb: 1920, velocidadRpm: "N/A", estado: "Operativo" },
  { marca: "HPE", modelo: "MO001920JWTMR", tipoDisco: "SAS SSD", capacidadGb: 1920, velocidadRpm: "N/A", estado: "Operativo" },
];

const raidColumns = [
  { key: "modelo", label: "Modelo" },
  { key: "raid", label: "RAID" },
  { key: "estado", label: "Estado" },
];

const raidRows = [
  { modelo: "HPE Smart Array P204i-c SR Gen10", raid: "RAID 1", estado: "Operativo" },
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
      return (
        <>
          <span className="detail-subtitle">Controladoras RAID</span>
          <DetailTable columns={raidColumns} rows={raidRows} />
          <span className="detail-subtitle">Discos</span>
          <DetailTable columns={discosColumns} rows={discosRows} />
        </>
      );
    default:
      return null;
  }
}

function ServerBladeDetail() {
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
      <h1 className="server-detail__title">Servidor Blade {id}</h1>

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

export default ServerBladeDetail;
