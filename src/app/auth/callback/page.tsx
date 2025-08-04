'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback started')
        console.log('Current URL:', window.location.href)

        // 获取完整的 URL 用于处理认证
        const url = window.location.href
        const urlParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))

        // 从 URL 参数或 hash 中获取认证信息
        const code = urlParams.get('code') || hashParams.get('code')
        const accessToken = urlParams.get('access_token') || hashParams.get('access_token')
        const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token')
        const tokenType = urlParams.get('token_type') || hashParams.get('token_type')
        const type = urlParams.get('type') || hashParams.get('type')

        console.log('Auth params:', { code, accessToken, refreshToken, tokenType, type })
        console.log('Full URL for processing:', url)

        // 让 Supabase 自动处理 URL 中的认证信息
        console.log('Attempting automatic session detection...')

        // 首先检查当前会话状态
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Session check error:', sessionError)
        }

        if (sessionData.session) {
          console.log('Found existing session:', sessionData.session.user)
          await handleUserCreation(sessionData.session.user)
          setStatus('success')
          setMessage('登录成功！')

          // 跳转到仪表板
          router.push('/dashboard')
          return
        }

        // 如果没有现有会话，尝试处理 URL 中的认证信息
        if (accessToken) {
          console.log('Found access token, setting up session')

          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          })

          if (error) {
            console.error('Session setup error:', error)
            setStatus('error')
            setMessage(`会话设置失败: ${error.message}`)
            return
          }

          if (data.user) {
            console.log('Session authentication successful:', data.user)
            await handleUserCreation(data.user)
            setStatus('success')
            setMessage('登录成功！')

            // 跳转到仪表板
            router.push('/dashboard')
            return
          }
        }

        // 如果有 code 参数，尝试处理（但不使用 PKCE）
        if (code) {
          console.log('Found code parameter, but skipping PKCE exchange')
          // 对于 implicit flow，我们不需要处理 code
        }

        // 检查 URL fragment (hash) 中的参数
        const hashFragment = window.location.hash
        if (hashFragment && hashFragment.includes('access_token')) {
          console.log('Found access token in URL fragment')

          // 让 Supabase 自动处理 hash 中的参数
          const { data, error } = await supabase.auth.getSession()

          if (error) {
            console.error('Hash processing error:', error)
            setStatus('error')
            setMessage(`认证失败: ${error.message}`)
            return
          }

          if (data.session) {
            console.log('Hash authentication successful:', data.session.user)
            await handleUserCreation(data.session.user)
            setStatus('success')
            setMessage('登录成功！')

            // 跳转到仪表板
            router.push('/dashboard')
            return
          }
        }

        // 如果所有方法都失败了
        console.error('No valid authentication method found')
        console.log('Available parameters:', { code, accessToken, refreshToken, tokenType, type })
        console.log('URL hash:', window.location.hash)
        console.log('URL search:', window.location.search)

        setStatus('error')
        setMessage('未找到有效的认证信息。请确保直接从邮件链接访问此页面，不要手动输入 URL。')
      } catch (error) {
        console.error('Unexpected error:', error)
        setStatus('error')
        setMessage('An unexpected error occurred')
      }
    }

    const handleUserCreation = async (user: any) => {
      try {
        // Check if user exists in our database
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        // If user doesn't exist, create them
        if (!existingUser && !userError) {
          const { error: createError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email!
            })

          if (createError) {
            console.error('Error creating user:', createError)
          } else {
            console.log('User created successfully')
          }
        } else {
          console.log('User already exists')
        }
      } catch (error) {
        console.error('Error in user creation:', error)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            {status === 'loading' && <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-8 w-8 text-green-600" />}
            {status === 'error' && <XCircle className="h-8 w-8 text-red-600" />}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Signing you in...'}
            {status === 'success' && 'Welcome!'}
            {status === 'error' && 'Sign In Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              {message || 'Please wait while we complete your sign in...'}
            </p>
            {status === 'success' && (
              <p className="text-sm text-gray-500">
                Redirecting you to the dashboard...
              </p>
            )}
            {status === 'error' && (
              <button
                onClick={() => router.push('/auth/login')}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Try signing in again
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
