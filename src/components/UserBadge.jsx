const roleLabelMap = {
  owner: 'Owner',
  manager: 'Manager',
  agent: 'Agent',
  viewer: 'Viewer',
}

const getInitials = (value) => {
  if (!value) {
    return 'U'
  }

  const chunks = String(value).split('@')[0].split(/[.\s_-]+/).filter(Boolean)
  const initials = chunks.slice(0, 2).map((chunk) => chunk.charAt(0).toUpperCase()).join('')
  return initials || 'U'
}

const UserBadge = ({ profile }) => {
  if (!profile) {
    return null
  }

  const email = profile.email || 'Sin email'
  const roleLabel = profile.is_admin ? 'Admin' : (roleLabelMap[String(profile.role || '').toLowerCase()] || 'Viewer')

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue font-semibold text-white">
        {getInitials(email)}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">{email}</span>
        <span className="text-xs text-gray-500">{roleLabel}</span>
      </div>
    </div>
  )
}

export default UserBadge
