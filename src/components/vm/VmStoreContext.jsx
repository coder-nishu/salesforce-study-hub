import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  STORAGE_KEY,
  createRecord,
  deletePlan,
  deleteRecord,
  demoState,
  emptyState,
  loadState,
  saveState,
  updateRecord,
} from '../../lib/vm/store'
import { VmStoreContext } from '../../lib/vm/storeContext'

// Holds the lab's records for all /vm routes. Every change is validated by store.js,
// saved to this browser, and picked up by other open tabs of the lab.
export default function VmStoreProvider({ children }) {
  const [initial] = useState(loadState)
  const [state, setState] = useState(initial.state)
  const [loadIssues, setLoadIssues] = useState(initial.issues)
  const stateRef = useRef(state)

  const commit = useCallback((next) => {
    stateRef.current = next
    setState(next)
    saveState(next)
  }, [])

  // Keep tabs in sync (e.g. a record created from a lookup's “New” link in another tab).
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== STORAGE_KEY) return
      const { state: next, issues } = loadState()
      stateRef.current = next
      setState(next)
      setLoadIssues(issues)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const run = useCallback(
    (operation) => {
      const result = operation(stateRef.current)
      if (result.ok) commit(result.state)
      return result
    },
    [commit],
  )

  const value = useMemo(
    () => ({
      records: state.records,
      create: (objectApiName, values, options) => run((s) => createRecord(s, objectApiName, values, options)),
      update: (id, values) => run((s) => updateRecord(s, id, values)),
      remove: (id) => run((s) => deleteRecord(s, id)),
      planDelete: (id) => deletePlan(stateRef.current.records, id),
      resetDemo: () => {
        commit(demoState())
        setLoadIssues([])
      },
      resetEmpty: () => {
        commit(emptyState())
        setLoadIssues([])
      },
      loadIssues,
      dismissLoadIssues: () => setLoadIssues([]),
      storage: initial.storage,
    }),
    [state, run, commit, loadIssues, initial.storage],
  )

  return <VmStoreContext.Provider value={value}>{children}</VmStoreContext.Provider>
}
