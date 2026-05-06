import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PublicNav } from '@/components/layout/PublicNav';
import { ArrowRight, FileText, CheckCircle, Zap, Target, Search } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      
      {/* Hero Section */}
      <section className="py-24 px-4 container max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-8">
          <Zap className="w-4 h-4" />
          AI-Powered Match Scoring
        </div>
        <h1 className="text-5xl md:text-6xl font-medium tracking-tight text-blue-950 mb-6 leading-tight">
          Land your dream job with a <br className="hidden md:block" />
          <span className="text-violet-600">perfectly matched CV</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Upload your resume, paste the job description, and let our AI analyze your match score. Get instant feedback and a retailored CV to beat the ATS.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="h-12 px-8 text-base">
            <Link to="/match">
              Score My CV Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
            <Link to="/auth/register">Create Free Account</Link>
          </Button>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-medium text-blue-950">How SyncRes works</h2>
            <p className="mt-4 text-gray-600 text-lg">Three simple steps to a better application.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center">
                <FileText className="w-8 h-8 text-blue-950" />
              </div>
              <h3 className="text-xl font-medium text-blue-950">1. Upload CV</h3>
              <p className="text-gray-600">Securely upload your current PDF or Word resume, or just paste the text.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center">
                <Search className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="text-xl font-medium text-blue-950">2. Add Job Post</h3>
              <p className="text-gray-600">Provide the job description you are targeting. We'll extract the core requirements.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center">
                <Target className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-medium text-blue-950">3. Get Matched</h3>
              <p className="text-gray-600">Instantly view your match score, missing skills, and download a tailored CV.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors bg-white shadow-sm">
              <CheckCircle className="w-10 h-10 text-violet-600 mb-6" />
              <h3 className="text-xl font-medium text-blue-950 mb-3">ATS Optimization</h3>
              <p className="text-gray-600">Ensure your resume gets past the Applicant Tracking Systems by hitting the exact keywords recruiters are looking for.</p>
            </div>
            <div className="p-8 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors bg-white shadow-sm">
              <Zap className="w-10 h-10 text-emerald-500 mb-6" />
              <h3 className="text-xl font-medium text-blue-950 mb-3">AI CV Tailoring</h3>
              <p className="text-gray-600">If your score is high enough, our AI rewrites your bullet points to align perfectly with the target role without changing your history.</p>
            </div>
            <div className="p-8 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors bg-white shadow-sm">
              <Target className="w-10 h-10 text-blue-950 mb-6" />
              <h3 className="text-xl font-medium text-blue-950 mb-3">Application Tracking</h3>
              <p className="text-gray-600">Manage all your tailored CVs and track your job applications in an integrated Kanban board designed for job seekers.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
