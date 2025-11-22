'use client';

import { useState, useCallback } from 'react';
import { Upload, File, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
    onUploadComplete: (files: File[]) => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles((prev) => [...prev, ...droppedFiles]);
        onUploadComplete(droppedFiles);
    }, [onUploadComplete]);

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="w-full">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer",
                    isDragging
                        ? "border-blue-500 bg-blue-50 scale-[1.01]"
                        : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                )}
            >
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center transition-colors",
                        isDragging ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                    )}>
                        <Upload className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-lg font-medium text-slate-700">
                            Dra och släpp ritningar här
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            Stöder PDF, DWG, JPG, PNG
                        </p>
                    </div>
                    <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                        Eller välj filer
                    </button>
                </div>
            </div>

            {files.length > 0 && (
                <div className="mt-6 space-y-3">
                    <h3 className="text-sm font-medium text-slate-900">Uppladdade filer</h3>
                    {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                    <File className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">{file.name}</p>
                                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="flex items-center text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Klar
                                </span>
                                <button
                                    onClick={() => removeFile(index)}
                                    className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
