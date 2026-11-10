'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { openApiToMarkdown, parseInputToSchema } from '@/lib/converter';

const sampleYaml = `openapi: 3.0.0
info:
  title: Swagger Petstore Pro
  description: A production-ready sample API for testing documentation generation.
paths:
  /pets:
    get:
      summary: List all pets
      parameters:
        - name: limit
          in: query
          required: false
          description: How many items to return
          schema:
            type: integer
      responses:
        '200':
          description: An array of pets
    post:
      summary: Create a pet
      responses:
        '201':
          description: Pet created successfully
  /pets/{petId}:
    get:
      summary: Info for a specific pet
      parameters:
        - name: petId
          in: path
          required: true
          description: The ID of the pet to retrieve
          schema:
            type: string
      responses:
        '200':
          description: Expected response to a valid request
        '404':
          description: Pet not found
`;

export default function Home() {
  const [input, setInput] = useState(sampleYaml);
  const [markdown, setMarkdown] = useState(() => {
    try {
      return openApiToMarkdown(parseInputToSchema(sampleYaml));
    } catch {
      return '';
    }
  });
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleInputChange = (value: string) => {
    setInput(value);
    try {
      const parsed = parseInputToSchema(value);
      if (parsed) {
        setMarkdown(openApiToMarkdown(parsed));
        setError('');
      } else {
        setError('Could not parse JSON or YAML input.');
      }
    } catch (e) {
      setError('Invalid JSON or YAML syntax.');
    }
  };


  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'api-docs.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) handleInputChange(content);
    };
    reader.readAsText(file);
  };

  return (
    <main className="flex h-screen flex-col bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 p-4 flex justify-between items-center bg-slate-950/50">
        <div className="flex items-center gap-3">
          <span className="text-xl">📄</span>
          <h1 className="font-bold text-lg">API Docs Generator</h1>
          <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-0.5 rounded-full border border-blue-500/20">
            Open Source
          </span>
          <a
            href="https://www.buymeacoffee.com/devids10"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 text-xs px-2.5 py-1 rounded-full border border-yellow-500/30 transition-colors flex items-center gap-1.5"
          >
            <span>☕</span> Buy me a coffee
          </a>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleInputChange(sampleYaml)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded font-medium transition-colors"
          >
            Load Sample API
          </button>
          <button 
            onClick={handleDownload}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded text-sm font-medium transition-colors border border-slate-700"
          >
            Download .md
          </button>
          <button 
            onClick={() => navigator.clipboard.writeText(markdown)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium transition-colors shadow-lg shadow-blue-600/20"
          >
            Copy Markdown
          </button>
        </div>
      </header>

      {/* Main Split View */}
      <div className="flex flex-1 overflow-hidden">
        {/* Input Panel */}
        <div 
          className={`w-1/2 border-r border-slate-800 p-4 flex flex-col transition-colors ${isDragging ? 'bg-slate-800/50 border-blue-500' : 'bg-slate-900'}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-slate-400 font-medium">OpenAPI Input (JSON or YAML)</label>
            <label className="text-xs text-blue-400 hover:underline cursor-pointer">
              Upload File
              <input 
                type="file" 
                accept=".json,.yaml,.yml" 
                className="hidden" 
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
            </label>
          </div>
          <textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Paste your OpenAPI spec here, or drag & drop a .json/.yaml file..."
            className="flex-1 w-full bg-slate-950 p-3 font-mono text-xs rounded border border-slate-800 focus:outline-none focus:border-blue-500 resize-none text-slate-200 leading-relaxed"
          />
          {error && <span className="text-red-400 text-xs mt-2">{error}</span>}
          <p className="text-[11px] text-slate-500 mt-2">💡 Tip: You can drag and drop any Swagger/OpenAPI file directly into this box.</p>
        </div>

        {/* Output Panel */}
        <div className="w-1/2 p-6 overflow-auto bg-slate-950">
          <label className="text-sm text-slate-400 mb-4 block font-medium">Live Rendered Preview</label>
          <div className="prose prose-invert max-w-none text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{markdown}</ReactMarkdown>
          </div>
        </div>
      </div>
    </main>
  );
}