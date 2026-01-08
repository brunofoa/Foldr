
import React, { useState, useMemo } from 'react';
import { CalendarEvent, Project } from '../types';

interface AgendaProps {
  events: CalendarEvent[];
  projects: Project[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onUpdateEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  onBack: () => void;
}

const Agenda: React.FC<AgendaProps> = ({ events, projects, onAddEvent, onUpdateEvent, onDeleteEvent, onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const [formData, setFormData] = useState<Omit<CalendarEvent, 'id'>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    description: '',
    type: 'shoot',
    projectId: ''
  });

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => ({
      day: prevMonthLastDay - firstDayOfMonth + i + 1,
      currentMonth: false,
      date: new Date(year, month - 1, prevMonthLastDay - firstDayOfMonth + i + 1)
    }));

    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      currentMonth: true,
      date: new Date(year, month, i + 1)
    }));

    // Fill up to 42 cells (6 rows)
    const totalCells = 42;
    const remainingCells = totalCells - prevMonthDays.length - currentMonthDays.length;
    const nextMonthDays = Array.from({ length: remainingCells }, (_, i) => ({
      day: i + 1,
      currentMonth: false,
      date: new Date(year, month + 1, i + 1)
    }));

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [currentDate]);

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });
  const yearLabel = currentDate.getFullYear();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const openAddModal = (date?: Date) => {
    setEditingEvent(null);
    setFormData({
      title: '',
      date: date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      time: '10:00',
      description: '',
      type: 'shoot',
      projectId: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    setEditingEvent(event);
    setFormData({ ...event });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      onUpdateEvent({ ...formData, id: editingEvent.id });
    } else {
      onAddEvent(formData);
    }
    setIsModalOpen(false);
  };

  const getEventsForDate = (date: Date) => {
    const dStr = date.toISOString().split('T')[0];
    return events.filter(e => e.date === dStr);
  };

  const typeColors = {
    shoot: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    meeting: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    deadline: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    other: 'bg-slate-700/50 text-slate-300 border-slate-600'
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Agenda</h1>
          <p className="text-slate-400 text-lg uppercase text-xs font-bold tracking-widest">{monthName} {yearLabel}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => openAddModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
          >
            <i className="fa-solid fa-calendar-plus"></i>
            Agendar Compromisso
          </button>
          <button onClick={onBack} className="text-slate-400 hover:text-white flex items-center gap-2 px-4">
            <i className="fa-solid fa-house"></i>
          </button>
        </div>
      </header>

      <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-900/50">
          <div className="flex gap-1">
            <button onClick={handlePrevMonth} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-700 text-slate-400 transition-all">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-all">Hoje</button>
            <button onClick={handleNextMonth} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-700 text-slate-400 transition-all">
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
          <div className="hidden sm:flex gap-4 text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Gravação</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Reunião</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Prazo</span>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-700 bg-slate-900/30">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-600">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarData.map((cell, idx) => {
            const dayEvents = getEventsForDate(cell.date);
            const isToday = cell.date.toDateString() === new Date().toDateString();

            return (
              <div
                key={idx}
                onClick={() => openAddModal(cell.date)}
                className={`min-h-[120px] p-2 border-r border-b border-slate-700 transition-all cursor-pointer hover:bg-slate-700/20 group relative ${!cell.currentMonth ? 'opacity-30' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${isToday ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {cell.day}
                  </span>
                </div>
                <div className="space-y-1 overflow-y-auto max-h-[80px] scrollbar-hide">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => openEditModal(e, event)}
                      className={`text-[10px] px-2 py-1 rounded-md border truncate font-bold ${typeColors[event.type]} hover:brightness-125 transition-all`}
                    >
                      {event.time} {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal CRUD Evento */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-slideIn">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">{editingEvent ? 'Editar Compromisso' : 'Novo Compromisso'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors text-xl">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Título</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                    placeholder="Ex: Diária Clipe Sertanejo"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Data</label>
                    <input
                      required
                      type="date"
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hora</label>
                    <input
                      required
                      type="time"
                      value={formData.time}
                      onChange={e => setFormData({ ...formData, time: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tipo</label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="shoot">Gravação</option>
                      <option value="meeting">Reunião</option>
                      <option value="deadline">Prazo / Entrega</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Vincular Projeto</label>
                    <select
                      value={formData.projectId}
                      onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="">Nenhum</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Descrição / Notas</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all resize-none"
                    placeholder="Detalhes adicionais..."
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  {editingEvent && (
                    <button
                      type="button"
                      onClick={() => { onDeleteEvent(editingEvent.id); setIsModalOpen(false); }}
                      className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold py-4 rounded-xl transition-all"
                    >
                      Excluir
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
                  >
                    {editingEvent ? 'Salvar Alterações' : 'Agendar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;
