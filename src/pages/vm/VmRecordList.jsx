import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import Breadcrumbs from '../../components/Breadcrumbs'
import RecordTable from '../../components/vm/RecordTable'
import { ObjectKindBadge } from '../../components/vm/VmBadges'
import { vmNewRecordPath, vmObjectPath, vmObjectsPath, vmPath } from '../../data/navigation'
import { getObject } from '../../data/npc-vm'
import { displayName, recordsOf } from '../../lib/vm/records'
import { useVmStore } from '../../lib/vm/storeContext'
import NotFound from '../NotFound'

export default function VmRecordList() {
  const { apiName } = useParams()
  const [params] = useSearchParams()
  const { records } = useVmStore()
  const [query, setQuery] = useState('')
  const object = getObject(apiName)
  if (!object) return <NotFound />

  // ?filter=Field:Value (e.g. the Volunteers tab: AccountType:Person Account)
  const [filterField, filterValue] = (params.get('filter') ?? '').split(':')
  const needle = query.trim().toLowerCase()
  const list = recordsOf(records, apiName)
    .filter((r) => !filterField || String(r.values[filterField] ?? '') === filterValue)
    .filter((r) => !needle || displayName(r).toLowerCase().includes(needle) || r.id.toLowerCase().includes(needle))

  return (
    <div className="page page-wide">
      <Breadcrumbs
        items={[
          { label: 'NPC Volunteer Management Lab', to: vmPath },
          { label: 'Objects', to: vmObjectsPath },
          { label: object.label, to: vmObjectPath(apiName) },
          { label: 'Records' },
        ]}
      />
      <header className="vm-list-header">
        <div>
          <div className="page-eyebrow">{object.label}</div>
          <h1 className="page-title">{object.label} records</h1>
          <div className="vm-details-meta">
            <ObjectKindBadge object={object} />
            <Link to={vmObjectPath(apiName)}>Object details →</Link>
          </div>
        </div>
        <Link to={vmNewRecordPath(apiName)} className="vm-button vm-button-primary">
          New {object.label}
        </Link>
      </header>

      <div className="vm-filters">
        <label className="vm-search">
          <span className="visually-hidden">Search {object.label}</span>
          <input type="search" placeholder={`Search ${object.label}…`} value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        {filterField && (
          <p className="vm-result-count">
            Filtered: {filterField} = {filterValue} · <Link to={`/vm/objects/${apiName}/records`}>Show all</Link>
          </p>
        )}
      </div>
      <p className="vm-result-count">{list.length} record{list.length === 1 ? '' : 's'}</p>
      <RecordTable objectApiName={apiName} records={list} />
    </div>
  )
}
