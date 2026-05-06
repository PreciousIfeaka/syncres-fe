import { lazy, Suspense } from 'react';
import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

const AppLayout = lazy(() => import('./components/layout/AppLayout'));
const Landing = lazy(() => import('./pages/Landing'));
const Match = lazy(() => import('./pages/Match'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));

const Dashboard = lazy(() => import('./pages/app/Dashboard'));
const AppMatch = lazy(() => import('./pages/app/AppMatch'));
const Cvs = lazy(() => import('./pages/app/Cvs'));
const Applications = lazy(() => import('./pages/app/Applications'));
const Settings = lazy(() => import('./pages/app/Settings'));

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/auth/login" />;
  return <>{children}</>;
};

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function Routes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RouterRoutes>
        <Route path="/" element={<Landing />} />
        <Route path="/match" element={<Match />} />
        
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/verify-email" element={<VerifyEmail />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="match" element={<AppMatch />} />
          <Route path="cvs" element={<Cvs />} />
          <Route path="applications" element={<Applications />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </RouterRoutes>
    </Suspense>
  );
}
