// Shift capacity at a glance: seats, assigned (counting toward capacity), remaining.
export default function CapacityMeter({ capacity, assigned, remaining, total }) {
  if (capacity === null || capacity === undefined) {
    return <p className="vm-capacity-none">No Maximum Attendees set — capacity isn’t limited. {total ?? assigned} assigned.</p>
  }
  const pct = capacity ? Math.min(100, Math.round((assigned / capacity) * 100)) : 0
  return (
    <div className="vm-capacity">
      <div className="vm-capacity-bar" role="meter" aria-valuemin={0} aria-valuemax={capacity} aria-valuenow={assigned} aria-label="Shift coverage">
        <span style={{ width: `${pct}%` }} />
      </div>
      <dl className="vm-capacity-stats">
        <div><dt>Capacity</dt><dd>{capacity}</dd></div>
        <div><dt>Assigned</dt><dd>{assigned}</dd></div>
        <div><dt>Remaining</dt><dd>{remaining}</dd></div>
        <div><dt>Coverage</dt><dd>{pct}%</dd></div>
      </dl>
      {total > assigned && (
        <p className="vm-capacity-note">
          {total - assigned} more assignment{total - assigned === 1 ? '' : 's'} on this shift don’t count toward capacity.
        </p>
      )}
    </div>
  )
}
