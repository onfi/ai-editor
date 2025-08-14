import React, { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface GoogleAdSenseProps {
  className?: string;
}

export const GoogleAdSense: React.FC<GoogleAdSenseProps> = ({ className = '' }) => {
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;
  const slotId = import.meta.env.VITE_ADSENSE_SLOT_ID;

  useEffect(() => {
    if (!clientId || !slotId) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, [clientId, slotId]);

  // 環境変数が設定されていない場合は何も表示しない
  if (!clientId || !slotId) {
    return null;
  }

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};