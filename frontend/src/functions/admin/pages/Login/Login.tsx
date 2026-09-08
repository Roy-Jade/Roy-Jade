import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAdminSession } from '../../../core/hooks/useAdminSession';
import LoginDialog from '../../components/Login/Login';

export default function Login() {
    const { data: session, isLoading } = useAdminSession();
    const navigate = useNavigate();

    useEffect(() => {
        if (session?.isAdmin) navigate('/cv', { replace: true });
    }, [session, navigate]);

    if (isLoading || session?.isAdmin) return null;

    return <LoginDialog isOpen={true} onClose={() => navigate('/cv', { replace: true })} />;
}
