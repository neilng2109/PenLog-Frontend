import { getStatusColor, getStatusText } from '../utils/helpers'

export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${getStatusColor(status)}`}>
      {getStatusText(status)}
    </span>
  )
}