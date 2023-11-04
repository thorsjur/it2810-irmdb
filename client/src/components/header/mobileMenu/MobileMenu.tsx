import { Google, Logout } from '@mui/icons-material';
import { Avatar, Divider, IconButton, ListItemIcon, Menu, MenuItem, Tooltip } from '@mui/material';
import { useGoogleLogin } from '@react-oauth/google';
import { useWindowSize } from '@uidotdev/usehooks';
import React from 'react';
import { useLogout } from '../../../hooks/useLogout';
import { JwtUser } from '../../../hooks/useUser';
import { onLoginSuccessToken } from '../../login/onLogin';

interface MobileMenuProps {
  user: JwtUser | null;
}

export const MobileMenu = ({ user }: MobileMenuProps) => {
  const [anchorElement, setAnchorElement] = React.useState<null | HTMLElement>(null);
  const isOpen = Boolean(anchorElement);
  const logout = useLogout();
  const login = useGoogleLogin({ onSuccess: onLoginSuccessToken });
  const { width } = useWindowSize();

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElement(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorElement(null);
  };

  // This account menu is directly inspired by the one in the Material UI docs: https://mui.com/material-ui/react-menu/#account-menu
  return (
    <>
      <Tooltip title='Account'>
        <IconButton
          onClick={handleMenuClick}
          size='small'
          sx={{ 'ml': width && width < 340 ? 0 : 2, '.MuiTouchRipple-root': { display: 'none' } }}
          aria-controls={isOpen ? 'account-menu' : undefined}
          aria-haspopup='true'
          aria-expanded={isOpen ? 'true' : undefined}
        >
          <Avatar sx={{ width: 32, height: 32 }}>{user?.name.charAt(0) || '?'}</Avatar>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorElement}
        id='account-menu'
        open={isOpen}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            'overflow': 'visible',
            'filter': 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            'mt': 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {user ? (
          <div>
            <MenuItem
              style={{ backgroundColor: 'transparent', cursor: 'default' }}
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar src={user?.picture} /> {user?.name}
            </MenuItem>
            <Divider />
            <MenuItem onClick={logout}>
              <ListItemIcon>
                <Logout fontSize='small' />
              </ListItemIcon>
              Logout
            </MenuItem>
          </div>
        ) : (
          <MenuItem onClick={() => login()}>
            <ListItemIcon>
              <Google fontSize='small' />
            </ListItemIcon>
            Login
          </MenuItem>
        )}
      </Menu>
    </>
  );
};