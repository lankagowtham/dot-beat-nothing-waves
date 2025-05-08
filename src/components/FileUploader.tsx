
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UploadIcon } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Check if the file is an audio file
    if (!file.type.startsWith('audio/')) {
      toast.error('Please upload an audio file');
      return;
    }
    
    onFileUpload(file);
    toast.success(`File uploaded: ${file.name}`);
    
    // Reset the input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="audio/*"
        className="hidden"
        data-testid="file-input"
      />
      <Button 
        variant="outline" 
        className="glass-morph flex items-center gap-2 text-white hover:bg-white/10"
        onClick={handleButtonClick}
      >
        <UploadIcon size={16} />
        Upload Music
      </Button>
    </div>
  );
};

export default FileUploader;
