import { useState } from "react";
import WorldMap from "../components/WorldMap";
import StatusBadge from "../components/StatusBadge";
import { datacenters, STATUS } from "../data/datacenters";
import { IconServerStack, IconDrive, IconAlert, IconBolt } from "../components/icons";
import "./Home.css";

function Home() {
  const [activeId, setActiveId] = useState(datacenters[0].id);
  const active = datacenters.find((dc) => dc.id === activeId) ?? datacenters[0];

  const totalServers = datacenters.reduce((sum, dc) => sum + dc.servers, 0);
  const totalStorage = datacenters.reduce((sum, dc) => sum + dc.storageTB, 0);
  const incidents = datacenters.filter((dc) => dc.status !== "online").length;
  const avgUptime =
    datacenters.reduce((sum, dc) => sum + dc.uptime, 0) / datacenters.length;

  return (
    <div className="home">
      <section className="home__kpis">
        <div className="kpi-tile">
          <IconServerStack className="kpi-tile__icon" />
          <div>
            <div className="kpi-tile__value tabular">{totalServers}</div>
            <div className="kpi-tile__label">Equipos activos</div>
          </div>
        </div>
        <div className="kpi-tile">
          <IconDrive className="kpi-tile__icon" />
          <div>
            <div className="kpi-tile__value tabular">{totalStorage.toLocaleString("es-PE")} TB</div>
            <div className="kpi-tile__label">Capacidad total</div>
          </div>
        </div>
        <div className="kpi-tile">
          <IconBolt className="kpi-tile__icon" />
          <div>
            <div className="kpi-tile__value tabular">{avgUptime.toFixed(2)}%</div>
            <div className="kpi-tile__label">Uptime promedio</div>
          </div>
        </div>
        <div className={`kpi-tile ${incidents > 0 ? "kpi-tile--warn" : ""}`}>
          <IconAlert className="kpi-tile__icon" />
          <div>
            <div className="kpi-tile__value tabular">{incidents}</div>
            <div className="kpi-tile__label">Sedes con incidencias</div>
          </div>
        </div>
      </section>

      <section className="home__body">
        <div className="panel home__map-panel">
          <div className="panel__header">
            <div>
              <h2>Cobertura nacional</h2>
              <p>Ubicación técnica de data centers on-premise</p>
            </div>
            <div className="home__legend">
              {Object.entries(STATUS).map(([key, meta]) => (
                <span key={key} className="home__legend-item">
                  <span className="home__legend-dot" style={{ background: meta.color }} />
                  {meta.label}
                </span>
              ))}
            </div>
          </div>
          <WorldMap activeId={activeId} onSelect={setActiveId} />
        </div>

        <div className="panel home__list-panel">
          <div className="panel__header">
            <div>
              <h2>Data centers</h2>
              <p>{datacenters.length} sedes registradas</p>
            </div>
          </div>

          <div className="dc-list">
            {datacenters.map((dc) => (
              <button
                key={dc.id}
                className={`dc-list__item ${dc.id === activeId ? "is-active" : ""}`}
                onClick={() => setActiveId(dc.id)}
              >
                <div className="dc-list__top">
                  <span className="dc-list__id">{dc.id}</span>
                  <StatusBadge status={dc.status} compact />
                </div>
                <div className="dc-list__name">{dc.name}</div>
                <div className="dc-list__city">{dc.city} · {dc.tier}</div>
              </button>
            ))}
          </div>

          <div className="dc-detail">
            <div className="dc-detail__header">
              <div>
                <div className="dc-detail__name">{active.name}</div>
                <div className="dc-detail__role">{active.role}</div>
              </div>
              <StatusBadge status={active.status} />
            </div>

            <div className="dc-detail__grid">
              <div>
                <span>Equipos</span>
                <strong className="tabular">{active.servers}</strong>
              </div>
              <div>
                <span>Uptime</span>
                <strong className="tabular">{active.uptime}%</strong>
              </div>
              <div>
                <span>Carga eléctrica</span>
                <strong className="tabular">{active.powerLoad}%</strong>
              </div>
            </div>

            <div className="dc-detail__usage">
              {[
                {
                  label: "Storage",
                  value: `${active.storageUsedTB}/${active.storageTB} TB`,
                  pct: (active.storageUsedTB / active.storageTB) * 100,
                },
                {
                  label: "RAM",
                  value: `${active.ramUsedPct}% de ${active.ramTotalTB} TB`,
                  pct: active.ramUsedPct,
                },
                {
                  label: "CPU",
                  value: `${active.cpuUsagePct}%`,
                  pct: active.cpuUsagePct,
                },
              ].map((row) => (
                <div className="usage-row" key={row.label}>
                  <div className="usage-row__top">
                    <span>{row.label}</span>
                    <span className="tabular">{row.value}</span>
                  </div>
                  <div className="usage-row__bar">
                    <div
                      className="usage-row__fill"
                      style={{
                        width: `${row.pct}%`,
                        background: row.pct > 85 ? "var(--status-warning)" : "var(--accent)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
