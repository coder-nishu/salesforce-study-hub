import { useSearchParams } from 'react-router-dom'
import Breadcrumbs from '../../components/Breadcrumbs'
import MatchPanel from '../../components/vm/MatchPanel'
import { vmPath } from '../../data/navigation'

export default function VmFindVolunteers() {
  const [params] = useSearchParams()
  const shift = params.get('shift')
  const job = params.get('job')
  return (
    <div className="page page-wide">
      <Breadcrumbs items={[{ label: 'Volunteer Management Lab', to: vmPath }, { label: 'Find Volunteers' }]} />
      <header className="page-header">
        <h1 className="page-title">Find Volunteers</h1>
        <p className="page-subtitle">
          Search for volunteers who fit a job position and shift — by qualification, date and time, and location — and see
          exactly why each one does or doesn’t match.
        </p>
      </header>
      <MatchPanel key={`${shift}-${job}`} initialShiftId={shift} initialJobPositionId={job} />
    </div>
  )
}
