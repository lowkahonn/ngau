function IconBase({ children }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-none stroke-current">
      {children}
    </svg>
  );
}

export function IconInstagram() {
  return (
    <IconBase>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" strokeWidth="2" />
      <circle cx="17.3" cy="6.8" r="1.2" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function IconWhatsApp() {
  return (
    <svg viewBox="0 0 512 512" aria-label="WhatsApp" role="img" className="h-7 w-7">
      <rect width="512" height="512" rx="15%" fill="#25d366" />
      <path fill="#25d366" stroke="#ffffff" strokeWidth="26" d="M123 393l14-65a138 138 0 1150 47z" />
      <path fill="#ffffff" d="M308 273c-3-2-6-3-9 1l-12 16c-3 2-5 3-9 1-15-8-36-17-54-47-1-4 1-6 3-8l9-14c2-2 1-4 0-6l-12-29c-3-8-6-7-9-7h-8c-2 0-6 1-10 5-22 22-13 53 3 73 3 4 23 40 66 59 32 14 39 12 48 10 11-1 22-10 27-19 1-3 6-16 2-18" />
    </svg>
  );
}

export function IconX() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-current">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.847h-7.406l-5.8-7.584-6.64 7.584H.474l8.6-9.83L0 1.153h7.594l5.243 6.932 6.064-6.932Zm-1.297 19.28h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

export function IconShare() {
  return (
    <IconBase>
      <circle cx="18" cy="5.2" r="2.2" strokeWidth="1.8" />
      <circle cx="6" cy="12" r="2.2" strokeWidth="1.8" />
      <circle cx="18" cy="18.8" r="2.2" strokeWidth="1.8" />
      <path d="M8.1 11 15.9 6.2M8.1 13l7.8 4.8" strokeWidth="1.8" />
    </IconBase>
  );
}

export function IconDownload() {
  return (
    <IconBase>
      <path d="M12 4v10" strokeWidth="2" />
      <path d="m7.8 10.8 4.2 4.2 4.2-4.2" strokeWidth="2" />
      <path d="M5 19h14" strokeWidth="2" />
    </IconBase>
  );
}
