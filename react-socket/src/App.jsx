import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import './App.css'

// Configuration
const SITE_NAME = 'arcpos.aninda.me'
const BEARER_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYXptaW5AZXhjZWxiZC5jb20iLCJleHAiOjE3NzAwMzkwNTksImlhdCI6MTc3MDAzNTQ1OSwidHlwZSI6ImFjY2VzcyJ9.R13NjohGl1wSGKlk9wo9RNMb1fBFJHd8uXb7J1P8b8s'
const USER_EMAIL = 'azmin@excelbd.com'

// Socket URL: Use proxy in dev, direct URL in production
const SOCKET_URL = import.meta.env.DEV ? '' : `https://${SITE_NAME}`
const NAMESPACE = `/${SITE_NAME}`

function App() {
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [sessionId, setSessionId] = useState(null)
  const [events, setEvents] = useState([])
  const [joinedRooms, setJoinedRooms] = useState([])
  const socketRef = useRef(null)
  const eventsEndRef = useRef(null)

  const addEvent = (eventName, data, type) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false })
    setEvents(prev => [...prev, {
      id: Date.now(),
      timestamp,
      eventName,
      data,
      type
    }])
  }

  useEffect(() => {
    // Create socket connection
    // In dev: uses Vite proxy (empty URL). In prod: connects directly to server
    const socket = io(`${SOCKET_URL}${NAMESPACE}`, {
      path: '/socket.io',
      // Pass auth via handshake (works with browser WebSocket)
      auth: {
        token: BEARER_TOKEN,
        site: SITE_NAME,
      },
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    // Connection events
    socket.on('connect', () => {
      setConnectionStatus('connected')
      setSessionId(socket.id)

      // Join user-specific room
      const userRoom = `${SITE_NAME}:user:${USER_EMAIL}`
      socket.emit('room:join', userRoom)

      // Join doctype rooms
      const doctypesToWatch = ['Sales Invoice', 'POS Invoice', 'ToDo', 'Notification Log']
      for (const doctype of doctypesToWatch) {
        const doctypeRoom = `${SITE_NAME}:doctype:${doctype}`
        socket.emit('room:join', doctypeRoom)
      }
    })

    socket.on('connect_error', (error) => {
      setConnectionStatus('error')
      addEvent('connect_error', { message: error.message }, 'error')
    })

    socket.on('disconnect', (reason) => {
      setConnectionStatus('disconnected')
      addEvent('disconnect', { reason }, 'warning')
    })

    // Room confirmations
    socket.on('room:joined', (data) => {
      setJoinedRooms(prev => [...prev, data])
    })

    // Frappe document events
    socket.on('doc_update', (data) => addEvent('doc_update', data, 'info'))
    socket.on('list_update', (data) => addEvent('list_update', data, 'success'))

    // Notification events
    socket.on('new_notification', (data) => addEvent('new_notification', data, 'notification'))
    socket.on('notification', (data) => addEvent('notification', data, 'notification'))

    // Message events
    socket.on('msgprint', (data) => addEvent('msgprint', data, 'info'))
    socket.on('eval_js', (data) => addEvent('eval_js', data, 'warning'))
    socket.on('progress', (data) => addEvent('progress', data, 'info'))

    // Catch-all for unknown events
    socket.onAny((eventName, data) => {
      const knownEvents = [
        'connect', 'disconnect', 'connect_error',
        'room:joined', 'room:left',
        'doc_update', 'list_update',
        'new_notification', 'notification',
        'msgprint', 'eval_js', 'progress', 'pong'
      ]
      if (!knownEvents.includes(eventName)) {
        addEvent(eventName, data, 'other')
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events])

  const clearEvents = () => {
    setEvents([])
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#22c55e'
      case 'error': return '#ef4444'
      default: return '#f59e0b'
    }
  }

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'success': return '#22c55e'
      case 'error': return '#ef4444'
      case 'warning': return '#f59e0b'
      case 'notification': return '#8b5cf6'
      case 'info': return '#3b82f6'
      default: return '#6b7280'
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Frappe Socket.IO Events</h1>
        <div className="connection-info">
          <div className="status-indicator" style={{ backgroundColor: getStatusColor() }} />
          <span className="status-text">{connectionStatus}</span>
          {sessionId && <span className="session-id">ID: {sessionId}</span>}
        </div>
      </header>

      <div className="config-panel">
        <div className="config-item">
          <span className="config-label">URL:</span>
          <span className="config-value">{SOCKET_URL || '(dev proxy)'}{NAMESPACE}</span>
        </div>
        <div className="config-item">
          <span className="config-label">Namespace:</span>
          <span className="config-value">{NAMESPACE}</span>
        </div>
        <div className="config-item">
          <span className="config-label">User:</span>
          <span className="config-value">{USER_EMAIL}</span>
        </div>
      </div>

      {joinedRooms.length > 0 && (
        <div className="rooms-panel">
          <h3>Joined Rooms</h3>
          <div className="rooms-list">
            {joinedRooms.map((room, index) => (
              <span key={index} className="room-badge">
                {typeof room === 'object' ? JSON.stringify(room) : room}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="events-panel">
        <div className="events-header">
          <h2>Events ({events.length})</h2>
          <button onClick={clearEvents} className="clear-btn">Clear</button>
        </div>

        <div className="events-list">
          {events.length === 0 ? (
            <div className="no-events">Waiting for events...</div>
          ) : (
            events.map(event => (
              <div key={event.id} className="event-card" style={{ borderLeftColor: getEventTypeColor(event.type) }}>
                <div className="event-header">
                  <span className="event-name" style={{ color: getEventTypeColor(event.type) }}>
                    {event.eventName}
                  </span>
                  <span className="event-time">{event.timestamp}</span>
                </div>
                <div className="event-data">
                  {typeof event.data === 'object' && event.data !== null ? (
                    Object.entries(event.data).map(([key, value]) => (
                      <div key={key} className="data-row">
                        <span className="data-key">{key}:</span>
                        <span className="data-value">{JSON.stringify(value)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="data-row">
                      <span className="data-value">{String(event.data)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={eventsEndRef} />
        </div>
      </div>
    </div>
  )
}

export default App
