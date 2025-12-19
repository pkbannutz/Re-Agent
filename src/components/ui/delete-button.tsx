import React from 'react'
import { X } from 'lucide-react'
import { useTwoStepDelete } from '@/lib/use-two-step-delete'

interface DeleteButtonProps {
  onDelete: () => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function DeleteButton({ onDelete, size = 'md', className = '' }: DeleteButtonProps) {
  const { showConfirm, handleFirstClick, handleConfirmDelete } = useTwoStepDelete({
    onDelete,
    timeout: 3000
  })

  if (showConfirm) {
    return (
      <div data-delete-button className={`transition-all duration-200 ease-out ${className}`}>
        <button
          onClick={handleConfirmDelete}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors font-medium text-xs whitespace-nowrap shadow-sm"
        >
          Remove
        </button>
      </div>
    )
  }

  return (
    <div data-delete-button className={`transition-all duration-200 ease-out ${className}`}>
      <button
        onClick={handleFirstClick}
        className="w-8 h-8 bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-500/70 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
