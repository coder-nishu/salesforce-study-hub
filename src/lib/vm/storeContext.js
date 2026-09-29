import { createContext, useContext } from 'react'

export const VmStoreContext = createContext(null)

// { records, create, update, remove, planDelete, resetDemo, resetEmpty, loadIssues, dismissLoadIssues, storage }
export function useVmStore() {
  const store = useContext(VmStoreContext)
  if (!store) throw new Error('useVmStore must be used inside <VmStoreProvider>')
  return store
}
