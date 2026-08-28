export const servers = [
  { id: "SRV-0142", name: "app-web-01", dc: "DC-LIM-01", cluster: "Web Frontend", marca: "Dell", model: "Dell PowerEdge R750", tipo: "RACKEABLE", os: "Ubuntu Server 22.04", cpu: "2x Xeon Gold 6338 (64 vCPU)", ramGB: 256, vcpus: 64, ramPct: 61, cpuPct: 42, status: "online", ip: "10.10.1.12" },
  { id: "SRV-0143", name: "app-web-02", dc: "DC-LIM-01", cluster: "Web Frontend", marca: "Dell", model: "Dell PowerEdge R750", tipo: "RACKEABLE", os: "Ubuntu Server 22.04", cpu: "2x Xeon Gold 6338 (64 vCPU)", ramGB: 256, vcpus: 64, ramPct: 58, cpuPct: 38, status: "online", ip: "10.10.1.13" },
  { id: "SRV-0144", name: "db-primary-01", dc: "DC-LIM-01", cluster: "DB Cluster Producción", marca: "HPE", model: "HPE ProLiant DL380 Gen10", tipo: "RACKEABLE", os: "RHEL 9", cpu: "2x Xeon Platinum 8358", ramGB: 512, vcpus: 96, ramPct: 74, cpuPct: 55, status: "online", ip: "10.10.1.20" },
  { id: "SRV-0145", name: "db-replica-01", dc: "DC-CAL-01", cluster: "DB Cluster Producción", marca: "HPE", model: "HPE ProLiant DL380 Gen10", tipo: "RACKEABLE", os: "RHEL 9", cpu: "2x Xeon Platinum 8358", ramGB: 512, vcpus: 96, ramPct: 52, cpuPct: 33, status: "online", ip: "10.20.1.21" },
  { id: "SRV-0146", name: "erp-core-01", dc: "DC-LIM-01", cluster: "ERP Core", marca: "Dell", model: "Dell PowerEdge R650", tipo: "RACKEABLE", os: "Windows Server 2022", cpu: "2x Xeon Gold 6330", ramGB: 384, vcpus: 72, ramPct: 91, cpuPct: 88, status: "warning", ip: "10.10.1.30" },
  { id: "SRV-0147", name: "hyperv-node-03", dc: "DC-TRU-01", cluster: "Virtualización Hyper-V", marca: "Lenovo", model: "Lenovo ThinkSystem SR650", tipo: "BLADE", os: "Windows Server 2022 Hyper-V", cpu: "2x Xeon Gold 6248R", ramGB: 512, vcpus: 64, ramPct: 85, cpuPct: 82, status: "warning", ip: "10.30.1.5" },
  { id: "SRV-0148", name: "esxi-node-07", dc: "DC-ARE-01", cluster: "Virtualización VMware", marca: "Dell", model: "Dell PowerEdge R740", tipo: "BLADE", os: "VMware ESXi 8.0", cpu: "2x Xeon Silver 4316", ramGB: 256, vcpus: 40, ramPct: 63, cpuPct: 47, status: "online", ip: "10.40.1.7" },
  { id: "SRV-0149", name: "edge-gw-piu", dc: "DC-PIU-01", cluster: "Edge Gateways", marca: "Supermicro", model: "Supermicro SYS-1029P", tipo: "RACKEABLE", os: "Ubuntu Server 22.04", cpu: "1x Xeon Silver 4310", ramGB: 128, vcpus: 16, ramPct: 40, cpuPct: 21, status: "online", ip: "10.50.1.2" },
  { id: "SRV-0150", name: "mail-relay-01", dc: "DC-CUS-01", cluster: "Mensajería", marca: "Dell", model: "Dell PowerEdge R640", tipo: "RACKEABLE", os: "RHEL 8", cpu: "1x Xeon Gold 5218", ramGB: 128, vcpus: 24, ramPct: 0, cpuPct: 0, status: "offline", ip: "10.60.1.4" },
  { id: "SRV-0151", name: "backup-node-iqt", dc: "DC-IQT-01", cluster: "Backup & DR", marca: "HPE", model: "HPE ProLiant DL360 Gen10", tipo: "RACKEABLE", os: "Ubuntu Server 22.04", cpu: "1x Xeon Silver 4210", ramGB: 128, vcpus: 16, ramPct: 35, cpuPct: 18, status: "online", ip: "10.70.1.3" },
  { id: "SRV-0152", name: "monitoring-01", dc: "DC-LIM-01", cluster: "Monitoreo", marca: "Dell", model: "Dell PowerEdge R650", tipo: "RACKEABLE", os: "Ubuntu Server 22.04", cpu: "1x Xeon Gold 6330", ramGB: 192, vcpus: 24, ramPct: 48, cpuPct: 29, status: "online", ip: "10.10.1.40" },
  { id: "SRV-0153", name: "app-web-03", dc: "DC-ARE-01", cluster: "Web Frontend", marca: "Dell", model: "Dell PowerEdge R750", tipo: "BLADE", os: "Ubuntu Server 22.04", cpu: "2x Xeon Gold 6338 (64 vCPU)", ramGB: 256, vcpus: 64, ramPct: 60, cpuPct: 44, status: "online", ip: "10.40.1.14" },
];

