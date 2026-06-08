import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useClerk, useUser } from '@clerk/clerk-react'
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import DashboardIcon from '@mui/icons-material/Dashboard'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import AssignmentIcon from '@mui/icons-material/Assignment'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import BuildIcon from '@mui/icons-material/Build'
import EngineeringIcon from '@mui/icons-material/Engineering'
import PeopleIcon from '@mui/icons-material/People'
import HistoryIcon from '@mui/icons-material/History'
import LogoutIcon from '@mui/icons-material/Logout'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { trpc } from '@/trpc/client'
import { useColorMode } from '@/contexts/ColorModeContext'

const DRAWER_WIDTH = 240

type NavItem = { label: string; path: string; icon: React.ReactNode }

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  customer: [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Properties', path: '/properties', icon: <HomeWorkIcon /> },
    { label: 'Bookings', path: '/bookings', icon: <AssignmentIcon /> },
    { label: 'Repairs', path: '/repairs', icon: <BuildIcon /> },
    { label: 'History', path: '/history', icon: <HistoryIcon /> },
  ],
  staff: [
    { label: 'My Assignments', path: '/my-assignments', icon: <AssignmentTurnedInIcon /> },
  ],
  admin: [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Bookings', path: '/bookings', icon: <AssignmentIcon /> },
    { label: 'Repairs', path: '/repairs', icon: <BuildIcon /> },
    { label: 'Work Orders', path: '/work-orders', icon: <EngineeringIcon /> },
    { label: 'Staff', path: '/staff', icon: <PeopleIcon /> },
  ],
  repair_tech: [
    { label: 'My Work Orders', path: '/my-work-orders', icon: <EngineeringIcon /> },
  ],
}

export default function CustomerLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { signOut } = useClerk()
  const { user } = useUser()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { mode, toggleColorMode } = useColorMode()

  const { data: dbUser } = trpc.users.me.useQuery()
  const role = dbUser?.role ?? 'customer'
  const navItems = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.customer

  const upsertFromClerk = trpc.users.upsertFromClerk.useMutation()
  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress && user?.fullName) {
      upsertFromClerk.mutate({
        name: user.fullName,
        email: user.primaryEmailAddress.emailAddress,
        phone: user.primaryPhoneNumber?.phoneNumber,
      })
    }
  }, [user?.id])

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev)
  const handleAvatarClick = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)
  const handleSignOut = () => signOut(() => navigate('/'))

  const drawer = (
    <Box>
      <Toolbar sx={{ px: 2, justifyContent: 'center' }}>
        <Box
          component="img"
          src={theme.palette.mode === 'dark' ? '/images/logo-dark.png' : '/images/logo-light.png'}
          alt="Cabin Care"
          sx={{ maxWidth: 160, width: '100%', height: 'auto' }}
        />
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item) => {
          const active = location.pathname.startsWith(item.path)
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={active}
                onClick={() => {
                  navigate(item.path)
                  if (isMobile) setMobileOpen(false)
                }}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '& .MuiListItemIcon-root': { color: 'white' },
                    '&:hover': { bgcolor: 'primary.dark' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Top AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={toggleColorMode} size="small" sx={{ mr: 1 }} aria-label="Toggle dark mode">
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <IconButton onClick={handleAvatarClick} size="small">
            <Avatar
              src={user?.imageUrl}
              alt={user?.fullName ?? ''}
              sx={{ width: 32, height: 32 }}
            >
              <AccountCircleIcon />
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {user?.primaryEmailAddress?.emailAddress}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleSignOut}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Sign out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar — mobile temporary drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
        }}
      >
        {drawer}
      </Drawer>

      {/* Sidebar — desktop permanent drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          minWidth: 0,
          minHeight: '100vh',
          bgcolor: 'grey.50',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}
