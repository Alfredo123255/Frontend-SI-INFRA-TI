import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { IconChevronLeft, IconChevronDown } from "../../components/icons";
import SectionSideNav from "../../components/SectionSideNav";
import DetailInfoGrid from "./DetailInfoGrid";
import DetailTable from "./DetailTable";
import { obtenerSwitch } from "../../api/client";
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

const puertosColumns = [
  { key: "numeroPuerto", label: "Puerto" },
  { key: "velocidad", label: "Velocidad" },
  { key: "estado", label: "Estado" },
];

const fuentesPoderColumns = [
  { key: "modelo", label: "Modelo" },
  { key: "consumoW", label: "Consumo (W)" },
  { key: "tipoCorriente", label: "Tipo de Corriente" },
  { key: "estado", label: "Estado" },
];

const fansColumns = [
  { key: "modelo", label: "Modelo" },
  { key: "velocidadRpm", label: "Velocidad (RPM)" },
  { key: "estado", label: "Estado" },
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

function buildGeneralInfo(d) {
  return [
    { label: "Número de Serie", value: d.numero_serie },
    { label: "Hostname", value: d.hostname },
    { label: "Fabricante", value: d.fabricante },
    { label: "Modelo", value: d.modelo },
    { label: "Generación", value: d.generacion },
    { label: "Ubicación", value: d.ubicacion },
    { label: "IP de Gestión", value: d.ip_gestion },
    { label: "Estado Operativo", value: d.estado_operativo, type: "estado" },
    { label: "Cluster", value: d.cluster },
    { label: "Responsable", value: d.responsable },
    { label: "Orden de Compra", value: d.orden_compra },
    { label: "Fecha EOS", value: d.fecha_eos },
    { label: "Versión de Firmware", value: d.version_firmware },
    { label: "Última Actualización", value: d.ultima_actualizacion },
    { label: "Tipo de Red", value: d.tipoRED },
    { label: "Modo de Operación", value: d.modo_operacion },
    { label: "Cantidad de Puertos", value: d.cantidad_puertos },
    { label: "Puertos Ocupados", value: d.cantidad_puertos_ocupados },
  ];
}

function buildEnergiaInfo(d) {
  return [
    { label: "Temperatura Actual", value: d.temperatura != null ? `${d.temperatura}°C` : "N/D" },
    { label: "Consumo Eléctrico", value: d.consumo_electico_w != null ? `${d.consumo_electico_w} W` : "N/D" },
  ];
}

function mapPuertosRows(puertos = []) {
  return puertos.map((p) => ({
    numeroPuerto: p.numero_puerto,
    velocidad: p.velocidad,
    estado: p.estado,
  }));
}

function mapFuentesEnergia(list = []) {
  return list.map((f) => ({
    numeroSerial: f.numero_serial,
    modelo: f.modelo,
    consumoW: f.consumo_w,
    tipoCorriente: f.tipo_corriente,
    estado: f.estado,
  }));
}

function mapFansRows(ventiladores = []) {
  return ventiladores.map((v) => ({
    numeroSerial: v.numero_serial,
    modelo: v.modelo,
    velocidadRpm: v.velocidad_rpm,
    estado: v.estado,
  }));
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

function renderSectionBody(key, data) {
  switch (key) {
    case "general":
      return <DetailInfoGrid items={buildGeneralInfo(data)} />;
    case "puertos":
      return <DetailTable columns={puertosColumns} rows={mapPuertosRows(data.puertos)} />;
    case "energia":
      return (
        <>
          <DetailInfoGrid items={buildEnergiaInfo(data)} />
          <span className="detail-subtitle">Fuentes de Poder</span>
          <DetailTable columns={fuentesPoderColumns} rows={mapFuentesEnergia(data.fuentesEnergia)} />
        </>
      );
    case "fans":
      return <DetailTable columns={fansColumns} rows={mapFansRows(data.ventiladores)} />;
    case "cpu":
      return <DetailTable columns={cpuColumns} rows={mapCpuRows(data.cpus)} />;
    case "ram":
      return <DetailTable columns={ramColumns} rows={mapRamRows(data.memoriaRAM)} />;
    default:
      return null;
  }
}

function SwitchDetail() {
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
    obtenerSwitch(id)
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
      <Link to="/inventario/switches" className="detail-placeholder__back">
        <IconChevronLeft />
        Volver a Switches
      </Link>
      <h1 className="server-detail__title">Switch {data?.hostname ?? id}</h1>

      {error && <p className="detail-placeholder__error">No se pudo cargar el switch ({error.message}).</p>}
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

export default SwitchDetail;
