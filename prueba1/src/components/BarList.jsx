import "./BarList.css";

function BarList({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bar-list">
      {data.map((d) => (
        <div className="bar-list__row" key={d.label}>
          <div className="bar-list__label">{d.label}</div>
          <div className="bar-list__track">
            <div
              className="bar-list__fill"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
          <div className="bar-list__value tabular">{d.value}</div>
        </div>
      ))}
    </div>
  );
}

export default BarList;
