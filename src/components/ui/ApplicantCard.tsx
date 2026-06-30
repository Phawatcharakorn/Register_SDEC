'use client'

import Image from 'next/image'
import Link from 'next/link'
import StatusBadge from './StatusBadge'
import type { ApplicationListItem } from '@/types/api'

interface ApplicantCardProps {
  application: ApplicationListItem
}

const dateFormatter = new Intl.DateTimeFormat('th-TH', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

export default function ApplicantCard({ application: app }: ApplicantCardProps) {
  return (
    <Link
      href={`/admin/applications/${app.id}`}
      className="section-card flex items-center gap-4 transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ku-green"
    >
      {/* Photo */}
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-100">
        {app.photo_url ? (
          <Image
            src={app.photo_url}
            alt={app.full_name}
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xl text-gray-400">
            {app.full_name.charAt(0)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="truncate font-semibold text-gray-900">{app.full_name}</p>
            <p className="text-sm text-gray-500">
              {app.student_id} · {app.faculty}
            </p>
          </div>
          <StatusBadge status={app.status} size="sm" />
        </div>

        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
          <span>ปี {app.year} · GPA {app.gpa.toFixed(2)}</span>
          {app.corps && (
            <span className="font-medium text-ku-green">ฝ่าย {app.corps}</span>
          )}
          <span>สมัครเมื่อ {dateFormatter.format(new Date(app.created_at))}</span>
        </div>
      </div>

      {/* Chevron */}
      <svg className="h-4 w-4 shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}
