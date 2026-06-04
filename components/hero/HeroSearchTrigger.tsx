'use client';

import { Search } from 'lucide-react';

type Props = {
  onOpen: () => void;
};

export default function HeroSearchTrigger({
  onOpen,
}: Props) {
  return (
    <button
      onClick={onOpen}
      className="
      flex
      h-16
      w-full
      items-center
      gap-3
      rounded-3xl
      border
      border-white/10
      bg-white/10
      px-5
      text-left
      backdrop-blur-xl
      transition
      hover:bg-white/15
    "
    >
      <Search className="h-5 w-5 text-white/70" />

      <span className="text-white/70">
        Search vehicles...
      </span>
    </button>
  );
}