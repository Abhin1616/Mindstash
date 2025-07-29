import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supportEmail } from '../constants';
const GoogleAuthSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const profileCompleted = params.get('profileCompleted');
        const userId = params.get('userId');

        if (params.get("banned") === "true") {
            toast.error("This account has been suspended for violating our community guidelines.", { duration: 4000 });
            setTimeout(() => {
                toast(`Contact ${supportEmail} to appeal.`, {
                    duration: 7000,
                    icon: "📩",
                });
            }, 1000);
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
