import { useMutation } from '@tanstack/react-query';
import { Cloud, FolderOpen, HardDrive } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiRequest } from '../../lib/api';
import { useSaveTarget } from './useSaveTarget';

/** Account settings: Google Drive or a local folder for voices and videos. */
export function StorageSettingsCard() {
  const target = useSaveTarget();
  const [params, setParams] = useSearchParams();
  const [message, setMessage] = useState('');
  const driveResult = params.get('drive');

  const preference = useMutation({
    mutationFn: (provider: 'SUPABASE' | 'GOOGLE_DRIVE') =>
      apiRequest('/storage/preference', target.token, { method: 'PATCH', body: JSON.stringify({ provider }) }),
    onSuccess: () => { void target.refresh(); },
  });
  const connect = useMutation({
    mutationFn: () => apiRequest<{ authorizationUrl: string }>('/storage/google-drive/connect', target.token, { method: 'POST' }),
    onSuccess: (data) => { window.location.assign(data.authorizationUrl); },
  });
  const disconnect = useMutation({
    mutationFn: () => apiRequest('/storage/google-drive', target.token, { method: 'DELETE' }),
    onSuccess: () => { void target.refresh(); },
  });

  useEffect(() => {
    if (!driveResult) {return;}
    // Back from Google: use Drive right away, then clean the URL.
    if (driveResult === 'connected') {preference.mutate('GOOGLE_DRIVE'); setMessage('Đã kết nối Google Drive. Voice và video sẽ lưu vào Drive của bạn.');}
    else {setMessage('Chưa kết nối được Google Drive. Hãy thử lại.');}
    params.delete('drive');
    setParams(params, { replace: true });
  }, [driveResult]);

  const drive = target.status.data?.googleDrive;
  return (
    <section className="panel storage-card">
      <div className="panel-heading">
        <div><span className="step-label">LƯU TRỮ</span><h2>Nơi lưu voice và video</h2></div>
      </div>
      <p className="admin-meta">KATA TTS không giữ video của bạn trên máy chủ. Chọn Google Drive, hoặc một thư mục trên máy tính này.</p>
      {message && <p className="form-success" role="status">{message}</p>}

      <div className="storage-option">
        <Cloud size={18} />
        <div>
          <strong>Google Drive</strong>
          <small>{drive?.connected ? `Đã kết nối${drive.accountId ? `: ${drive.accountId}` : ''}` : 'Lưu thẳng vào Drive, dùng được trên mọi thiết bị và từ trợ lý AI.'}</small>
        </div>
        {drive?.connected ? (
          <div className="storage-actions">
            {!target.usesDrive && <button className="secondary-button" onClick={() => preference.mutate('GOOGLE_DRIVE')}>Dùng Drive</button>}
            <button className="secondary-button" disabled={disconnect.isPending} onClick={() => disconnect.mutate()}>Ngắt kết nối</button>
          </div>
        ) : (
          <button className="primary-button" disabled={!drive?.configured || connect.isPending} onClick={() => connect.mutate()}>
            {drive?.configured === false ? 'Chưa cấu hình' : 'Kết nối'}
          </button>
        )}
      </div>

      <div className="storage-option">
        {target.folderSupported ? <FolderOpen size={18} /> : <HardDrive size={18} />}
        <div>
          <strong>Thư mục trên máy tính này</strong>
          <small>{target.folderSupported
            ? (target.folderName ? `Đang lưu vào thư mục “${target.folderName}”.` : 'Bắt buộc chọn nếu không dùng Google Drive.')
            : 'Trình duyệt này không chọn được thư mục; tệp sẽ được tải xuống. Dùng Chrome hoặc Edge để lưu thẳng vào thư mục.'}</small>
        </div>
        {target.folderSupported && (
          <div className="storage-actions">
            {target.usesDrive && <button className="secondary-button" onClick={() => preference.mutate('SUPABASE')}>Dùng thư mục</button>}
            <button className="secondary-button" onClick={() => void target.pickFolder().catch(() => undefined)}>{target.folderName ? 'Đổi thư mục' : 'Chọn thư mục'}</button>
          </div>
        )}
      </div>
      {(preference.isError || connect.isError || disconnect.isError) && (
        <p className="inline-error" role="alert">{(preference.error ?? connect.error ?? disconnect.error)?.message}</p>
      )}
    </section>
  );
}
