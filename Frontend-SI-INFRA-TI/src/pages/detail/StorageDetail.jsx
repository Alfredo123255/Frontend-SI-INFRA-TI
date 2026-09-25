import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { IconChevronLeft, IconChevronDown, IconWifi } from "../../components/icons";
import SectionSideNav from "../../components/SectionSideNav";
import SnmpConexionModal from "../administrar-equipos/SnmpConexionModal";
import DetailInfoGrid from "./DetailInfoGrid";
import DetailTable from "./DetailTable";
import DetailExpandableTable from "./DetailExpandableTable";
import { obtenerStorage } from "../../api/client";
import "./DetailPlaceholder.css";
import "./ServerRackDetail.css";

const sections = [
  { key: "general", title: "Datos generales" },
  { key: "discos", title: "Almacenamiento" },
  { key: "red", title: "Tarjetas de Red" },
  { key: "cpu", title: "CPU" },
  { key: "ram", title: "RAM" },
  { key: "fans", title: "Ventiladores" },
  { key: "energia", title: "Energía" },
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

const redColumns = [
  { key: "numeroSerial", label: "Número de Serie" },
  { key: "marca", label: "Marca" },
  { key: "modelo", label: "Modelo" },
  { key: "cantidadPuertos", label: "Puertos" },
  { key: "estado", label: "Estado" },
];

const redPuertosColumns = [
  { key: "numeroPuerto", label: "Puerto" },
  { key: "macAddress", label: "Dirección MAC" },
  { key: "velocidad", label: "Velocidad" },
  { key: "estado", label: "Estado" },
];

const fansColumns = [
  { key: "modelo", label: "Modelo" },
  { key: "velocidadRpm", label: "Velocidad (RPM)" },
  { key: "estado", label: "Estado" },
];

const fuentesPoderColumns = [
  { key: "modelo", label: "Modelo" },
  { key: "consumoW", label: "Consumo (W)" },
  { key: "tipoCorriente", label: "Tipo de Corriente" },
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
    { label: "Fecha EOL", value: d.fechaEol },
    { label: "Versión de Firmware", value: d.version_firmware },
    { label: "Última Actualización", value: d.ultima_actualizacion },
    { label: "Protocolo de Comunicación", value: d.protocolo_comunicacion },
    { label: "Capacidad Total (TB)", value: d.capacidad_total_TB },
    { label: "Capacidad Usada (TB)", value: d.capacidad_usada_TB },
    { label: "IOPS", value: d.iops },
  ];
}

function buildEnergiaInfo(d) {
  return [
    { label: "Temperatura Actual", value: d.temperatura != null ? `${d.temperatura}°C` : "N/D" },
    { label: "Consumo Eléctrico", value: d.consumo_electico_w != null ? `${d.consumo_electico_w} W` : "N/D" },
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

function mapTarjetasRed(list = []) {
  return list.map((t, index) => ({
    id: t.id ?? index,
    numeroSerial: t.numero_serial,
    marca: t.marca,
    modelo: t.modelo,
    cantidadPuertos: t.cantidad_puertos,
    estado: t.estado,
    puertos: (t.puertos ?? []).map((p) => ({
      numeroPuerto: p.numero_puerto,
      macAddress: p.mac_addess,
      velocidad: p.velocidad,
      estado: p.estado,
    })),
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

function mapFuentesEnergia(list = []) {
  return list.map((f) => ({
    numeroSerial: f.numero_serial,
    modelo: f.modelo,
    consumoW: f.consumo_w,
    tipoCorriente: f.tipo_corriente,
    estado: f.estado,
  }));
}

function renderSectionBody(key, data) {
  switch (key) {
    case "general":
      return <DetailInfoGrid items={buildGeneralInfo(data)} />;
    case "discos":
      return (
        <>
          <span className="detail-subtitle">Controladoras RAID</span>
          <DetailTable columns={raidColumns} rows={mapRaidRows(data.controladorasRAID)} />
          <span className="detail-subtitle">Discos</span>
          <DetailTable columns={discosColumns} rows={mapDiscosRows(data.discos)} />
        </>
      );
    case "red":
      return (
        <DetailExpandableTable
          columns={redColumns}
          rows={mapTarjetasRed(data.tarjetasRED)}
          nestedColumns={redPuertosColumns}
          nestedKey="puertos"
          nestedLabel="Puertos"
        />
      );
    case "cpu":
      return <DetailTable columns={cpuColumns} rows={mapCpuRows(data.cpus)} />;
    case "ram":
      return <DetailTable columns={ramColumns} rows={mapRamRows(data.memoriaRAM)} />;
    case "fans":
      return <DetailTable columns={fansColumns} rows={mapFansRows(data.ventiladores)} />;
    case "energia":
      return (
        <>
          <DetailInfoGrid items={buildEnergiaInfo(data)} />
          <span className="detail-subtitle">Fuentes de Poder</span>
          <DetailTable columns={fuentesPoderColumns} rows={mapFuentesEnergia(data.fuentesEnergia)} />
        </>
      );
    default:
      return null;
  }
}

function StorageDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(sections.map((section) => [section.key, true]))
  );
  const [snmpModalOpen, setSnmpModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    obtenerStorage(id)
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
      <Link to="/inventario/storage" className="detail-placeholder__back">
        <IconChevronLeft />
        Volver a Storage
      </Link>
      <h1 className="server-detail__title">Storage {data?.hostname ?? id}</h1>

      {error && <p className="detail-placeholder__error">No se pudo cargar el storage ({error.message}).</p>}
      {loading && !error && <p>Cargando...</p>}

      {data && (
        <>
          <div className="server-detail__sections">
            {sections.map((section) => {
              const isOpen = openSections[section.key];
              return (
                <div key={section.key} id={section.key} className="panel server-detail__section">
                  <div className={`server-detail__section-header ${isOpen ? "is-open" : ""}`}>
                    <button
                      type="button"
                      className="server-detail__section-title-btn"
                      onClick={() => toggleSection(section.key)}
                      aria-expanded={isOpen}
                    >
                      <h2>{section.title}</h2>
                    </button>
                    <div className="server-detail__section-header-actions">
                      {section.key === "general" && (
                        <button
                          type="button"
                          className="detail-general-actions__btn"
                          onClick={() => setSnmpModalOpen(true)}
                        >
                          <IconWifi className="detail-general-actions__icon" />
                          Editar Conexión SNMP
                        </button>
                      )}
                      <button
                        type="button"
                        className="server-detail__section-toggle-btn"
                        onClick={() => toggleSection(section.key)}
                        aria-label={isOpen ? "Colapsar sección" : "Expandir sección"}
                      >
                        <IconChevronDown
                          className={`server-detail__section-caret ${isOpen ? "is-open" : ""}`}
                        />
                      </button>
                    </div>
                  </div>
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

      <SnmpConexionModal open={snmpModalOpen} onClose={() => setSnmpModalOpen(false)} />
    </div>
  );
}

export default StorageDetail;
