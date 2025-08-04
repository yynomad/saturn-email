'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, Plus, Settings } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mailboxes, setMailboxes] = useState<any[]>([])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          router.push('/auth/login')
          return
        }

        if (!session) {
          console.log('No session found, redirecting to login')
          router.push('/auth/login')
          return
        }

        console.log('User authenticated:', session.user)
        setUser(session.user)
        
        // 获取用户的邮箱列表
        await fetchMailboxes()
        
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    const fetchMailboxes = async () => {
      try {
        const response = await fetch('/api/mailbox')
        if (response.ok) {
          const data = await response.json()
          setMailboxes(data.mailboxes || [])
        }
      } catch (error) {
        console.error('Error fetching mailboxes:', error)
      }
    }

    checkAuth()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session)
      
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/auth/login')
      } else if (event === 'SIGNED_IN') {
        setUser(session.user)
        fetchMailboxes()
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      } else {
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Sign out exception:', error)
    }
  }

  const createMailbox = async () => {
    try {
      const response = await fetch('/api/mailbox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'random'
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Mailbox created:', data)
        // 重新获取邮箱列表
        window.location.reload()
      } else {
        console.error('Failed to create mailbox')
      }
    } catch (error) {
      console.error('Error creating mailbox:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>未登录，正在跳转...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🪐 Saturn Email</h1>
              <p className="text-sm text-gray-600">欢迎回来，{user.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={createMailbox} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                创建邮箱
              </Button>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 用户信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                账户信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>邮箱:</strong> {user.email}</div>
                <div><strong>用户ID:</strong> {user.id}</div>
                <div><strong>注册时间:</strong> {new Date(user.created_at).toLocaleDateString()}</div>
                <div><strong>最后登录:</strong> {new Date(user.last_sign_in_at).toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>

          {/* 邮箱统计 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                邮箱统计
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>总邮箱数:</strong> {mailboxes.length}</div>
                <div><strong>活跃邮箱:</strong> {mailboxes.filter(m => m.is_active).length}</div>
                <div><strong>总邮件:</strong> 0</div>
                <div><strong>未读邮件:</strong> 0</div>
              </div>
            </CardContent>
          </Card>

          {/* 快速操作 */}
          <Card>
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={createMailbox} className="w-full" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                创建随机邮箱
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                查看所有邮件
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 邮箱列表 */}
        {mailboxes.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">我的邮箱</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mailboxes.map((mailbox) => (
                <Card key={mailbox.id}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="font-medium">{mailbox.email_address}</div>
                      {mailbox.name && (
                        <div className="text-sm text-gray-600">{mailbox.name}</div>
                      )}
                      <div className="text-xs text-gray-500">
                        创建于: {new Date(mailbox.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded ${
                          mailbox.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {mailbox.is_active ? '活跃' : '停用'}
                        </span>
                        <Button size="sm" variant="outline">
                          查看邮件
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {mailboxes.length === 0 && (
          <div className="mt-8 text-center">
            <div className="bg-white rounded-lg p-8">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">还没有邮箱</h3>
              <p className="text-gray-600 mb-4">创建您的第一个无限邮箱地址</p>
              <Button onClick={createMailbox}>
                <Plus className="h-4 w-4 mr-2" />
                创建邮箱
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
