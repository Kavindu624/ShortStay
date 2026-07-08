import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { Calendar, ChevronLeft, ChevronRight, Plus, X, RotateCcw, AlertTriangle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

function buildCalendar(year, month) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const days = [];
  // pad start
  for (let i = 0; i < start.getDay(); i++) days.push(null);
  for (let d = 1; d <= end.getDate(); d++) {
    const dt = new Date(year, month, d);
    // Correct for timezone offset before converting to ISO string
    const tzoffset = dt.getTimezoneOffset() * 60000;
    const str = new Date(dt.getTime() - tzoffset).toISOString().split('T')[0];
    days.push({ date: d, str, isPast: dt < new Date(new Date().setHours(0, 0, 0, 0)) });
  }
  return days;
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function HostCalendar() {
  const now = new Date();
  const [searchParams] = useSearchParams();
  const initialProp = searchParams.get('property') || '';

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [properties, setProperties] = useState([]);
  const [selectedProp, setSelectedProp] = useState(initialProp);
  const [availability, setAvailability] = useState([]); // list of available date strings
  const [bookedDates, setBookedDates] = useState([]); // list of booked date strings
  const [selected, setSelected] = useState(new Set());
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);

  useEffect(() => {
    api.get('/properties/host/my-properties').then(r => {
      const props = r.data || [];
      setProperties(props);
      if (props.length > 0 && !selectedProp) {
        // If initialProp is passed but doesn't exist, it will fallback to the first one in the select
        setSelectedProp(initialProp || String(props[0].property_id));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedProp) return;
    api.get(`/availability/calendar/${selectedProp}`)
      .then(r => {
        setAvailability(r.data.available_dates || []);
        setBookedDates(r.data.booked_dates || []);
        setSelected(new Set());
      })
      .catch(() => {});
  }, [selectedProp]);

  const days = buildCalendar(year, month);

  const toggleDay = (str, isPast) => {
    if (isPast) return;
    setSelected(prev => {
      const next = new Set(prev);
      next.has(str) ? next.delete(str) : next.add(str);
      return next;
    });
  };

  const addDates = async () => {
    if (selected.size === 0) return;
    setMsg(''); setLoading(true);
    try {
      await api.post('/availability/add', { property_id: Number(selectedProp), dates: [...selected] });
      setAvailability(prev => [...new Set([...prev, ...selected])]);
      setSelected(new Set());
      setMsg('Dates added successfully!');
    } catch (err) { setMsg(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const removeDates = async () => {
    if (selected.size === 0) return;
    setMsg(''); setLoading(true);
    try {
      await api.delete('/availability/remove', { data: { property_id: Number(selectedProp), dates: [...selected] } });
      setAvailability(prev => prev.filter(d => !selected.has(d)));
      setSelected(new Set());
      setMsg('Dates blocked successfully!');
    } catch (err) { setMsg(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const confirmFullSchedule = async () => {
    setMsg(''); setLoading(true);
    try {
      await api.post('/availability/set', { property_id: Number(selectedProp), dates: [...selected] });
      setAvailability([...selected]);
      setSelected(new Set());
      setMsg('Availability schedule updated!');
      setShowReplaceModal(false);
    } catch (err) { setMsg(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-title">Availability Calendar</div>
        <div className="page-subtitle">Manage available and blocked dates for your properties. <strong style={{ color: 'var(--primary)' }}>Note: You are marking the nights the guest will stay.</strong> A guest can check out on the morning of a blocked date.</div>
      </div>

      {/* Property selector */}
      {properties.length > 1 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <label className="form-label">Select Property</label>
          <select className="form-input" style={{ maxWidth: 360 }} value={selectedProp} onChange={e => setSelectedProp(e.target.value)}>
            {properties.map(p => <option key={p.property_id} value={p.property_id}>{p.title}</option>)}
          </select>
        </div>
      )}

      {msg && <div className={`alert ${msg.includes('successfully') || msg.includes('updated') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 16 }}>{msg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
        {/* Calendar */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><ChevronLeft size={20} /></button>
            <h3 style={{ fontWeight: 700, fontSize: 16 }}>{MONTHS[month]} {year}</h3>
            <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><ChevronRight size={20} /></button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {days.map((day, i) => {
              if (!day) return <div key={i} />;
              const isAvailable = availability.includes(day.str);
              const isBooked = bookedDates.includes(day.str);
              const isSelected = selected.has(day.str);
              
              let bg = 'white';
              let col = 'var(--text-main)';
              
              if (isSelected) {
                bg = 'var(--primary)';
                col = 'white';
              } else if (isBooked) {
                bg = '#fee2e2'; // Light red
                col = '#dc2626'; // Red text
              } else if (isAvailable) {
                bg = '#d1fae5';
                col = '#065f46';
              } else if (day.isPast) {
                bg = '#f9fafb';
                col = '#d1d5db';
              }

              return (
                <button
                  key={day.str}
                  onClick={() => toggleDay(day.str, day.isPast || isBooked)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 8,
                    border: isSelected ? '2px solid var(--primary)' : '2px solid transparent',
                    background: bg,
                    color: col,
                    cursor: (day.isPast || isBooked) ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    fontSize: 13,
                    textAlign: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  {day.date}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
            {[
              { color: '#d1fae5', text: 'Available' },
              { color: 'var(--primary)', text: 'Selected' },
              { color: '#fee2e2', text: 'Booked' },
              { color: 'white', border: '1px solid #e5e7eb', text: 'Unavailable' },
            ].map(l => (
              <div key={l.text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: l.color, border: l.border || 'none' }} />
                {l.text}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <h4 style={{ fontWeight: 700, marginBottom: 8 }}>Selection</h4>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
              {selected.size === 0 ? 'Click dates on the calendar to select them.' : `${selected.size} date${selected.size !== 1 ? 's' : ''} selected`}
            </p>
            {selected.size > 0 && (
              <button onClick={() => setSelected(new Set())} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                <X size={12} /> Clear selection
              </button>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: 6 }} onClick={addDates} disabled={loading || selected.size === 0}>
                <Plus size={14} /> Mark as Available
              </button>
              <button className="btn-danger" style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: 6 }} onClick={removeDates} disabled={loading || selected.size === 0}>
                <X size={14} /> Block Dates
              </button>
              <button className="btn-outline" style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: 6, fontSize: 12 }} onClick={() => setShowReplaceModal(true)} disabled={loading || selected.size === 0}>
                <RotateCcw size={13} /> Set as Full Schedule
              </button>
            </div>
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #bfdbfe' }}>
            <h4 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>Tips</h4>
            <ul style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, paddingLeft: 18 }}>
              <li style={{ marginBottom: 6 }}>Green dates are currently available for bookings</li>
              <li style={{ marginBottom: 6 }}>Click dates to select them, then use the buttons to mark or block</li>
              <li>"Set Full Schedule" replaces all availability with your selection</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Replace Schedule Modal */}
      {showReplaceModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 400, maxWidth: '90%', textAlign: 'center', padding: '32px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={24} color="#d97706" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: '#111827' }}>Replace Schedule?</h2>
            <p style={{ color: '#4b5563', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
              This will replace the <strong>entire</strong> availability schedule for this property with only the currently selected dates. All unselected dates will be blocked. Continue?
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-primary" onClick={confirmFullSchedule} disabled={loading} style={{ flex: 1, background: '#d97706', justifyContent: 'center' }}>
                {loading ? 'Saving...' : 'Yes, Replace'}
              </button>
              <button className="btn-outline" onClick={() => setShowReplaceModal(false)} disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
