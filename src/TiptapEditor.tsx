import { type ReactElement, useCallback, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import MarkdownIt from 'markdown-it';
import './TiptapEditor.css';

const TiptapEditor = (): ReactElement => {
  const [sourceContent, setSourceContent] = useState<string>('');
  
  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: '<p>Start writing ✍️</p>',
    onUpdate: ({ editor }) => {
      setSourceContent(editor.getHTML());
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 画像を挿入する関数
  const insertImage = useCallback((url: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  // ファイル選択時の処理
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイルタイプの検証
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください');
      return;
    }

    // ファイルサイズの検証 (5MB制限の例)
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズは5MB以下にしてください');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        insertImage(result);
      }
    };
    reader.onerror = () => {
      alert('画像の読み込みに失敗しました');
    };
    reader.readAsDataURL(file);

    // input要素をリセット
    event.target.value = '';
  }, [insertImage]);

  // ファイル選択ダイアログを開く
  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Markdownとして保存する関数
  const handleSaveMarkdown = useCallback(() => {
    if (!editor) return;
    
    // HTMLからMarkdownに変換
    const md = new MarkdownIt();
    const content = editor.getHTML();
    const markdown = md.render(content);
    
    // Blobを作成
    const blob = new Blob([markdown], { type: 'text/markdown' });
    
    // ダウンロードリンクを作成
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `dad-notes-${timestamp}.md`;
    
    // ダウンロードを実行
    document.body.appendChild(a);
    a.click();
    
    // クリーンアップ
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('保存された内容 (Markdown):', markdown);
  }, [editor]);

  // 保存してダウンロードする関数
  const handleSave = useCallback(() => {
    if (!editor) return;
    
    const content = editor.getHTML();
    
    // HTMLファイルとして整形
    const fullHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Saved dad-notes</title>
    <style>
        body { max-width: 800px; margin: 40px auto; padding: 0 20px; }
        img { max-width: 100%; height: auto; }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;

    // Blobを作成
    const blob = new Blob([fullHTML], { type: 'text/html' });
    
    // ダウンロードリンクを作成
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `dad-notes-${timestamp}.html`;
    
    // ダウンロードを実行
    document.body.appendChild(a);
    a.click();
    
    // クリーンアップ
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('保存された内容:', content);
  }, [editor]);

  // リセット機能を追加
  const handleReset = useCallback(() => {
    if (editor) {
      if (window.confirm('エディタの内容をリセットしますか？')) {
        editor.commands.setContent('<p>Start writing ✍️</p>');
        setSourceContent('<p>Start writing ✍️</p>');
      }
    }
  }, [editor]);

  return (
    <div className="editor-container">
      <div className="editor-main">
        <EditorContent editor={editor} />
      </div>
      <div className="editor-source">
        <pre>
          <code>{sourceContent}</code>
        </pre>
      </div>
      <div className="button-container">
        <button 
          type="button" 
          onClick={handleButtonClick}
        >
          画像を挿入
        </button>
        <button 
          type="button" 
          onClick={handleSaveMarkdown}
        >
          Markdownとして保存
        </button>
        <button 
          type="button" 
          onClick={handleSave}
        >
          HTMLとして保存
        </button>
        <button 
          type="button" 
          onClick={handleReset}
          className="reset-button"
        >
          リセット
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default TiptapEditor;
