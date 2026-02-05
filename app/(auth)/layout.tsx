'use client';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated blobs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl animate-blob-reverse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-500/15 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
