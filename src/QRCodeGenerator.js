import React, { useState, useRef, useEffect, useMemo, lazy, Suspense } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import {
  QrCode,
  Link as LinkIcon,
  MessageSquare,
  User,
  Download,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react';
import { FadeIn, ScaleIn, ScrollProgressBar } from './ScrollAnimations';

const ProfileSection = lazy(() => import('./ProfileSection'));

const TRANSLATIONS = {
  'en-US': {
    appTitle: 'QR Magic',
    appDescription: 'offline · local · instant',
    urlTab: 'URL',
    textTab: 'Text',
    contactTab: 'Contact',
    enterUrl: 'Website URL',
    enterText: 'Plain Text',
    contactInformation: 'Contact Card',
    websiteUrl: 'Website URL',
    urlPlaceholder: 'example.com',
    textContent: 'Text Content',
    textPlaceholder: 'Enter your text…',
    firstName: 'First Name',
    firstNamePlaceholder: 'John',
    lastName: 'Last Name',
    lastNamePlaceholder: 'Doe',
    phoneNumber: 'Phone',
    phonePlaceholder: '+1 555-0123',
    emailAddress: 'Email',
    emailPlaceholder: 'john@example.com',
    organization: 'Company',
    organizationPlaceholder: 'Acme Inc',
    website: 'Website',
    websitePlaceholder: 'https://example.com',
    clearAllFields: 'Clear',
    generatedQrCode: 'Your QR Code',
    scanQrCode: 'Ready to scan',
    fillFormPrompt: 'Fill the form to generate QR code',
    download: 'Download PNG',
    copyData: 'Copy',
    copied: 'Copied!',
    tooLong: 'Content too long for this error-correction level',
    bytes: 'bytes'
  }
};
const t = (key) => TRANSLATIONS['en-US'][key] || key;

/* Maximum payload (bytes) per error-correction level for QR v40 */
const EC_LEVELS = [
  { value: 'L', label: 'L', recovery: '7%' },
  { value: 'M', label: 'M', recovery: '15%' },
  { value: 'Q', label: 'Q', recovery: '25%' },
  { value: 'H', label: 'H', recovery: '30%' }
];
const EC_MAX_BYTES = { L: 2953, M: 2331, Q: 1663, H: 1273 };
const EC_HELP = {
  L: 'Low — max data, minimal recovery',
  M: 'Medium — balanced',
  Q: 'Quartile — better recovery',
  H: 'High — best recovery, less data'
};

const byteLength = (str) => new TextEncoder().encode(str).length;

/* ------------------------------------------------------------
   Background layers — static noise (generated once, not per
   frame), three GPU-animated blobs, a static grid, and a
   cursor glow that mutates CSS directly (no React re-render).
   ------------------------------------------------------------ */
const BackgroundFX = () => {
  const noiseRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const canvas = noiseRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const w = 128;
      const h = 128;
      canvas.width = w;
      canvas.height = h;
      const img = ctx.createImageData(w, h);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.floor(Math.random() * 64);
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        img.data[i + 3] = 24;
      }
      ctx.putImageData(img, 0, 0);
    }

    const onMove = (e) => {
      const el = glowRef.current;
      if (el) {
        el.style.background = `radial-gradient(circle at ${e.clientX}px ${e.clientY}px, rgba(139,92,246,0.10) 0%, transparent 42%)`;
      }
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div className="bg-layer" aria-hidden="true">
      <canvas ref={noiseRef} className="noise-canvas" />
      <div className="bg-blobs">
        <span className="blob blob-1" />
        <span className="blob blob-2" />
        <span className="blob blob-3" />
      </div>
      <div className="grid-overlay" />
      <div ref={glowRef} className="cursor-glow" />
    </div>
  );
};

