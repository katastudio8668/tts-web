import { AudioLines, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../features/auth/AuthProvider';
import { isAllowedRedirect, rememberReturnTo } from '../features/oauth/oauthPolicy';
import { supabase } from '../lib/supabase';

type Details = { authorization_id: string; redirect_uri: string; client: { name: string; uri: string }; scope: string };

/** Consent screen for AI apps (Claude, ChatGPT) connecting to KATA TTS through OAuth. */
export default function OAuthConsentPage() {
  const { session, loading, signInWithGoogle } = useAuth();
  const authorizationId = new URLSearchParams(window.location.search).get('authorization_id') ?? '';
  const [details, setDetails] = useState<Details | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!session || !authorizationId || !supabase) {return;}
    let active = true;
    void supabase.auth.oauth.getAuthorizationDetails(authorizationId).then(({ data, error: failure }) => {
      if (!active) {return;}
      if (failure || !data) {setError('Yêu cầu kết nối không hợp lệ hoặc đã hết hạn. Hãy thử kết nối lại từ ứng dụng AI.'); return;}
      // Already approved earlier: Supabase returns the redirect straight away.
      if ('redirect_url' in data) {if (isAllowedRedirect(data.redirect_url)) {window.location.assign(data.redirect_url);} else {setError('Ứng dụng này không được phép kết nối.');} return;}
      setDetails(data as Details);
    });
    return () => { active = false; };
  }, [session, authorizationId]);

  async function decide(decision: 'approve' | 'deny') {
    if (!supabase || !details) {return;}
    setBusy(true);
    const { data, error: failure } = decision === 'approve'
      ? await supabase.auth.oauth.approveAuthorization(authorizationId)
      : await supabase.auth.oauth.denyAuthorization(authorizationId);
    if (failure || !data?.redirect_url) {setError('Không hoàn tất được. Hãy thử lại.'); setBusy(false); return;}
    window.location.assign(data.redirect_url);
  }

  const allowed = details ? isAllowedRedirect(details.redirect_uri) : false;
  return (
    <main className="auth-page">
      <section className="auth-grid consent-grid">
        <div className="auth-card">
          <div className="auth-card-icon"><AudioLines size={22} /></div>
          {!authorizationId && <p className="inline-error">Thiếu mã yêu cầu kết nối.</p>}
          {loading && <p><span className="spinner" /> Đang kiểm tra đăng nhập…</p>}
          {!loading && !session && authorizationId && (
            <>
              <h2>Đăng nhập để kết nối</h2>
              <p>Một ứng dụng AI muốn dùng tài khoản KATA TTS của bạn. Đăng nhập để xem và cho phép.</p>
              <button className="google-button" onClick={() => { rememberReturnTo(window.location.pathname + window.location.search); void signInWithGoogle(); }}>
                <span className="google-g">G</span>Tiếp tục với Google
              </button>
            </>
          )}
          {details && (
            <>
              <h2>Cho phép {details.client.name || 'ứng dụng AI'} truy cập?</h2>
              <p>Ứng dụng sẽ dùng tài khoản <strong>{session?.user.email}</strong> để:</p>
              <ul className="consent-list">
                <li><ShieldCheck size={14} /> Xem số dư credit, danh sách giọng và video của bạn</li>
                <li><ShieldCheck size={14} /> Tạo, sửa mẫu video và dự án video</li>
                <li><ShieldCheck size={14} /> Tạo voice (trừ credit, sau khi bạn đồng ý trong cuộc trò chuyện) và xuất video vào Google Drive</li>
              </ul>
              {!allowed && <p className="inline-error" role="alert">Địa chỉ nhận kết nối ({details.redirect_uri}) không thuộc ứng dụng AI được hỗ trợ, nên không thể cho phép.</p>}
              <div className="form-actions">
                <button className="primary-button" disabled={busy || !allowed} onClick={() => void decide('approve')}>Cho phép</button>
                <button className="secondary-button" disabled={busy} onClick={() => void decide('deny')}>Từ chối</button>
              </div>
              <p className="auth-terms">Bạn có thể ngắt kết nối bất cứ lúc nào trong ứng dụng AI.</p>
            </>
          )}
          {error && <p className="inline-error" role="alert">{error}</p>}
        </div>
      </section>
    </main>
  );
}
