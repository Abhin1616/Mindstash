import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleAuthSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const profileCompleted = params.get('profileCompleted');
        const userId = params.get('userId');
        if (profileCompleted === 'true') {
            navigate('/', { replace: true });
        } else {
            navigate(`/complete-profile?userId=${userId}`, { replace: true });
        }
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center text-lg font-medium text-gray-600 dark:text-gray-300">
            Redirecting...
        </div>
    );
};

export default GoogleAuthSuccess;
