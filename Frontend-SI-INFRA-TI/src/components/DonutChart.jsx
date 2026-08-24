import "./DonutChart.css";

const SIZE = 176;
const STROKE = 22;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 4;

function DonutChart({ data, centerValue, centerLabel }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let offset = 0;

  return (
    <div className="donut-chart">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--gridline)"
            strokeWidth={STROKE}
          />
          {data.map((d) => {
            const share = total === 0 ? 0 : d.value / total;
            const rawLen = share * CIRCUMFERENCE;
            const len = Math.max(rawLen - GAP, 0);
            const dashoffset = -offset;
            offset += rawLen;
            if (d.value === 0) return null;
            return (
              <circle
                key={d.label}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={d.color}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={`${len} ${CIRCUMFERENCE - len}`}
                strokeDashoffset={dashoffset}
              />
            );
          })}
        </g>
        <text
          x="50%"
          y="47%"
          textAnchor="middle"
          className="donut-chart__value tabular"
        >
          {centerValue}
        </text>
        <text x="50%" y="61%" textAnchor="middle" className="donut-chart__label">
          {centerLabel}
        </text>
      </svg>

      <ul className="donut-chart__legend">
        {data.map((d) => (
          <li key={d.label}>
            <span className="donut-chart__swatch" style={{ background: d.color }} />
            <span className="donut-chart__legend-label">{d.label}</span>
            <span className="donut-chart__legend-value tabular">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DonutChart;
