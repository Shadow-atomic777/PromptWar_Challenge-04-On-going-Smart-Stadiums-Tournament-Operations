import React from 'react';

export default function AnimatedFootball({ size = 100 }: { size?: number }) {
  return (
    <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, margin: '0' }}>
      <div className="football-3d" style={{ fontSize: `${size * 0.6}px` }}>⚽</div>
      <div className="football-shadow" style={{ 
        width: `${size * 0.7}px`, 
        height: `${size * 0.12}px`,
        bottom: `-${size * 0.2}px`,
        marginLeft: `-${size * 0.35}px`
      }}></div>
    </div>
  );
}
