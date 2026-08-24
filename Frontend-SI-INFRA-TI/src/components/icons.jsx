const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const IconHome = (props) => (
  <svg {...base} {...props}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5.5 9.5V19a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1V9.5" />
  </svg>
);

export const IconServerStack = (props) => (
  <svg {...base} {...props}>
    <rect x="3.5" y="3.5" width="17" height="6" rx="1.4" />
    <rect x="3.5" y="14.5" width="17" height="6" rx="1.4" />
    <circle cx="7" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="7" cy="17.5" r="0.9" fill="currentColor" stroke="none" />
    <path d="M10.5 6.5h7M10.5 17.5h7" />
  </svg>
);

export const IconDashboard = (props) => (
  <svg {...base} {...props}>
    <path d="M4 13a8 8 0 0 1 16 0" />
    <path d="M12 13V8.5M12 13l3.4-2.4" />
    <path d="M3.5 17.5h17" />
  </svg>
);

export const IconChevronDown = (props) => (
  <svg {...base} {...props}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const IconChevronLeft = (props) => (
  <svg {...base} {...props}>
    <path d="m15 6-6 6 6 6" />
  </svg>
);

export const IconMonitor = (props) => (
  <svg {...base} {...props}>
    <rect x="3.5" y="4.5" width="17" height="12" rx="1.6" />
    <path d="M8.5 20.5h7M12 16.5v4" />
  </svg>
);

export const IconDrive = (props) => (
  <svg {...base} {...props}>
    <rect x="4.5" y="3.5" width="15" height="17" rx="1.6" />
    <path d="M4.5 14.5h15" />
    <circle cx="8.2" cy="17.8" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="11.4" cy="17.8" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const IconSwitch = (props) => (
  <svg {...base} {...props}>
    <rect x="3.5" y="8.5" width="17" height="7" rx="1.4" />
    <path d="M7 12h.01M10.4 12h.01M13.8 12h.01" />
    <path d="M17.5 8.5V6M6.5 15.5V18" />
  </svg>
);

export const IconLogo = (props) => (
  <svg {...base} viewBox="0 0 32 32" {...props}>
    <path d="M16 3 27 9v14L16 29 5 23V9z" />
    <path d="M16 3v13M16 16 5 9M16 16l11-7M16 16v13" />
  </svg>
);

export const IconMapPin = (props) => (
  <svg {...base} {...props}>
    <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.4" />
  </svg>
);

export const IconAlert = (props) => (
  <svg {...base} {...props}>
    <path d="M12 3.5 21.5 20h-19Z" />
    <path d="M12 9.5v4.2M12 17h.01" />
  </svg>
);

export const IconBolt = (props) => (
  <svg {...base} {...props}>
    <path d="M12.5 3 5 13.5h5.5L11 21l7.5-10.5H13Z" />
  </svg>
);

export const IconSun = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.4M12 19.1v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7" />
  </svg>
);

export const IconMoon = (props) => (
  <svg {...base} {...props}>
    <path d="M20 14.2A8.5 8.5 0 1 1 9.8 4a6.8 6.8 0 0 0 10.2 10.2Z" />
  </svg>
);

export const IconPlus = (props) => (
  <svg {...base} {...props}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconMinus = (props) => (
  <svg {...base} {...props}>
    <path d="M5 12h14" />
  </svg>
);

export const IconTarget = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="7.5" />
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
  </svg>
);
