// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../utils/api';
import toast from 'react-hot-toast';

const SEGMENT_COLORS = { LEAD:'#ffd700', ACTIVE:'#00ff88', INACTIVE:'#ff8800', CHURNED:'#ff3366' };
const KYC_COLORS     = { UNVERIFIED:'#ff3366', PARTIAL:'#ffd700', VERIFIED:'#00ff88' };

const Tag = ({ label, color = '#4a6a8a' }) => (
  <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99,
    background:`${color}22`, color, border:`1px solid ${color}44`, letterSpacing:'0.06em' }}>
    {label}
  </span>
);

const Input = ({ label, ...props }) => (
  <label style={{ display:'flex', flexDirection:'column', gap:4, fontSize:11, color:'#7a9ab0', letterSpacing:'0.06em' }}>
    {label}
    <input {...props} style={{ padding:'0.5rem 0.75rem', background:'#0a1628', border:'1px solid #1a3050',
      borderRadius:6, color:'#e0f0ff', fontSize:13, outline:'none', ...props.style }} />
  </label>
);

const Select = ({ label, children, ...props }) => (
  <label style={{ display:'flex', flexDirection:'column', gap:4, fontSize:11, color:'#7a9ab0', letterSpacing:'0.06em' }}>
    {label}
    <select {...props} style={{ padding:'0.5rem 0.75rem', background:'#0a1628', border:'1px solid #1a3050',
      borderRadius:6, color:'#e0f0ff', fontSize:13, outline:'none' }}>
      {children}
    </select>
  </label>
);

