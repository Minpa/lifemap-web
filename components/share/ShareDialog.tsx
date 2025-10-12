'use client';

import { useState } from 'react';
import { Modal } from '@/components/Modal';
import styles from './ShareDialog.module.css';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'map' | 'trip' | 'place' | 'run';
  contentId: string;
  onShare?: (shareUrl: string) => void;
}

const SNS_PLATFORMS = [
  { id: 'twitter', name: 'Twitter', icon: '𝕏', color: '#000000' },
  { id: 'facebook', name: 'Facebook', icon: 'f', color: '#1877F2' },
  { id: 'instagram', name: 'Instagram', icon: '📷', color: '#E4405F' },
  { id: 'kakao', name: 'KakaoTalk', icon: '💬', color: '#FEE500' },
];

export function ShareDialog({
  isOpen,
  onClose,
  contentType,
  contentId,
  onShare,
}: ShareDialogProps) {
  const [expiresIn, setExpiresIn] = useState<number>(168); // 7 days
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleGenerateLink = async () => {
    setIsGenerating(true);

    // Mock implementation - will be replaced with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockUrl = `${window.location.origin}/share/${contentId}-${Date.now()}`;
    setShareUrl(mockUrl);
    setIsGenerating(false);
    onShare?.(mockUrl);
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleSNSShare = (platform: string) => {
    if (!shareUrl) {
      handleGenerateLink();
      return;
    }

    const text = 'LifeMap에서 내 여정을 공유합니다 #LifeMap';
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(text);

    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing, copy link instead
        handleCopyLink();
        alert('링크가 복사되었습니다. Instagram 프로필이나 스토리에 붙여넣으세요.');
        return;
      case 'kakao':
        // Kakao SDK integration would go here
        alert('KakaoTalk 공유 기능은 곧 제공됩니다.');
        return;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="공유" size="md">
      <div className={styles.container}>
        <p className={styles.description}>
          퍼징된 GeoJSON으로 생성된 링크입니다. 만료 기간을 선택하세요.
        </p>

        <div className={styles.expirySection}>
          <label htmlFor="expires" className={styles.label}>
            만료 기간
          </label>
          <select
            id="expires"
            value={expiresIn}
            onChange={(e) => setExpiresIn(Number(e.target.value))}
            className={styles.select}
            data-prop="expires"
          >
            <option value={72}>72시간</option>
            <option value={168}>7일</option>
            <option value={720}>30일</option>
          </select>
        </div>

        <div className={styles.privacyInfo}>
          <span className={styles.privacyIcon}>🔒</span>
          <div className={styles.privacyText}>
            <p>집/직장 프라이버시 존 자동 마스킹</p>
            <p>시간 퍼징 1–3h</p>
          </div>
        </div>

        {!shareUrl ? (
          <button
            onClick={handleGenerateLink}
            disabled={isGenerating}
            className={styles.generateButton}
            data-action="create-share"
          >
            {isGenerating ? '생성 중...' : '링크 만들기'}
          </button>
        ) : (
          <div className={styles.linkSection}>
            <div className={styles.linkBox}>
              <input
                type="text"
                value={shareUrl}
                readOnly
                className={styles.linkInput}
              />
              <button onClick={handleCopyLink} className={styles.copyButton}>
                {copied ? '✓' : '복사'}
              </button>
            </div>
          </div>
        )}

        {shareUrl && (
          <div className={styles.snsSection}>
            <h4 className={styles.snsTitle}>SNS 공유</h4>
            <div className={styles.snsButtons}>
              {SNS_PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => handleSNSShare(platform.id)}
                  className={styles.snsButton}
                  style={{ backgroundColor: platform.color }}
                  aria-label={`${platform.name}에 공유`}
                >
                  <span className={styles.snsIcon}>{platform.icon}</span>
                  <span className={styles.snsName}>{platform.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button onClick={onClose} className={styles.closeButton} data-action="close">
            닫기
          </button>
        </div>
      </div>
    </Modal>
  );
}
