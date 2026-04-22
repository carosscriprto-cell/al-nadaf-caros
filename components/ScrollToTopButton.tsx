'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () =>
      window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`
        fixed bottom-18 z-40 cursor-pointer
        right-6
        transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
      `}
    >
      <div
        className="
          flex h-12 w-12 items-center justify-center
          rounded-2xl
          border border-border/60
          bg-card/80 backdrop-blur-xl
          shadow-xl
          hover:-translate-y-1 hover:shadow-2xl
          transition
        "
      >
        <ArrowUp className="h-5 w-5 text-accent" />
      </div>
    </button>
  );
}