const QRCodeGenerator = () => {
  const [activeTab, setActiveTab] = useState('url');
  const [copied, setCopied] = useState(false);
  const [ecLevel, setEcLevel] = useState('M');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [contactInfo, setContactInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    organization: '',
    url: ''
  });

  const formatUrl = (url) => {
    const u = url.trim();
    if (!u) return '';
    return /^[a-z][a-z0-9+.-]*:\/\//i.test(u) ? u : `https://${u}`;
  };

  const vcardEscape = (s) =>
    s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

  const generateVCard = (c) => {
    const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
    const fullName = `${c.firstName} ${c.lastName}`.trim();
    if (fullName) {
      lines.push(`FN:${vcardEscape(fullName)}`);
      lines.push(`N:${vcardEscape(c.lastName)};${vcardEscape(c.firstName)};;;`);
    }
    if (c.organization.trim()) lines.push(`ORG:${vcardEscape(c.organization.trim())}`);
    if (c.phone.trim()) lines.push(`TEL:${vcardEscape(c.phone.trim())}`);
    if (c.email.trim()) lines.push(`EMAIL:${vcardEscape(c.email.trim())}`);
    if (c.url.trim()) lines.push(`URL:${vcardEscape(c.url.trim())}`);
    lines.push('END:VCARD');
    return lines.join('\n');
  };

  const qrData = useMemo(() => {
    if (activeTab === 'url') return formatUrl(urlInput);
    if (activeTab === 'text') return textInput;
    if (activeTab === 'contact') {
      const c = contactInfo;
      const hasAny =
        c.firstName || c.lastName || c.phone || c.email || c.organization || c.url;
      return hasAny ? generateVCard(c) : '';
    }
    return '';
  }, [activeTab, urlInput, textInput, contactInfo]);

  const sizeBytes = byteLength(qrData);
  const isTooLong = sizeBytes > EC_MAX_BYTES[ecLevel];

  const downloadQRCode = () => {
    const canvas = document.getElementById('download-canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qr-magic-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const copyToClipboard = async () => {
    if (!qrData) return;
    try {
      await navigator.clipboard.writeText(qrData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable (e.g. non-secure context) — ignore */
    }
  };

  const resetForm = () => {
    setUrlInput('');
    setTextInput('');
    setContactInfo({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      organization: '',
      url: ''
    });
  };

  const tabs = [
    { id: 'url', label: t('urlTab'), icon: LinkIcon },
    { id: 'text', label: t('textTab'), icon: MessageSquare },
    { id: 'contact', label: t('contactTab'), icon: User }
  ];

  const onTabKeyDown = (e) => {
    const idx = tabs.findIndex((tab) => tab.id === activeTab);
    let next = null;
    if (e.key === 'ArrowRight') next = tabs[(idx + 1) % tabs.length];
    if (e.key === 'ArrowLeft') next = tabs[(idx - 1 + tabs.length) % tabs.length];
    if (next) {
      e.preventDefault();
      setActiveTab(next.id);
      document.getElementById(`tab-${next.id}`)?.focus();
    }
  };

  const setContact = (key) => (e) =>
    setContactInfo((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="app">
      <ScrollProgressBar />
      <BackgroundFX />

      <main className="content">
        {/* Hero */}
        <header className="hero">
          <FadeIn duration={0.9}>
            <div className="logo-badge">
              <div className="logo-badge-inner">
                <QrCode size={40} color="#fff" aria-hidden="true" />
              </div>
            </div>
            <h1 className="app-title">{t('appTitle')}</h1>
            <FadeIn delay={0.15}>
              <p className="app-subtitle">
                <span className="dot" aria-hidden="true" />
                {t('appDescription')}
              </p>
            </FadeIn>
          </FadeIn>
        </header>

        {/* Generator */}
        <FadeIn delay={0.2} duration={0.8}>
          <div className="card-frame">
            <div className="card">
              <div className="tabs" role="tablist" aria-label="QR content type" onKeyDown={onTabKeyDown}>
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const selected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      id={`tab-${tab.id}`}
                      role="tab"
                      aria-selected={selected}
                      aria-controls={`panel-${tab.id}`}
                      tabIndex={selected ? 0 : -1}
                      className={`tab-btn${selected ? ' active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <Icon size={18} aria-hidden="true" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="gen-grid">
                {/* Form */}
                <section
                  id={`panel-${activeTab}`}
                  role="tabpanel"
                  aria-labelledby={`tab-${activeTab}`}
                >
                  <div className="section-head">
                    <h2 className="section-title">
                      {activeTab === 'url' && t('enterUrl')}
                      {activeTab === 'text' && t('enterText')}
                      {activeTab === 'contact' && t('contactInformation')}
                    </h2>
                    <button type="button" className="btn btn-danger" onClick={resetForm}>
                      <RotateCcw size={14} aria-hidden="true" />
                      {t('clearAllFields')}
                    </button>
                  </div>

                  {activeTab === 'url' && (
                    <div className="field">
                      <label htmlFor="qr-url">{t('websiteUrl')}</label>
                      <input
                        id="qr-url"
                        type="text"
                        className="input"
                        inputMode="url"
                        autoComplete="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder={t('urlPlaceholder')}
                        spellCheck={false}
                      />
                      <p className="field-hint">https:// is added automatically if missing</p>
                    </div>
                  )}

                  {activeTab === 'text' && (
                    <div className="field">
                      <label htmlFor="qr-text">{t('textContent')}</label>
                      <textarea
                        id="qr-text"
                        className="textarea"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder={t('textPlaceholder')}
                      />
                      {textInput && (
                        <p className={`field-hint${sizeBytes > EC_MAX_BYTES.L ? ' warn' : ''}`}>
                          {sizeBytes.toLocaleString()} {t('bytes')} · max ≈{' '}
                          {EC_MAX_BYTES[ecLevel].toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  {activeTab === 'contact' && (
                    <div>
                      <div className="field-grid">
                        <div className="field">
                          <label htmlFor="c-first">{t('firstName')}</label>
                          <input
                            id="c-first"
                            type="text"
                            className="input"
                            autoComplete="given-name"
                            value={contactInfo.firstName}
                            onChange={setContact('firstName')}
                            placeholder={t('firstNamePlaceholder')}
                          />
                        </div>
                        <div className="field">
                          <label htmlFor="c-last">{t('lastName')}</label>
                          <input
                            id="c-last"
                            type="text"
                            className="input"
                            autoComplete="family-name"
                            value={contactInfo.lastName}
                            onChange={setContact('lastName')}
                            placeholder={t('lastNamePlaceholder')}
                          />
                        </div>
                      </div>
                      <div className="field">
                        <label htmlFor="c-phone">{t('phoneNumber')}</label>
                        <input
                          id="c-phone"
                          type="tel"
                          className="input"
                          autoComplete="tel"
                          value={contactInfo.phone}
                          onChange={setContact('phone')}
                          placeholder={t('phonePlaceholder')}
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="c-email">{t('emailAddress')}</label>
                        <input
                          id="c-email"
                          type="email"
                          className="input"
                          autoComplete="email"
                          value={contactInfo.email}
                          onChange={setContact('email')}
                          placeholder={t('emailPlaceholder')}
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="c-org">{t('organization')}</label>
                        <input
                          id="c-org"
                          type="text"
                          className="input"
                          autoComplete="organization"
                          value={contactInfo.organization}
                          onChange={setContact('organization')}
                          placeholder={t('organizationPlaceholder')}
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="c-url">{t('website')}</label>
                        <input
                          id="c-url"
                          type="url"
                          className="input"
                          autoComplete="url"
                          value={contactInfo.url}
                          onChange={setContact('url')}
                          placeholder={t('websitePlaceholder')}
                          spellCheck={false}
                        />
                      </div>
                    </div>
                  )}
                </section>

                {/* QR output */}
                <FadeIn delay={0.15}>
                  <section className="qr-panel" aria-label={t('generatedQrCode')}>
                    <div className="section-head">
                      <h2 className="section-title">{t('generatedQrCode')}</h2>
                    </div>

                    {qrData && !isTooLong ? (
                      <>
                        <ScaleIn key={`${activeTab}-${ecLevel}`} duration={0.45}>
                          <div className="qr-tile">
                            <QRCodeSVG
                              value={qrData}
                              size={240}
                              level={ecLevel}
                              bgColor="#ffffff"
                              fgColor="#05060b"
                              marginSize={2}
                              aria-label={t('generatedQrCode')}
                            />
                          </div>
                        </ScaleIn>
                        <p className="qr-status">
                          {t('scanQrCode')} · EC {ecLevel} ({EC_HELP[ecLevel]}) ·{' '}
                          {sizeBytes.toLocaleString()} {t('bytes')}
                        </p>

                        <div
                          className="ec-row"
                          role="radiogroup"
                          aria-label="Error correction level"
                        >
                          {EC_LEVELS.map((lvl) => (
                            <button
                              key={lvl.value}
                              type="button"
                              role="radio"
                              aria-checked={ecLevel === lvl.value}
                              className={`ec-option${ecLevel === lvl.value ? ' active' : ''}`}
                              onClick={() => setEcLevel(lvl.value)}
                              title={EC_HELP[lvl.value]}
                            >
                              {lvl.label}
                              <span className="ec-sub">{lvl.recovery}</span>
                            </button>
                          ))}
                        </div>

                        <div className="actions">
                          <button type="button" className="btn btn-primary" onClick={downloadQRCode}>
                            <Download size={18} aria-hidden="true" />
                            {t('download')}
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={copyToClipboard}
                            aria-label="Copy QR data to clipboard"
                          >
                            {copied ? (
                              <Check size={18} aria-hidden="true" />
                            ) : (
                              <Copy size={18} aria-hidden="true" />
                            )}
                            {copied ? t('copied') : t('copyData')}
                          </button>
                        </div>

                        {/* Off-screen high-res canvas used for PNG export */}
                        <div className="download-canvas" aria-hidden="true">
                          <QRCodeCanvas
                            id="download-canvas"
                            value={qrData}
                            size={1024}
                            level={ecLevel}
                            bgColor="#ffffff"
                            fgColor="#05060b"
                            marginSize={4}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="qr-empty">
                        <QrCode size={88} aria-hidden="true" />
                        <p>{isTooLong ? t('tooLong') : t('fillFormPrompt')}</p>
                        {isTooLong && (
                          <p className="field-hint">
                            {sizeBytes.toLocaleString()} {t('bytes')} &gt;{' '}
                            {EC_MAX_BYTES[ecLevel].toLocaleString()} ({t('copyData')} content or
                            use EC L)
                          </p>
                        )}
                      </div>
                    )}
                  </section>
                </FadeIn>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Below-the-fold profile section — lazy loaded */}
        <Suspense fallback={null}>
          <ProfileSection />
        </Suspense>

        <footer className="footer">
          Made with passion by{' '}
          <a href="https://github.com/vishnuskandha" target="_blank" rel="noopener noreferrer">
            Vishnu Skandha
          </a>{' '}
          · QR Magic © {new Date().getFullYear()}
        </footer>
      </main>
    </div>
  );
};

export default QRCodeGenerator;
