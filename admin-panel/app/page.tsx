import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center max-w-4xl mx-auto px-6 py-12">
        {/* Main Header */}
        <div className="mb-16">
          <h1 className="text-7xl font-thin text-white mb-6 tracking-tight">
            Qudrat Academy
          </h1>
          <div className="w-24 h-px bg-white/30 mx-auto mb-6"></div>
          <p className="text-lg font-light text-zinc-400 tracking-wide">
            Manage courses, lessons, challenges, and more
          </p>
        </div>

        {/* Dashboard Button */}
        <Link
          href="/dashboard"
          className="inline-block px-10 py-3 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase"
        >
          Go to Dashboard
        </Link>

        {/* Feature Cards */}
        <div className="mt-20 grid grid-cols-3 gap-8 text-center">
          <div className="p-8 bg-black/40 rounded-sm border border-white/10 hover:border-white/20 transition-all duration-300 group">
            <div className="text-4xl mb-4 opacity-70 group-hover:opacity-100 transition-opacity">📚</div>
            <div className="text-xs font-light text-white/80 tracking-wider uppercase">Courses</div>
          </div>
          <div className="p-8 bg-black/40 rounded-sm border border-white/10 hover:border-white/20 transition-all duration-300 group">
            <div className="text-4xl mb-4 opacity-70 group-hover:opacity-100 transition-opacity">💡</div>
            <div className="text-xs font-light text-white/80 tracking-wider uppercase">Prompts</div>
          </div>
          <div className="p-8 bg-black/40 rounded-sm border border-white/10 hover:border-white/20 transition-all duration-300 group">
            <div className="text-4xl mb-4 opacity-70 group-hover:opacity-100 transition-opacity">🎯</div>
            <div className="text-xs font-light text-white/80 tracking-wider uppercase">Challenges</div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <p className="text-xs font-light text-zinc-500 tracking-widest uppercase">
            Admin Portal
          </p>
        </div>
      </div>
    </div>
  );
}
