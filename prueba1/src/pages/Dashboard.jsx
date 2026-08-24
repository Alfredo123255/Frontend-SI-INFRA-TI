import DonutChart from "../components/DonutChart";
import BarList from "../components/BarList";
import StatusBadge from "../components/StatusBadge";
import { datacenters } from "../data/datacenters";
import { servers, storageDevices, switches } from "../data/inventory";
import { IconServerStack, IconDrive, IconAlert, IconBolt } from "../components/icons";
import "./Dashboard.css";

const allEquipment = [
  ...servers.map((s) => ({ ...s, kind: "Servidor" })),
  ...storageDevices.map((s) => ({ ...s, kind: "Storage" })),
  ...switches.map((s) => ({ ...s, kind: "Switch" })),
];

function Dashboard() {
  const totalEquipment = allEquipment.length;
  const totalServers = servers.length;
  const totalStorageDevices = storageDevices.length;
  const totalSwitches = switches.length;

  const statusCounts = allEquipment.reduce(
    (acc, item) => {
      acc[item.status] += 1;
      return acc;
    },
    { online: 0, warning: 0, offline: 0 }
  );

  const statusData = [
    { label: "Operativo", value: statusCounts.online, color: "var(--status-good)" },
    { label: "Advertencia", value: statusCounts.warning, color: "var(--status-warning)" },
    { label: "Fuera de línea", value: statusCounts.offline, color: "var(--status-critical)" },
  ];

  const operativePct = totalEquipment
    ? Math.round((statusCounts.online / totalEquipment) * 100)
    : 0;

  const equipmentByDc = datacenters
    .map((dc) => ({
      label: dc.city,
      value: allEquipment.filter((e) => e.dc === dc.id).length,
    }))
    .sort((a, b) => b.value - a.value);

  const totalCapacity = datacenters.reduce((sum, dc) => sum + dc.storageTB, 0);
  const usedCapacity = datacenters.reduce((sum, dc) => sum + dc.storageUsedTB, 0);
  const avgUptime = (
    datacenters.reduce((sum, dc) => sum + dc.uptime, 0) / datacenters.length
  ).toFixed(2);

  return (
    <div className="dashboard">
      <section className="dashboard__kpis">
        <div className="kpi-tile">
          <IconServerStack className="kpi-tile__icon" />
          <div>
            <div className="kpi-tile__value tabular">{totalEquipment}</div>
            <div className="kpi-tile__label">Equipos totales</div>
          </div>
        </div>
        <div className="kpi-tile">
          <IconDrive className="kpi-tile__icon" />
          <div>
            <div className="kpi-tile__value tabular">
              {Math.round((usedCapacity / totalCapacity) * 100)}%
            </div>
            <div className="kpi-tile__label">Storage utilizado</div>
          </div>
        </div>
        <div className="kpi-tile">
          <IconBolt className="kpi-tile__icon" />
          <div>
            <div className="kpi-tile__value tabular">{avgUptime}%</div>
            <div className="kpi-tile__label">Uptime promedio</div>
          </div>
        </div>
        <div className={`kpi-tile ${statusCounts.offline > 0 ? "kpi-tile--warn" : ""}`}>
          <IconAlert className="kpi-tile__icon" />
          <div>
            <div className="kpi-tile__value tabular">
              {statusCounts.warning + statusCounts.offline}
            </div>
            <div className="kpi-tile__label">Alertas activas</div>
          </div>
        </div>
      </section>

      <section className="dashboard__grid">
        <div className="panel">
          <div className="panel__header">
            <div>
              <h2>Estado de los equipos</h2>
              <p>Distribución sobre {totalEquipment} equipos monitoreados</p>
            </div>
          </div>
          <div className="dashboard__panel-body">
            <DonutChart data={statusData} centerValue={`${operativePct}%`} centerLabel="Operativo" />
          </div>
        </div>

        <div className="panel">
          <div className="panel__header">
            <div>
              <h2>Equipos por data center</h2>
              <p>Servidores, storage y switches por sede</p>
            </div>
          </div>
          <div className="dashboard__panel-body">
            <BarList data={equipmentByDc} />
          </div>
        </div>

        <div className="panel dashboard__breakdown">
          <div className="panel__header">
            <div>
              <h2>Composición del inventario</h2>
              <p>Distribución por tipo de recurso</p>
            </div>
          </div>
          <div className="dashboard__panel-body dashboard__breakdown-body">
            <div className="dashboard__breakdown-item">
              <span className="dashboard__breakdown-value tabular">{totalServers}</span>
              <span className="dashboard__breakdown-label">Servidores</span>
            </div>
            <div className="dashboard__breakdown-item">
              <span className="dashboard__breakdown-value tabular">{totalStorageDevices}</span>
              <span className="dashboard__breakdown-label">Unidades de storage</span>
            </div>
            <div className="dashboard__breakdown-item">
              <span className="dashboard__breakdown-value tabular">{totalSwitches}</span>
              <span className="dashboard__breakdown-label">Switches / red</span>
            </div>
          </div>
        </div>

        <div className="panel dashboard__table-panel">
          <div className="panel__header">
            <div>
              <h2>Capacidad por sede</h2>
              <p>Almacenamiento asignado vs. utilizado</p>
            </div>
          </div>
          <div className="inventory__table-wrap">
            <table className="inventory__table">
              <thead>
                <tr>
                  <th>Data center</th>
                  <th>Tier</th>
                  <th>Capacidad</th>
                  <th>Uptime</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {datacenters.map((dc) => {
                  const pct = Math.round((dc.storageUsedTB / dc.storageTB) * 100);
                  return (
                    <tr key={dc.id}>
                      <td>{dc.name}</td>
                      <td>{dc.tier}</td>
                      <td>
                        <div className="inventory__capacity">
                          <span className="tabular">
                            {dc.storageUsedTB}/{dc.storageTB} TB
                          </span>
                          <div className="inventory__capacity-bar">
                            <div
                              className="inventory__capacity-fill"
                              style={{
                                width: `${pct}%`,
                                background: pct > 85 ? "var(--status-warning)" : "var(--accent)",
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="tabular">{dc.uptime}%</td>
                      <td>
                        <StatusBadge status={dc.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
