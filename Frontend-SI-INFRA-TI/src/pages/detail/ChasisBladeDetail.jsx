import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { IconChevronLeft, IconChevronDown } from "../../components/icons";
import SectionSideNav from "../../components/SectionSideNav";
import DetailInfoGrid from "./DetailInfoGrid";
import DetailTable from "./DetailTable";
import DetailExpandableTable from "./DetailExpandableTable";
import { obtenerChasisBlade } from "../../api/client";
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
  { key: "velocidadRpm", label: "Velocidad (RPM)" },
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
    { label: "Última Actualización", value: d.ultima_actualizacion },
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
          {(data.chasisSlots ?? []).map((slot) => {
            const estadoKey = (slot.estado ?? "").toLowerCase();
            return (
              <li key={slot.id ?? slot.numeroSlot} className="slot-list__row">
                <span className="slot-list__num">
                  Slot {String(slot.numeroSlot).padStart(2, "0")}
                </span>
                <span className={`slot-list__state slot-list__state--${estadoKey}`}>
                  <span className="slot-list__dot" aria-hidden="true" />
                  {SLOT_ESTADO_LABEL[estadoKey] ?? slot.estado}
                </span>
                {slot.hostanameServidor && slot.servidorId != null ? (
                  <Link
                    to={`/inventario/servidores/blade/${slot.servidorId}`}
                    className="slot-list__host"
                  >
                    {slot.hostanameServidor}
                  </Link>
                ) : slot.hostanameServidor ? (
                  <span className="slot-list__host">{slot.hostanameServidor}</span>
                ) : (
                  <span className="slot-list__host slot-list__host--empty">Sin servidor</span>
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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    obtenerChasisBlade(id)
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
      <Link to="/inventario/chasis-blades" className="detail-placeholder__back">
        <IconChevronLeft />
        Volver a Chasis Blades
      </Link>
      <h1 className="server-detail__title">Chasis Blade {data?.hostname ?? id}</h1>

      {error && <p className="detail-placeholder__error">No se pudo cargar el chasis ({error.message}).</p>}
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

export default ChasisBladeDetail;
