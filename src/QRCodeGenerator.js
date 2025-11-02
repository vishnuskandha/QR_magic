import React, { useState, useRef, useEffect } from 'react';
import { QrCode, Link, MessageSquare, User, Download, Copy, Check } from 'lucide-react';
import ProfileCard from './ProfileCard';
import { FadeIn, ScaleIn, Parallax, StaggerContainer, ScrollProgressBar } from './ScrollAnimations';

const TRANSLATIONS = {
  "en-US": {
    "appTitle": "QR Magic",
    "appDescription": "Professional QR Code Generator for Modern Web",
    "urlTab": "URL",
    "textTab": "Text",
    "contactTab": "Contact",
    "enterUrl": "Website URL",
    "enterText": "Plain Text",
    "contactInformation": "Contact Card",
    "websiteUrl": "Website URL",
    "urlPlaceholder": "example.com",
    "textContent": "Text Content",
    "textPlaceholder": "Enter your text...",
    "firstName": "First Name",
    "firstNamePlaceholder": "John",
    "lastName": "Last Name",
    "lastNamePlaceholder": "Doe",
    "phoneNumber": "Phone",
    "phonePlaceholder": "+1 555-0123",
    "emailAddress": "Email",
    "emailPlaceholder": "john@example.com",
    "organization": "Company",
    "organizationPlaceholder": "Acme Inc",
    "website": "Website",
    "websitePlaceholder": "https://example.com",
    "clearAllFields": "Clear",
    "generatedQrCode": "Your QR Code",
    "scanQrCode": "Ready to scan",
    "fillFormPrompt": "Fill the form to generate QR code",
    "download": "Download",
    "copyData": "Copy",
    "copied": "Copied!"
  }
};
const t = (key) => TRANSLATIONS['en-US'][key] || key;