export const storageDevices = [
  { id: "STG-0031", name: "san-primary-lim", dc: "DC-LIM-01", cluster: "Almacenamiento Producción", marca: "Dell EMC", model: "Dell EMC PowerStore 5000T", type: "SAN All-Flash", capacityTB: 420, usedTB: 318, protocol: "FC 32Gb", status: "online" },
  { id: "STG-0032", name: "nas-backup-cal", dc: "DC-CAL-01", cluster: "Backup & DR", marca: "NetApp", model: "NetApp FAS2750", type: "NAS Híbrido", capacityTB: 260, usedTB: 140, protocol: "NFS / iSCSI", status: "online" },
  { id: "STG-0033", name: "san-secundario-tru", dc: "DC-TRU-01", cluster: "Almacenamiento Producción", marca: "HPE", model: "HPE Nimble AF40", type: "SAN All-Flash", capacityTB: 120, usedTB: 101, protocol: "iSCSI 10Gb", status: "warning" },
  { id: "STG-0034", name: "object-store-lim", dc: "DC-LIM-01", cluster: "Object Storage", marca: "MinIO", model: "MinIO Cluster (6 nodos)", type: "Object Storage", capacityTB: 200, usedTB: 87, protocol: "S3", status: "online" },
  { id: "STG-0035", name: "nas-edge-piu", dc: "DC-PIU-01", cluster: "Edge Gateways", marca: "Synology", model: "Synology RS3621xs+", type: "NAS", capacityTB: 60, usedTB: 22, protocol: "NFS", status: "online" },
  { id: "STG-0036", name: "san-cus", dc: "DC-CUS-01", cluster: "Almacenamiento Producción", marca: "Dell EMC", model: "Dell EMC Unity 380", type: "SAN Híbrido", capacityTB: 40, usedTB: 34, protocol: "FC 16Gb", status: "offline" },
  { id: "STG-0037", name: "nas-are", dc: "DC-ARE-01", cluster: "Virtualización VMware", marca: "QNAP", model: "QNAP TS-h2490FU", type: "NAS All-Flash", capacityTB: 150, usedTB: 96, protocol: "iSCSI 25Gb", status: "online" },
  { id: "STG-0038", name: "backup-vault-iqt", dc: "DC-IQT-01", cluster: "Backup & DR", marca: "Synology", model: "Synology RS4021xs+", type: "Backup / Archivo", capacityTB: 30, usedTB: 11, protocol: "NFS", status: "online" },
];