export default function CRMPage({ slug, color = '#00d4ff' }) {
  const [clients, setClients]         = useState([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [segment, setSegment]         = useState('');
  const [showForm, setShowForm]       = useState(false);
  const [selected, setSelected]       = useState(null);
  const [interacting, setInteracting] = useState(null);
  const [interNote, setInterNote]     = useState('');
  const [form, setForm]               = useState({
    fullName:'', phone:'', email:'', idType:'NATIONAL_ID',
    idNumber:'', segment:'LEAD', address:'', notes:''
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search)  params.search  = search;
      if (segment) params.segment = segment;
      const { data } = await api.get('/crm', { params });
      setClients(data.clients || data);
      setTotal(data.total || (data.clients || data).length);
    } catch { toast.error('Failed to load clients'); }
    finally { setLoading(false); }
  }, [search, segment]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (selected) {
        await api.patch(`/crm/${selected._id}`, form);
        toast.success('Client updated');
      } else {
        await api.post('/crm', form);
        toast.success('Client created');
      }
      setShowForm(false); setSelected(null);
      setForm({ fullName:'', phone:'', email:'', idType:'NATIONAL_ID', idNumber:'', segment:'LEAD', address:'', notes:'' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const logInteraction = async () => {
    if (!interNote.trim()) return;
    try {
      await api.post(`/crm/${interacting._id}/interactions`, { summary: interNote, type:'NOTE', outcome:'NEUTRAL' });
      toast.success('Interaction logged');
      setInteracting(null); setInterNote('');
    } catch { toast.error('Failed to log'); }
  };

  const sendPortalInvite = async (id) => {
    try {
      await api.post(`/crm/${id}/portal-invite`);
      toast.success('Portal invite sent via SMS');
    } catch { toast.error('Failed to send invite'); }
  };

  const editClient = (c) => {
    setSelected(c);
    setForm({ fullName:c.fullName, phone:c.phone, email:c.email||'', idType:c.idType||'NATIONAL_ID',
      idNumber:c.idNumber||'', segment:c.segment, address:c.address||'', notes:c.notes||'' });
    setShowForm(true);
  };

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", color:'#c0d8f0' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <div>
          <h2 style={{ margin:0, fontSize:20, fontWeight:700, color }}>CRM — Client Management</h2>
          <p style={{ margin:'4px 0 0', fontSize:12, color:'#4a6a8a' }}>{total} clients in department</p>
        </div>
        <button onClick={() => { setSelected(null); setShowForm(true); }}
          style={{ padding:'0.5rem 1.2rem', background:color, color:'#000', border:'none', borderRadius:6,
            fontWeight:700, fontSize:12, cursor:'pointer', letterSpacing:'0.06em' }}>
          + NEW CLIENT
        </button>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:12, marginBottom:'1rem' }}>
        <input placeholder="Search name or phone…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex:1, padding:'0.5rem 0.75rem', background:'#0a1628', border:'1px solid #1a3050',
            borderRadius:6, color:'#e0f0ff', fontSize:13, outline:'none' }} />
        <select value={segment} onChange={e => setSegment(e.target.value)}
          style={{ padding:'0.5rem', background:'#0a1628', border:'1px solid #1a3050', borderRadius:6, color:'#e0f0ff', fontSize:13 }}>
          <option value="">All Segments</option>
          {['LEAD','ACTIVE','INACTIVE','CHURNED'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Client table */}
      {loading ? <p style={{ color:'#4a6a8a' }}>Loading…</p> : (
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid #0a2040' }}>
                {['Name','Phone','Email','Segment','KYC','Balance (KES)','Actions'].map(h => (
                  <th key={h} style={{ padding:'0.6rem 0.75rem', textAlign:'left', color:'#4a6a8a',
                    letterSpacing:'0.08em', fontWeight:600, textTransform:'uppercase', fontSize:10 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((c, i) => (
                <tr key={c._id} style={{ borderBottom:'1px solid #040c1a', background: i%2===0?'transparent':'#050d1a' }}>
                  <td style={{ padding:'0.6rem 0.75rem', fontWeight:600, color:'#e0f0ff' }}>{c.fullName}</td>
                  <td style={{ padding:'0.6rem 0.75rem', color:'#7a9ab0' }}>{c.phone}</td>
                  <td style={{ padding:'0.6rem 0.75rem', color:'#7a9ab0' }}>{c.email || '—'}</td>
                  <td style={{ padding:'0.6rem 0.75rem' }}><Tag label={c.segment} color={SEGMENT_COLORS[c.segment]} /></td>
                  <td style={{ padding:'0.6rem 0.75rem' }}><Tag label={c.kycStatus} color={KYC_COLORS[c.kycStatus]} /></td>
                  <td style={{ padding:'0.6rem 0.75rem', color: c.outstandingBalance > 0 ? '#ff3366':'#00ff88' }}>
                    {c.outstandingBalance?.toLocaleString() || '0'}
                  </td>
                  <td style={{ padding:'0.6rem 0.75rem' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => editClient(c)}
                        style={{ padding:'3px 10px', background:`${color}22`, color, border:`1px solid ${color}44`, borderRadius:4, fontSize:10, cursor:'pointer', fontWeight:700 }}>EDIT</button>
                      <button onClick={() => setInteracting(c)}
                        style={{ padding:'3px 10px', background:'#1a304022', color:'#7a9ab0', border:'1px solid #1a3050', borderRadius:4, fontSize:10, cursor:'pointer' }}>LOG</button>
                      {!c.portalAccess && (
                        <button onClick={() => sendPortalInvite(c._id)}
                          style={{ padding:'3px 10px', background:'#00ff8822', color:'#00ff88', border:'1px solid #00ff8844', borderRadius:4, fontSize:10, cursor:'pointer' }}>INVITE</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr><td colSpan={7} style={{ padding:'2rem', textAlign:'center', color:'#2a4a6a' }}>No clients found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#060d14', border:`1px solid ${color}44`, borderRadius:12, padding:'1.5rem', width:480, maxHeight:'90vh', overflowY:'auto' }}>
            <h3 style={{ margin:'0 0 1rem', color, fontSize:16, fontWeight:700 }}>{selected ? 'Edit Client' : 'New Client'}</h3>
            <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <Input label="Full Name *" value={form.fullName} onChange={e => setForm(p=>({...p,fullName:e.target.value}))} required />
              <Input label="Phone (E.164 e.g. 254712…) *" value={form.phone} onChange={e => setForm(p=>({...p,phone:e.target.value}))} required />
              <Input label="Email" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} type="email" />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <Select label="ID Type" value={form.idType} onChange={e => setForm(p=>({...p,idType:e.target.value}))}>
                  <option>NATIONAL_ID</option><option>PASSPORT</option><option>ALIEN_ID</option>
                </Select>
                <Input label="ID Number" value={form.idNumber} onChange={e => setForm(p=>({...p,idNumber:e.target.value}))} />
              </div>
              <Select label="Segment" value={form.segment} onChange={e => setForm(p=>({...p,segment:e.target.value}))}>
                {['LEAD','ACTIVE','INACTIVE','CHURNED'].map(s => <option key={s}>{s}</option>)}
              </Select>
              <Input label="Address" value={form.address} onChange={e => setForm(p=>({...p,address:e.target.value}))} />
              <label style={{ fontSize:11, color:'#7a9ab0', letterSpacing:'0.06em', display:'flex', flexDirection:'column', gap:4 }}>
                Internal Notes
                <textarea value={form.notes} onChange={e => setForm(p=>({...p,notes:e.target.value}))} rows={3}
                  style={{ padding:'0.5rem', background:'#0a1628', border:'1px solid #1a3050', borderRadius:6,
                    color:'#e0f0ff', fontSize:13, resize:'vertical', outline:'none' }} />
              </label>
              <div style={{ display:'flex', gap:10, marginTop:4 }}>
                <button type="submit" style={{ flex:1, padding:'0.6rem', background:color, color:'#000', border:'none', borderRadius:6, fontWeight:700, fontSize:13, cursor:'pointer' }}>
                  {selected ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setSelected(null); }}
                  style={{ flex:1, padding:'0.6rem', background:'transparent', color:'#7a9ab0', border:'1px solid #1a3050', borderRadius:6, fontWeight:700, fontSize:13, cursor:'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Interaction Modal */}
      {interacting && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#060d14', border:'1px solid #1a3050', borderRadius:12, padding:'1.5rem', width:420 }}>
            <h3 style={{ margin:'0 0 0.75rem', color:'#e0f0ff', fontSize:15 }}>Log Interaction — {interacting.fullName}</h3>
            <textarea value={interNote} onChange={e => setInterNote(e.target.value)} rows={4} placeholder="Summarise the interaction…"
              style={{ width:'100%', padding:'0.5rem', background:'#0a1628', border:'1px solid #1a3050', borderRadius:6,
                color:'#e0f0ff', fontSize:13, resize:'none', outline:'none', boxSizing:'border-box' }} />
            <div style={{ display:'flex', gap:10, marginTop:12 }}>
              <button onClick={logInteraction}
                style={{ flex:1, padding:'0.6rem', background:color, color:'#000', border:'none', borderRadius:6, fontWeight:700, cursor:'pointer' }}>Log</button>
              <button onClick={() => { setInteracting(null); setInterNote(''); }}
                style={{ flex:1, padding:'0.6rem', background:'transparent', color:'#7a9ab0', border:'1px solid #1a3050', borderRadius:6, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
