
import React, { useState, useEffect } from 'react';
import { Movie, AppState, MOODS, GENRES, UserPreferences, User } from './types';
import { getMovieRecommendation } from './services/geminiService';
import MovieCard from './components/MovieCard';
import { Film, Home, Bookmark, Loader2, Sparkles, ChevronLeft, Info, Search, Clapperboard, Star, Settings, LogOut, User as UserIcon } from 'lucide-react';

const PLACEHOLDERS = [
  "مثلاً: یه فیلم جدید هندی که امتیاز بالایی داره و بیشتر تو فضای باز هست و جایزه های زیادی گرفته...",
  "مثلاً: یه سریال حال خوب کن واسه آموزش زبان ساده باشه و پر مخاطب شبیه فرندز...",
  "مثلاً: یه مستند راجع به کهکشان‌ها و فضا که تصاویر خیره‌کننده داشته باشه...",
  "مثلاً: یه فیلم ترسناک که جامپ اسکر نداشته باشه و بیشتر اتمسفریک باشه...",
  "مثلاً: یه انیمیشن کوتاه و بامزه که مناسب بچه‌ها باشه و مفهوم دوستی رو یاد بده..."
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.HOME);
  const [user, setUser] = useState<User | null>(null);
  const [currentPlaceholder, setCurrentPlaceholder] = useState('');
  const [preferences, setPreferences] = useState<UserPreferences>({
    mood: '',
    genres: [],
    additionalInfo: '',
    excludedTitles: []
  });
  const [recommendation, setRecommendation] = useState<Movie | null>(null);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Session load
    const savedUser = localStorage.getItem('bb_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const savedWatchlist = localStorage.getItem('bb_watchlist');
    if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
    
    const savedSeen = localStorage.getItem('bb_seen');
    if (savedSeen) setPreferences(prev => ({ ...prev, excludedTitles: JSON.parse(savedSeen) }));

    const savedPrefs = localStorage.getItem('bb_prefs');
    if (savedPrefs) setPreferences(prev => ({ ...prev, ...JSON.parse(savedPrefs) }));

    // Random placeholder
    setCurrentPlaceholder(PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]);
  }, []);

  const handleLogin = () => {
    const mockUser = {
      name: 'کاربر عزیز',
      email: 'user@gmail.com',
      picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      isLoggedIn: true
    };
    setUser(mockUser);
    localStorage.setItem('bb_user', JSON.stringify(mockUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('bb_user');
  };

  const addToWatchlist = (movie: Movie) => {
    if (!watchlist.find(m => m.id === movie.id)) {
      const newList = [...watchlist, movie];
      setWatchlist(newList);
      localStorage.setItem('bb_watchlist', JSON.stringify(newList));
    }
  };

  const removeFromWatchlist = (id: string) => {
    const newList = watchlist.filter(m => m.id !== id);
    setWatchlist(newList);
    localStorage.setItem('bb_watchlist', JSON.stringify(newList));
  };

  const handleGetRecommendation = async (isNext = false) => {
    setError(null);
    setState(AppState.LOADING);
    
    localStorage.setItem('bb_prefs', JSON.stringify({
      mood: preferences.mood,
      genres: preferences.genres,
      additionalInfo: preferences.additionalInfo
    }));

    let currentExcludes = [...(preferences.excludedTitles || [])];
    if (isNext && recommendation) {
      currentExcludes.push(recommendation.title);
      setPreferences(prev => ({ ...prev, excludedTitles: currentExcludes }));
      localStorage.setItem('bb_seen', JSON.stringify(currentExcludes));
    }

    try {
      const movie = await getMovieRecommendation({ ...preferences, excludedTitles: currentExcludes });
      setRecommendation(movie);
      setState(AppState.RESULT);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError('مشکلی پیش آمد. دوباره تلاش کنید.');
      setState(AppState.HOME);
    }
  };

  const toggleGenre = (genre: string) => {
    setPreferences(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const toggleMood = (label: string) => {
    setPreferences(prev => ({
      ...prev,
      mood: prev.mood === label ? '' : label
    }));
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-[#020617] text-right font-['Vazirmatn']">
      <nav className="sticky top-0 z-50 glass-card px-6 py-4 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setState(AppState.HOME)}>
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
            <Clapperboard className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-black bg-gradient-to-l from-cyan-400 to-blue-500 bg-clip-text text-transparent">بده ببینم</h1>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => setState(AppState.HOME)} className={`flex items-center gap-2 font-bold transition-all ${state === AppState.HOME ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}>
            <Settings size={18} /> تنظیمات
          </button>
          <button onClick={() => setState(AppState.WATCHLIST)} className={`flex items-center gap-2 font-bold transition-all ${state === AppState.WATCHLIST ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}>
            <Bookmark size={18} /> بعداً ببینم
            {watchlist.length > 0 && (
              <span className="bg-cyan-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">{watchlist.length}</span>
            )}
          </button>
          {user ? (
            <div className="flex items-center gap-3 border-r border-white/10 pr-6">
              <img src={user.picture} className="w-9 h-9 rounded-full border border-white/20" alt="Profile" />
              <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button onClick={handleLogin} className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all border border-white/5">ورود با گوگل</button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 mt-6">
        {state === AppState.HOME && (
          <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-6">
               <div className="flex justify-center">
                 {!user ? (
                   <button onClick={handleLogin} className="bg-cyan-500/10 text-cyan-400 px-6 py-2 rounded-full text-xs font-bold border border-cyan-500/20 hover:bg-cyan-500/20 transition-all">
                     برای ذخیره لیست تماشا و پیشنهادهای شخصی وارد شوید
                   </button>
                 ) : (
                   <span className="bg-green-500/10 text-green-400 px-6 py-2 rounded-full text-xs font-bold border border-green-500/20">هوش مصنوعی آماده به خدمت، {user.name}</span>
                 )}
               </div>
              <h2 className="text-5xl font-black text-white leading-tight">چی میخوای ببینی؟</h2>
            </div>

            <section className="space-y-6">
              <h3 className="text-xl font-black flex items-center gap-2 text-white">
                <Sparkles size={24} className="text-yellow-500" /> الان چه حسی داری؟
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {MOODS.map(mood => (
                  <button
                    key={mood.id}
                    onClick={() => toggleMood(mood.label)}
                    className={`p-6 rounded-[2rem] transition-all border-2 flex flex-col items-center gap-3 active:scale-95 ${
                      preferences.mood === mood.label 
                        ? 'border-cyan-500 bg-cyan-500/10 text-white shadow-[0_0_30px_rgba(6,182,212,0.1)]' 
                        : 'border-slate-800 bg-slate-800/20 text-slate-400 hover:border-slate-600 hover:text-white'
                    }`}
                  >
                    <span className="text-5xl">{mood.icon}</span>
                    <span className="font-bold">{mood.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-xl font-black flex items-center gap-2 text-white">
                <Search size={24} className="text-cyan-500" /> چه ژانرهایی رو می‌پسندی؟
              </h3>
              <div className="flex flex-wrap gap-3">
                {GENRES.map(genre => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`px-5 py-2.5 rounded-2xl transition-all border-2 font-bold ${
                      preferences.genres.includes(genre)
                        ? 'border-cyan-500 bg-cyan-600 text-white shadow-lg shadow-cyan-900/30'
                        : 'border-slate-800 bg-slate-800/10 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-xl font-black flex items-center gap-2 text-white">
                <Info size={24} className="text-blue-500" /> نکته خاصی داری؟
              </h3>
              <textarea
                className="w-full h-40 bg-slate-900/50 border-2 border-slate-800 rounded-[2rem] p-8 text-white focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-600 text-lg leading-relaxed"
                placeholder={currentPlaceholder}
                value={preferences.additionalInfo}
                onChange={(e) => setPreferences({ ...preferences, additionalInfo: e.target.value })}
              />
            </section>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-6 rounded-[2rem] text-center font-bold">
                {error}
              </div>
            )}

            <button
              onClick={() => handleGetRecommendation(false)}
              className="w-full bg-gradient-to-l from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-black py-7 rounded-[2rem] text-2xl shadow-2xl transition-all transform hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-4"
            >
              <Film size={28} />
              بده ببینم چی داری!
            </button>
          </div>
        )}

        {state === AppState.LOADING && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-10">
            <div className="relative">
              <Loader2 size={120} className="text-cyan-500 animate-spin opacity-40" />
              <Clapperboard className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white animate-bounce" size={40} />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white">در حال گشتن...</h2>
              <p className="text-slate-400 text-xl font-light">دارم بهترین فیلما رو برات پیدا می‌کنم.</p>
            </div>
          </div>
        )}

        {state === AppState.RESULT && recommendation && (
          <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <MovieCard 
              movie={recommendation} 
              onAddToWatchlist={addToWatchlist}
              isInWatchlist={watchlist.some(m => m.id === recommendation.id)}
              onRemoveFromWatchlist={removeFromWatchlist}
              onNextRecommendation={() => handleGetRecommendation(true)}
            />
          </div>
        )}

        {state === AppState.WATCHLIST && (
          <div className="space-y-10 animate-in fade-in duration-500">
             <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-white/5 pb-10">
              <h2 className="text-4xl font-black text-white flex items-center gap-4">
                <Bookmark size={36} className="text-cyan-500" /> بعداً ببینم
              </h2>
              <button 
                onClick={() => setState(AppState.HOME)}
                className="bg-cyan-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-cyan-500 transition-all shadow-xl"
              >
                + پیشنهاد جدید
              </button>
            </div>

            {watchlist.length === 0 ? (
              <div className="glass-card p-24 rounded-[3.5rem] text-center space-y-8 border-dashed border-2 border-white/10">
                <Bookmark size={64} className="mx-auto text-slate-700" />
                <h3 className="text-3xl font-bold text-slate-300">لیستت خالیه!</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {watchlist.map(movie => (
                  <div key={movie.id} className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col group border-white/5 hover:border-cyan-500/40 transition-all">
                    <div className="h-72 relative overflow-hidden">
                      <img src={movie.posterUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <button 
                        onClick={() => removeFromWatchlist(movie.id)}
                        className="absolute top-4 left-4 p-3 bg-red-500 rounded-full text-white shadow-lg"
                      >
                        <Bookmark size={20} fill="currentColor" />
                      </button>
                      <div className="absolute bottom-4 right-6 bg-yellow-500 text-slate-900 font-black text-xs px-3 py-1 rounded-lg flex items-center gap-1">
                        <Star size={12} fill="currentColor" /> {movie.rating}
                      </div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col justify-between">
                      <h4 className="text-2xl font-black text-white mb-3">{movie.title}</h4>
                      <div className="flex gap-3 mt-4">
                        <a href={movie.streamUrl} target="_blank" className="flex-[2] bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl text-center text-sm font-black">کجا ببینم؟</a>
                        <button onClick={() => { setRecommendation(movie); setState(AppState.RESULT); }} className="flex-1 bg-cyan-600/10 text-cyan-400 py-4 rounded-2xl text-sm font-black">جزئیات</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 glass-card border-t border-white/10 px-8 py-5 flex justify-around items-center z-50 rounded-t-[2.5rem]">
        <button onClick={() => setState(AppState.HOME)} className={`flex flex-col items-center gap-1 transition-all ${state === AppState.HOME ? 'text-cyan-400 scale-110' : 'text-slate-500'}`}>
          <Settings size={26} />
          <span className="text-[10px] font-bold">تنظیمات</span>
        </button>
        <button onClick={() => setState(AppState.WATCHLIST)} className={`flex flex-col items-center gap-1 transition-all ${state === AppState.WATCHLIST ? 'text-cyan-400 scale-110' : 'text-slate-500'}`}>
          <div className="relative">
            <Bookmark size={26} />
            {watchlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-cyan-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{watchlist.length}</span>
            )}
          </div>
          <span className="text-[10px] font-bold">بعداً ببینم</span>
        </button>
      </div>
    </div>
  );
};

export default App;
