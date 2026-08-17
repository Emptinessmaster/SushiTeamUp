import type { SVGProps } from 'react';

const base = (props: SVGProps<SVGSVGElement>) => ({
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
});

/** Lista completa (tutti gli ordini) */
export const IconList = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M8 6h13M8 12h13M8 18h13" />
    <circle cx="3.5" cy="6" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="3.5" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="3.5" cy="18" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

/** Profilo / i miei */
export const IconUser = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6" />
  </svg>
);

/** Totale serviti (somma) */
export const IconReceipt = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M6 2.5h12v19l-3-1.6-3 1.6-3-1.6-3 1.6z" />
    <path d="M9.5 8h5M9.5 12h5" />
  </svg>
);

/** I miei serviti */
export const IconUserCheck = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8" r="4" />
    <path d="M2.5 20c0-3.3 3-5.8 6.5-5.8 1 0 2 .2 2.8.6" />
    <path d="M15.5 18.5l1.8 1.8 3.4-3.6" />
  </svg>
);

export const IconPlus = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconCheck = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 12.5l5 5 11-11" />
  </svg>
);

export const IconTrash = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13" />
  </svg>
);

export const IconUndo = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M9 7L4 12l5 5" />
    <path d="M4 12h11a5 5 0 0 1 0 10h-3" />
  </svg>
);

export const IconBack = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

export const IconShare = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="6" cy="12" r="2.6" />
    <circle cx="17.5" cy="6" r="2.6" />
    <circle cx="17.5" cy="18" r="2.6" />
    <path d="M8.3 10.8l6.9-3.6M8.3 13.2l6.9 3.6" />
  </svg>
);

export const IconClock = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const IconBackspace = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M21 5H8.5L3 12l5.5 7H21z" />
    <path d="M12 9.5l5 5M17 9.5l-5 5" />
  </svg>
);
