import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'

export default function LoginPage() {
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
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Please configure Supabase authentication to continue
            </p>
            <Button disabled className="w-full">
              Sign In with Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
