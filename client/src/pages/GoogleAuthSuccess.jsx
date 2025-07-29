import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const GoogleAuthSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const profileCompleted = params.get('profileCompleted');
        const userId = params.get('userId');

        if (params.get("banned") === "true") {
            toast.error("This account has been suspended for violating our community guidelines.", { duration: 3000 });
            toast("Contact support@example.com to appeal.", {
                duration: 5000,
                icon: "📩",
            });
            navigate('/auth', { replace: true });
            return;
        }


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
