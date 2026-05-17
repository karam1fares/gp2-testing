"use client";
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import "./ShipmentCalendar.css";

const ShipmentCalendar = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  const [newNote, setNewNote] = useState({
    title: '',
    description: '',
    start: '',
    end: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem("jamrik_calendar");
    if (saved) setEvents(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("jamrik_calendar", JSON.stringify(events));
  }, [events]);

  // NEW: When clicking a blank day (Create)
  const handleDateClick = (arg: any) => {
    setSelectedEventId(null); // Ensure we aren't in edit mode
    setNewNote({ title: '', description: '', start: arg.dateStr, end: arg.dateStr });
    setIsModalOpen(true);
  };

  // NEW: When clicking an existing note (View/Delete)
  const handleEventClick = (clickInfo: any) => {
    setSelectedEventId(clickInfo.event.id);
    setNewNote({
      title: clickInfo.event.title,
      description: clickInfo.event.extendedProps.description || '',
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr || clickInfo.event.startStr
    });
    setIsModalOpen(true);
  };

  const handleSaveNote = () => {
    if (newNote.title) {
      const eventToAdd = {
        id: Math.random().toString(36).substr(2, 9), // Give it a unique ID
        title: newNote.title,
        start: newNote.start,
        end: newNote.end,
        description: newNote.description,
        color: "#000000"
      };
      setEvents([...events, eventToAdd]);
      setIsModalOpen(false);
    }
  };

  const handleDeleteNote = () => {
    if (selectedEventId) {
      setEvents(events.filter(event => event.id !== selectedEventId));
      setIsModalOpen(false);
    }
  };

  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick} // Hook up the click listener
      />

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{selectedEventId ? "Manage Note" : "Add New Note"}</h3>
            
            <label>Title</label>
            <input type="text" value={newNote.title} readOnly={!!selectedEventId}
              onChange={(e) => setNewNote({...newNote, title: e.target.value})} />

            <label>Description</label>
            <textarea value={newNote.description} readOnly={!!selectedEventId}
              onChange={(e) => setNewNote({...newNote, description: e.target.value})} />

            <div className="date-row">
              <div><label>From</label><input type="date" value={newNote.start} readOnly={!!selectedEventId} /></div>
              <div><label>To</label><input type="date" value={newNote.end} readOnly={!!selectedEventId} /></div>
            </div>

            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Close</button>
              
              {/* Show DELETE if editing, show SAVE if creating */}
              {selectedEventId ? (
                <button className="btn-delete" onClick={handleDeleteNote}>Remove Note</button>
              ) : (
                <button className="btn-save" onClick={handleSaveNote}>Save Note</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentCalendar;