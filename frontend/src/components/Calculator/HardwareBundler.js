// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
import { useState } from 'react';
import { formatKES } from '../../utils/helpers';

const HARDWARE = {
  'Laptop (Refurb)': { basic: 25000, mid: 45000, pro: 80000 },
  'Desktop (Full set)': { basic: 30000, mid: 55000, pro: 90000 },
  'Smartphone': { basic: 8000, mid: 18000, pro: 40000 },
  'Printer': { basic: 6000, mid: 12000, pro: 25000 },
  'Router / Wi-Fi': { basic: 3000, mid: 6500, pro: 14000 },
  'Accessories Bundle': { basic: 2000, mid: 4500, pro: 8000 },
  'Antivirus Licence (1yr)': { basic: 1500, mid: 3000, pro: 6000 },
  'Setup & Config': { basic: 1000, mid: 2500, pro: 5000 },
};

const TIER_LABELS = { basic: 'Basic', mid: 'Mid-Range', pro: 'Pro' };

export default function HardwareBundler({ onQuote }) {
  const [selections, setSelections] = useState({});

  const toggle = (item, tier) => {
    setSelections((prev) => {
      const next = { ...prev };
      if (next[item]?.tier === tier) delete next[item];
      else next[item] = { tier, price: HARDWARE[item][tier] };
      return next;
    });
  };

  const total = Object.values(selections).reduce((s, { price }) => s + price, 0);
  const items = Object.entries(selections).map(([name, { tier, price }]) => ({ name, tier, price }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Object.entries(HARDWARE).map(([item, prices]) => (
        <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ width: 180, fontSize: 14, fontWeight: 500 }}>{item}</span>
          {Object.entries(prices).map(([tier, price]) => (
            <button key={tier} onClick={() => toggle(item, tier)}
              style={{ padding: '4px 10px', borderRadius: 6, border: '2px solid', fontSize: 12,
                borderColor: selections[item]?.tier === tier ? '#3b82f6' : '#e2e8f0',
                background: selections[item]?.tier === tier ? '#eff6ff' : '#fff',
                cursor: 'pointer', fontWeight: selections[item]?.tier === tier ? 700 : 400 }}>
              {TIER_LABELS[tier]}<br />{formatKES(price)}
            </button>
          ))}
        </div>
      ))}
      {total > 0 && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '1rem', marginTop: 8 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 20, color: '#15803d' }}>Total: {formatKES(total)}</p>
          <ul style={{ margin: '8px 0', paddingLeft: 20, fontSize: 13 }}>
            {items.map((i) => <li key={i.name}>{i.name} ({i.tier}) — {formatKES(i.price)}</li>)}
          </ul>
          <button onClick={() => onQuote({ type: 'hardware', items, total })} style={{ padding: '0.5rem 1.5rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Request This Bundle →
          </button>
        </div>
      )}
    </div>
  );
}
