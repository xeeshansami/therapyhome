import { useSelector } from 'react-redux';
import { can } from './permissions';

/** (module, action) => boolean for the signed-in admin. */
export const useCan = () => {
    const user = useSelector((s) => s.user.currentUser);
    return (module, action = 'view') => can(user, module, action);
};
