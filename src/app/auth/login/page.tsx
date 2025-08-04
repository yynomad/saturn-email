'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { config } from '@/lib/config'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setIsLoading(true)

    try {
      // 使用配置文件中的回调 URL
      const redirectUrl = config.getAuthCallbackUrl()
      console.log('Sending magic link with redirect URL:', redirectUrl)
      console.log('Current origin:', window.location.origin)

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
          // 确保邮件链接不会过期太快
          shouldCreateUser: true
        }
      })

      if (error) {
        console.error('Sign in error:', error)
        toast.error(error.message)
      } else {
        console.log('Magic link sent successfully')
        setIsEmailSent(true)
        toast.success('Check your email for the login link!')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <p className="text-gray-600">
              We've sent a magic link to <strong>{email}</strong>
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                Click the link in your email to sign in. You can close this tab.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEmailSent(false)
                  setEmail('')
                }}
                className="w-full"
              >
                Try Different Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Saturn Email</CardTitle>
          <p className="text-gray-600">Infinite email addresses for your needs</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Magic Link...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Sign In with Email
                </>
              )}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              We'll send you a secure login link via email
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
