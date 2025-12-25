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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Please sign in to access settings.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-card-foreground tracking-tight mb-2">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl border ${
          statusMessage.type === 'success'
            ? 'bg-emerald-100 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
            : 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
        }`}>
          {statusMessage.message}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {/* Profile Settings */}
        <div className="bg-card p-6 rounded-2xl border border-border space-y-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Profile Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Full Name</label>
              <EditableText
                initialValue={user.user_metadata?.full_name || ''}
                onSave={(val) => handleUpdateProfile('full_name', val)}
                className="w-full px-4 py-3 bg-background border border-border text-card-foreground rounded-xl focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Email Address</label>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="flex-1 px-4 py-3 bg-muted border border-border text-muted-foreground rounded-xl cursor-not-allowed"
                />
                <button
                  onClick={handleChangeEmail}
                  disabled={updating}
                  className="px-4 py-3 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-xl transition-colors disabled:opacity-50"
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
                    className="w-full px-4 py-3 bg-background border border-border text-card-foreground rounded-xl focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    disabled={updating}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={submitNewEmail}
                      disabled={updating || !newEmail.trim()}
                      className="flex-1 px-4 py-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-xl transition-colors disabled:opacity-50 text-sm font-medium"
                    >
                      {updating ? 'Updating...' : 'Update Email'}
                    </button>
                    <button
                      onClick={() => setShowEmailForm(false)}
                      disabled={updating}
                      className="px-4 py-2 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-xl transition-colors disabled:opacity-50 text-sm"
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
        <div className="bg-card p-6 rounded-2xl border border-border space-y-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Account Security</h2>

          <div className="space-y-4">
            <div>
              <button
                onClick={handleChangePassword}
                disabled={updating}
                className="w-full flex items-center justify-between p-4 bg-muted border border-border text-card-foreground rounded-xl hover:border-primary-300 dark:hover:border-primary-700 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center">
                  <Lock className="w-5 h-5 mr-3 text-muted-foreground" />
                  <span>Change Password</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </button>

              {showPasswordForm && (
                <div className="mt-4 space-y-3">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 bg-background border border-border text-card-foreground rounded-xl focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    disabled={updating}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={submitNewPassword}
                      disabled={updating || !newPassword.trim()}
                      className="flex-1 px-4 py-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-xl transition-colors disabled:opacity-50 text-sm font-medium"
                    >
                      {updating ? 'Updating...' : 'Update Password'}
                    </button>
                    <button
                      onClick={() => setShowPasswordForm(false)}
                      disabled={updating}
                      className="px-4 py-2 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-xl transition-colors disabled:opacity-50 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-4">
                Account created on {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Billing & Subscription */}
        <div className="bg-card p-6 rounded-2xl border border-border space-y-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Billing & Subscription</h2>

          <div className="space-y-4">
            <button
              onClick={handleBillingPortal}
              className="w-full flex items-center justify-between p-4 bg-muted border border-border text-card-foreground rounded-xl hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
            >
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 mr-3 text-muted-foreground" />
                <span>Manage Billing & Payments</span>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </button>

            <p className="text-xs text-muted-foreground">
              View invoices, update payment methods, and manage your subscription.
            </p>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-card p-6 rounded-2xl border border-border space-y-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Account Actions</h2>

          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl hover:bg-red-100 dark:hover:bg-red-900 transition-colors">
              <div className="flex items-center">
                <Trash2 className="w-5 h-5 mr-3" />
                <span>Delete Account</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-xs text-muted-foreground">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
