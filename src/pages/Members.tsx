import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface MemberProfile {
  uid: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  role: string;
  skills: string;
  created_at: string;
}

export default function Members() {
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profiles')
      .then(res => res.json())
      .then(data => {
        setMembers(data as MemberProfile[]);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  return (
    <div className="page-container">
      <h1>メンバー一覧</h1>
      <p className="page-subtitle">Open Essexのメンバーたち（{members.length}人）</p>

      {isLoading ? (
        <p style={{ textAlign: 'center' }}>読み込み中...</p>
      ) : members.length === 0 ? (
        <p className="empty-state">まだメンバーが登録されていません。</p>
      ) : (
        <div className="members-list">
          {members.map(member => (
            <Link to={`/profile/${member.uid}`} key={member.uid} className="member-row glass-panel">
              <div className="member-row-avatar">
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt={member.display_name} className="member-row-img" />
                ) : (
                  <div className="member-row-placeholder">
                    {member.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="member-row-info">
                <div className="member-row-top">
                  <h3 className="member-row-name">{member.display_name}</h3>
                  <span className="member-role">{member.role}</span>
                </div>
                {member.bio && <p className="member-row-bio">{member.bio.length > 100 ? member.bio.slice(0, 100) + '...' : member.bio}</p>}
              </div>
              {member.skills && (
                <div className="member-row-skills">
                  {member.skills.split(',').slice(0, 3).map((skill, i) => (
                    <span key={i} className="skill-tag">{skill.trim()}</span>
                  ))}
                </div>
              )}
              <span className="member-row-arrow">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
