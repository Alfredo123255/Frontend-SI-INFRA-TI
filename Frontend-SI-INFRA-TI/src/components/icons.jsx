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

export const IconDownload = (props) => (
  <svg {...base} {...props}>
    <path d="M12 3.5v11.5M7.5 10.5 12 15l4.5-4.5" />
    <path d="M4.5 16.5v2.4a1.6 1.6 0 0 0 1.6 1.6h11.8a1.6 1.6 0 0 0 1.6-1.6v-2.4" />
  </svg>
);

export const IconWifi = (props) => (
  <svg {...base} {...props}>
    <path d="M8.1 16.4a5.5 5.5 0 0 1 7.8 0M12 20h.01M4.9 12.9c3.9-3.9 10.2-3.9 14.1 0M1.4 9.4c5.9-5.9 15.4-5.9 21.2 0" />
  </svg>
);

export const IconCheck = (props) => (
  <svg {...base} {...props}>
    <path d="M5 13l4 4L19 7" />
  </svg>
);

export const IconClose = (props) => (
  <svg {...base} {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconSettings = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 13.5c.1-.5.1-1 0-1.5l1.9-1.5-2-3.4-2.2.9a7.5 7.5 0 0 0-1.3-.75L15.5 5h-4l-.3 2.25c-.47.19-.9.45-1.3.75l-2.2-.9-2 3.4 1.9 1.5c-.1.5-.1 1 0 1.5l-1.9 1.5 2 3.4 2.2-.9c.4.3.83.56 1.3.75L11.5 21h4l.3-2.25c.47-.19.9-.45 1.3-.75l2.2.9 2-3.4-1.9-1.5Z" />
  </svg>
);

export const IconEye = (props) => (
  <svg {...base} {...props}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconEyeOff = (props) => (
  <svg {...base} {...props}>
    <path d="M3 3l18 18" />
    <path d="M10.6 5.2A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17.7 17.7 0 0 1-3.2 4.2M6.5 6.7C3.9 8.4 2 12 2 12s3.6 7 10 7a10 10 0 0 0 4.2-.9" />
    <path d="M9.5 9.9a3 3 0 0 0 4.2 4.2" />
  </svg>
);

export const IconSearch = (props) => (
  <svg {...base} {...props}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-3.6-3.6" />
  </svg>
);

export const IconWrench = (props) => (
  <svg {...base} {...props}>
    <path d="M20.5 6.5a4.5 4.5 0 0 1-5.86 4.29L7.4 18.03a1.9 1.9 0 1 1-2.69-2.69l7.24-7.24A4.5 4.5 0 0 1 17.5 3.5c.5 0 .98.09 1.42.26a.4.4 0 0 1 .13.65L16.7 6.76l1.3 1.3 2.35-2.35c.2-.2.53-.15.65.13.13.4.2.83.2 1.27" />
  </svg>
);

export const IconPower = (props) => (
  <svg {...base} {...props}>
    <path d="M12 3.5v7" />
    <path d="M7.4 6.2a7 7 0 1 0 9.2 0" />
  </svg>
);
