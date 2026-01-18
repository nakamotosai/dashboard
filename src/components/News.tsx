import { useState, useEffect } from 'react';

interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    source: string;
    image?: string;
}

export const News = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNews = async () => {
        try {
            // Google News RSS (Japan)
            const rssUrl = 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja';
            const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(rssUrl));
            const data = await response.json();

            if (data.contents) {
                const parser = new DOMParser();
                const xml = parser.parseFromString(data.contents, "text/xml");
                const items = xml.querySelectorAll("item");

                const fetchedNews: NewsItem[] = Array.from(items).slice(0, 30).map(item => ({
                    title: item.querySelector("title")?.textContent || "",
                    link: item.querySelector("link")?.textContent || "",
                    pubDate: item.querySelector("pubDate")?.textContent || "",
                    source: item.querySelector("source")?.textContent || "Google News",
                }));

                setNews(fetchedNews);
                setLoading(false);

                // Asynchronously fetch images for the top items
                fetchedNews.slice(0, 15).forEach(async (item) => {
                    try {
                        const pageRes = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(item.link));
                        const pageData = await pageRes.json();
                        const html = pageData.contents;

                        // Try various meta tags and patterns
                        const patterns = [
                            /property="og:image" content="([^"]+)"/,
                            /name="twitter:image" content="([^"]+)"/,
                            /itemprop="image" content="([^"]+)"/,
                            /rel="image_src" href="([^"]+)"/,
                            /"thumbnailUrl":"([^"]+)"/
                        ];

                        let imageUrl = "";
                        for (const pattern of patterns) {
                            const match = html.match(pattern);
                            if (match && match[1]) {
                                imageUrl = match[1];
                                break;
                            }
                        }

                        // Fallback: If no meta, try to find the first large-ish image in the content
                        if (!imageUrl) {
                            const imgMatch = html.match(/<img[^>]+src="([^">]+\.(?:jpg|jpeg|png|webp)[^">]*)"/i);
                            if (imgMatch && imgMatch[1] && !imgMatch[1].includes('icon') && !imgMatch[1].includes('logo')) {
                                imageUrl = imgMatch[1];
                            }
                        }

                        if (imageUrl) {
                            setNews(prev => {
                                const next = [...prev];
                                const currentItemIndex = next.findIndex(n => n.link === item.link);
                                if (currentItemIndex !== -1) {
                                    next[currentItemIndex] = { ...next[currentItemIndex], image: imageUrl };
                                }
                                return next;
                            });
                        }
                    } catch (e) {
                        console.error("Image fetch failed for", item.title, e);
                    }
                });
            }
        } catch (error) {
            console.error("Failed to fetch news", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
        const interval = setInterval(fetchNews, 600000); // 10 mins
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass-panel rounded-3xl p-5 flex flex-col h-full relative overflow-hidden group">
            <div className="flex-1 overflow-hidden relative mask-linear-fade">
                <div className="flex flex-col gap-3 animate-vertical-scroll hover:pause-animation">
                    {news.length > 0 ? [...news, ...news].map((item, index) => (
                        <a
                            key={index}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex gap-4 p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-red-500/30 group/item transform hover:scale-[1.01]"
                        >
                            <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-zinc-800/50 border border-white/5 relative">
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt=""
                                        className="w-full h-full object-cover opacity-80 group-hover/item:opacity-100 transition-opacity"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-white/10 font-bold uppercase tracking-tighter text-center px-1">
                                        {item.source.substring(0, 10)}
                                    </div>
                                )}
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
                    )) : !loading && (
                        <div className="h-full flex items-center justify-center text-zinc-600 italic text-sm">
                            No news available.
                        </div>
                    )}
                </div>
            </div>

            {/* Decorative Bloom */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        </div>
    );
};
