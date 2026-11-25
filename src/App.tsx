import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthProvider';
import AppShell from './components/AppShell';
import KataStudioFooter from './components/KataStudioFooter';
import SignInPage from './pages/SignInPage';
import DashboardPage from './pages/DashboardPage';
import GeneratePage from './pages/GeneratePage';
import HistoryPage from './pages/HistoryPage';
import PlansPage from './pages/PlansPage';
import AccountPage from './pages/AccountPage';
import PaymentResultPage from './pages/PaymentResultPage';
import AdminPage from './pages/AdminPage';
import VideosPage from './pages/VideosPage';
// The editor carries the video player; load it only when a video is opened.
const VideoEditorPage = lazy(() => import('./pages/VideoEditorPage'));
import AiPluginPage from './pages/AiPluginPage';
import OAuthConsentPage from './pages/OAuthConsentPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 15000, retry: 1, refetchOnWindowFocus: false },
  },
});

export function ProtectedLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="screen-center">
        <span className="spinner" />
        Đang kiểm tra phiên đăng nhập…
      </div>
    );
  }

  if (!session) return <Navigate to="/signin" replace />;

  return <AppShell key={session.user.id} />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="app-root">
            <div className="app-main">
              <Routes>
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/oauth/consent" element={<OAuthConsentPage />} />
                <Route element={<ProtectedLayout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/generate" element={<GeneratePage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/plans" element={<PlansPage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/payment/result" element={<PaymentResultPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/videos" element={<VideosPage />} />
                  <Route path="/videos/:id" element={<Suspense fallback={<div className="empty-state"><span className="spinner" />Đang mở trình dựng video…</div>}><VideoEditorPage /></Suspense>} />
                  <Route path="/ai-plugin" element={<AiPluginPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <KataStudioFooter />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
