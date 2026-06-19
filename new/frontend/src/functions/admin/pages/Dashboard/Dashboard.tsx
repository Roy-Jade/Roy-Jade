import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardOverview } from '../../../../api/dashboardApi';
import { isApiError } from '../../../../api/privateApi';
import Login from '../../components/Login/Login';
import './Dashboard.scss';
import DashboardIdentity from '../../components/Dashboard/DashboardIdentity/DashboardIdentity';
import DashboardProfile from '../../components/Dashboard/DashboardProfile/DashboardProfile';
import DashboardDomain from '../../components/Dashboard/DashboardDomain/DashboardDomain';
import DashboardSoftskill from '../../components/Dashboard/DashboardSoftskill/DashboardSoftskill';
import DashboardHardskill from '../../components/Dashboard/DashboardHardskill/DashboardHardskill';
import DashboardExperience from '../../components/Dashboard/DashboardExperience/DashboardExperience';
import DashboardFormation from '../../components/Dashboard/DashboardFormation/DashboardFormation';
import DashboardLanguage from '../../components/Dashboard/DashboardLanguage/DashboardLanguage';
import DashboardHobby from '../../components/Dashboard/DashboardHobby/DashboardHobby';

export default function Dashboard() {
    const { data, error, isError } = useQuery({
        queryKey: ['dashboardOverview'],
        queryFn: getDashboardOverview,
        retry: (failureCount, err) =>
            isApiError(err) && err.status === 401 ? false : failureCount < 3,
    });

    const needsAuth = isError && isApiError(error) && error.status === 401;

    const [isLoginOpen, setIsLoginOpen] = useState(false);

    useEffect(() => {
        if (needsAuth) setIsLoginOpen(true);
    }, [needsAuth]);

    if (needsAuth) {
        return (
            <>
                <button onClick={() => setIsLoginOpen(true)}>Se connecter</button>
                <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
            </>
        );
    }

    if (!data) return null;

    return (
        <div className="dashboard-grid">
            <DashboardIdentity identity={data.identity} />
            <DashboardLanguage languages={data.language} />
            <DashboardHobby hobbies={data.hobby} />
            <DashboardDomain domains={data.domain} />
            <DashboardProfile profiles={data.profile} />
            <DashboardSoftskill softskills={data.softskill} />
            <DashboardHardskill hardskills={data.hardskill} />
            <DashboardExperience experiences={data.experience} hardskills={data.hardskill} softskills={data.softskill} domains={data.domain} />
            <DashboardFormation formations={data.formation} hardskills={data.hardskill} domains={data.domain} />
        </div>
    );
}
