'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { EditableText } from '@/components/ui/editable-text'
import { ArrowRight, CreditCard, User, Mail, Lock, Trash2, ExternalLink } from 'lucide-react'

export function SettingsView() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    getUser()
  }, [])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    setLoading(false)
  }

  const handleUpdateProfile = async (field: string, value: string) => {
    if (!user) return

    setUpdating(true)
    setStatusMessage(null)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { [field]: value }
      })

      if (error) throw error

      // Update local state
      setUser({ ...user, user_metadata: { ...user.user_metadata, [field]: value } })
      setStatusMessage({ type: 'success', message: 'Profile updated successfully!' })
    } catch (error: any) {
      setStatusMessage({ type: 'error', message: 'Failed to update profile: ' + error.message })
    } finally {
      setUpdating(false)
    }
  }

  const handleChangePassword = () => {
    setShowPasswordForm(!showPasswordForm)
    setNewPassword('')
    setStatusMessage(null)
  }

  const submitNewPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setStatusMessage({ type: 'error', message: 'Password must be at least 6 characters long' })
      return
    }

    setUpdating(true)
    setStatusMessage(null)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      setStatusMessage({ type: 'success', message: 'Password updated successfully!' })
      setShowPasswordForm(false)
      setNewPassword('')
    } catch (error: any) {
      setStatusMessage({ type: 'error', message: 'Failed to update password: ' + error.message })
    } finally {
      setUpdating(false)
    }
  }

  const handleChangeEmail = () => {
    setShowEmailForm(!showEmailForm)
    setNewEmail('')
    setStatusMessage(null)
  }

  const submitNewEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      setStatusMessage({ type: 'error', message: 'Please enter a valid email address' })
      return
    }

    setUpdating(true)
    setStatusMessage(null)
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      })

      if (error) throw error

      setStatusMessage({ type: 'success', message: 'Email update initiated! Please check both your old and new email for confirmation.' })
      setShowEmailForm(false)
      setNewEmail('')
    } catch (error: any) {
      setStatusMessage({ type: 'error', message: 'Failed to update email: ' + error.message })
    } finally {
      setUpdating(false)
    }
  }

  const handleBillingPortal = async () => {
    setStatusMessage(null)
    try {
      // Create a portal session (this would need to be implemented on the backend)
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      window.open(url, '_blank')
    } catch (error: any) {
      setStatusMessage({ type: 'error', message: 'Billing portal not yet implemented. Please contact support.' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-400">Please sign in to access settings.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
          Settings
        </h1>
        <p className="text-zinc-400">
          Manage your account settings and preferences.
        </p>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl border ${
          statusMessage.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {statusMessage.message}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {/* Profile Settings */}
        <div className="bg-[#111] p-6 rounded-2xl border border-white/5 space-y-6">
          <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Full Name</label>
              <EditableText
                initialValue={user.user_metadata?.full_name || ''}
                onSave={(val) => handleUpdateProfile('full_name', val)}
                className="w-full px-4 py-3 bg-black border border-white/10 text-white rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Email Address</label>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="flex-1 px-4 py-3 bg-black border border-white/10 text-zinc-500 rounded-xl cursor-not-allowed"
                />
                <button
                  onClick={handleChangeEmail}
                  disabled={updating}
                  className="px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-colors disabled:opacity-50"
                >
                  Change
                </button>
              </div>

              {showEmailForm && (
                <div className="mt-4 space-y-3">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter new email address"
                    className="w-full px-4 py-3 bg-black border border-white/10 text-white rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    disabled={updating}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={submitNewEmail}
                      disabled={updating || !newEmail.trim()}
                      className="flex-1 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-colors disabled:opacity-50 text-sm font-medium"
                    >
                      {updating ? 'Updating...' : 'Update Email'}
                    </button>
                    <button
                      onClick={() => setShowEmailForm(false)}
                      disabled={updating}
                      className="px-4 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors disabled:opacity-50 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div className="bg-[#111] p-6 rounded-2xl border border-white/5 space-y-6">
          <h2 className="text-xl font-semibold text-white mb-4">Account Security</h2>

          <div className="space-y-4">
            <div>
              <button
                onClick={handleChangePassword}
                disabled={updating}
                className="w-full flex items-center justify-between p-4 bg-black border border-white/10 text-white rounded-xl hover:border-emerald-500/50 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center">
                  <Lock className="w-5 h-5 mr-3 text-zinc-400" />
                  <span>Change Password</span>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400" />
              </button>

              {showPasswordForm && (
                <div className="mt-4 space-y-3">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 bg-black border border-white/10 text-white rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    disabled={updating}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={submitNewPassword}
                      disabled={updating || !newPassword.trim()}
                      className="flex-1 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-colors disabled:opacity-50 text-sm font-medium"
                    >
                      {updating ? 'Updating...' : 'Update Password'}
                    </button>
                    <button
                      onClick={() => setShowPasswordForm(false)}
                      disabled={updating}
                      className="px-4 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors disabled:opacity-50 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs text-zinc-500 mb-4">
                Account created on {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Billing & Subscription */}
        <div className="bg-[#111] p-6 rounded-2xl border border-white/5 space-y-6">
          <h2 className="text-xl font-semibold text-white mb-4">Billing & Subscription</h2>

          <div className="space-y-4">
            <button
              onClick={handleBillingPortal}
              className="w-full flex items-center justify-between p-4 bg-black border border-white/10 text-white rounded-xl hover:border-emerald-500/50 transition-colors"
            >
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 mr-3 text-zinc-400" />
                <span>Manage Billing & Payments</span>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-400" />
            </button>

            <p className="text-xs text-zinc-500">
              View invoices, update payment methods, and manage your subscription.
            </p>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-[#111] p-6 rounded-2xl border border-white/5 space-y-6">
          <h2 className="text-xl font-semibold text-white mb-4">Account Actions</h2>

          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors">
              <div className="flex items-center">
                <Trash2 className="w-5 h-5 mr-3" />
                <span>Delete Account</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-xs text-zinc-500">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
