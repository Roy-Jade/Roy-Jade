import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAdminSession } from '../../../core/hooks/useAdminSession';
import { getLastVisitedPath } from '../../../core/hooks/useTrackLastVisitedPath';
import LoginDialog from '../../components/Login/Login';

export default function Login() {
    const { data: session, isLoading } = useAdminSession();
    const navigate = useNavigate();
    const hasNavigatedBack = useRef(false);

    const goBackOrToCv = useCallback(() => {
        if (hasNavigatedBack.current) return;
        hasNavigatedBack.current = true;
        navigate(getLastVisitedPath() ?? '/cv', { replace: true });
    }, [navigate]);

    useEffect(() => {
        if (session?.isAdmin) goBackOrToCv();
    }, [session, goBackOrToCv]);

    if (isLoading || session?.isAdmin) return null;

    return <LoginDialog isOpen={true} onClose={goBackOrToCv} />;
}
