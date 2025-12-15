import { useStore } from "@nanostores/preact";
import { aboutViewStore } from "@/stores/aboutViewStore";
import type { ComponentChildren } from "preact";

interface AboutViewWrapperProps {
  view: 'article' | 'projects';
  children: ComponentChildren;
}

export default function AboutViewWrapper({ view, children }: AboutViewWrapperProps) {
  const currentView = useStore(aboutViewStore);
  const isVisible = currentView === view;

  return (
    <div class={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 hidden'}`}>
      {children}
    </div>
  );
}


