'use client'
import { useState, useEffect, useRef } from 'react'

export function StableInput({ value, onChange, className = 'input-dark', type = 'text', placeholder = '', ...props }: any) {
  const [local, setLocal] = useState(value)
  const ref = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    if (document.activeElement !== ref.current) {
      setLocal(value)
    }
  }, [value])

  return (
    <input
      ref={ref}
      type={type}
      value={local}
      onChange={e => { setLocal(e.target.value); onChange(e) }}
      className={className}
      placeholder={placeholder}
      {...props}
    />
  )
}

export function StableTextarea({ value, onChange, className = 'input-dark', rows = 2, placeholder = '', ...props }: any) {
  const [local, setLocal] = useState(value)
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (document.activeElement !== ref.current) {
      setLocal(value)
    }
  }, [value])

  return (
    <textarea
      ref={ref}
      value={local}
      onChange={e => { setLocal(e.target.value); onChange(e) }}
      className={`${className} resize-none w-full`}
      rows={rows}
      placeholder={placeholder}
      {...props}
    />
  )
}