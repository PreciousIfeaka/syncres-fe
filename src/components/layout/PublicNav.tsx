import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

export function PublicNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight text-blue-950">
          <div className="bg-blue-950 text-white p-1.5 rounded-md">
            <FileText className="w-5 h-5" />
          </div>
          SyncRes
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/auth/login" className="text-sm font-medium text-gray-600 hover:text-blue-950">
            Log in
          </Link>
          <Button asChild size="sm">
            <Link to="/auth/register">Sign up</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