// Animated Background Shapes
const ShapeBlur = () => {
  const [shapes] = useState(() => 
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 100 + Math.random() * 200,
      duration: 15 + Math.random() * 15,
      delay: Math.random() * 5,
      color: ['#ec4899', '#8b5cf6', '#06b6d4', '#f59e0b'][Math.floor(Math.random() * 4)]
    }))
  );

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {shapes.map((shape) => (
        <div
          key={shape.id}
          style={{
            position: 'absolute',
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            background: shape.color,
            borderRadius: '50%',
            filter: 'blur(80px)',
            opacity: 0.3,
            animation: `float-random ${shape.duration}s ease-in-out infinite`,
            animationDelay: `${shape.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

// Noise Texture
const NoiseTexture = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const animate = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 50;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = 15;
      }
      ctx.putImageData(imageData, 0, 0);
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, opacity: 0.4, pointerEvents: 'none', zIndex: 0 }} />;
};

// Light Rays
const LightRays = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(139, 92, 246, 0.15) 0%, transparent 50%)`
      }}
    />
  );
};

// Prism Grid
const PrismGrid = () => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      opacity: 0.05,
      pointerEvents: 'none',
      zIndex: 0,
      backgroundImage: `
        linear-gradient(to right, #8b5cf6 1px, transparent 1px),
        linear-gradient(to bottom, #8b5cf6 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px'
    }}
  />
);


const QRCodeGenerator = () => {
  const [activeTab, setActiveTab] = useState('url');
  const [qrData, setQrData] = useState('');
  const [copied, setCopied] = useState(false);
  const qrContainerRef = useRef(null);
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [contactInfo, setContactInfo] = useState({ firstName: '', lastName: '', phone: '', email: '', organization: '', url: '' });

  // Generate QR code using QRious CDN
  const generateQRCode = (text) => {
    if (!text.trim()) {
      if (qrContainerRef.current) qrContainerRef.current.innerHTML = '';
      return;
    }
    if (!window.QRious) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
      script.onload = () => createQR(text);
      document.head.appendChild(script);
    } else {
      createQR(text);
    }
  };
  const createQR = (text) => {
    if (!qrContainerRef.current) return;
    qrContainerRef.current.innerHTML = '';
    const canvas = document.createElement('canvas');
    qrContainerRef.current.appendChild(canvas);
    new window.QRious({
      element: canvas,
      value: text,
      size: 240,
      background: 'white',
      foreground: '#8b5cf6',
      level: 'M'
    });
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
  };
  const formatUrl = (url) => {
    if (!url.trim()) return '';
    return url.startsWith('http') ? url : 'https://' + url;
  };
  const generateVCard = (contact) => {
    return `BEGIN:VCARD\nVERSION:3.0\nFN:${contact.firstName} ${contact.lastName}\nN:${contact.lastName};${contact.firstName};;;\nORG:${contact.organization}\nTEL:${contact.phone}\nEMAIL:${contact.email}\nURL:${contact.url}\nEND:VCARD`;
  };
  useEffect(() => {
    let data = '';
    switch (activeTab) {
      case 'url': data = formatUrl(urlInput); break;
      case 'text': data = textInput; break;
      case 'contact':
        if (contactInfo.firstName || contactInfo.lastName || contactInfo.phone || contactInfo.email) {
          data = generateVCard(contactInfo);
        }
        break;
      default: break;
    }
    setQrData(data);
    generateQRCode(data);
    // eslint-disable-next-line
  }, [activeTab, urlInput, textInput, contactInfo]);

  const downloadQRCode = () => {
    if (!qrData) return;
    const canvas = qrContainerRef.current?.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `qr-code-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };
  const copyToClipboard = async () => {
    if (qrData) {
      try {
        await navigator.clipboard.writeText(qrData);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // ignore
      }
    }
  };
  const resetForm = () => {
    setUrlInput('');
    setTextInput('');
    setContactInfo({ firstName: '', lastName: '', phone: '', email: '', organization: '', url: '' });
    setQrData('');
    if (qrContainerRef.current) qrContainerRef.current.innerHTML = '';
  };
  const tabs = [
    { id: 'url', label: t('urlTab'), icon: Link },
    { id: 'text', label: t('textTab'), icon: MessageSquare },
    { id: 'contact', label: t('contactTab'), icon: User }
  ];


  return (
    <div style={{ minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
      {/* Scroll Progress Bar */}
      <ScrollProgressBar />
      
      {/* Background Effects */}
      <NoiseTexture />
      <ShapeBlur />
      <LightRays />
      <PrismGrid />
      
      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Header with Metallic Paint Effect */}
        <FadeIn duration={1.2}>
          <div style={{ textAlign: 'center', paddingTop: 'clamp(1.5rem, 5vw, 3rem)', marginBottom: 'clamp(1rem, 3vw, 2rem)', padding: '0 1rem' }}>
            <ScaleIn delay={0.3} duration={0.8}>
              <div style={{ display: 'inline-block', marginBottom: '1.5rem', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,#8b5cf6,#ec4899)', filter: 'blur(32px)', opacity: 0.5, animation: 'pulse 3s ease-in-out infinite' }}></div>
                <div style={{ position: 'relative', background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', padding: 'clamp(1rem, 3vw, 1.5rem)', borderRadius: '2rem', transform: 'rotate(3deg)', transition: 'transform 0.3s' }}>
                  <QrCode size={window.innerWidth < 480 ? 32 : 48} color="#fff" style={{ transform: 'rotate(-3deg)' }} />
                </div>
              </div>
            </ScaleIn>
            <h1 className="metallic-text" style={{ 
              fontSize: 'clamp(3rem, 8vw, 5rem)', 
              fontWeight: 900, 
              margin: 0, 
              letterSpacing: '-2px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #667eea 75%, #764ba2 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 3s linear infinite'
            }}>
              {t('appTitle')}
            </h1>
            <FadeIn delay={0.4} direction="up">
              <div className="subtitle" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem', 
                fontWeight: 600, 
                color: '#b983ff', 
                fontSize: '1.1rem', 
                marginTop: '1rem',
                letterSpacing: '0.5px'
              }}>
                {t('appDescription')}
              </div>
            </FadeIn>
          </div>
        </FadeIn>

        {/* Pixel Card */}
        <FadeIn delay={0.6} duration={1}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(1rem, 3vw, 1.5rem) 3rem' }}>
            <div className="pixel-border" style={{ 
              position: 'relative',
              borderRadius: 'clamp(16px, 4vw, 32px)',
              padding: '2px',
              background: 'linear-gradient(45deg, #ec4899, #8b5cf6, #06b6d4, #f59e0b)',
              animation: 'pixel-pulse 3s ease-in-out infinite'
            }}>
              <div style={{ 
                background: 'rgba(20, 20, 40, 0.85)', 
                backdropFilter: 'blur(20px)',
                borderRadius: 'clamp(14px, 4vw, 30px)',
                padding: 'clamp(1.5rem, 4vw, 2.5rem)'
              }}>
                {/* Tabs */}
                <div className="tabs" style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                  {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                          flex: '1 1 auto',
                          minWidth: 'fit-content',
                          padding: 'clamp(0.75rem, 2vw, 1rem)',
                          borderRadius: 'clamp(12px, 3vw, 16px)',
                          background: activeTab === tab.id ? 'linear-gradient(90deg, #8b5cf6, #ec4899)' : 'transparent',
                          color: activeTab === tab.id ? '#fff' : '#888',
                          fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          boxShadow: activeTab === tab.id ? '0 4px 20px rgba(139, 92, 246, 0.4)' : 'none'
                        }}
                      >
                        <Icon size={16} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
                
                {/* Form & QR Grid */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', 
                  gap: 'clamp(1.5rem, 4vw, 2.5rem)', 
                  alignItems: 'start' 
                }}>
                  {/* Input Section */}
                  <FadeIn delay={0.2} direction="left">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                          {activeTab === 'url' && t('enterUrl')}
                          {activeTab === 'text' && t('enterText')}
                          {activeTab === 'contact' && t('contactInformation')}
                        </h2>
                        <button 
                          style={{ 
                            background: 'rgba(239,68,68,0.15)', 
                            color: '#f87171', 
                            borderRadius: 12, 
                            padding: '0.5rem 1rem', 
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }} 
                          onClick={resetForm}
                        >
                          {t('clearAllFields')}
                        </button>
                      </div>
                      
                      {/* URL Tab */}
                      {activeTab === 'url' && (
                        <div style={{ marginBottom: 24 }}>
                          <label style={{ color: '#b983ff', fontWeight: 700, fontSize: 14, display: 'block', marginBottom: 8 }}>{t('websiteUrl')}</label>
                          <input
                            type="url"
                            value={urlInput}
                            onChange={e => setUrlInput(e.target.value)}
                            placeholder={t('urlPlaceholder')}
                            style={{ 
                              width: '100%', 
                              padding: '0.875rem 1rem',
                              background: 'rgba(255,255,255,0.05)',
                              border: '2px solid rgba(139, 92, 246, 0.3)',
                              borderRadius: '16px',
                              color: '#fff',
                              fontSize: '1rem',
                              outline: 'none',
                              transition: 'all 0.3s'
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Text Tab */}
                      {activeTab === 'text' && (
                        <div style={{ marginBottom: 24 }}>
                          <label style={{ color: '#b983ff', fontWeight: 700, fontSize: 14, display: 'block', marginBottom: 8 }}>{t('textContent')}</label>
                          <textarea
                            value={textInput}
                            onChange={e => setTextInput(e.target.value)}
                            placeholder={t('textPlaceholder')}
                            rows={6}
                            style={{ 
                              width: '100%', 
                              padding: '0.875rem 1rem',
                              background: 'rgba(255,255,255,0.05)',
                              border: '2px solid rgba(139, 92, 246, 0.3)',
                              borderRadius: '16px',
                              color: '#fff',
                              fontSize: '1rem',
                              outline: 'none',
                              resize: 'none',
                              transition: 'all 0.3s'
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Contact Tab */}
                      {activeTab === 'contact' && (
                        <div style={{ marginBottom: 24 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            <div>
                              <label style={{ color: '#b983ff', fontWeight: 700, fontSize: 14, display: 'block', marginBottom: 8 }}>{t('firstName')}</label>
                              <input 
                                type="text" 
                                value={contactInfo.firstName} 
                                onChange={e => setContactInfo({ ...contactInfo, firstName: e.target.value })} 
                                placeholder={t('firstNamePlaceholder')} 
                                style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(139, 92, 246, 0.3)', borderRadius: '12px', color: '#fff', outline: 'none' }} 
                              />
                            </div>
                            <div>
                              <label style={{ color: '#b983ff', fontWeight: 700, fontSize: 14, display: 'block', marginBottom: 8 }}>{t('lastName')}</label>
                              <input 
                                type="text" 
                                value={contactInfo.lastName} 
                                onChange={e => setContactInfo({ ...contactInfo, lastName: e.target.value })} 
                                placeholder={t('lastNamePlaceholder')} 
                                style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(139, 92, 246, 0.3)', borderRadius: '12px', color: '#fff', outline: 'none' }} 
                              />
                            </div>
                          </div>
                          <div style={{ marginBottom: 16 }}>
                            <label style={{ color: '#b983ff', fontWeight: 700, fontSize: 14, display: 'block', marginBottom: 8 }}>{t('phoneNumber')}</label>
                            <input 
                              type="tel" 
                              value={contactInfo.phone} 
                              onChange={e => setContactInfo({ ...contactInfo, phone: e.target.value })} 
                              placeholder={t('phonePlaceholder')} 
                              style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(139, 92, 246, 0.3)', borderRadius: '12px', color: '#fff', outline: 'none' }} 
                            />
                          </div>
                          <div style={{ marginBottom: 16 }}>
                            <label style={{ color: '#b983ff', fontWeight: 700, fontSize: 14, display: 'block', marginBottom: 8 }}>{t('emailAddress')}</label>
                            <input 
                              type="email" 
                              value={contactInfo.email} 
                              onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })} 
                              placeholder={t('emailPlaceholder')} 
                              style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(139, 92, 246, 0.3)', borderRadius: '12px', color: '#fff', outline: 'none' }} 
                            />
                          </div>
                          <div style={{ marginBottom: 16 }}>
                            <label style={{ color: '#b983ff', fontWeight: 700, fontSize: 14, display: 'block', marginBottom: 8 }}>{t('organization')}</label>
                            <input 
                              type="text" 
                              value={contactInfo.organization} 
                              onChange={e => setContactInfo({ ...contactInfo, organization: e.target.value })} 
                              placeholder={t('organizationPlaceholder')} 
                              style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(139, 92, 246, 0.3)', borderRadius: '12px', color: '#fff', outline: 'none' }} 
                            />
                          </div>
                          <div>
                            <label style={{ color: '#b983ff', fontWeight: 700, fontSize: 14, display: 'block', marginBottom: 8 }}>{t('website')}</label>
                            <input 
                              type="url" 
                              value={contactInfo.url} 
                              onChange={e => setContactInfo({ ...contactInfo, url: e.target.value })} 
                              placeholder={t('websitePlaceholder')} 
                              style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(139, 92, 246, 0.3)', borderRadius: '12px', color: '#fff', outline: 'none' }} 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </FadeIn>
                  
                  {/* QR Section */}
                  <FadeIn delay={0.4} direction="right">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0 }}>{t('generatedQrCode')}</h2>
                      <ScaleIn delay={0.6}>
                        <div style={{ 
                          background: '#fff', 
                          borderRadius: '24px', 
                          padding: '1.5rem', 
                          boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
                          transition: 'transform 0.3s, box-shadow 0.3s'
                        }}>
                          {qrData ? (
                            <div style={{ textAlign: 'center' }}>
                              <div ref={qrContainerRef}></div>
                              <p style={{ color: '#8b5cf6', fontWeight: 700, marginTop: 16, fontSize: 15 }}>{t('scanQrCode')}</p>
                            </div>
                          ) : (
                            <div style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
                              <QrCode size={96} color="#8b5cf6" style={{ opacity: 0.3, marginBottom: 16 }} />
                              <p style={{ color: '#8b5cf699', fontWeight: 700 }}>{t('fillFormPrompt')}</p>
                            </div>
                          )}
                        </div>
                      </ScaleIn>
                      {qrData && (
                        <FadeIn delay={0.8} direction="up">
                          <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 320 }}>
                            <button 
                              style={{ 
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                padding: '0.875rem',
                                background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                                border: 'none',
                                borderRadius: '16px',
                                color: '#fff',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                              }} 
                              onClick={downloadQRCode}
                            >
                              <Download size={20} />
                              {t('download')}
                            </button>
                            <button 
                              style={{ 
                                padding: '0.875rem',
                                background: 'rgba(255,255,255,0.08)', 
                                border: '2px solid rgba(255,255,255,0.15)', 
                                borderRadius: '16px',
                                color: '#fff',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                              }} 
                              onClick={copyToClipboard}
                            >
                              {copied ? <><Check size={20} />{t('copied')}</> : <Copy size={20} />}
                            </button>
                          </div>
                        </FadeIn>
                      )}
                    </div>
                  </FadeIn>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Profile Card Section */}
        <FadeIn delay={0.8} duration={1.2}>
          <div style={{ maxWidth: '1200px', margin: '4rem auto 3rem', padding: '0 clamp(1rem, 3vw, 1.5rem)' }}>
            {/* Sticky Header */}
            <div style={{ 
              position: 'sticky', 
              top: 'clamp(10px, 2vw, 20px)', 
              zIndex: 100,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: 'clamp(12px, 3vw, 20px)',
              padding: 'clamp(1rem, 3vw, 1.5rem) clamp(1.25rem, 4vw, 2rem)',
              marginBottom: 'clamp(2rem, 4vw, 3rem)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <h2 className="metallic-text" style={{ 
                  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', 
                  fontWeight: 900, 
                  margin: 0, 
                  marginBottom: '0.5rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #667eea 75%, #764ba2 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'shimmer 3s linear infinite'
                }}>
                  About The Developer
                </h2>
              <p style={{ color: '#b983ff', fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                Frontend Developer | IoT Innovator | BSc CS @ SRM
              </p>
              </div>
            </div>
            
            <ScaleIn delay={1.2}>
              <ProfileCard
                name="Vishnu Skandha"
                title="Frontend Developer & IoT Innovator"
                handle="vishnuskandha"
                status="Available for collaboration"
                contactText="View GitHub"
                avatarUrl="https://avatars.githubusercontent.com/u/81701749?v=4"
                showUserInfo={true}
                enableTilt={true}
                enableMobileTilt={false}
                onContactClick={() => window.open('https://github.com/vishnuskandha', '_blank')}
              />
            </ScaleIn>
            
            <FadeIn delay={1.4} duration={1}>
              <div style={{ 
                marginTop: '3rem', 
                padding: '2rem', 
                background: 'rgba(139, 92, 246, 0.1)', 
                borderRadius: '24px',
                border: '1px solid rgba(139, 92, 246, 0.3)'
              }}>
                <h3 style={{ 
                  color: '#fff', 
                  fontSize: '1.5rem', 
                  fontWeight: 800, 
                  marginBottom: '1.5rem',
                  textAlign: 'center'
                }}>
                  Featured Projects
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
                  gap: 'clamp(0.75rem, 2vw, 1rem)'
                }}>
                  <StaggerContainer staggerDelay={0.1}>
                    {[
                      { title: 'Clicker Game', desc: 'React.js web app', tech: 'React • JavaScript', icon: '🎮' },
                      { title: 'Smart Military Assistant', desc: 'AI + Neural link', tech: 'AI • IoT', icon: '🛡️' },
                      { title: 'Fire Detection System', desc: 'Raspberry Pi + CV', tech: 'Python • CV', icon: '🔥' },
                      { title: 'Bluetooth Robot Car', desc: 'Arduino + HC-05', tech: 'Arduino • IoT', icon: '🚗' }
                    ].map((project, idx) => (
                      <div key={idx} style={{ 
                        padding: '1.25rem', 
                        background: 'rgba(0, 0, 0, 0.3)', 
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      >
                        <div style={{ 
                          width: '56px', 
                          height: '56px', 
                          borderRadius: '14px', 
                          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '1rem',
                          border: '1px solid rgba(139, 92, 246, 0.2)',
                          fontSize: '2rem'
                        }}>
                          {project.icon}
                        </div>
                        <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.3 }}>
                          {project.title}
                        </h4>
                        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem', margin: 0, marginBottom: '0.75rem', lineHeight: 1.4 }}>
                          {project.desc}
                        </p>
                        <div style={{ 
                          fontSize: '0.7rem', 
                          color: 'rgba(185, 131, 255, 0.8)', 
                          fontWeight: 600,
                          padding: '0.25rem 0.5rem',
                          background: 'rgba(139, 92, 246, 0.1)',
                          borderRadius: '6px',
                          display: 'inline-block'
                        }}>
                          {project.tech}
                        </div>
                      </div>
                    ))}
                  </StaggerContainer>
                </div>
                
                <FadeIn delay={2} direction="up">
                  <div style={{ 
                    marginTop: '2rem', 
                    textAlign: 'center',
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                  }}>
                    <a 
                      href="https://vishnuskandhagithubio.vercel.app/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        color: '#fff',
                        textDecoration: 'none',
                        borderRadius: '12px',
                        fontWeight: 700,
                        transition: 'all 0.3s',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 25px rgba(102, 126, 234, 0.6)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                      }}
                    >
                      <span>Portfolio</span>
                    </a>
                    <a 
                      href="https://github.com/vishnuskandha" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                        color: '#fff',
                        textDecoration: 'none',
                        borderRadius: '12px',
                        fontWeight: 700,
                        transition: 'all 0.3s',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 25px rgba(139, 92, 246, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <span>GitHub</span>
                    </a>
                    <a 
                      href="https://linkedin.com/in/vishnuskandha" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                        textDecoration: 'none',
                        borderRadius: '12px',
                        fontWeight: 700,
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.3s',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      }}
                    >
                      <span>LinkedIn</span>
                    </a>
                  </div>
                </FadeIn>
              </div>
            </FadeIn>
          </div>
        </FadeIn>

        {/* Footer */}
        <FadeIn delay={2.2} direction="up">
          <div style={{ textAlign: 'center', color: 'rgba(185, 131, 255, 0.6)', fontSize: '0.95rem', paddingBottom: '2rem' }}>
            Made with passion by Vishnu Skandha | QR Magic © 2025
          </div>
        </FadeIn>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
