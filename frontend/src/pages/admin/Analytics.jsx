import { useState, useEffect } from 'react';
import { analyticsAPI, contactAPI } from '@services/api';

// ── tiny recharts wrapper ─────────────────────────────────
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#a78bfa','#60a5fa','#34d399','#f472b6','#fb923c','#22d3ee'];

const card  = { background:'#0f0f1a', border:'1px solid #1e1e2e', borderRadius:14, padding:'20px 22px' };
const cTitle= { fontSize:11, textTransform:'uppercase', letterSpacing:'2px', color:'#3a3a5a', marginBottom:16 };

const Stat = ({ label, value, sub, color='#a78bfa' }) => (
  <div style={{ ...card, display:'flex', flexDirection:'column', gap:4 }}>
    <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a' }}>{label}</div>
    <div style={{ fontSize:32, fontWeight:800, color, fontFamily:'Syne,sans-serif', lineHeight:1 }}>{value ?? '—'}</div>
    {sub && <div style={{ fontSize:11, color:'#4a4a6a' }}>{sub}</div>}
  </div>
);

const Row = ({ label, value, bar, total }) => (
  <div style={{ marginBottom:10 }}>
    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
      <span style={{ color:'#8a8aaa', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'70%' }}>{label || 'Unknown'}</span>
      <span style={{ color:'#c4b5fd', fontWeight:600 }}>{value}</span>
    </div>
    {bar && total > 0 && (
      <div style={{ height:4, background:'#1a1a2e', borderRadius:2, overflow:'hidden' }}>
        <div style={{ height:4, borderRadius:2, background:'linear-gradient(90deg,#a78bfa,#60a5fa)', width:`${Math.round((value/total)*100)}%`, transition:'width 0.6s' }} />
      </div>
    )}
  </div>
);

const ttStyle = { backgroundColor:'#1a1a2e', border:'1px solid #2e2a4a', borderRadius:8, color:'#e8e6f0', fontSize:12 };

