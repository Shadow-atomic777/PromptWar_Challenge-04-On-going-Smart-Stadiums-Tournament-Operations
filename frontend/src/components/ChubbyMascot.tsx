import React from 'react';

export default function ChubbyMascot({ style }: { style?: React.CSSProperties }) {
  return (
    <div className="mascot-container" style={{ width: 140, height: 140, ...style }}>
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        {/* Shadow */}
        <ellipse cx="50" cy="95" rx="25" ry="4" fill="rgba(0,255,135,0.2)" className="mascot-shadow" />
        
        {/* Football */}
        <g className="mascot-ball">
          <circle cx="75" cy="85" r="10" fill="#fff" />
          <path d="M68 80 l14 10 M68 90 l14 -10" stroke="#000" strokeWidth="2" />
          <circle cx="75" cy="85" r="3" fill="#000" />
        </g>

        {/* Mascot Body Group */}
        <g className="mascot-body-group">
          {/* Left Leg */}
          <g className="leg-left">
            <rect x="35" y="65" width="12" height="20" rx="6" fill="#fcd34d" />
            <path d="M30 82 h18 v8 h-18 z" fill="#00ff87" rx="4" />
          </g>
          
          {/* Right Leg */}
          <g className="leg-right">
            <rect x="53" y="65" width="12" height="20" rx="6" fill="#fcd34d" />
            <path d="M48 82 h18 v8 h-18 z" fill="#00ff87" rx="4" />
          </g>

          {/* Chubby Body / Jersey */}
          <ellipse cx="50" cy="50" rx="30" ry="26" fill="#3b82f6" />
          
          {/* Jersey Details */}
          <path d="M30 50 Q 50 65 70 50" stroke="#fff" strokeWidth="3" fill="none" />
          <text x="50" y="58" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">10</text>
          
          {/* Arms */}
          <ellipse cx="18" cy="50" rx="8" ry="16" fill="#3b82f6" className="arm-left" />
          <ellipse cx="82" cy="50" rx="8" ry="16" fill="#3b82f6" className="arm-right" />
          
          {/* Head */}
          <circle cx="50" cy="18" r="16" fill="#fcd34d" />
          
          {/* Eyes */}
          <circle cx="43" cy="15" r="2.5" fill="#000" />
          <circle cx="57" cy="15" r="2.5" fill="#000" />
          
          {/* Rosy Cheeks */}
          <circle cx="38" cy="18" r="3" fill="#fbbf24" opacity="0.6" />
          <circle cx="62" cy="18" r="3" fill="#fbbf24" opacity="0.6" />
          
          {/* Happy Smile */}
          <path d="M43 23 Q 50 28 57 23" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
          
          {/* Hair / Headband */}
          <path d="M34 8 Q 50 -2 66 8" stroke="#a855f7" strokeWidth="6" fill="none" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
