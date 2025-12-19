import { useState, useEffect, useRef } from 'react'

interface UseTwoStepDeleteOptions {
  onDelete: () => void
  timeout?: number // Default 3 seconds
}

export function useTwoStepDelete({ onDelete, timeout = 3000 }: UseTwoStepDeleteOptions) {
  const [showConfirm, setShowConfirm] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-revert after timeout
  useEffect(() => {
    if (showConfirm) {
      timeoutRef.current = setTimeout(() => {
        setShowConfirm(false)
      }, timeout)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [showConfirm, timeout])

  // Handle click outside to revert
  useEffect(() => {
    if (!showConfirm) return

    const handleClickOutside = (e: MouseEvent) => {
      // Only revert if clicking outside the delete button area
      const target = e.target as Element
      if (!target.closest('[data-delete-button]')) {
        setShowConfirm(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showConfirm])

  const handleFirstClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowConfirm(true)
  }

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete()
    setShowConfirm(false)
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  return {
    showConfirm,
    handleFirstClick,
    handleConfirmDelete,
    handleCancel
  }
}
