'use client'

import { useRef, useState, useCallback } from 'react'
import Image from 'next/image'

interface FileUploadProps {
  id: string
  accept: string
  maxSizeBytes: number
  label: string
  hint: string
  previewType: 'image' | 'document'
  onChange: (file: File | null) => void
  error?: string
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FileUpload({
  id,
  accept,
  maxSizeBytes,
  label,
  hint,
  previewType,
  onChange,
  error,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [sizeError, setSizeError] = useState<string | null>(null)

  const handleFile = useCallback((file: File) => {
    if (file.size > maxSizeBytes) {
      setSizeError(`ไฟล์ใหญ่เกิน ${formatBytes(maxSizeBytes)}`)
      onChange(null)
      return
    }
    setSizeError(null)
    setFileName(file.name)
    setFileSize(file.size)
    onChange(file)

    if (previewType === 'image') {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }, [maxSizeBytes, onChange, previewType])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const clearFile = () => {
    setPreview(null)
    setFileName(null)
    setFileSize(null)
    setSizeError(null)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const displayError = sizeError ?? error

  return (
    <div>
      <label className="form-label">{label}</label>

      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        className={`
          relative cursor-pointer rounded-lg border-2 border-dashed p-4
          transition-colors duration-150 select-none
          ${isDragging
            ? 'border-ku-green bg-ku-green-50'
            : displayError
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 bg-gray-50 hover:border-ku-green hover:bg-ku-green-50'
          }
        `}
      >
        {/* Image preview */}
        {previewType === 'image' && preview ? (
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
              <Image src={preview} alt="preview" fill className="object-cover" sizes="80px" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-gray-700">{fileName}</p>
              {fileSize !== null && (
                <p className="text-xs text-gray-400">{formatBytes(fileSize)}</p>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); clearFile() }}
                className="mt-1.5 text-xs text-red-600 hover:underline"
              >
                ลบรูป
              </button>
            </div>
          </div>
        ) : previewType === 'document' && fileName ? (
          /* Document preview */
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100">
              <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM9.5 17H8v-5h1.5a2 2 0 010 4zm4.5 0h-1v-5h1c1.38 0 2 .62 2 2.5S15.38 17 14 17z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-gray-700">{fileName}</p>
              {fileSize !== null && (
                <p className="text-xs text-gray-400">{formatBytes(fileSize)}</p>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); clearFile() }}
              className="text-xs text-red-600 hover:underline"
            >
              ลบ
            </button>
          </div>
        ) : (
          /* Empty state */
          <div className="py-4 text-center">
            <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="mt-2 text-sm font-medium text-gray-600">
              ลากไฟล์มาวาง หรือ{' '}
              <span className="text-ku-green underline underline-offset-2">เลือกไฟล์</span>
            </p>
            <p className="mt-1 text-xs text-gray-400">{hint}</p>
          </div>
        )}

        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={handleInputChange}
        />
      </div>

      {displayError && (
        <p className="form-error">{displayError}</p>
      )}
    </div>
  )
}