export const chasisBlades = [
  { id: "CHS-0011", name: "chassis-blade-lim-01", dc: "DC-LIM-01", cluster: "Virtualización VMware", marca: "Dell", model: "Dell PowerEdge M1000e", ip: "10.10.2.10", status: "online" },
  { id: "CHS-0012", name: "chassis-blade-lim-02", dc: "DC-LIM-01", cluster: "ERP Core", marca: "HPE", model: "HPE BladeSystem c7000", ip: "10.10.2.11", status: "online" },
  { id: "CHS-0013", name: "chassis-blade-cal-01", dc: "DC-CAL-01", cluster: "DB Cluster Producción", marca: "Dell", model: "Dell PowerEdge M1000e", ip: "10.20.2.10", status: "warning" },
  { id: "CHS-0014", name: "chassis-blade-tru-01", dc: "DC-TRU-01", cluster: "Virtualización Hyper-V", marca: "Cisco", model: "Cisco UCS 5108", ip: "10.30.2.5", status: "warning" },
  { id: "CHS-0015", name: "chassis-blade-are-01", dc: "DC-ARE-01", cluster: "Web Frontend", marca: "HPE", model: "HPE BladeSystem c7000", ip: "10.40.2.8", status: "online" },
  { id: "CHS-0016", name: "chassis-blade-cus-01", dc: "DC-CUS-01", cluster: "Backup & DR", marca: "Dell", model: "Dell PowerEdge M1000e", ip: "10.60.2.4", status: "apagado" },
  { id: "CHS-0017", name: "chassis-blade-iqt-01", dc: "DC-IQT-01", cluster: "Monitoreo", marca: "Cisco", model: "Cisco UCS 5108", ip: "10.70.2.3", status: "online" },
];

export const switches = [
  { id: "SWT-0071", name: "core-sw-lim-01", dc: "DC-LIM-01", marca: "Cisco", model: "Cisco Nexus 9336C-FX2", type: "Core", ports: 36, portsUsed: 31, speed: "100GbE", status: "online", ip: "10.10.0.11" },
  { id: "SWT-0072", name: "acc-sw-lim-02", dc: "DC-LIM-01", marca: "Cisco", model: "Cisco Catalyst 9300", type: "Acceso", ports: 48, portsUsed: 40, speed: "1/10GbE", status: "online", ip: "10.10.0.12" },
  { id: "SWT-0073", name: "core-sw-cal-01", dc: "DC-CAL-01", marca: "Juniper", model: "Juniper QFX5120", type: "Core", ports: 32, portsUsed: 18, speed: "40/100GbE", status: "online", ip: "10.20.0.11" },
  { id: "SWT-0074", name: "acc-sw-tru-01", dc: "DC-TRU-01", marca: "Aruba", model: "HPE Aruba 6300M", type: "Acceso", ports: 24, portsUsed: 23, speed: "1/10GbE", status: "warning", ip: "10.30.0.11" },
  { id: "SWT-0075", name: "edge-sw-piu-01", dc: "DC-PIU-01", marca: "Cisco", model: "Cisco Catalyst 9200", type: "Edge", ports: 24, portsUsed: 9, speed: "1GbE", status: "online", ip: "10.50.0.11" },
  { id: "SWT-0076", name: "acc-sw-cus-01", dc: "DC-CUS-01", marca: "Aruba", model: "HPE Aruba 2930F", type: "Acceso", ports: 24, portsUsed: 15, speed: "1GbE", status: "offline", ip: "10.60.0.11" },
  { id: "SWT-0077", name: "core-sw-are-01", dc: "DC-ARE-01", marca: "Juniper", model: "Juniper EX4400", type: "Core", ports: 48, portsUsed: 29, speed: "10/25GbE", status: "online", ip: "10.40.0.11" },
  { id: "SWT-0078", name: "fw-perimetral-lim", dc: "DC-LIM-01", marca: "Fortinet", model: "Fortinet FortiGate 200F", type: "Firewall", ports: 16, portsUsed: 12, speed: "1/10GbE", status: "online", ip: "10.10.0.13" },
  { id: "SWT-0079", name: "acc-sw-iqt-01", dc: "DC-IQT-01", marca: "Aruba", model: "HPE Aruba 2930F", type: "Acceso", ports: 24, portsUsed: 8, speed: "1GbE", status: "online", ip: "10.70.0.11" },
];
