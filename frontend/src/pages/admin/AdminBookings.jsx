import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Search, BookOpen, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/date';

const statusColors = {
  confirmed: 'bg-emerald-500/10 text-emerald-400',
  cancelled:  'bg-red-500/10 text-red-400',
  attended:   'bg-blue-500/10 text-blue-400',
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminAPI.getAllBookings().then(res => setBookings(res.data)).finally(() => setLoading(false));
  }, []);

  const handleAttend = async (id) => {
    try {
      await adminAPI.markAttended(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'attended' } : b));
      toast.success('Marked as attended');
    } catch { toast.error('Failed'); }
  };

  const filtered = bookings.filter(b =>
    b.member?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.session?.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="page-title">All Bookings</h1>
        <p className="text-zinc-500 mt-1">{bookings.length} total bookings</p>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input className="input pl-9" placeholder="Search by member or session..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.04] border-b border-white/10">
              <tr>
                {['Member', 'Session', 'Date & Time', 'Status', 'Booked At'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.07]">
              {filtered.map(b => (
                <tr key={b.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-brand-500 text-black rounded-full flex items-center justify-center text-xs font-bold">
                        {b.member?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{b.member?.name}</p>
                        <p className="text-xs text-zinc-500">{b.member?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-300">{b.session?.title}</td>
                  <td className="px-4 py-3 text-zinc-400">
                    <p>{formatDate(b.session?.date)}</p>
                    <p className="text-xs">{b.session?.startTime}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statusColors[b.status]} capitalize`}>{b.status}</span>
                    {b.status === 'confirmed' && (
                      <button onClick={() => handleAttend(b.id)} className="ml-2 text-xs text-blue-400 hover:underline flex items-center gap-1 mt-1">
                        <CheckCircle size={12} /> Mark Attended
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(b.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-zinc-600">
              <BookOpen size={40} className="mx-auto mb-2 opacity-30" />
              <p>No bookings found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
