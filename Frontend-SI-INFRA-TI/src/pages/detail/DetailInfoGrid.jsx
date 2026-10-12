import StatusBadge from "../../components/StatusBadge";

function fechaHoraLima(valor) {
  if (valor === "N/A") return valor;
  const fechaAntigua = String(valor).match(/^(\d{4}-\d{2}-\d{2})(?:T00:00:00(?:\.0+)?)?$/);
  if (fechaAntigua) {
    const fecha = new Date(`${fechaAntigua[1]}T12:00:00Z`);
    return `${fecha.toLocaleDateString("es-PE", { dateStyle: "medium", timeZone: "America/Lima" })} · hora no disponible`;
  }
  // PostgreSQL guarda UTC sin zona; Java lo serializa sin el sufijo Z.
  const iso = /(?:Z|[+-]\d{2}:\d{2})$/i.test(valor) ? valor : `${valor}Z`;
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return valor;
  return `${fecha.toLocaleString("es-PE", {
    dateStyle: "medium", timeStyle: "short", timeZone: "America/Lima",
  })} (Lima)`;
}

function DetailInfoGrid({ items }) {
  return (
    <div className="detail-grid">
      {items.map((item) => {
        const value =
          item.value == null || (typeof item.value === "string" && item.value.trim() === "")
            ? "N/A"
            : item.value;

        return (
          <div key={item.label} className="detail-grid__cell">
            <span className="detail-grid__label">{item.label}</span>
            <span className="detail-grid__value">
              {item.editElement ?? (item.type === "estado" ? <StatusBadge status={value} />
                : item.type === "fechaHoraUtc" ? fechaHoraLima(value) : value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default DetailInfoGrid;
