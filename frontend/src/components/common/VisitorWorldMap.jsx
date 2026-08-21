// frontend/src/components/common/VisitorWorldMap.jsx
// Feature 12 — Visitor World Map
// Shows animated dots on a globe where visitors come from
// Uses data from your existing analytics dashboard
// Drop in admin Dashboard or Analytics page

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const DEMO_LOCATIONS = [
  { country:'India',     lat:20.5937,  lng:78.9629,  count:142 },
  { country:'USA',       lat:37.0902,  lng:-95.7129, count:98  },
  { country:'Germany',   lat:51.1657,  lng:10.4515,  count:34  },
  { country:'UK',        lat:55.3781,  lng:-3.4360,  count:28  },
  { country:'Canada',    lat:56.1304,  lng:-106.3468,count:19  },
  { country:'Australia', lat:-25.2744, lng:133.7751, count:16  },
  { country:'Japan',     lat:36.2048,  lng:138.2529, count:12  },
  { country:'Singapore', lat:1.3521,   lng:103.8198, count:11  },
  { country:'Brazil',    lat:-14.2350, lng:-51.9253, count:9   },
  { country:'France',    lat:46.2276,  lng:2.2137,   count:8   },
];

// Convert lat/lng to SVG x/y (equirectangular projection)
const toXY = (lat, lng, w=600, h=300) => ({
  x: ((lng + 180) / 360) * w,
  y: ((90 - lat) / 180) * h,
});

export default function VisitorWorldMap({ locations = null, className = '' }) {
  const data = locations || DEMO_LOCATIONS;
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div className={className}>
      <div style={{ position:'relative', width:'100%' }}>
        {/* Map SVG */}
        <svg viewBox="0 0 600 300" width="100%" style={{ display:'block' }}>
          {/* World background */}
          <rect width="600" height="300" fill="rgba(15,15,26,0.5)" rx="12"/>

          {/* Grid lines */}
          {Array.from({length:7},(_,i)=>(
            <line key={`h${i}`} x1="0" y1={i*50} x2="600" y2={i*50} stroke="rgba(99,102,241,0.06)" strokeWidth="0.5"/>
          ))}
          {Array.from({length:13},(_,i)=>(
            <line key={`v${i}`} x1={i*50} y1="0" x2={i*50} y2="300" stroke="rgba(99,102,241,0.06)" strokeWidth="0.5"/>
          ))}

          {/* Equator + prime meridian */}
          <line x1="0" y1="150" x2="600" y2="150" stroke="rgba(99,102,241,0.15)" strokeWidth="0.8"/>
          <line x1="300" y1="0" x2="300" y2="300" stroke="rgba(99,102,241,0.15)" strokeWidth="0.8"/>

          {/* Visitor dots */}
          {data.map((loc, i) => {
            const { x, y } = toXY(loc.lat, loc.lng);
            const r = 3 + (loc.count / maxCount) * 10;
            return (
              <g key={i}>
                {/* Pulse ring */}
                <circle cx={x} cy={y} r={r * 2} fill="none" stroke="#6366f1" strokeWidth="0.8" opacity="0.3">
                  <animate attributeName="r" from={r} to={r*3} dur={`${1.5 + i*0.2}s`} repeatCount="indefinite"/>
                  <animate attributeName="opacity" from="0.4" to="0" dur={`${1.5 + i*0.2}s`} repeatCount="indefinite"/>
                </circle>
                {/* Main dot */}
                <circle cx={x} cy={y} r={r} fill="#6366f1" opacity="0.85"/>
                {/* Tooltip on hover */}
                <title>{loc.country}: {loc.count} visits</title>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:'10px 16px', marginTop:12 }}>
          {data.slice(0,5).map(loc => (
            <div key={loc.country} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#8a8aaa' }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:'#6366f1', display:'inline-block' }}/>
              {loc.country} <span style={{ color:'#a78bfa', fontWeight:600 }}>{loc.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
