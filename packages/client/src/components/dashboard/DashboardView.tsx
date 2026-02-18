import { Box, Typography, Paper, Grid } from '@mui/material';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, ResponsiveContainer, Legend,
} from 'recharts';
import { useDashboard } from '../../api/hooks';
import { useDepartment } from '../../context/DepartmentContext';

const STATUS_COLORS: Record<string, string> = {
  Closed: '#4caf50',
  Open: '#2196f3',
  'On Hold': '#ff9800',
  'Waiting on customer response': '#f44336',
  Escalated: '#9c27b0',
};

const PRIORITY_COLORS: Record<string, string> = {
  None: '#9e9e9e',
  High: '#f44336',
  Medium: '#ff9800',
  Low: '#4caf50',
};

const PIE_COLORS = ['#2196f3', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#795548'];

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Paper sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h4" fontWeight={700}>{value.toLocaleString()}</Typography>
      <Typography variant="body2" color="text.secondary">{title}</Typography>
    </Paper>
  );
}

export function DashboardView() {
  const { departmentId } = useDepartment();
  const { data, isLoading } = useDashboard(departmentId);

  if (isLoading || !data) return <Typography color="text.secondary">Loading dashboard...</Typography>;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>Dashboard</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Total Tickets" value={data.totalTickets} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Open Tickets" value={data.openTickets} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Closed Tickets" value={data.closedTickets} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Tickets by Status</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.byStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ status, count }) => `${status} (${count})`}
                >
                  {data.byStatus.map((entry, i) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Tickets by Priority</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.byPriority}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count">
                  {data.byPriority.map((entry) => (
                    <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority] || '#9e9e9e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Ticket Volume Over Time</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.byMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#1976d2" name="Tickets" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Agent Workload</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.byAgent} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="agentName" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>By Channel</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.byChannel}
                  dataKey="count"
                  nameKey="channel"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ channel, count }) => `${channel} (${count})`}
                >
                  {data.byChannel.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
