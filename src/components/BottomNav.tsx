import type { ComponentType, SVGProps } from 'react';
import { IconList, IconReceipt, IconUser, IconUserCheck } from './Icons';

export type Tab = 'all' | 'mine' | 'doneTotal' | 'doneMine';

const TABS: {
  id: Tab;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  { id: 'all', label: 'Tutti', Icon: IconList },
  { id: 'mine', label: 'I miei', Icon: IconUser },
  { id: 'doneTotal', label: 'Totale', Icon: IconReceipt },
  { id: 'doneMine', label: 'Miei', Icon: IconUserCheck },
];

export function BottomNav({
  active,
  onChange,
  badges,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
  badges: Record<Tab, number>;
}) {
  return (
    <nav className="bottom-nav" role="tablist">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          role="tab"
          aria-selected={active === id}
          className={active === id ? 'nav-item active' : 'nav-item'}
          onClick={() => onChange(id)}
        >
          <span className="nav-icon-wrap">
            <Icon width={23} height={23} />
            {badges[id] > 0 && <span className="nav-badge">{badges[id]}</span>}
          </span>
          <span className="nav-label">{label}</span>
        </button>
      ))}
    </nav>
  );
}
