import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { IconChevronLeft, IconChevronDown } from "../../components/icons";
import SectionSideNav from "../../components/SectionSideNav";
import DetailInfoGrid from "./DetailInfoGrid";
import DetailTable from "./DetailTable";
import { obtenerServidor } from "../../api/client";
import "./DetailPlaceholder.css";
import "./ServerRackDetail.css";

const sections = [
  { key: "general", title: "Datos generales" },
  { key: "cpu", title: "CPU" },
  { key: "ram", title: "RAM" },
  { key: "discos", title: "Almacenamiento" },
];

const cpuColumns = [
  { key: "marca", label: "Marca" },
  { key: "familia", label: "Familia" },
  { key: "modelo", label: "Modelo" },
  { key: "velocidadGhz", label: "Velocidad" },
  { key: "cantidadNucleos", label: "Núcleos" },
  { key: "cantidadHilos", label: "Hilos" },
  { key: "cacheL1L2L3", label: "Caché L1/L2/L3 (MB)" },
  { key: "estado", label: "Estado" },
];

const ramColumns = [
  { key: "marca", label: "Marca" },
  { key: "modelo", label: "Modelo" },
  { key: "generacion", label: "Generación" },
  { key: "velocidadMhz", label: "Velocidad (MHz)" },
  { key: "capacidadGb", label: "Capacidad (GB)" },
  { key: "estado", label: "Estado" },
];

const discosColumns = [
  { key: "marca", label: "Marca" },
  { key: "modelo", label: "Modelo" },
  { key: "tipoDisco", label: "Tipo de Disco" },
  { key: "capacidadGb", label: "Capacidad (GB)" },
  { key: "velocidadRpm", label: "Velocidad (RPM)" },
  { key: "estado", label: "Estado" },
];

const raidColumns = [
  { key: "modelo", label: "Modelo" },
  { key: "raid", label: "RAID" },
  { key: "numeroSerial", label: "Número de Serie" },
  { key: "estado", label: "Estado" },
];

function buildGeneralInfo(d) {
  return [
    { label: "Número de Serie", value: d.numero_serie },
    { label: "Hostname", value: d.hostname },
    { label: "Fabricante", value: d.fabricante },
    { label: "Modelo", value: d.modelo },
    { label: "Generación", value: d.generacion },
    { label: "Ubicación", value: d.ubicacion },
    { label: "IP de Gestión", value: d.ip_gestion },
    { label: "Estado Operativo", value: d.estado_operativo },
    { label: "Cluster", value: d.cluster },
    { label: "Responsable", value: d.responsable },
    { label: "Orden de Compra", value: d.orden_compra },
    { label: "Fecha EOS", value: d.fecha_eos },
    { label: "Versión de Firmware", value: d.version_firmware },
    { label: "Última Actualización", value: d.ultima_actualizacion },
    { label: "IP del Sistema Operativo", value: d.ip_sistema_operativo },
    { label: "Versión de SO", value: d.version_so },
    { label: "Fecha de Soporte SO", value: d.fecha_soporte_so },
  ];
}

function mapCpuRows(cpus = []) {
  return cpus.map((c) => ({
    numeroSerial: c.numero_serial,
    marca: c.marca,
    familia: c.familia,
    modelo: c.modelo,
    velocidadGhz: c.velocidad_ghz != null ? `${c.velocidad_ghz} GHz` : "N/D",
    cantidadNucleos: c.cantidad_nucleos,
    cantidadHilos: c.cantidad_hilos,
    cacheL1L2L3: [c.cacheL1Mb, c.cacheL2Mb, c.cacheL3Mb].map((v) => (v != null ? v : "N/D")).join(" / "),
    estado: c.estado,
  }));
}

function mapRamRows(ram = []) {
  return ram.map((r) => ({
    numeroSerial: r.numero_serial,
    marca: r.marca,
    modelo: r.modelo,
    generacion: r.generacion,
    velocidadMhz: r.valocidad_mhz,
    capacidadGb: r.capacidad_gb,
    estado: r.estado,
  }));
}

function mapDiscosRows(discos = []) {
  return discos.map((d) => ({
    numeroSerial: d.numero_serial,
    marca: d.marca,
    modelo: d.modelo ?? "N/D",
    tipoDisco: d.tipo,
    capacidadGb: d.capacidad_GB,
    velocidadRpm: d.velocidad_rpm || "N/A",
    estado: d.estado,
  }));
}

function mapRaidRows(raid = []) {
  return raid.map((r) => ({
    modelo: r.modelo,
    raid: r.raid,
    numeroSerial: r.numero_serial,
    estado: r.estado,
  }));
}

function renderSectionBody(key, data) {
  switch (key) {
    case "general":
      return <DetailInfoGrid items={buildGeneralInfo(data)} />;
    case "cpu":
      return <DetailTable columns={cpuColumns} rows={mapCpuRows(data.cpus)} />;
    case "ram":
      return <DetailTable columns={ramColumns} rows={mapRamRows(data.memoriaRAM)} />;
    case "discos":
      return (
        <>
          <span className="detail-subtitle">Controladoras RAID</span>
          <DetailTable columns={raidColumns} rows={mapRaidRows(data.controladorasRAID)} />
          <span className="detail-subtitle">Discos</span>
          <DetailTable columns={discosColumns} rows={mapDiscosRows(data.discos)} />
        </>
      );
    default:
      return null;
  }
}

function ServerBladeDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(sections.map((section) => [section.key, true]))
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    obtenerServidor(id)
      .then((dto) => {
        if (!cancelled) setData(dto);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="server-detail">
      <Link to="/inventario/servidores" className="detail-placeholder__back">
        <IconChevronLeft />
        Volver a Servidores
      </Link>
      <h1 className="server-detail__title">Servidor Blade {data?.hostname ?? id}</h1>

      {error && <p className="detail-placeholder__error">No se pudo cargar el servidor ({error.message}).</p>}
      {loading && !error && <p>Cargando...</p>}

      {data && (
        <>
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
                    <div className="server-detail__section-body">
                      {renderSectionBody(section.key, data)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <SectionSideNav
            items={sections.map((section) => ({ id: section.key, label: section.title }))}
            onNavigate={(key) => setOpenSections((prev) => ({ ...prev, [key]: true }))}
          />
        </>
      )}
    </div>
  );
}

export default ServerBladeDetail;
