function DetailInfoGrid({ items }) {
  return (
    <div className="detail-grid">
      {items.map((item) => (
        <div key={item.label} className="detail-grid__cell">
          <span className="detail-grid__label">{item.label}</span>
          <span className="detail-grid__value">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export default DetailInfoGrid;
