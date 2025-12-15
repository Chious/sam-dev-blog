import { atom } from 'nanostores';

export type AboutView = 'article' | 'projects';

// 預設顯示 article
export const aboutViewStore = atom<AboutView>('article');

// 切換到指定的視圖
export function setAboutView(view: AboutView) {
  aboutViewStore.set(view);
}

// 切換視圖
export function toggleAboutView() {
  const current = aboutViewStore.get();
  aboutViewStore.set(current === 'article' ? 'projects' : 'article');
}


