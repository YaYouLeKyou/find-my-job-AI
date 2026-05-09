'use client';

import { useCallback, useRef, useState } from 'react';

interface DropzoneProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export default function Dropzone({ file, onFileChange }: DropzoneProps) {
  const [isOver, setIsOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsOver(false);
      const droppedFile = event.dataTransfer.files?.[0] ?? null;
      if (droppedFile && droppedFile.type === 'application/pdf') {
        onFileChange(droppedFile);
      }
    },
    [onFileChange],
  );

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      className={`rounded-3xl border-2 ${isOver ? 'border-blue-400 bg-slate-800/70' : 'border-slate-700 bg-slate-950/70'} p-8 text-center transition cursor-pointer`}
    >
      <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Glisser-déposer</p>
      <p className="mt-4 text-lg font-semibold text-white">Dépose ton CV PDF ici</p>
      <p className="mt-2 text-sm text-slate-400">Ou clique pour sélectionner un fichier.</p>
      {file ? <p className="mt-4 text-slate-200">Fichier sélectionné : {file.name}</p> : null}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        className="hidden"
        id="pdf-upload"
      />
    </div>
  );
}
