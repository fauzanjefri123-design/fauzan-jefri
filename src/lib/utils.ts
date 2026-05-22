import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTenantPrefix(): string {
  if (typeof window === 'undefined') return 'tenant_fauzanjefri123_gmail_com_';
  const offlineUserStr = localStorage.getItem('offline_logged_in_user');
  if (offlineUserStr) {
    try {
      const u = JSON.parse(offlineUserStr);
      const isEmp = u?.role === 'Employee' || u?.role === 'Karyawan' || u?.email?.includes('karyawan') || u?.email?.includes('employee');
      if (isEmp) {
        const empProfStr = localStorage.getItem('inmarket_employee_profile');
        if (empProfStr) {
          const emp = JSON.parse(empProfStr);
          if (emp.ownerEmail) {
            return `tenant_${emp.ownerEmail.replace(/[^a-zA-Z0-9]/g, '_')}_`;
          }
        }
        return 'unlinked_tenant_'; // Indicates not linked to an owner
      }
      return `tenant_${u.email.replace(/[^a-zA-Z0-9]/g, '_')}_`;
    } catch {
      return 'tenant_fauzanjefri123_gmail_com_';
    }
  }
  return 'tenant_fauzanjefri123_gmail_com_';
}

export function getCurrentStoreId(): string {
  if (typeof window === 'undefined') return 's1';
  return localStorage.getItem('inmarket_current_store_id') || 's1';
}

export function getPartitionedKey(baseKey: string, isBranchScoped = false): string {
  const tenant = getTenantPrefix();
  if (isBranchScoped) {
    const storeId = getCurrentStoreId();
    return `${baseKey}_${tenant}${storeId}`;
  }
  return `${baseKey}_${tenant}`;
}
