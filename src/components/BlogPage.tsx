import React, { useState, useEffect, useMemo } from 'react';
import { marked } from 'marked';
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  ArrowLeft, 
  Share2, 
  Check, 
  Tag, 
  Search, 
  ChevronRight, 
  FileSpreadsheet, 
  ShieldCheck, 
  ExternalLink,
  Layers,
  Sparkles,
  ArrowRight,
  Calculator,
  Bookmark
} from 'lucide-react';
import { Page } from '../types';
import { BLOG_POSTS, BlogPost } from '../data/blogPosts';

interface BlogPageProps {
  setPage: (page: Page) => void;
  initialSlug?: string | null;
  onOpenTenderWizard?: () => void;
  onOpenCostCalculator?: () => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({
  setPage,
  initialSlug = null,
  onOpenTenderWizard,
  onOpenCostCalculator
}) => {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(initialSlug);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  // Sync with URL query or hash on mount/change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const postFromQuery = urlParams.get('post');
      const hash = window.location.hash;
      
      if (postFromQuery) {
        setSelectedSlug(postFromQuery);
      } else if (hash.startsWith('#blog/')) {
        const slugFromHash = hash.replace('#blog/', '');
        if (slugFromHash) setSelectedSlug(slugFromHash);
      }
    }
  }, []);

  // Update URL history when slug changes
  const handleSelectPost = (slug: string) => {
    setSelectedSlug(slug);
    if (typeof window !== 'undefined') {
      try {
        const newUrl = `${window.location.pathname}?post=${encodeURIComponent(slug)}`;
        window.history.pushState({ slug }, '', newUrl);
      } catch {
        window.location.hash = `blog/${slug}`;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToList = () => {
    setSelectedSlug(null);
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState(null, '', window.location.pathname);
      } catch {
        window.location.hash = 'blog';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Track reading progress on active article
  useEffect(() => {
    if (!selectedSlug) return;

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedSlug]);

  const activePost = useMemo(() => {
    if (!selectedSlug) return null;
    return BLOG_POSTS.find(p => p.slug === selectedSlug) || null;
  }, [selectedSlug]);

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(BLOG_POSTS.map(p => p.category))];
    return cats;
  }, []);

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter(post => {
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      const matchesQuery = 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const renderedMarkdown = useMemo(() => {
    if (!activePost) return '';
    try {
      return marked.parse(activePost.content, { async: false }) as string;
    } catch {
      return activePost.content;
    }
  }, [activePost]);

  const handleCopyArticleLink = async () => {
    if (typeof window === 'undefined') return;
    try {
      const url = `${window.location.origin}${window.location.pathname}?post=${encodeURIComponent(activePost?.slug || '')}`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy article link:', err);
    }
  };

  // WhatsApp share
  const whatsappArticleShare = () => {
    if (!activePost || typeof window === 'undefined') return;
    const url = `${window.location.origin}${window.location.pathname}?post=${encodeURIComponent(activePost.slug)}`;
    const text = encodeURIComponent(`Check out this compliance guide from MeloTwo Safety:\n"${activePost.title}"\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // ==========================================
  // ARTICLE READER VIEW
  // ==========================================
  if (activePost) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 relative">
        {/* Reading Progress Indicator */}
        <div 
          className="fixed top-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-indigo-500 z-50 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <button
              onClick={handleBackToList}
              className="inline-flex items-center space-x-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Knowledge Base</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={whatsappArticleShare}
                className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                title="Share via WhatsApp"
              >
                <span>Share WhatsApp</span>
              </button>

              <button
                onClick={handleCopyArticleLink}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer border border-slate-700"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
                <span>{isCopied ? 'Link Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Article Header Card */}
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-amber-500/20 border border-amber-500/30 text-amber-300">
                {activePost.category}
              </span>
              <span className="flex items-center text-xs text-slate-400 space-x-1">
                <Clock className="w-3.5 h-3.5 mr-1" />
                {activePost.readTime}
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center text-xs text-slate-400 space-x-1">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                {activePost.publishedAt}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {activePost.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              {activePost.description}
            </p>

            <div className="flex items-center space-x-3 pt-3 border-t border-slate-800/80">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-md ring-2 ring-slate-800">
                {activePost.author.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{activePost.author.name}</p>
                <p className="text-xs text-slate-400">{activePost.author.role}</p>
              </div>
            </div>
          </header>

          {/* Rendered Markdown Article Body */}
          <article 
            className="prose prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white prose-h1:text-2xl prose-h2:text-xl prose-h2:border-b prose-h2:border-slate-800 prose-h2:pb-2 prose-h2:mt-8 prose-h3:text-lg prose-p:text-slate-300 prose-p:leading-relaxed prose-li:text-slate-300 prose-strong:text-amber-300 prose-table:w-full prose-table:text-left prose-table:border-collapse prose-th:bg-slate-900 prose-th:p-3 prose-th:text-xs prose-th:font-bold prose-th:text-slate-200 prose-th:border prose-th:border-slate-800 prose-td:p-3 prose-td:text-xs prose-td:border prose-td:border-slate-800/80 prose-td:text-slate-300 prose-tr:even:bg-slate-900/40 prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:bg-slate-900/60 prose-blockquote:p-4 prose-blockquote:rounded-r-xl prose-blockquote:text-slate-200 prose-blockquote:italic"
            dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
          />

          {/* Tags */}
          <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 flex items-center mr-1">
              <Tag className="w-3.5 h-3.5 mr-1" /> Tags:
            </span>
            {activePost.tags.map(tag => (
              <span 
                key={tag}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* High-Conversion Bottom Call-to-Action Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/70 border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-2xl relative overflow-hidden mt-12">
            <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-extrabold uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Immediate Regulatory Readiness</span>
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white">
                Eliminate Tender Gate Rejections with MeloTwo
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                Automatically generate all 20 statutory sections required by MHSA (Act 29 of 1996) and DMRE guidelines in under 90 seconds. 100% audit-proof.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => {
                  if (onOpenTenderWizard) {
                    onOpenTenderWizard();
                  } else {
                    window.location.hash = 'tender-file';
                  }
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Build 20-Section Tender File</span>
              </button>

              <button
                onClick={() => {
                  if (onOpenCostCalculator) {
                    onOpenCostCalculator();
                  } else {
                    window.location.hash = 'calculate-cost';
                  }
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-cyan-500/40 text-cyan-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-cyan-400" />
                <span>Calculate Site Stoppage Cost</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // BLOG LIST & ARCHIVE VIEW
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        
        {/* HEADER HERO */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-12 text-white shadow-2xl">
          <div className="absolute right-0 bottom-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute left-1/3 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wide">
              <BookOpen className="w-4 h-4" />
              <span>SHEQ & Industrial Mining Knowledge Base</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Regulatory Blueprints, MHSA Case Law & Stoppage Prevention
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Technical whitepapers, SANS standards walkthroughs, and executive guides designed for South African Mine Managers, SHEQ Officers, and Contractors.
            </p>
          </div>
        </div>

        {/* SEARCH & CATEGORY FILTER BAR */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px] md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search guides, SANS, MHSA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>
        </div>

        {/* FEATURED POST (If available and no query filtering) */}
        {selectedCategory === 'All' && !searchQuery && (
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950/50 border border-slate-800 rounded-3xl p-6 sm:p-8 hover:border-slate-700 transition shadow-xl group">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                    Featured Blueprint
                  </span>
                  <span className="text-xs text-slate-400">• {BLOG_POSTS[0].readTime}</span>
                </div>
                <h2 
                  onClick={() => handleSelectPost(BLOG_POSTS[0].slug)}
                  className="text-2xl sm:text-3xl font-black text-white group-hover:text-amber-400 transition cursor-pointer"
                >
                  {BLOG_POSTS[0].title}
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {BLOG_POSTS[0].description}
                </p>
                <div className="flex items-center space-x-3 pt-2 text-xs text-slate-400">
                  <span>By {BLOG_POSTS[0].author.name}</span>
                  <span>•</span>
                  <span>{BLOG_POSTS[0].publishedAt}</span>
                </div>
              </div>

              <button
                onClick={() => handleSelectPost(BLOG_POSTS[0].slug)}
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wide transition shrink-0 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <span>Read Full Blueprint</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ARTICLES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map(post => (
            <div
              key={post.slug}
              onClick={() => handleSelectPost(post.slug)}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:shadow-xl transition-all duration-200 cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-amber-300 border border-slate-700">
                    {post.category}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> {post.readTime}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition leading-snug line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {post.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  <span className="font-medium text-slate-300">{post.author.name}</span>
                  <span className="block text-[10px] text-slate-500">{post.publishedAt}</span>
                </div>

                <span className="text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center">
                  Read <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-3">
            <BookOpen className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-base font-bold text-white">No compliance guides found</p>
            <p className="text-xs text-slate-400">Try adjusting your search query or selecting a different category.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
