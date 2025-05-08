
import AudioPlayer from "@/components/AudioPlayer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Dot Matrix Audio Visualizer</h1>
        <p className="text-gray-400 mt-2">Upload your music and watch the beats come alive</p>
      </header>
      
      <main className="flex-1 max-w-4xl mx-auto w-full">
        <div className="h-[70vh] md:h-[75vh]">
          <AudioPlayer />
        </div>
      </main>
      
      <footer className="mt-auto pt-4 text-center text-xs text-gray-500">
        <p>Built with React, Tailwind CSS, and Web Audio API</p>
      </footer>
    </div>
  );
};

export default Index;
