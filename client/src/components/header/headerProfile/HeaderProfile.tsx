import { Avatar } from '@mui/material';
import { useLogout } from '../../../hooks/useLogout';
import { JwtUser } from '../../../hooks/useUser';
import './HeaderProfile.css';

interface HeaderProfileProps {
  user: JwtUser;
}

export const HeaderProfile = ({ user }: HeaderProfileProps) => {
  const logout = useLogout();

  return (
    <div className='header-profile-container'>
      <Avatar sx={{ width: 32, height: 32 }} src={user.picture} />
      <span onClick={logout}>Logout</span>
    </div>
  );
};