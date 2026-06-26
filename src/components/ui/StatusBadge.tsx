import type { ApplicationStatus } from '@/types/database'

interface StatusBadgeProps {
  status: ApplicationStatus
  size?: 'sm' | 'md'
}

const config: Record<ApplicationStatus, { label: string; className: string }> = {
  pending:  { label: 'รอดำเนินการ', className: 'bg-amber-50  text-amber-700  border-amber-200'  },
  approved: { label: 'ผ่านการคัดเลือก', className: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { label: 'ไม่ผ่าน',     className: 'bg-red-50   text-red-700   border-red-200'   },
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const { label, className } = config[status]
  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-medium
        ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
        ${className}
      `}
    >
      {label}
    </span>
  )
}
