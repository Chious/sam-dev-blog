import { useState, useEffect } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { aboutViewStore, setAboutView } from "@/stores/aboutViewStore";
import type { Project } from "@/utils/notion";

interface ProfileFlipCardProps {
  imageSrc: string;
  projects: Project[];
}

export default function ProfileFlipCard({
  imageSrc,
  projects,
}: ProfileFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentThought, setCurrentThought] = useState(0);
  const currentView = useStore(aboutViewStore);

  const thoughts = [
    "💭 I'm thinking of...",
    "💡 Building cool stuff!",
    "🚀 Next.js? Astro?",
    "☕ Coffee first...",
    "🎨 Design matters!",
    "📚 Always learning...",
  ];

  // 定期更換思考內容
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentThought((prev) => (prev + 1) % thoughts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    // 切換顯示內容：如果是正面，顯示 projects；如果是背面，顯示 article
    setAboutView(isFlipped ? "article" : "projects");
  };

  return (
    <div
      class="relative flex justify-center items-center mb-16"
      style={{ perspective: "1000px" }}
    >
      <div
        class={`relative w-[300px] h-[300px] transition-transform duration-700 ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          class="absolute w-full h-full cursor-pointer group"
          style={{ backfaceVisibility: "hidden" }}
          onClick={handleFlip}
        >
          <div class="relative">
            <div class="absolute inset-0 border-transparent bg-black/60 hover:border-black border-2 border-dashed rounded-full flex items-center justify-center transition-colors z-10 opacity-0 group-hover:opacity-100">
              <h2
                class={`text-lg font-semibold text-white underline ${
                  isFlipped ? "rotate-y-180" : ""
                }`}
              >
                {!isFlipped ? "顯示作品集" : "返回"}
              </h2>
            </div>
            <img
              src={imageSrc}
              alt="Sam 的個人照片"
              class="w-[300px] h-[300px] rounded-full shadow-lg object-cover"
            />

            <div
              id="bubble"
              class={`absolute -top-16 -right-20 bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-lg
                         border-2 border-gray-200 dark:border-gray-700 text-sm font-medium
                         text-gray-800 dark:text-gray-200 whitespace-nowrap
                         animate-bounce ${isFlipped ? "hidden" : "block"}`}
            >
              {thoughts[currentThought]}
            </div>

            <div
              id="bubble-tail"
              class={`absolute -top-8 right-2 w-0 h-0 
                          border-l-[10px] border-l-transparent
                          border-r-[10px] border-r-transparent
                          border-t-[15px] border-t-white dark:border-t-gray-800 ${
                            isFlipped ? "hidden" : "block"
                          }`}
            ></div>
          </div>
        </div>

        <div
          class="absolute w-full h-full cursor-pointer"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
          onClick={handleFlip}
        >
          <div class="w-[300px] h-[300px] bg-white dark:bg-gray-800 rounded-full shadow-lg p-6 overflow-y-auto flex flex-col items-center justify-center">
            <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 sticky top-0 bg-white dark:bg-gray-800 pb-2">
              作品集
            </h3>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-bounce {
          animation: bounce 2s infinite;
        }

        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
