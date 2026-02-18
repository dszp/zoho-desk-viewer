import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Divider, Typography, Box, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ConfirmationNumber as TicketIcon,
  People as ContactIcon,
  Business as AccountIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDepartments } from '../../api/hooks';
import { useDepartment } from '../../context/DepartmentContext';

const DRAWER_WIDTH = 240;

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Tickets', icon: <TicketIcon />, path: '/tickets' },
  { label: 'Contacts', icon: <ContactIcon />, path: '/contacts' },
  { label: 'Accounts', icon: <AccountIcon />, path: '/accounts' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: departments } = useDepartments();
  const { departmentId, setDepartmentId } = useDepartment();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
          Zoho Desk Viewer
        </Typography>
      </Box>
      <Divider />
      <List>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname.startsWith(item.path)}
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Department</InputLabel>
          <Select
            value={departmentId || ''}
            label="Department"
            onChange={(e) => setDepartmentId(e.target.value || undefined)}
          >
            <MenuItem value="">All Departments</MenuItem>
            {departments?.map((d) => (
              <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Drawer>
  );
}
