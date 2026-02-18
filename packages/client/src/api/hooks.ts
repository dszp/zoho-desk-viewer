import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { api } from './client';
import type { TicketFilters } from '@zohodesk/shared';

export function useTickets(filters: TicketFilters) {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => api.getTickets(filters),
    placeholderData: keepPreviousData,
  });
}

export function useTicketDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => api.getTicketById(id!),
    enabled: !!id,
  });
}

export function useThreads(ticketId: string | undefined, page = 1) {
  return useQuery({
    queryKey: ['threads', ticketId, page],
    queryFn: () => api.getThreads(ticketId!, page),
    enabled: !!ticketId,
    placeholderData: keepPreviousData,
  });
}

export function useComments(ticketId: string | undefined) {
  return useQuery({
    queryKey: ['comments', ticketId],
    queryFn: () => api.getComments(ticketId!),
    enabled: !!ticketId,
  });
}

export function useContacts(search?: string, page = 1) {
  return useQuery({
    queryKey: ['contacts', search, page],
    queryFn: () => api.getContacts(search, page),
    placeholderData: keepPreviousData,
  });
}

export function useContactDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['contact', id],
    queryFn: () => api.getContactById(id!),
    enabled: !!id,
  });
}

export function useContactTickets(contactId: string | undefined, page = 1) {
  return useQuery({
    queryKey: ['contactTickets', contactId, page],
    queryFn: () => api.getContactTickets(contactId!, page),
    enabled: !!contactId,
    placeholderData: keepPreviousData,
  });
}

export function useAccounts(search?: string, page = 1) {
  return useQuery({
    queryKey: ['accounts', search, page],
    queryFn: () => api.getAccounts(search, page),
    placeholderData: keepPreviousData,
  });
}

export function useAccountDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['account', id],
    queryFn: () => api.getAccountById(id!),
    enabled: !!id,
  });
}

export function useAccountTickets(accountId: string | undefined, page = 1) {
  return useQuery({
    queryKey: ['accountTickets', accountId, page],
    queryFn: () => api.getAccountTickets(accountId!, page),
    enabled: !!accountId,
    placeholderData: keepPreviousData,
  });
}

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: () => api.getAgents(),
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => api.getDepartments(),
  });
}

export function useDashboard(departmentId?: string) {
  return useQuery({
    queryKey: ['dashboard', departmentId],
    queryFn: () => api.getDashboard(departmentId),
  });
}
