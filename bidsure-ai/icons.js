// Minimal inline icon set (stroke-based, 22x22) — no external icon dependency.
const ICONS = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  doc: '<path d="M6 2.5h8l4 4V21a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1z"/><path d="M14 2.5V7h4"/>',
  users: '<circle cx="8.5" cy="8" r="3.4"/><path d="M2 20c0-3.6 2.9-6 6.5-6S15 16.4 15 20"/><path d="M15.5 5.2A3.4 3.4 0 1 1 16.7 11.8"/><path d="M17 14c3.1.4 5 2.6 5 6"/>',
  check: '<circle cx="12" cy="12" r="9.3"/><path d="M8 12.3l2.7 2.7L16.3 9"/>',
  alert: '<path d="M10.6 3.5 2.7 18a1.8 1.8 0 0 0 1.6 2.7h15.4a1.8 1.8 0 0 0 1.6-2.7L13.4 3.5a1.8 1.8 0 0 0-2.8 0z"/><path d="M12 9.3v4.3"/><circle cx="12" cy="16.6" r="0.15" fill="currentColor"/>',
  report: '<path d="M5 3h11l3 3v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M8 11h8M8 15h8M8 7h4"/>',
  clock: '<circle cx="12" cy="12" r="9.3"/><path d="M12 6.8V12l3.6 2.2"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v2.4M12 19.1v2.4M4.5 12H2.1M21.9 12h-2.4M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.3-4.3"/>',
  link: '<path d="M9.5 14.5l5-5"/><path d="M8 16.5 5.6 18.9a3.5 3.5 0 0 1-4.9-4.9L5.6 9a3.5 3.5 0 0 1 4.9 0"/><path d="M16 7.5l2.4-2.4a3.5 3.5 0 1 1 4.9 4.9L18.4 15"/>',
  bell: '<path d="M6 9a6 6 0 0 1 12 0c0 5.5 2 6.5 2 6.5H4S6 14.5 6 9z"/><path d="M9.5 19a2.5 2.5 0 0 0 5 0"/>',
  upload: '<path d="M12 16V4M7 8.5 12 4l5 4.5"/><path d="M4 16.5V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2.5"/>',
  file: '<path d="M6 2.5h8l4 4V21a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1z"/><path d="M14 2.5V7h4"/>',
  scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 1-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3"/><path d="M4 12h16"/>',
  map: '<circle cx="12" cy="12" r="2.3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
  shield: '<path d="M12 2.5 20 6v6c0 5-3.4 8.3-8 9.5-4.6-1.2-8-4.5-8-9.5V6z"/>',
  eye: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/>',
  download: '<path d="M12 4v11.5M7.5 11l4.5 4.5L16.5 11"/><path d="M4.5 17v2a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-2"/>',
  'arrow-right': '<path d="M4 12h15.5M13.5 6l6 6-6 6"/>',
  'arrow-left': '<path d="M20 12H4.5M10.5 18l-6-6 6-6"/>',
  close: '<path d="M5 5l14 14M19 5 5 19"/>',
  'chevron-right': '<path d="M9 5l7 7-7 7"/>',
  ban: '<circle cx="12" cy="12" r="9.3"/><path d="M5.6 5.6l12.8 12.8"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M8 2.5v4M16 2.5v4M3 9.5h18"/>',
  building: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 7h1.2M14.8 7H16M8 11h1.2M14.8 11H16M8 15h1.2M14.8 15H16M10 21v-4h4v4"/>',
  briefcase: '<rect x="2.5" y="7" width="19" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M2.5 12.5h19"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/>',
  'ext-link': '<path d="M9 5H5.5A1.5 1.5 0 0 0 4 6.5v12A1.5 1.5 0 0 0 5.5 20h12a1.5 1.5 0 0 0 1.5-1.5V15"/><path d="M14 4h6v6M20 4l-9.5 9.5"/>',
  'ok-circle': '<circle cx="12" cy="12" r="9.3"/><path d="M8 12.3l2.7 2.7L16.3 9"/>',
  'x-circle': '<circle cx="12" cy="12" r="9.3"/><path d="M9 9l6 6M15 9l-6 6"/>',
  info: '<circle cx="12" cy="12" r="9.3"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r="0.15" fill="currentColor"/>',
  key: '<circle cx="8" cy="15" r="3.6"/><path d="M10.5 12.5 18 5M15 8l2.5 2.5M18 5l2.5 2.5"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5M3 8l9 5 9-5"/>',
  flag: '<path d="M5 21V4"/><path d="M5 4h13l-3 4.5L18 13H5"/>',
  filter: '<path d="M3 5h18M6 12h12M10 19h4"/>',
  'trend-up': '<path d="M3 17l6-6 4 4 8-9"/><path d="M15 6h6v6"/>',
  passport: '<rect x="4" y="2" width="16" height="20" rx="3"/><circle cx="12" cy="10" r="4"/><path d="M8 18h8M12 6v8M8 10h8"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="5" y="5" width="3" height="3" fill="currentColor"/><rect x="16" y="5" width="3" height="3" fill="currentColor"/><rect x="5" y="16" width="3" height="3" fill="currentColor"/><path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 19h2v2h-2zM19 14h2v2h-2z"/>',
  code: '<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>',
  printer: '<path d="M6 9V3h12v6"/><rect x="4" y="9" width="16" height="9" rx="2"/><path d="M6 15h12v6H6z"/>',
  'badge-check': '<path d="M12 2l2.6 2.3 3.4-.6 1.4 3.2 3.1 1.5-.7 3.4 2.1 2.8-2.1 2.8.7 3.4-3.1 1.5-1.4 3.2-3.4-.6L12 22l-2.6-2.3-3.4.6-1.4-3.2-3.1-1.5.7-3.4L0 9.4l2.1-2.8-.7-3.4 3.1-1.5 1.4-3.2 3.4.6z"/><path d="M8.5 12l2.5 2.5 5-5"/>',
  'file-text': '<path d="M6 2.5h8l4 4V21a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1z"/><path d="M14 2.5V7h4"/><path d="M9 12h6M9 16h4"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>',
  cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/>',
  switch: '<path d="M4 17h16M16 13l4 4-4 4M20 7H4M8 3L4 7l4 4"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V4a2 2 0 0 1 2-2h12"/>',
  refresh: '<path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l6.73-1.19"/>'
};

function renderIcons(root=document){
  root.querySelectorAll('[data-icon]').forEach(el=>{
    const name = el.getAttribute('data-icon');
    const body = ICONS[name];
    if(!body) return;
    const size = el.getAttribute('data-size') || 17;
    el.outerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  });
}
