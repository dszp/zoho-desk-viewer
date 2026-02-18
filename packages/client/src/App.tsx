import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { TicketListView } from './components/tickets/TicketListView';
import { ContactListView } from './components/contacts/ContactListView';
import { ContactDetailView } from './components/contacts/ContactDetailView';
import { AccountListView } from './components/accounts/AccountListView';
import { AccountDetailView } from './components/accounts/AccountDetailView';
import { DashboardView } from './components/dashboard/DashboardView';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/tickets" replace />} />
        <Route path="/dashboard" element={<DashboardView />} />
        <Route path="/tickets" element={<TicketListView />} />
        <Route path="/tickets/:id" element={<TicketListView />} />
        <Route path="/contacts" element={<ContactListView />} />
        <Route path="/contacts/:id" element={<ContactDetailView />} />
        <Route path="/accounts" element={<AccountListView />} />
        <Route path="/accounts/:id" element={<AccountDetailView />} />
      </Route>
    </Routes>
  );
}
