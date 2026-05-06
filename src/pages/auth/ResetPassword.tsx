import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { OtpInput } from '@/components/shared/OtpInput';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

const resetSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetForm = z.infer<typeof resetSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpError, setOtpError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  useEffect(() => {
    if (!email) navigate('/auth/forgot-password');
  }, [email, navigate]);

  const onSubmit = async (data: ResetForm) => {
    if (otp.length !== 6) {
      setOtpError('Please enter the 6-digit code');
      return;
    }
    setOtpError('');

    try {
      await api.post('/auth/reset-password', {
        email,
        otp,
        newPassword: data.password
      });
      toast.success('Password reset successfully');
      navigate('/auth/login');
    } catch (err: any) {
      setError('root', {
        message: err.response?.data?.message || 'Failed to reset password. Code might be expired.'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2 font-semibold text-xl tracking-tight text-blue-950">
            <div className="bg-blue-950 text-white p-2 rounded-md">
              <FileText className="w-6 h-6" />
            </div>
            SyncRes
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create new password</CardTitle>
            <CardDescription>
              Enter the code sent to {email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errors.root && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-start gap-2 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{errors.root.message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-center block mb-2">Reset Code</Label>
                <div className="flex justify-center">
                  <OtpInput value={otp} onChange={setOtp} error={!!otpError} />
                </div>
                {otpError && <p className="text-sm text-red-500 text-center mt-1">{otpError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting || otp.length !== 6}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Reset Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
