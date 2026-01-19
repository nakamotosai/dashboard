import { useState, useEffect, useRef, useCallback } from 'react';

interface NewsItem {
    id: string;
    title: string;
    link: string;
    pubDate: string;
    source: string;
    sourceUrl: string;
    domain: string;
}

// Simple domain cache - just remember which domains we've seen
const DOMAIN_CACHE_KEY = 'news_domain_cache';

const loadDomainCache = (): Record<string, boolean> => {
    try {
        const cached = localStorage.getItem(DOMAIN_CACHE_KEY);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (e) { /* ignore */ }
    return {};
};

const saveDomainToCache = (domain: string) => {
    try {
        const cache = loadDomainCache();
        cache[domain] = true;
        localStorage.setItem(DOMAIN_CACHE_KEY, JSON.stringify(cache));
    } catch (e) { /* ignore */ }
};

export const News = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadedIcons, setLoadedIcons] = useState<Set<string>>(new Set());
    const domainCacheRef = useRef<Record<string, boolean>>({});

    // Extended media map for Japanese news sources
    const MEDIA_MAP: Record<string, string> = {
        'reuters': 'reuters.com',
        'ロイター': 'reuters.com',
        'nikkei': 'nikkei.com',
        '日本経済新聞': 'nikkei.com',
        '日経': 'nikkei.com',
        'yahoo': 'yahoo.co.jp',
        'ヤフー': 'yahoo.co.jp',
        'asahi': 'asahi.com',
        '朝日新聞': 'asahi.com',
        '朝日': 'asahi.com',
        'yomiuri': 'yomiuri.co.jp',
        '読売新聞': 'yomiuri.co.jp',
        '読売': 'yomiuri.co.jp',
        'mainichi': 'mainichi.jp',
        '毎日新聞': 'mainichi.jp',
        '毎日': 'mainichi.jp',
        'nhk': 'nhk.or.jp',
        'kyodo': 'kyodonews.jp',
        '共同通信': 'kyodonews.jp',
        'sankei': 'sankei.com',
        '産経新聞': 'sankei.com',
        '産経': 'sankei.com',
        'tbs': 'tbs.co.jp',
        'TBS NEWS': 'tbs.co.jp',
        'jiji': 'jiji.com',
        '時事': 'jiji.com',
        '时事': 'jiji.com',
        'bloomberg': 'bloomberg.co.jp',
        'ブルームバーグ': 'bloomberg.co.jp',
        '47news': '47news.jp',
        'cnn': 'cnn.co.jp',
        'abema': 'abema.tv',
        'bunshun': 'bunshun.jp',
        '文春': 'bunshun.jp',
        'mag2': 'mag2.com',
        'tenki': 'tenki.jp',
        '天気': 'tenki.jp',
        'goo': 'goo.ne.jp',
        'livedoor': 'livedoor.com',
        'ライブドア': 'livedoor.com',
        'テレ朝': 'tv-asahi.co.jp',
        'テレビ朝日': 'tv-asahi.co.jp',
        'フジ': 'fnn.jp',
        'FNN': 'fnn.jp',
        '日テレ': 'ntv.co.jp',
        'NTV': 'ntv.co.jp',
        'テレ東': 'tv-tokyo.co.jp',
        'TV TOKYO': 'tv-tokyo.co.jp',
        'ANN': 'tv-asahi.co.jp',
        'JNN': 'tbs.co.jp',
        'NNN': 'ntv.co.jp',
        '東洋経済': 'toyokeizai.net',
        'ダイヤモンド': 'diamond.jp',
        'プレジデント': 'president.jp',
        '現代ビジネス': 'gendai.media',
        'ハフポスト': 'huffingtonpost.jp',
        'BuzzFeed': 'buzzfeed.com',
        'ITmedia': 'itmedia.co.jp',
        'CNET': 'cnet.com',
        'Gigazine': 'gigazine.net',
        '女性自身': 'jisin.jp',
        '週刊文春': 'bunshun.jp',
        '週刊新潮': 'shinchosha.co.jp',
        'スポニチ': 'sponichi.co.jp',
        'スポーツ報知': 'hochi.co.jp',
        'デイリー': 'daily.co.jp',
        'サンスポ': 'sanspo.com',
        '中日': 'chunichi.co.jp',
        '西日本': 'nishinippon.co.jp',
        '北海道': 'hokkaido-np.co.jp',
        '琉球': 'ryukyushimpo.jp',
        '東京': 'tokyo-np.co.jp',
        '神戸': 'kobe-np.co.jp'
    };

    // Get favicon URL for a domain
    const getFaviconUrl = useCallback((domain: string) => {
        if (!domain) return null;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    }, []);

    // Handle successful icon load
    const handleIconLoad = useCallback((domain: string) => {
        if (domain && !loadedIcons.has(domain)) {
            setLoadedIcons(prev => new Set([...prev, domain]));
            saveDomainToCache(domain);
        }
    }, [loadedIcons]);

    const fetchNewsWithProxy = async (rssUrl: string) => {
        const proxies = [
            (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
            (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`
        ];

        for (const proxyFn of proxies) {
            try {
                const proxyUrl = proxyFn(rssUrl);
                const response = await fetch(proxyUrl);
                if (!response.ok) continue;

                // Attempt to get text first to determine content type
                const contentType = response.headers.get('content-type');
                const text = await response.text();
                let xmlString = "";

                if (contentType?.includes('application/json') || text.trim().startsWith('{')) {
                    try {
                        const data = JSON.parse(text);
                        if (data && typeof data === 'object' && 'contents' in data) {
                            xmlString = data.contents;
                        } else {
                            // Some proxies might return the XML in a different JSON field or as a string
                            xmlString = typeof data === 'string' ? data : text;
                        }
                    } catch (e) {
                        xmlString = text;
                    }
                } else {
                    xmlString = text;
                }

                if (xmlString && xmlString.includes('<item>')) {
                    const parser = new DOMParser();
                    const xml = parser.parseFromString(xmlString, "text/xml");
                    const items = xml.querySelectorAll("item");
                    if (items.length > 0) return items;
                }
            } catch (e) {
                console.warn(`Proxy failed for ${proxyFn.name}:`, e);
            }
        }
        return null;
    };

    const fetchNews = async () => {
        try {
            setLoading(true);
            const rssUrl = 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja';
            const items = await fetchNewsWithProxy(rssUrl);

            if (items) {
                const fetchedNews: NewsItem[] = Array.from(items).slice(0, 30).map((item, idx) => {
                    const sourceEl = item.querySelector("source");
                    const rawSourceName = sourceEl?.textContent || "Google News";
                    const sourceUrl = sourceEl?.getAttribute("url") || "";
                    const link = item.querySelector("link")?.textContent || "";

                    const sourceName = rawSourceName.replace(/ - Reuters$/i, '').replace(/ - 日本経済新聞$/i, '').trim();

                    let domain = "";
                    const nameLower = rawSourceName.toLowerCase();

                    for (const [key, val] of Object.entries(MEDIA_MAP)) {
                        if (nameLower.includes(key.toLowerCase())) {
                            domain = val;
                            break;
                        }
                    }

                    if (!domain) {
                        try {
                            const urlToParse = sourceUrl && !sourceUrl.includes('google.com') ? sourceUrl : link;
                            const extracted = new URL(urlToParse).hostname.replace('www.', '');
                            if (extracted && !extracted.includes('google.com')) domain = extracted;
                        } catch (e) { /* ignore */ }
                    }

                    if (!domain && nameLower.includes('yahoo')) domain = 'yahoo.co.jp';

                    return {
                        id: `news-${idx}-${Date.now()}`,
                        title: item.querySelector("title")?.textContent || "",
                        link: link,
                        pubDate: item.querySelector("pubDate")?.textContent || "",
                        source: sourceName,
                        sourceUrl: sourceUrl,
                        domain: domain
                    };
                });

                setNews(fetchedNews);
                setLoading(false);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error("Failed to fetch news", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        // Load cached domains on mount
        domainCacheRef.current = loadDomainCache();
        const cachedDomains = Object.keys(domainCacheRef.current);
        if (cachedDomains.length > 0) {
            setLoadedIcons(new Set(cachedDomains));
        }

        fetchNews();
        const interval = setInterval(fetchNews, 600000); // 10 mins
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="glass-panel rounded-3xl p-5 flex flex-col h-full relative overflow-hidden group">
            <div className="flex-1 overflow-visible relative mask-linear-fade">
                {/* Loading Spinner */}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <div className="w-8 h-8 border-2 border-white/10 border-t-white/60 rounded-full animate-spin backdrop-blur-sm"></div>
                    </div>
                )}

                <div className={`flex flex-col gap-3 px-4 py-2 animate-vertical-scroll hover:pause-animation ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}>
                    {news.length > 0 ? [...news, ...news].map((item, index) => {
                        const faviconUrl = getFaviconUrl(item.domain);
                        const showIcon = item.domain && faviconUrl;

                        return (
                            <a
                                key={`${item.id}-${index}`}
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex gap-4 p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-luxury-gold/20 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] group/item"
                            >
                                <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-zinc-800/50 border border-white/5 relative flex items-center justify-center">
                                    {showIcon ? (
                                        <img
                                            src={faviconUrl}
                                            alt=""
                                            className="w-10 h-10 object-contain opacity-90 transition-opacity"
                                            referrerPolicy="no-referrer"
                                            onLoad={() => handleIconLoad(item.domain)}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const fallback = target.parentElement?.querySelector('.fallback-text') as HTMLElement;
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className="fallback-text w-full h-full items-center justify-center text-[10px] text-white/20 font-bold uppercase tracking-tighter text-center px-1 bg-white/5 absolute inset-0"
                                        style={{ display: showIcon ? 'none' : 'flex' }}
                                    >
                                        {item.source.substring(0, 4)}
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col justify-center min-w-0">
                                    <div className="text-[13px] font-sans text-gray-200 line-clamp-2 leading-snug mb-1.5 font-medium group-hover/item:text-white transition-colors">
                                        {item.title}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] text-zinc-500 font-mono">
                                            {new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="text-[10px] text-zinc-400 font-sans tracking-wide truncate max-w-[100px]">{item.source}</span>
                                    </div>
                                </div>
                            </a>
                        );
                    }) : !loading && (
                        <div className="h-full flex items-center justify-center flex-col gap-2 text-zinc-500">
                            <div className="text-sm italic">News temporarily unavailable</div>
                            <button
                                onClick={() => { setLoading(true); fetchNews(); }}
                                className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Decorative Bloom */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-luxury-gold/5 rounded-full blur-3xl pointer-events-none" />
        </div>
    );
};
