import {
  useRef,
  useCallback,
  useState,
  useMemo,
  useEffect,
} from "preact/hooks";
import Fuse from "fuse.js";
import type { UnifiedArticle } from "@/data/mockArticles";

// 擴展類型來包含搜尋結果的額外屬性
type SearchResultArticle = UnifiedArticle & {
  fuseScore?: number;
  matches?: readonly any[];
};

function SearchIsland() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultArticle[]>([]);
  const [allArticles, setAllArticles] = useState<SearchResultArticle[]>([]);
  const [loading, setLoading] = useState(false);

  // 配置 Fuse.js 選項
  const fuseOptions = useMemo(
    () => ({
      // 基本選項
      isCaseSensitive: false,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      shouldSort: true,
      findAllMatches: false,

      // 模糊匹配選項
      threshold: 0.4,
      location: 0,
      distance: 100,
      ignoreLocation: true,

      // 搜尋的欄位
      keys: [
        {
          name: "data.title",
          weight: 0.4,
        },
        {
          name: "data.tags",
          weight: 0.2,
        },
        {
          name: "data.description",
          weight: 0.2,
        },
        {
          name: "body",
          weight: 0.1,
        },
        {
          name: "data.area", // travel 專用
          weight: 0.05,
        },
        {
          name: "data.difficulty", // travel 專用
          weight: 0.05,
        },
      ],
    }),
    []
  );

  // 建立 Fuse 實例
  const fuse = useMemo(
    () => new Fuse(allArticles, fuseOptions),
    [allArticles, fuseOptions]
  );

  // 載入所有文章
  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      try {
        // 使用 API 端點獲取所有文章
        const response = await fetch("/api/search.json");
        const articles = await response.json();
        setAllArticles(articles);
        setResults(articles);
      } catch (error) {
        console.error("載入文章失敗:", error);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  // 開關 dialog 的函式
  const openDialog = useCallback(() => {
    dialogRef.current?.showModal();
  }, []);

  const closeDialog = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const handleDialogClick = useCallback(
    (event: MouseEvent) => {
      if (event.target !== dialogRef.current) return;
      closeDialog();
    },
    [closeDialog]
  );

  // 使用 Fuse.js 搜尋功能
  const handleInput = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    setQuery(value);

    if (value.trim() === "") {
      setResults(allArticles);
      return;
    }

    // 使用 Fuse.js 進行模糊搜尋
    const searchResults = fuse.search(value);

    // 轉換結果格式，加上評分資訊
    const transformedResults = searchResults.map((result) => ({
      ...result.item,
      fuseScore: result.score,
      matches: result.matches,
    }));

    setResults(transformedResults);
  };

  // 處理文章點擊 - 根據 collection 決定路由
  const handleArticleClick = (article: UnifiedArticle) => {
    let url = "";
    switch (article.collection) {
      case "blog":
        url = `/blog/${article.slug}`;
        break;
      case "notes":
        // notes 的 filePath 格式: "category/filename.md"
        // 我們需要提取 category 和檔名（去掉 .md）
        const pathParts = article.filePath.split("/");
        const category = pathParts[0];
        const filename = pathParts[1];
        const slug = filename.replace(/\.md$/, ""); // 去掉 .md 副檔名
        url = `/notes/${category}/${slug}`;
        break;
      case "travel":
        url = `/travel/${article.data.area}/${article.slug}`;
        break;
    }
    window.location.href = url;
    closeDialog();
  };

  // 截斷文字的輔助函數
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // 高亮匹配文字的函數
  const highlightMatches = (text: string, matches: readonly any[] = []) => {
    if (!matches || matches.length === 0) return text;

    const textMatches = matches.filter(
      (match) => match.value === text || text.includes(match.value)
    );

    if (textMatches.length === 0) return text;

    let highlightedText = text;
    textMatches.forEach((match) => {
      if (match.indices) {
        match.indices.forEach(([start, end]: [number, number]) => {
          const matchedText = match.value.substring(start, end + 1);
          highlightedText = highlightedText.replace(
            matchedText,
            `<mark class="bg-yellow-200">${matchedText}</mark>`
          );
        });
      }
    });

    return highlightedText;
  };

  // 獲取文章類型的顯示名稱和樣式
  const getCollectionInfo = (collection: string) => {
    switch (collection) {
      case "blog":
        return { name: "部落格", class: "bg-blue-100 text-blue-700" };
      case "notes":
        return { name: "筆記", class: "bg-green-100 text-green-700" };
      case "travel":
        return { name: "旅遊", class: "bg-purple-100 text-purple-700" };
      default:
        return { name: "文章", class: "bg-gray-100 text-gray-700" };
    }
  };

  return (
    <>
      <button
        id="search-btn"
        class="flex items-center justify-center w-10 h-10 cursor-pointer"
        onClick={openDialog}
      >
        <img src="/images/search.svg" alt="search" width={24} height={24} />
      </button>
      <dialog
        ref={dialogRef}
        class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 outline-none p-0 rounded-lg shadow-lg border-0 w-full max-w-2xl max-h-[80vh]"
        onClick={handleDialogClick}
      >
        <div class="bg-white rounded-lg overflow-hidden">
          {/* Header */}
          <div class="flex justify-between items-center p-4 border-b">
            <h2 class="text-lg font-semibold text-gray-800">搜尋全站文章</h2>
            <button
              onClick={closeDialog}
              class="text-gray-500 hover:text-gray-700 text-xl px-2 py-1 rounded hover:bg-gray-100"
            >
              ×
            </button>
          </div>

          {/* Search Input */}
          <div class="p-4 border-b">
            <input
              type="text"
              placeholder="搜尋部落格、筆記、旅遊文章..."
              value={query}
              onInput={handleInput}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autofocus
              disabled={loading}
            />
            {query && (
              <p class="text-xs text-gray-500 mt-1">
                智能搜尋 • 支援模糊匹配 • 搜尋所有文章類型
              </p>
            )}
          </div>

          {/* Results */}
          <div class="max-h-96 overflow-y-auto">
            {loading ? (
              <div class="p-8 text-center text-gray-500">
                <p>載入文章中...</p>
              </div>
            ) : results.length === 0 ? (
              <div class="p-8 text-center text-gray-500">
                <p>沒有找到相關文章</p>
                <p class="text-sm mt-1">試試其他關鍵字或檢查拼寫</p>
              </div>
            ) : (
              <div class="divide-y">
                {results.map((article) => {
                  const collectionInfo = getCollectionInfo(article.collection);
                  return (
                    <div
                      key={article.id}
                      class="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleArticleClick(article)}
                    >
                      <div class="flex justify-between items-start mb-2">
                        <h3
                          class="font-medium text-gray-900 flex-1"
                          dangerouslySetInnerHTML={{
                            __html: highlightMatches(
                              article.data.title,
                              article.matches
                            ),
                          }}
                        />
                        <div class="flex items-center gap-2 ml-2">
                          {/* 文章類型標籤 */}
                          <span
                            class={`px-2 py-1 text-xs rounded-full ${collectionInfo.class}`}
                          >
                            {collectionInfo.name}
                          </span>
                          {/* 搜尋評分 */}
                          {article.fuseScore !== undefined && query && (
                            <span class="text-xs text-gray-400">
                              {Math.round((1 - article.fuseScore) * 100)}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Tags and Area/Difficulty */}
                      <div class="flex flex-wrap gap-1 mb-2">
                        {article.data.tags?.map((tag) => (
                          <span
                            key={tag}
                            class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {article.data.area && (
                          <span class="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                            {article.data.area}
                          </span>
                        )}
                        {article.data.difficulty && (
                          <span class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                            {article.data.difficulty}
                          </span>
                        )}
                      </div>

                      {/* Content Preview */}
                      <p class="text-sm text-gray-600 line-clamp-2">
                        {article.data.description ||
                          truncateText(
                            article.body
                              .replace(/##?\s/g, "")
                              .replace(/\n/g, " "),
                            120
                          )}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div class="p-3 bg-gray-50 border-t text-center">
            <p class="text-xs text-gray-500">
              找到 {results.length} 篇文章
              {query && results.length > 0 && " • 按相關性排序"}
              {!loading && ` • 包含部落格、筆記、旅遊文章`}
            </p>
          </div>
        </div>
      </dialog>
    </>
  );
}

export default SearchIsland;
