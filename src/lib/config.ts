// 应用配置
export const config = {
  // 获取当前环境的基础 URL
  getBaseUrl: () => {
    // 在服务器端
    if (typeof window === 'undefined') {
      // 生产环境
      if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`
      }
      // 开发环境
      return process.env.NEXTAUTH_URL || 'http://localhost:3000'
    }
    
    // 在客户端
    return window.location.origin
  },

  // 获取认证回调 URL
  getAuthCallbackUrl: () => {
    return `${config.getBaseUrl()}/auth/callback`
  },

  // Supabase 配置
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },

  // 邮件配置
  email: {
    domain: process.env.EMAIL_DOMAIN || 'mydomain.com',
  },

  // 应用信息
  app: {
    name: 'Saturn Email',
    description: 'Infinite email addresses for your needs',
  }
}

// 验证必需的环境变量
export const validateConfig = () => {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

// 开发环境检查
export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'
