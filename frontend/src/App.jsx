import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import UploadPage from './pages/UploadPage'
import ProcessingPage from './pages/ProcessingPage'
import ListingPage from './pages/ListingPage'
import VariantsPage from './pages/VariantsPage'
import QAPage from './pages/QAPage'
import PastListingsPage from './pages/PastListingsPage'
import AccountSettingsPage from './pages/AccountSettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/upload" replace />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/processing" element={<ProcessingPage />} />
        <Route path="/listing" element={<ListingPage />} />
        <Route path="/variants" element={<VariantsPage />} />
        <Route path="/qa" element={<QAPage />} />
        <Route path="/history" element={<PastListingsPage />} />
        <Route path="/settings" element={<AccountSettingsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
