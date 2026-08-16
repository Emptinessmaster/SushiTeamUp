export function Logo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#e23b2e" />
      <ellipse cx="32" cy="42" rx="19" ry="9" fill="#fff2ef" />
      <rect x="19" y="26" width="26" height="13" rx="6.5" fill="#ffffff" />
      <circle cx="32" cy="32.5" r="5" fill="#e23b2e" />
      <rect
        x="11"
        y="16"
        width="2.6"
        height="32"
        rx="1.3"
        fill="#f4b942"
        transform="rotate(13 12 34)"
      />
      <rect
        x="50"
        y="16"
        width="2.6"
        height="32"
        rx="1.3"
        fill="#f4b942"
        transform="rotate(-13 52 34)"
      />
    </svg>
  );
}
