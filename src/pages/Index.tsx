
import AudioPlayer from "@/components/AudioPlayer";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-black text-white">
      <header className="mb-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Dot Matrix Audio Visualizer</h1>
        <p className="text-gray-400 mt-2">Upload your music or capture background audio and watch the beats come alive</p>
      </header>
      
      <main className="flex-1 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Main audio visualizer - spans 2 columns */}
          <Card className="md:col-span-2 row-span-2 bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 h-[60vh] md:h-[65vh]">
              <AudioPlayer />
            </CardContent>
          </Card>
          
          {/* Info card */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 h-full flex flex-col justify-center items-center">
              <h2 className="text-xl font-semibold mb-2">About</h2>
              <p className="text-gray-400 text-center">
                A minimalist dot matrix visualizer for your audio files with a monochromatic aesthetic
              </p>
            </CardContent>
          </Card>
          
          {/* Features card */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 h-full">
              <h2 className="text-xl font-semibold mb-2">Features</h2>
              <ul className="text-gray-400 list-disc pl-5 space-y-1">
                <li>Upload audio files</li>
                <li>Capture system audio</li>
                <li>Responsive visualization</li>
                <li>Minimal B&W design</li>
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
