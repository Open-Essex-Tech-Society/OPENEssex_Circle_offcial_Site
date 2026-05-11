import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AuthorBadge from '../components/AuthorBadge';

interface Guide {
  id: number;
  title: string;
  content: string;
  poster?: string;
  co_authors?: string;
  created_at: string;
  likes?: number;
}

export default function Guides() {
  const { userName, user } = useAuth();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coAuthors, setCoAuthors] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const fetchGuides = async () => {
    try {
      const res = await fetch(`/api/guides?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setGuides(data as Guide[]);
      } else {
        console.error('API returned non-array:', data);
        setError(`データ取得エラー: ${data?.error || '不明なエラー'}`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('データの取得に失敗しました。');
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!userName) {
      setError('投稿するにはログインしてプロフィールを設定してください。');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      if (editId) {
        const res = await fetch(`/api/guides/${editId}`, {
          method: 'PUT',
          body: JSON.stringify({ action: 'edit', title, content, co_authors: coAuthors }),
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(`更新失敗: ${errData?.error || res.statusText} ${errData?.detail || ''}`);
          return;
        }
        await fetchGuides();
        setEditId(null);
      } else {
        const res = await fetch('/api/guides', {
          method: 'POST',
          body: JSON.stringify({ title, content, poster: userName, co_authors: coAuthors }),
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(`投稿失敗: ${errData?.error || res.statusText} ${errData?.detail || ''}`);
          return;
        }
        await fetchGuides();
      }
      setTitle('');
      setContent('');
      setCoAuthors('');
      setShowForm(false);
    } catch (err: any) {
      setError(`エラー: ${err?.message || '不明なエラー'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (guide: Guide) => {
    setEditId(guide.id);
    setTitle(guide.title);
    setContent(guide.content);
    setCoAuthors(guide.co_authors || '');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('このガイドを削除してよろしいですか？')) return;
    await fetch(`/api/guides/${id}`, { method: 'DELETE' });
    fetchGuides();
  };

  const handleLike = async (id: number) => {
    const likedKey = `liked_guides_${id}`;
    if (localStorage.getItem(likedKey)) return;

    setGuides(prev => prev.map(guide => guide.id === id ? { ...guide, likes: (guide.likes || 0) + 1 } : guide));
    localStorage.setItem(likedKey, 'true');

    await fetch(`/api/guides/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ action: 'like' }),
      headers: { 'Content-Type': 'application/json' }
    });
  };

  return (
    <div className="page-container">
      <h1>ガイド</h1>
      <p className="page-subtitle">技術・知識共有</p>

      {error && (
        <div className="mypage-message error" style={{ marginBottom: '1rem' }}>
          ⚠️ {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
        </div>
      )}

      {user ? (
        <button onClick={() => {
          setShowForm(!showForm);
          setError('');
          if (editId) { setEditId(null); setTitle(''); setContent(''); setCoAuthors(''); }
        }} className="btn btn-primary" style={{ marginBottom: '2rem' }}>
          {showForm ? 'キャンセル' : 'ガイドを投稿する'}
        </button>
      ) : (
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>投稿するにはログインしてください。</p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="post-form glass-panel">
          <div className="auto-author-badge" style={{ marginBottom: '1rem' }}>投稿者: {userName || '未設定'}</div>
          <input type="text" placeholder="ガイドのタイトル" value={title} onChange={e => setTitle(e.target.value)} required className="input-field" />
          <input type="text" placeholder="共同投稿者の表示名（カンマ区切り。例: user1, user2）" value={coAuthors} onChange={e => setCoAuthors(e.target.value)} className="input-field" />
          <textarea placeholder="ガイドの内容（Markdown対応）" value={content} onChange={e => setContent(e.target.value)} required rows={15} className="input-field" />
          <p style={{ fontSize: '0.8rem', marginTop: '-0.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>※Markdown記法（# 見出し, * リスト, **太字** など）が使えます</p>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary">
            {isSubmitting ? '処理中...' : editId ? '変更を保存' : 'ガイドを投稿する'}
          </button>
        </form>
      )}

      <div className="list-container">
        {guides.length === 0 ? <p>ガイドはまだありません。</p> : guides.map(guide => (
          <div key={guide.id} className="card glass-panel">
            <h2>{guide.title}</h2>
            <div className="meta" style={{ marginBottom: '1rem' }}>
              <AuthorBadge author={guide.poster || ''} date={guide.created_at} coAuthors={guide.co_authors} />
            </div>
            <div className="content" style={{ padding: '1rem 0' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{guide.content}</ReactMarkdown>
            </div>

            <div className="timeline-actions">
              <button className={`btn btn-like ${localStorage.getItem(`liked_guides_${guide.id}`) ? 'liked' : ''}`} onClick={() => handleLike(guide.id)}>
                <span className="icon">♥</span> {guide.likes || 0}
              </button>
              {(!guide.poster || userName === guide.poster) && (
                <>
                  <div className="spacer"></div>
                  <button className="btn btn-edit" onClick={() => handleEdit(guide)}>編集</button>
                  <button className="btn btn-delete" onClick={() => handleDelete(guide.id)}>削除</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
