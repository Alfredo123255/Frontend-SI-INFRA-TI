import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { IconChevronLeft, IconChevronDown, IconWifi } from "../../components/icons";
import SectionSideNav from "../../components/SectionSideNav";
import SnmpConexionModal from "../administrar-equipos/SnmpConexionModal";
import DetailInfoGrid from "./DetailInfoGrid";
import DetailTable from "./DetailTable";
import DetailExpandableTable from "./DetailExpandableTable";
import MaintenanceNotice from "./MaintenanceNotice";
import SnmpConnectionNotice from "./SnmpConnectionNotice";
import HistorialActivoLink from "./HistorialActivoLink";
import DatosGeneralesEditables from "./DatosGeneralesEditables";
import { obtenerChasisBlade } from "../../api/client";
import { potenciaFuenteW } from "./potenciaFuente";
import "./DetailPlaceholder.css";
import "./ServerRackDetail.css";

const sections = [
  { key: "general", title: "Detalle General" },
  { key: "slots", title: "Slots Blades" },
  { key: "red", title: "Red" },
  { key: "energia", title: "Energía" },
  { key: "fans", title: "Fans" },
];

const fuentesPoderColumns = [
  { key: "modelo", label: "Modelo" },
  { key: "consumoW", label: "Consumo (W)" },
  { key: "tipoCorriente", label: "Tipo de Corriente" },
  { key: "estado", label: "Estado" },
];

const fansColumns = [
  { key: "modelo", label: "Modelo" },
  { key: "velocidadRpm", label: "Velocidad" },
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

const SLOT_ESTADO_LABEL = { libre: "Libre", ocupado: "Ocupado", alertado: "Alertado", degradado: "Alertado" };

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
    { label: "Última Actualización", value: d.ultima_actualizacion, type: "fechaHoraUtc" },
    { label: "Cantidad de Slots", value: d.cantidad_slots },
  ];
}

function buildEnergiaInfo(d) {
  return [
    { label: "Temperatura Actual", value: d.temperatura != null ? `${d.temperatura}°C` : "N/D" },
    { label: "Consumo Eléctrico", value: d.consumo_electico_w != null ? `${d.consumo_electico_w} W` : "N/D" },
  ];
}

function mapFuentesEnergia(list = []) {
  return list.map((f) => ({
    numeroSerial: f.numero_serial,
    modelo: f.modelo,
    consumoW: potenciaFuenteW(f),
    tipoCorriente: f.tipo_corriente,
    estado: f.estado,
  }));
}

function mapFansRows(ventiladores = []) {
  return ventiladores.map((v) => ({
    numeroSerial: v.numero_serial,
    modelo: v.modelo,
    velocidadRpm: v.velocidad_rpm != null
      ? `${v.velocidad_rpm} RPM`
      : v.estado?.toLowerCase() === "encendido" ? 100 : null,
    estado: v.estado,
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

function renderSectionBody(key, data) {
  switch (key) {
    case "slots":
      return (
        <ul className="slot-list">
          {[...(data.chasisSlots ?? [])].sort((a, b) => a.numeroSlot - b.numeroSlot).map((slot) => {
            const estadoKey = (slot.estado ?? "").toLowerCase();
            const estadoVisual = estadoKey === "degradado" ? "alertado" : estadoKey;
            const servidorId = slot.servidorId;
            return (
              <li key={slot.id ?? slot.numeroSlot} className="slot-list__row">
                <span className="slot-list__num">
                  Slot {String(slot.numeroSlot).padStart(2, "0")}
                </span>
                <span className={`slot-list__state slot-list__state--${estadoVisual}`}>
                  <span className="slot-list__dot" aria-hidden="true" />
                  {SLOT_ESTADO_LABEL[estadoKey] ?? slot.estado}
                </span>
                {slot.hostanameServidor && servidorId != null ? (
                  <Link
                    to={`/inventario/servidores/blade/${servidorId}`}
                    className="slot-list__host"
                  >
                    {slot.hostanameServidor}
                  </Link>
                ) : slot.hostanameServidor ? (
                  <span className="slot-list__host">{slot.hostanameServidor}</span>
                ) : (
                  <span className="slot-list__host slot-list__host--empty">Sin servidor</span>
                )}
                {servidorId != null && slot.hostanameServidor && (
                  <Link to={`/inventario/servidores/blade/${servidorId}`} className="slot-list__action">
                    Ver ficha →
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      );
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
    case "general":
      return <DetailInfoGrid items={buildGeneralInfo(data)} />;
    default:
      return null;
  }
}

function ChasisBladeDetail() {
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
    const cargar = (inicial = false) => {
      obtenerChasisBlade(id)
        .then((dto) => {
          if (!cancelled) {
            setData(dto);
            setError(null);
          }
        })
        .catch((err) => {
          if (!cancelled && inicial) setError(err);
        })
        .finally(() => {
          if (!cancelled && inicial) setLoading(false);
        });
    };
    cargar(true);
    const timer = window.setInterval(() => cargar(), 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [id]);

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="server-detail">
      <Link to="/inventario/chasis-blades" className="detail-placeholder__back">
        <IconChevronLeft />
        Volver a Chasis Blades
      </Link>
      <h1 className="server-detail__title">Chasis Blade {data?.hostname ?? id}</h1>
      <MaintenanceNotice active={data?.mantenimientoActivo === true} />
      {data && <SnmpConnectionNotice activoId={id} enMantenimiento={data.mantenimientoActivo === true} />}

      {error && <p className="detail-placeholder__error">No se pudo cargar el chasis ({error.message}).</p>}
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
                        <HistorialActivoLink activoId={id} />
                      )}
                      {section.key === "general" && (
                        <button
                          type="button"
                          className="detail-general-actions__btn"
                          onClick={() => setSnmpModalOpen(true)}
                        >
                          <IconWifi className="detail-general-actions__icon" />
                          Editar conexión SNMP
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
                      {section.key === "general" ? (
                        <DatosGeneralesEditables activoId={id} tipo="chasis"
                          items={buildGeneralInfo(data)}
                          onSaved={(campos) => setData((actual) => ({ ...actual, ...campos }))} />
                      ) : renderSectionBody(section.key, data)}
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

      <SnmpConexionModal open={snmpModalOpen} activoId={id}
        onClose={() => setSnmpModalOpen(false)}
        onSaved={(conexion) => setData((actual) => ({ ...actual, ip_gestion: conexion.ipGestion }))} />
    </div>
  );
}

export default ChasisBladeDetail;
