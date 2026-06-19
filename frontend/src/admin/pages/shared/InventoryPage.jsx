// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../utils/api';
import toast from 'react-hot-toast';

const COND_COLORS = { NEW:'#00ff88', GOOD:'#00d4ff', FAIR:'#ffd700', DAMAGED:'#ff8800', SCRAPPED:'#ff3366' };
const MOVE_TYPES = ['RESTOCK','SALE','JOB_USAGE','DAMAGE_LOSS','RETURN','TRANSFER','ADJUSTMENT'];

const Tag = ({ label, color }) => (
  <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99,
    background:`${color}22`, color, border:`1px solid ${color}44` }}>{label}</span>
);

const Input = ({ label, ...props }) => (
  <label style={{ display:'flex', flexDirection:'column', gap:4, fontSize:11, color:'#7a9ab0' }}>
    {label}
    <input {...props} style={{ padding:'0.45rem 0.7rem', background:'#0a1628', border:'1px solid #1a3050',
      borderRadius:5, color:'#e0f0ff', fontSize:13, outline:'none' }} />
  </label>
);

export default function InventoryPage({ color = '#00d4ff' }) {
  const [items, setItems]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [tab, setTab]           = useState('items'); // items | low-stock | expiring
  const [showForm, setShowForm] = useState(false);
  const [moveTarget, setMoveTarget] = useState(null);
  const [selected, setSelected] = useState(null);
  const [move, setMove]         = useState({ type:'RESTOCK', quantity:1, notes:'' });
  const [form, setForm]         = useState({
    name:'', category:'', sku:'', quantity:0, reorderLevel:5, reorderQty:10,
    unitCost:0, sellingPrice:0, supplier:'', supplierContact:'', location:'', condition:'NEW',
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const url = tab === 'low-stock' ? '/inventory/low-stock' : tab === 'expiring' ? '/inventory/expiring' : '/inventory';
      const params = {};
      if (search) params.search = search;
      const { data } = await api.get(url, { params });
      const arr = data.items || data;
      setItems(Array.isArray(arr) ? arr : []);
      setTotal(data.total || arr.length);
    } catch { toast.error('Failed to load inventory'); }
    finally { setLoading(false); }
  }, [tab, search]);

  useEffect(() => { load(); }, [load]);

  const submitItem = async (e) => {
    e.preventDefault();
    try {
      if (selected) {
        await api.patch(`/inventory/${selected._id}`, form);
        toast.success('Item updated');
      } else {
        await api.post('/inventory', form);
        toast.success('Item added');
      }
      setShowForm(false); setSelected(null);
      setForm({ name:'', category:'', sku:'', quantity:0, reorderLevel:5, reorderQty:10, unitCost:0, sellingPrice:0, supplier:'', supplierContact:'', location:'', condition:'NEW' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const recordMove = async () => {
    if (!moveTarget) return;
    try {
      await api.post('/inventory/movements', { itemId: moveTarget._id, ...move, quantity: Number(move.quantity) });
      toast.success('Movement recorded');
      setMoveTarget(null);
      setMove({ type:'RESTOCK', quantity:1, notes:'' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const editItem = (item) => {
    setSelected(item);
    setForm({ name:item.name, category:item.category, sku:item.sku||'', quantity:item.quantity,
      reorderLevel:item.reorderLevel, reorderQty:item.reorderQty, unitCost:item.unitCost,
      sellingPrice:item.sellingPrice, supplier:item.supplier||'', supplierContact:item.supplierContact||'',
      location:item.location||'', condition:item.condition });
    setShowForm(true);
  };

  const TABS = [['items','All Items'],['low-stock','⚠ Low Stock'],['expiring','⏰ Expiring']];

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", color:'#c0d8f0' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <div>
          <h2 style={{ margin:0, fontSize:20, fontWeight:700, color }}>Inventory Management</h2>
          <p style={{ margin:'4px 0 0', fontSize:12, color:'#4a6a8a' }}>{total} items</p>
        </div>
        <button onClick={() => { setSelected(null); setShowForm(true); }}
          style={{ padding:'0.5rem 1.2rem', background:color, color:'#000', border:'none', borderRadius:6, fontWeight:700, fontSize:12, cursor:'pointer' }}>
          + ADD ITEM
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:'1rem', borderBottom:'1px solid #0a2040', paddingBottom:8 }}>
        {TABS.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding:'0.35rem 0.9rem', borderRadius:4, border:'none', fontSize:11, fontWeight:700,
              background: tab===key ? `${color}22` : 'transparent',
              color: tab===key ? color : '#4a6a8a', cursor:'pointer', letterSpacing:'0.06em' }}>
            {label}
          </button>
        ))}
        <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ marginLeft:'auto', padding:'0.35rem 0.75rem', background:'#0a1628', border:'1px solid #1a3050',
            borderRadius:5, color:'#e0f0ff', fontSize:12, outline:'none', width:180 }} />
      </div>

      {loading ? <p style={{ color:'#4a6a8a' }}>Loading…</p> : (
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
          <thead>
            <tr style={{ borderBottom:'1px solid #0a2040' }}>
              {['Name','Category','Qty','Reorder At','Unit Cost','Sell Price','Condition','Actions'].map(h => (
                <th key={h} style={{ padding:'0.5rem 0.75rem', textAlign:'left', color:'#4a6a8a',
                  fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item._id} style={{ borderBottom:'1px solid #040c1a', background: i%2===0?'transparent':'#050d1a' }}>
                <td style={{ padding:'0.6rem 0.75rem', fontWeight:600, color:'#e0f0ff' }}>
                  {item.name}
                  {item.quantity <= item.reorderLevel && (
                    <span style={{ marginLeft:6, fontSize:9, color:'#ff8800', fontWeight:700 }}>⚠ LOW</span>
                  )}
                </td>
                <td style={{ padding:'0.6rem 0.75rem', color:'#7a9ab0' }}>{item.category}</td>
                <td style={{ padding:'0.6rem 0.75rem', fontWeight:700,
                  color: item.quantity === 0 ? '#ff3366' : item.quantity <= item.reorderLevel ? '#ff8800' : '#00ff88' }}>
                  {item.quantity}
                </td>
                <td style={{ padding:'0.6rem 0.75rem', color:'#7a9ab0' }}>{item.reorderLevel}</td>
                <td style={{ padding:'0.6rem 0.75rem', color:'#7a9ab0' }}>KES {item.unitCost?.toLocaleString()}</td>
                <td style={{ padding:'0.6rem 0.75rem', color:'#7a9ab0' }}>KES {item.sellingPrice?.toLocaleString()}</td>
                <td style={{ padding:'0.6rem 0.75rem' }}><Tag label={item.condition} color={COND_COLORS[item.condition]} /></td>
                <td style={{ padding:'0.6rem 0.75rem' }}>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={() => editItem(item)}
                      style={{ padding:'3px 8px', background:`${color}22`, color, border:`1px solid ${color}44`, borderRadius:4, fontSize:10, cursor:'pointer', fontWeight:700 }}>EDIT</button>
                    <button onClick={() => setMoveTarget(item)}
                      style={{ padding:'3px 8px', background:'#1a304022', color:'#7a9ab0', border:'1px solid #1a3050', borderRadius:4, fontSize:10, cursor:'pointer' }}>MOVE</button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={8} style={{ padding:'2rem', textAlign:'center', color:'#2a4a6a' }}>
                {tab === 'low-stock' ? 'All stock levels are healthy ✓' : tab === 'expiring' ? 'No items expiring soon ✓' : 'No inventory items found'}
              </td></tr>
            )}
          </tbody>
        </table>
      )}

      {/* Add/Edit Item Modal */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#060d14', border:`1px solid ${color}44`, borderRadius:12, padding:'1.5rem', width:500, maxHeight:'90vh', overflowY:'auto' }}>
            <h3 style={{ margin:'0 0 1rem', color, fontSize:16 }}>{selected ? 'Edit Item' : 'Add Item'}</h3>
            <form onSubmit={submitItem} style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <Input label="Name *" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} required style={{ gridColumn:'span 2' }} />
                <Input label="Category *" value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))} required />
                <Input label="SKU" value={form.sku} onChange={e => setForm(p=>({...p,sku:e.target.value}))} />
                <Input label="Quantity" type="number" value={form.quantity} onChange={e => setForm(p=>({...p,quantity:e.target.value}))} min={0} />
                <Input label="Reorder At" type="number" value={form.reorderLevel} onChange={e => setForm(p=>({...p,reorderLevel:e.target.value}))} min={0} />
                <Input label="Unit Cost (KES)" type="number" value={form.unitCost} onChange={e => setForm(p=>({...p,unitCost:e.target.value}))} min={0} />
                <Input label="Sell Price (KES)" type="number" value={form.sellingPrice} onChange={e => setForm(p=>({...p,sellingPrice:e.target.value}))} min={0} />
                <Input label="Supplier" value={form.supplier} onChange={e => setForm(p=>({...p,supplier:e.target.value}))} />
                <Input label="Supplier Contact" value={form.supplierContact} onChange={e => setForm(p=>({...p,supplierContact:e.target.value}))} />
                <Input label="Location" value={form.location} onChange={e => setForm(p=>({...p,location:e.target.value}))} />
                <label style={{ fontSize:11, color:'#7a9ab0', display:'flex', flexDirection:'column', gap:4 }}>
                  Condition
                  <select value={form.condition} onChange={e => setForm(p=>({...p,condition:e.target.value}))}
                    style={{ padding:'0.45rem 0.7rem', background:'#0a1628', border:'1px solid #1a3050', borderRadius:5, color:'#e0f0ff', fontSize:13 }}>
                    {['NEW','GOOD','FAIR','DAMAGED','SCRAPPED'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </label>
              </div>
              <div style={{ display:'flex', gap:10, marginTop:4 }}>
                <button type="submit" style={{ flex:1, padding:'0.6rem', background:color, color:'#000', border:'none', borderRadius:6, fontWeight:700, cursor:'pointer' }}>
                  {selected ? 'Update' : 'Add Item'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setSelected(null); }}
                  style={{ flex:1, padding:'0.6rem', background:'transparent', color:'#7a9ab0', border:'1px solid #1a3050', borderRadius:6, cursor:'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Movement Modal */}
      {moveTarget && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#060d14', border:'1px solid #1a3050', borderRadius:12, padding:'1.5rem', width:380 }}>
            <h3 style={{ margin:'0 0 0.75rem', color:'#e0f0ff', fontSize:15 }}>Stock Movement — {moveTarget.name}</h3>
            <p style={{ fontSize:12, color:'#4a6a8a', margin:'0 0 1rem' }}>Current stock: <strong style={{ color:'#e0f0ff' }}>{moveTarget.quantity}</strong></p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <label style={{ fontSize:11, color:'#7a9ab0', display:'flex', flexDirection:'column', gap:4 }}>
                Movement Type
                <select value={move.type} onChange={e => setMove(p=>({...p,type:e.target.value}))}
                  style={{ padding:'0.45rem 0.7rem', background:'#0a1628', border:'1px solid #1a3050', borderRadius:5, color:'#e0f0ff', fontSize:13 }}>
                  {MOVE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </label>
              <Input label="Quantity" type="number" value={move.quantity} onChange={e => setMove(p=>({...p,quantity:e.target.value}))} min={1} />
              <label style={{ fontSize:11, color:'#7a9ab0', display:'flex', flexDirection:'column', gap:4 }}>
                Notes
                <textarea value={move.notes} onChange={e => setMove(p=>({...p,notes:e.target.value}))} rows={2}
                  style={{ padding:'0.45rem', background:'#0a1628', border:'1px solid #1a3050', borderRadius:5, color:'#e0f0ff', fontSize:13, resize:'none', outline:'none' }} />
              </label>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:14 }}>
              <button onClick={recordMove}
                style={{ flex:1, padding:'0.6rem', background:color, color:'#000', border:'none', borderRadius:6, fontWeight:700, cursor:'pointer' }}>Record</button>
              <button onClick={() => setMoveTarget(null)}
                style={{ flex:1, padding:'0.6rem', background:'transparent', color:'#7a9ab0', border:'1px solid #1a3050', borderRadius:6, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
