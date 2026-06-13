import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
interface Props {
  children: ReactNode;
  requiredRoles?: string[];
}
export default function ProtectedRoute({ children, requiredRoles }: Props) {
  const { isAuthenticated, isLoading } = useAuth();

  const { t } = useLanguage();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (requiredRoles && requiredRoles.length > 0) {
    const user = JSON.parse(localStorage.getItem('snakes_user') || '{}');
    if (!requiredRoles.includes(user.role)) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 pt-20">
          <div className="glass-card p-8 text-center max-w-md">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-xl font-bold mb-2">
              {t('admin.insufficientPerms')}
            </h2>
          </div>
        </div>
      );
    }
  }
  return <>{children}</>;
}
