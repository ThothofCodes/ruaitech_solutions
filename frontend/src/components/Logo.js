// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.

export default function RuaiTechLogo({ size = 40, showText = true, textSize = '15px' }) {
  const id = `rtl${size}`;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(size * 0.3) }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 500 500"
        width={size}
        height={size}
        style={{ flexShrink: 0, filter: `drop-shadow(0 2px ${Math.round(size*0.1)}px rgba(200,80,106,0.45)) drop-shadow(0 0 ${Math.round(size*0.18)}px rgba(92,42,74,0.35))` }}
        role="img"
        aria-label="Ruai Tech Solutions Logo"
      >
        <defs>
          <linearGradient id={`${id}_bg`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a0d1f"/>
            <stop offset="100%" stopColor="#0d0812"/>
          </linearGradient>
          <radialGradient id={`${id}_sg`} cx="50%" cy="25%" r="55%">
            <stop offset="0%" stopColor="#5c2a4a" stopOpacity="0.55"/>
            <stop offset="100%" stopColor="#110a1e" stopOpacity="0"/>
          </radialGradient>
          {/* Six facet gradients */}
          <linearGradient id={`${id}_f1`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c8647a"/><stop offset="100%" stopColor="#7a3050"/>
          </linearGradient>
          <linearGradient id={`${id}_f2`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3a1c4a"/><stop offset="100%" stopColor="#1e0c2e"/>
          </linearGradient>
          <linearGradient id={`${id}_f3`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9b3a6a"/><stop offset="100%" stopColor="#5a1e3a"/>
          </linearGradient>
          <linearGradient id={`${id}_f4`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4788a"/><stop offset="100%" stopColor="#8c2a50"/>
          </linearGradient>
          <linearGradient id={`${id}_f5`} x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#4a1a3c"/><stop offset="100%" stopColor="#2a0c24"/>
          </linearGradient>
          <linearGradient id={`${id}_f6`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6c223c"/><stop offset="100%" stopColor="#3a0e22"/>
          </linearGradient>
          {/* K monogram gradient */}
          <linearGradient id={`${id}_kG`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0c0cc"/><stop offset="100%" stopColor="#c86880"/>
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width="500" height="500" fill={`url(#${id}_bg)`}/>
        <rect width="500" height="500" fill={`url(#${id}_sg)`}/>

        {/* Hexagonal gem — six facets */}
        <g transform="translate(250,175)">
          <polygon points="0,-80 69,-40 38,-10 5,-42"   fill={`url(#${id}_f1)`} opacity="0.92"/>
          <polygon points="69,-40 69,40 36,14 38,-10"   fill={`url(#${id}_f2)`} opacity="0.95"/>
          <polygon points="69,40 0,80 -8,44 36,14"      fill={`url(#${id}_f3)`} opacity="0.90"/>
          <polygon points="0,80 -69,40 -38,10 -8,44"    fill={`url(#${id}_f4)`} opacity="0.88"/>
          <polygon points="-69,40 -69,-40 -36,-14 -38,10" fill={`url(#${id}_f5)`} opacity="0.95"/>
          <polygon points="-69,-40 0,-80 5,-42 -36,-14" fill={`url(#${id}_f6)`} opacity="0.90"/>

          {/* K monogram inside gem */}
          <g fill={`url(#${id}_kG)`} opacity="0.92">
            <rect x="-9" y="-30" width="9" height="60" rx="1"/>
            <polygon points="0,-30 28,-30 6,0 0,0"/>
            <polygon points="0,0 6,0 28,30 0,30"/>
          </g>

          {/* Outer hex outline */}
          <polygon points="0,-80 69,-40 69,40 0,80 -69,40 -69,-40"
            fill="none" stroke="#e07090" strokeWidth="1" opacity="0.25"/>
        </g>

        {/* Wordmark */}
        <text x="250" y="310"
          fontFamily="Georgia,serif"
          fontSize="82"
          fontWeight="700"
          letterSpacing="10"
          textAnchor="middle"
          fill="#c8506a">RUAI</text>

        {/* Divider line */}
        <line x1="170" y1="322" x2="330" y2="322" stroke="#5c2a3a" strokeWidth="0.8" opacity="0.6"/>

        {/* Sub-wordmark */}
        <text x="250" y="358"
          fontFamily="Georgia,serif"
          fontSize="22"
          letterSpacing="9"
          textAnchor="middle"
          fill="#7a3a52">TECH SOLUTIONS</text>
      </svg>

      {/* Wordmark beside icon */}
      {showText && (
        <div style={{ lineHeight: 1.15 }}>
          <div style={{
            fontFamily: "'Poppins','Georgia',serif",
            fontWeight: 800,
            fontSize: textSize,
            letterSpacing: '0.06em',
            background: 'linear-gradient(90deg, #c8506a, #f0c0cc, #c8506a)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>Ruai Tech</div>
          <div style={{
            fontFamily: "'Inter','Georgia',serif",
            fontSize: `calc(${textSize} * 0.62)`,
            color: '#7a3a52',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginTop: 1,
            fontWeight: 500,
          }}>Solutions</div>
        </div>
      )}
    </div>
  );
}
