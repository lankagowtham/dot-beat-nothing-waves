
import AudioPlayer from "@/components/AudioPlayer";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useRef } from "react";
import anime from "animejs";

const Index = () => {
  const headerRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate the header
    if (headerRef.current) {
      anime({
        targets: headerRef.current,
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 800,
        easing: 'easeOutCubic'
      });
    }

    // Animate the main content
    if (mainRef.current) {
      anime({
        targets: mainRef.current,
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutQuad'
      });
    }

    // Animate the cards with staggered effect
    if (cardsRef.current) {
      anime({
        targets: cardsRef.current.children,
        scale: [0.9, 1],
        opacity: [0, 1],
        delay: anime.stagger(150),
        duration: 800,
        easing: 'easeOutSine'
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-black text-white">
      <header ref={headerRef} className="mb-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Dot Matrix Audio Visualizer</h1>
        <p className="text-gray-400 mt-2">Upload your music or capture background audio and watch the beats come alive</p>
      </header>
      
      <main ref={mainRef} className="flex-1 max-w-5xl mx-auto w-full">
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Main audio visualizer - spans 2 columns */}
          <Card className="md:col-span-2 row-span-2 bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
            <CardContent className="p-4 h-[60vh] md:h-[65vh]">
              <AudioPlayer />
            </CardContent>
          </Card>
          
          {/* Info card */}
          <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
            <CardContent className="p-4 h-full flex flex-col justify-center items-center">
              <h2 className="text-xl font-semibold mb-2">About</h2>
              <p className="text-gray-400 text-center">
                A minimalist dot matrix visualizer for your audio files with a monochromatic aesthetic
              </p>
            </CardContent>
          </Card>
          
          {/* Features card */}
          <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
            <CardContent className="p-4 h-full">
              <h2 className="text-xl font-semibold mb-2">Features</h2>
              <ul className="text-gray-400 list-disc pl-5 space-y-1">
                <li className="animate-fade-in" style={{animationDelay: '200ms'}}>Upload audio files</li>
                <li className="animate-fade-in" style={{animationDelay: '400ms'}}>Capture system audio</li>
                <li className="animate-fade-in" style={{animationDelay: '600ms'}}>Responsive visualization</li>
                <li className="animate-fade-in" style={{animationDelay: '800ms'}}>Minimal B&W design</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <footer className="mt-auto pt-4 text-center text-xs text-gray-500">
        <p>Built with React, Tailwind CSS, and Web Audio API</p>
      </footer>
    </div>
  );
};

export default Index;
