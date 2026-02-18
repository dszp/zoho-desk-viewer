import type {
  Ticket,
  Thread,
  Comment,
  Contact,
  Account,
  Agent,
  Department,
  PaginatedResponse,
  TicketFilters,
  DashboardStats,
} from '@zohodesk/shared';

const BASE = '/api';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

export const api = {
  getTickets(filters: TicketFilters): Promise<PaginatedResponse<Ticket>> {
    return fetchJson(`${BASE}/tickets${buildQuery(filters as Record<string, string>)}`);
  },

  getTicketById(id: string): Promise<Ticket> {
    return fetchJson(`${BASE}/tickets/${id}`);
  },

  getThreads(ticketId: string, page = 1, pageSize = 50): Promise<PaginatedResponse<Thread>> {
    return fetchJson(`${BASE}/tickets/${ticketId}/threads${buildQuery({ page, pageSize })}`);
  },

  getComments(ticketId: string): Promise<Comment[]> {
    return fetchJson(`${BASE}/tickets/${ticketId}/comments`);
  },

  getContacts(search?: string, page = 1, pageSize = 25): Promise<PaginatedResponse<Contact>> {
    return fetchJson(`${BASE}/contacts${buildQuery({ search, page, pageSize })}`);
  },

  getContactById(id: string): Promise<Contact> {
    return fetchJson(`${BASE}/contacts/${id}`);
  },

  getContactTickets(contactId: string, page = 1, pageSize = 25): Promise<PaginatedResponse<Ticket>> {
    return fetchJson(`${BASE}/contacts/${contactId}/tickets${buildQuery({ page, pageSize })}`);
  },

  getAccounts(search?: string, page = 1, pageSize = 25): Promise<PaginatedResponse<Account>> {
    return fetchJson(`${BASE}/accounts${buildQuery({ search, page, pageSize })}`);
  },

  getAccountById(id: string): Promise<Account & { contacts: Contact[] }> {
    return fetchJson(`${BASE}/accounts/${id}`);
  },

  getAccountTickets(accountId: string, page = 1, pageSize = 25): Promise<PaginatedResponse<Ticket>> {
    return fetchJson(`${BASE}/accounts/${accountId}/tickets${buildQuery({ page, pageSize })}`);
  },

  getAgents(): Promise<Agent[]> {
    return fetchJson(`${BASE}/agents`);
  },

  getDepartments(): Promise<Department[]> {
    return fetchJson(`${BASE}/departments`);
  },

  getDashboard(departmentId?: string): Promise<DashboardStats> {
    return fetchJson(`${BASE}/dashboard${buildQuery({ departmentId })}`);
  },
};
