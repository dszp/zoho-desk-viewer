export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  channel: string;
  category: string;
  subCategory: string;
  departmentId: string;
  departmentName?: string;
  contactId: string;
  contactName?: string;
  contactEmail?: string;
  accountId: string;
  accountName?: string;
  assigneeId: string;
  assigneeName?: string;
  createdBy: string;
  modifiedBy: string;
  createdTime: string;
  modifiedTime: string;
  closedTime: string;
  dueDate: string;
  resolution: string;
  isEscalated: boolean;
  threadCount: number;
  commentCount: number;
  tags: string;
  slaName: string;
  slaViolationType: string;
  toAddress: string;
  email: string;
  phone: string;
}

export interface Thread {
  id: string;
  ticketId: string;
  createdTime: string;
  threadStatus: string;
  content: string;
  isPrivate: boolean;
  fromEmailAddress: string;
  receipients: string;
  hasAttach: boolean;
  threadType: string;
  departmentId: string;
}

export interface Comment {
  id: string;
  comment: string;
  commentedBy: string;
  commentedByName?: string;
  isPublic: boolean;
  commentedTime: string;
  modifiedTime: string;
  entityId: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  mobile: string;
  title: string;
  accountId: string;
  accountName?: string;
  type: string;
  createdTime: string;
  modifiedTime: string;
}

export interface Account {
  id: string;
  accountName: string;
  phone: string;
  email: string;
  website: string;
  industry: string;
  street: string;
  city: string;
  state: string;
  code: string;
  country: string;
  createdTime: string;
  modifiedTime: string;
}

export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  status: string;
  role: string;
  profile: string;
}

export interface Department {
  id: string;
  name: string;
  isEnabled: boolean;
  status: string;
  createdTime: string;
  modifiedTime: string;
}

export interface TimeEntry {
  id: string;
  ownerId: string;
  executedTime: string;
  description: string;
  requestId: string;
  secondsSpent: number;
  isBillable: boolean;
  createdTime: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TicketFilters {
  status?: string;
  priority?: string;
  assigneeId?: string;
  channel?: string;
  departmentId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  byStatus: { status: string; count: number }[];
  byPriority: { priority: string; count: number }[];
  byChannel: { channel: string; count: number }[];
  byAgent: { agentId: string; agentName: string; count: number }[];
  byDepartment: { departmentId: string; departmentName: string; count: number }[];
  byMonth: { month: string; count: number }[];
}