export default function AdminAnalytics() {
  const [period, setPeriod]       = useState('7d');
  const [data, setData]           = useState(null);
  const [realtime, setRealtime]   = useState(null);
  const [contactStats, setContactStats] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [realtimeInterval, setRealtimeInterval] = useState(null);

  const load = async (p) => {
    setLoading(true);
    try {
      const [dash, rt, cs] = await Promise.allSettled([
        analyticsAPI.getDashboard({ period: p }),
        analyticsAPI.getRealTime(),
        contactAPI.getStats(),
      ]);
      setData(dash.value?.data?.data || null);
      setRealtime(rt.value?.data?.data || null);
      setContactStats(cs.value?.data?.data || null);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    load(period);
    // Refresh realtime every 30s
    const iv = setInterval(async () => {
      try {
        const r = await analyticsAPI.getRealTime();
        setRealtime(r.data?.data || null);
      } catch {}
    }, 30000);
    return () => clearInterval(iv);
  }, [period]);

  const ov = data?.overview || {};

  // Build contact summary numbers
  const totalContacts = contactStats?.total?.[0]?.count || 0;
  const weekContacts  = contactStats?.recentWeek?.[0]?.count || 0;
  const byStatus      = contactStats?.byStatus || [];
  const byCategory    = contactStats?.byCategory || [];
  const replied       = byStatus.find(x => x._id === 'replied')?.count || 0;
  const responseRate  = totalContacts > 0 ? Math.round((replied / totalContacts) * 100) : 0;

  // Format daily views for chart
  const chartData = (data?.dailyViews || []).map(d => ({
    date: d._id?.slice(5) || d._id,
    views: d.pageViews,
    visitors: d.uniqueVisitors,
  }));

  return (
    <div style={{ color:'#e8e6f0', fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');`}</style>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:800, letterSpacing:'-0.5px' }}>Analytics</div>
          <div style={{ fontSize:13, color:'#4a4a6a', marginTop:3 }}>Visitor tracking & contact insights</div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {['24h','7d','30d','90d'].map(p => (
            <button key={p} onClick={() => { setPeriod(p); load(p); }}
              style={{ padding:'7px 14px', borderRadius:8, fontSize:12, fontWeight:600, border:'none', cursor:'pointer', fontFamily:'inherit',
                background: period===p ? 'linear-gradient(135deg,#a78bfa,#60a5fa)' : '#1a1a2e',
                color: period===p ? '#fff' : '#6a6a8a' }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Realtime badge */}
      {realtime && (
        <div style={{ background:'linear-gradient(135deg,#0d2a1f,#0f1a2e)', border:'1px solid #1a4a35', borderRadius:12, padding:'12px 18px', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'#34d399', boxShadow:'0 0 8px #34d399', animation:'pulse 2s infinite' }} />
          <span style={{ fontSize:13, color:'#6a6a8a' }}>
            <strong style={{ color:'#34d399' }}>{realtime.activeVisitors}</strong> active visitor{realtime.activeVisitors!==1?'s':''} right now
            {realtime.recentPageViews?.length > 0 && (
              <span style={{ marginLeft:16, color:'#4a4a6a' }}>
                Last page: <strong style={{ color:'#8a8aaa' }}>{realtime.recentPageViews[0]?.path}</strong>
              </span>
            )}
          </span>
        </div>
      )}

      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
          {Array.from({length:4}).map((_,i) => <div key={i} style={{ height:90, background:'#0f0f1a', borderRadius:14, opacity:0.4 }} />)}
        </div>
      ) : (
        <>
          {/* ── VISITOR STATS ───────────────────────────── */}
          <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'2px', color:'#3a3a5a', marginBottom:12 }}>Visitor Stats ({period})</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14, marginBottom:24 }}>
            <Stat label="Page Views"       value={ov.pageViews?.toLocaleString()}    color="#a78bfa" sub="Total pages loaded" />
            <Stat label="Unique Visitors"  value={ov.uniqueVisitors?.toLocaleString()} color="#60a5fa" sub="Distinct sessions" />
            <Stat label="Project Views"    value={ov.projectViews?.toLocaleString()} color="#34d399" sub="Project detail opens" />
            <Stat label="Resume Downloads" value={ov.resumeDownloads?.toLocaleString()} color="#f472b6" sub="PDF downloads" />
          </div>

          {/* ── CHARTS ROW ──────────────────────────────── */}
          {chartData.length > 0 && (
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20, marginBottom:20 }}>
              <div style={card}>
                <div style={cTitle}>Views Over Time</div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                    <XAxis dataKey="date" stroke="#4a4a6a" tick={{fontSize:11}} />
                    <YAxis stroke="#4a4a6a" tick={{fontSize:11}} />
                    <Tooltip contentStyle={ttStyle} />
                    <Legend wrapperStyle={{fontSize:12}} />
                    <Line type="monotone" dataKey="views"    stroke="#a78bfa" strokeWidth={2} dot={false} name="Page Views" />
                    <Line type="monotone" dataKey="visitors" stroke="#60a5fa" strokeWidth={2} dot={false} name="Unique Visitors" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={card}>
                <div style={cTitle}>Devices</div>
                {(data?.deviceBreakdown || []).length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={data.deviceBreakdown} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={({_id,percent})=>`${_id||'?'} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                        {data.deviceBreakdown.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={ttStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <div style={{ padding:'60px 0', textAlign:'center', color:'#3a3a5a', fontSize:13 }}>No device data yet</div>}
              </div>
            </div>
          )}

          {/* ── TOP PAGES + PROJECTS ───────────────────── */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
            <div style={card}>
              <div style={cTitle}>Top Pages</div>
              {(data?.topPages || []).length === 0
                ? <div style={{ padding:'20px 0', textAlign:'center', color:'#3a3a5a', fontSize:13 }}>No page view data yet.<br/>Add <code style={{color:'#a78bfa'}}>usePageTracking()</code> to your pages.</div>
                : (data.topPages).map(p => <Row key={p._id} label={p._id} value={p.count} bar total={ov.pageViews} />)}
            </div>
            <div style={card}>
              <div style={cTitle}>Top Projects</div>
              {(data?.topProjects || []).length === 0
                ? <div style={{ padding:'20px 0', textAlign:'center', color:'#3a3a5a', fontSize:13 }}>No project views yet</div>
                : data.topProjects.map(p => <Row key={p._id} label={p.title||p._id} value={p.views} bar total={ov.projectViews} />)}
            </div>
          </div>

          {/* ── TRAFFIC + GEO ──────────────────────────── */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
            <div style={card}>
              <div style={cTitle}>Traffic Sources</div>
              {(data?.trafficSources || []).length === 0
                ? <div style={{ padding:'20px 0', textAlign:'center', color:'#3a3a5a', fontSize:13 }}>No referrer data yet</div>
                : data.trafficSources.slice(0,8).map(s => <Row key={s._id} label={s._id||'Direct'} value={s.count} bar total={ov.pageViews} />)}
            </div>
            <div style={card}>
              <div style={cTitle}>Countries</div>
              {(data?.geographicalDistribution || []).length === 0
                ? <div style={{ padding:'20px 0', textAlign:'center', color:'#3a3a5a', fontSize:13 }}>No geo data yet</div>
                : data.geographicalDistribution.slice(0,8).map(g => <Row key={g._id} label={g._id||'Unknown'} value={g.count} bar total={ov.pageViews} />)}
            </div>
          </div>

          {/* ── CONTACT STATS ───────────────────────────── */}
          <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'2px', color:'#3a3a5a', marginBottom:12 }}>Contact Form Stats</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14, marginBottom:20 }}>
            <Stat label="Total Messages"  value={totalContacts}  color="#60a5fa" sub="All time" />
            <Stat label="This Week"       value={weekContacts}   color="#34d399" sub="Last 7 days" />
            <Stat label="Replied"         value={replied}        color="#a78bfa" sub="Marked as replied" />
            <Stat label="Response Rate"   value={`${responseRate}%`} color={responseRate>50?'#34d399':'#f87171'} sub="Replied / Total" />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            <div style={card}>
              <div style={cTitle}>By Status</div>
              {byStatus.length === 0
                ? <div style={{ padding:'20px 0', textAlign:'center', color:'#3a3a5a', fontSize:13 }}>No contact data yet</div>
                : byStatus.map(s => <Row key={s._id} label={s._id} value={s.count} bar total={totalContacts} />)}
            </div>
            <div style={card}>
              <div style={cTitle}>By Category</div>
              {byCategory.length === 0
                ? <div style={{ padding:'20px 0', textAlign:'center', color:'#3a3a5a', fontSize:13 }}>No category data yet</div>
                : byCategory.map(c => <Row key={c._id} label={c._id} value={c.count} bar total={totalContacts} />)}
            </div>
          </div>

          {/* Tracking setup hint */}
          {ov.pageViews === 0 && (
            <div style={{ marginTop:20, background:'linear-gradient(135deg,#16122a,#0f1a2e)', border:'1px solid #28244a', borderRadius:14, padding:'18px 22px', fontSize:13, color:'#6a6a8a', lineHeight:1.7 }}>
              <strong style={{ color:'#a78bfa' }}>📊 Enable Visitor Tracking</strong><br/>
              To start collecting data, add <code style={{ color:'#60a5fa', background:'#1a1a2e', padding:'1px 6px', borderRadius:4 }}>usePageTracking()</code> to your public pages.<br/>
              Copy <strong style={{ color:'#c4b5fd' }}>useAnalytics.js</strong> to <code style={{ color:'#60a5fa' }}>frontend/src/hooks/useAnalytics.js</code>, then import and call it in Home, About, Projects, Contact, ProjectDetail pages.
            </div>
          )}
        </>
      )}
    </div>
  );
}
