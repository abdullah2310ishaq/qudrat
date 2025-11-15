import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center max-w-2xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-white mb-4">
            Qidrat Admin Panel
          </h1>
          <p className="text-xl text-zinc-400 mb-8">Manage courses, lessons, challenges, and more with style</p>
        </div>
        <Link
          href="/dashboard"
          className="inline-block px-8 py-4 bg-white text-black rounded-2xl hover:bg-zinc-200 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 font-bold text-lg"
        >
          Go to Dashboard →
        </Link>
        <div className="mt-12 grid grid-cols-3 gap-6 text-center">
          <div className="p-4 bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800">
            <div className="text-3xl mb-2">📚</div>
            <div className="text-sm font-semibold text-white">Courses</div>
          </div>
          <div className="p-4 bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800">
            <div className="text-3xl mb-2">💡</div>
            <div className="text-sm font-semibold text-white">Prompts</div>
          </div>
          <div className="p-4 bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-sm font-semibold text-white">Challenges</div>
          </div>
        </div>
      </div>
    </div>
  );
}
