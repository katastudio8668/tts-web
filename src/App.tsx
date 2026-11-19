import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthProvider';
import AppShell from './components/AppShell';
import SignInPage from './pages/SignInPage';
import DashboardPage from './pages/DashboardPage';
import GeneratePage from './pages/GeneratePage';
import HistoryPage from './pages/HistoryPage';
import PlansPage from './pages/PlansPage';
import AccountPage from './pages/AccountPage';
import PaymentResultPage from './pages/PaymentResultPage';
const queryClient = new QueryClient({defaultOptions:{queries:{staleTime:15000,retry:1,refetchOnWindowFocus:false}}});
function ProtectedLayout(){const {session,loading}=useAuth();if(loading)return <div className="screen-center"><span className="spinner"/>Đang kiểm tra phiên đăng nhập…</div>;if(!session)return <Navigate to="/signin" replace/>;return <AppShell/>;}
export default function App(){return <QueryClientProvider client={queryClient}><AuthProvider><BrowserRouter><Routes><Route path="/signin" element={<SignInPage/>}/><Route element={<ProtectedLayout/>}><Route path="/" element={<DashboardPage/>}/><Route path="/generate" element={<GeneratePage/>}/><Route path="/history" element={<HistoryPage/>}/><Route path="/plans" element={<PlansPage/>}/><Route path="/account" element={<AccountPage/>}/><Route path="/payment/result" element={<PaymentResultPage/>}/></Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes></BrowserRouter></AuthProvider></QueryClientProvider>;}
