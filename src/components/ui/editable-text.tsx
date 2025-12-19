'use client'

import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface EditableTextProps {
  initialValue: string
  onSave: (value: string) => void
  label?: string
  multiline?: boolean
  className?: string
  placeholder?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'
}

export function EditableText({
  initialValue,
  onSave,
  label,
  multiline = false,
  className,
  placeholder = 'Click to edit...',
  as: Component = 'div'
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleSave = () => {
    setIsEditing(false)
    if (value.trim() !== initialValue) {
      onSave(value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      handleSave()
    }
    if (e.key === 'Escape') {
      setIsEditing(false)
      setValue(initialValue)
    }
  }

  // Common styles for typography based on the 'as' prop to ensure input matches text
  const getTypographyStyles = () => {
    // This allows the input to inherit the styles from the parent or className
    return "bg-transparent border-none outline-none ring-0 p-0 m-0 w-full resize-none font-inherit text-inherit placeholder:text-zinc-600 focus:ring-0"
  }

  return (
    <div
      className={cn("relative group cursor-pointer", className)}
      onClick={() => !isEditing && setIsEditing(true)}
    >
      {label && (
        <span className="text-xs font-medium text-zinc-500 mb-1 block uppercase tracking-wider">
          {label}
        </span>
      )}

      {isEditing ? (
        multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={cn(getTypographyStyles(), "min-h-[100px] text-zinc-200")}
            placeholder={placeholder}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={cn(getTypographyStyles(), "text-white")}
            placeholder={placeholder}
          />
        )
      ) : (
        <Component
          className={cn(
            "transition-colors duration-200 empty:before:content-[attr(data-placeholder)] empty:before:text-zinc-600",
            !value && "text-zinc-500 italic"
          )}
          data-placeholder={placeholder}
        >
          {value || ''}
        </Component>
      )}
    </div>
  )
}
