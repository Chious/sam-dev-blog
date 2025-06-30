export interface TechItem {
  name: string;
  description: string;
  icon: string;
  category?: string;
}

export interface TechLayer {
  id: string;
  title: string;
  subtitle: string;
  position: "left" | "right";
  technologies: TechItem[];
}

export const techStackData: TechLayer[] = [
  {
    id: "frontend-core",
    title: "前端核心",
    subtitle: "現代化框架與開發工具",
    position: "left",
    technologies: [
      {
        name: "React",
        description: "組件化JS框架",
        icon: "⚛️",
      },
      {
        name: "Next.js",
        description: "全端React框架",
        icon: "▲",
      },
      {
        name: "Vite",
        description: "快速開發建構工具",
        icon: "⚡",
      },
      {
        name: "TypeScript",
        description: "類型安全的JavaScript",
        icon: "📱",
      },
    ],
  },
  {
    id: "frontend-ui",
    title: "使用者界面",
    subtitle: "設計系統與UI框架",
    position: "right",
    technologies: [
      {
        name: "Tailwind CSS",
        description: "實用優先的CSS框架",
        icon: "🎨",
      },
      {
        name: "Shadcn UI",
        description: "AI Friendly UI Library",
        icon: "🧩",
      },
      {
        name: "Radix UI",
        description: "無樣式組件系統",
        icon: "🔧",
      },
      {
        name: "Material UI",
        description: "Google設計語言",
        icon: "📐",
      },
    ],
  },
  {
    id: "frontend-state",
    title: "狀態管理",
    subtitle: "數據流與狀態同步",
    position: "left",
    technologies: [
      {
        name: "Tanstack Query",
        description: "Server State 狀態管理",
        icon: "🔄",
      },
      {
        name: "Zustand",
        description: "輕量狀態管理",
        icon: "🐻",
      },
      {
        name: "Redux",
        description: "可預測狀態容器",
        icon: "🔴",
      },
      {
        name: "Jotai",
        description: "原子化狀態管理",
        icon: "⚛️",
      },
    ],
  },
  {
    id: "backend-services",
    title: "後端服務",
    subtitle: "服務端架構與API",
    position: "right",
    technologies: [
      {
        name: "Node.js",
        description: "JavaScript運行環境",
        icon: "🟢",
      },
      {
        name: "Express.js",
        description: "快速Web應用框架",
        icon: "🚀",
      },
      {
        name: "Prisma",
        description: "現代化ORM工具",
        icon: "🔺",
      },
      {
        name: "GraphQL",
        description: "靈活的API查詢語言",
        icon: "🔥",
      },
    ],
  },
  {
    id: "tools-deployment",
    title: "工具與部署",
    subtitle: "開發效率與雲端服務",
    position: "left",
    technologies: [
      {
        name: "Docker",
        description: "容器化部署平台",
        icon: "🐳",
      },
      {
        name: "AWS",
        description: "亞馬遜雲端服務",
        icon: "☁️",
      },
      {
        name: "Gitlab",
        description: "配置 Gitlab Runner 實現自動部署",
        icon: "🦊",
      },
      {
        name: "Playwright",
        description: "E2E測試框架",
        icon: "🎭",
      },
    ],
  },
];

// 可選的技術分類映射
export const techCategories = {
  frontend: "前端開發",
  backend: "後端服務",
  mobile: "移動開發",
  devops: "開發運維",
  testing: "測試工具",
  database: "資料庫",
} as const;
