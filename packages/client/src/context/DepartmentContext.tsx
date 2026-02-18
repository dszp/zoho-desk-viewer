import { createContext, useContext, useState, type ReactNode } from 'react';

interface DepartmentContextValue {
  departmentId: string | undefined;
  setDepartmentId: (id: string | undefined) => void;
}

const DepartmentContext = createContext<DepartmentContextValue>({
  departmentId: undefined,
  setDepartmentId: () => {},
});

export function DepartmentProvider({ children }: { children: ReactNode }) {
  const [departmentId, setDepartmentId] = useState<string | undefined>(undefined);
  return (
    <DepartmentContext.Provider value={{ departmentId, setDepartmentId }}>
      {children}
    </DepartmentContext.Provider>
  );
}

export function useDepartment() {
  return useContext(DepartmentContext);
}
