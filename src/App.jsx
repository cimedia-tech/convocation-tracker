import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Login from './components/Login'
import PendingAccess from './components/PendingAccess'
import Dashboard from './components/Dashboard'
import SectionList from './components/SectionList'
import SectionDetail from './components/SectionDetail'
import TeamManager from './components/TeamManager'
import ConvocationList from './components/ConvocationList'
import ConvocationDetail from './components/ConvocationDetail'
import SessionDetail from './components/SessionDetail'
import PeopleRoster from './components/PeopleRoster'
import GroupList from './components/GroupList'

function AppRoutes() {
  const { user, userProfile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-church-background flex items-center justify-center font-technical">
        <div className="text-church-gold text-xl animate-pulse tracking-widest uppercase">Initializing System...</div>
      </div>
    )
  }

  if (!user) return <Login />
  if (userProfile?.role === 'pending') return <PendingAccess />

  return (
    <div className="min-h-screen bg-church-background text-church-textMain font-technical">
      <Navbar />
      <main>
        <Routes>
          <Route path="/"                           element={<Dashboard />} />
          <Route path="/sections"                   element={<SectionList />} />
          <Route path="/sections/:sectionId"        element={<SectionDetail />} />
          <Route path="/events"                     element={<ConvocationList />} />
          <Route path="/events/:convocationId"      element={<ConvocationDetail />} />
          <Route path="/sessions/:sessionId"        element={<SessionDetail />} />
          <Route path="/people"                     element={<PeopleRoster />} />
          <Route path="/groups"                     element={<GroupList />} />
          <Route path="/team"                       element={<TeamManager />} />
          <Route path="*"                           element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
