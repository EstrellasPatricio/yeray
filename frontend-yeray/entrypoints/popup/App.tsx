import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { browser } from 'wxt/browser';
import './App.css';

type View = 'home' | 'report' | 'reportForm' | 'history' | 'notifications' | 'settings' | 'account';
type Mode = 'agile' | 'balanced' | 'deep';
type RiskState = 'pending' | 'risk' | 'safe';
type Language = 'es' | 'en';
type Theme = 'light' | 'dark';
type AccountMode = 'signin' | 'create';

type SavedReport = {
  id: number;
  domain: string;
  tags: string[];
  rating: number;
  details: string;
  selectedText: string;
  when: string;
};

type HistoryItem = {
  domain: string;
  state: RiskState;
  when: string;
};

const I18N = {
  es: {
    tagline: 'Protección inteligente', currentPage: 'Página actual', active: 'Activo', pendingTitle: 'Pendiente de análisis', pendingBody: 'Todavía no hay un resultado de seguridad disponible para esta página.', riskTitle: 'Peligro: posible fraude', riskBody: 'Se han detectado señales importantes de riesgo. Se recomienda no continuar.', safeTitle: 'Sin amenazas conocidas', safeBody: 'No se han detectado señales conocidas de riesgo.', protection: 'Nivel de protección', protectionDesc: 'Elige cómo quieres analizar las páginas', agile: 'Ágil', balanced: 'Equilibrado', deep: 'Profundo', agileDesc: 'Reputación del sitio y amenazas críticas.', balancedDesc: 'Reputación web y análisis estructural.', deepDesc: 'Contenido, privacidad y posibles tácticas de engaño.', agileTime: 'menos de 3 s', balancedTime: 'menos de 5 s', deepTime: 'menos de 10 s', defaultMode: 'Predeterminado', checks: 'Comprobaciones', viewReport: 'Ver informe de seguridad', report: 'Reportar', history: 'Historial', back: 'Volver', reportTitle: 'Informe de seguridad', noScore: 'Sin puntuación todavía', demo: 'Resultado de demostración', explanation: 'Explicación del resultado', pendingExplanation: 'Yeray mostrará aquí los resultados cuando termine el análisis.', riskExplanation: 'Se han observado señales que conviene revisar antes de compartir datos o pagar.', safeExplanation: 'Las comprobaciones de demostración no han encontrado señales conocidas de riesgo.', reputation: 'Reputación de URL', thirdParty: 'Reputación de terceros', ai: 'Análisis de contenido e IA', community: 'Reportes comunitarios', cookies: 'Cookies y privacidad', suspicious: 'Elementos sospechosos', pendingCheck: 'Pendiente de análisis', riskCheck: 'Señales de riesgo detectadas', safeCheck: 'Sin alertas conocidas', suspiciousElements: 'Ver elementos sospechosos', hideElements: 'Ocultar elementos', concern1: 'Urgencia difícil de comprobar', concern2: 'Opción promocional seleccionada', concern3: 'Condiciones de renovación poco claras', reportFormTitle: 'Enviar un reporte', reportPrompt: '¿Qué te ha parecido sospechoso?', tagPhishing: 'Suplantación', tagPrice: 'Precio engañoso', tagPrivacy: 'Privacidad o cookies', tagPressure: 'Presión para comprar', tagPayment: 'Pago sospechoso', tagFakeDomain: 'Web o dominio falso', tagDownload: 'Descarga sospechosa', tagOther: 'Otro', selectText: 'Seleccionar texto sospechoso', selectHint: 'Pulsa el botón y selecciona el texto directamente en la página.', selectedText: 'Texto seleccionado', removeSelection: 'Quitar selección', selectionError: 'No se pudo activar la selección en esta página.', dangerRating: 'Peligrosidad de la página', details: 'Detalles', optional: '(opcional)', detailsPlaceholder: 'Describe brevemente lo que viste', evidence: 'Adjuntar evidencia', addImage: 'Añadir captura o imagen', imageFormats: 'PNG, JPG o similar', submit: 'Enviar reporte', reportSent: 'Reporte guardado', reportSaved: 'Tu reporte se ha guardado en esta demostración.', recentActivity: 'Actividad reciente', myReports: 'Mis reportes', noReports: 'Aún no has enviado reportes.', noHistory: 'Todavía no hay actividad.', clearHistory: 'Borrar historial local', historyCleared: 'Historial local borrado.', highRisk: 'Riesgo elevado', noThreats: 'Sin señales conocidas', pending: 'Pendiente', view: 'Ver', notifications: 'Avisos de seguridad', notificationsDesc: 'Avisar si un sitio vuelve a mostrar señales de riesgo.', noNotifications: 'No hay avisos nuevos.', settings: 'Preferencias', language: 'Idioma', appearance: 'Apariencia', light: 'Claro', dark: 'Oscuro', textSize: 'Tamaño del texto', privacy: 'Privacidad', privacyBody: 'Yeray evita analizar campos de contraseñas o tarjetas.', account: 'Cuenta Yeray', accountDemo: 'Acceso de demostración: todavía no se conecta a una cuenta real.', signIn: 'Iniciar sesión', createAccount: 'Crear cuenta', name: 'Nombre', surname: 'Apellidos', email: 'Correo electrónico', password: 'Contraseña', repeatPassword: 'Repetir contraseña', passwordRules: 'La contraseña debe incluir:', min8: 'Mínimo 8 caracteres', uppercase: 'Una mayúscula', lowercase: 'Una minúscula', number: 'Un número', passwordsMatch: 'Las contraseñas coinciden', invalidRegistration: 'Revisa todos los requisitos antes de crear la cuenta.', signInDemo: 'Inicio de sesión preparado para conectarse al backend.', createDemo: 'Datos de registro validados correctamente.',
  },
  en: {
    tagline: 'Smart protection', currentPage: 'Current page', active: 'Active', pendingTitle: 'Analysis pending', pendingBody: 'There is no security result available for this page yet.', riskTitle: 'Danger: possible fraud', riskBody: 'Important risk signals were detected. We recommend that you do not continue.', safeTitle: 'No known threats', safeBody: 'No known risk signals were detected.', protection: 'Protection level', protectionDesc: 'Choose how you want pages to be analyzed', agile: 'Agile', balanced: 'Balanced', deep: 'Deep', agileDesc: 'Site reputation and critical threats.', balancedDesc: 'Web reputation and structural analysis.', deepDesc: 'Content, privacy and possible deceptive tactics.', agileTime: 'under 3 sec', balancedTime: 'under 5 sec', deepTime: 'under 10 sec', defaultMode: 'Default', checks: 'Checks', viewReport: 'View security report', report: 'Report', history: 'History', back: 'Back', reportTitle: 'Security report', noScore: 'No score yet', demo: 'Demo result', explanation: 'Why this result', pendingExplanation: 'Yeray will display the results when analysis is complete.', riskExplanation: 'Signals were found that should be reviewed before sharing data or paying.', safeExplanation: 'The demo checks found no known risk signals.', reputation: 'URL reputation', thirdParty: 'Third-party reputation', ai: 'Content and AI analysis', community: 'Community reports', cookies: 'Cookies and privacy', suspicious: 'Suspicious elements', pendingCheck: 'Analysis pending', riskCheck: 'Risk signals detected', safeCheck: 'No known alerts', suspiciousElements: 'View suspicious elements', hideElements: 'Hide elements', concern1: 'Hard-to-verify urgency', concern2: 'Preselected promotion option', concern3: 'Unclear renewal terms', reportFormTitle: 'Send a report', reportPrompt: 'What seemed suspicious?', tagPhishing: 'Impersonation', tagPrice: 'Misleading price', tagPrivacy: 'Privacy or cookies', tagPressure: 'Purchase pressure', tagPayment: 'Suspicious payment', tagFakeDomain: 'Fake website or domain', tagDownload: 'Suspicious download', tagOther: 'Other', selectText: 'Select suspicious text', selectHint: 'Press the button and select the text directly on the page.', selectedText: 'Selected text', removeSelection: 'Remove selection', selectionError: 'Text selection could not be activated on this page.', dangerRating: 'Page risk rating', details: 'Details', optional: '(optional)', detailsPlaceholder: 'Briefly describe what you saw', evidence: 'Attach evidence', addImage: 'Add screenshot or image', imageFormats: 'PNG, JPG or similar', submit: 'Send report', reportSent: 'Report saved', reportSaved: 'Your report was saved in this demo.', recentActivity: 'Recent activity', myReports: 'My reports', noReports: 'You have not sent any reports yet.', noHistory: 'There is no activity yet.', clearHistory: 'Clear local history', historyCleared: 'Local history cleared.', highRisk: 'High risk', noThreats: 'No known signals', pending: 'Pending', view: 'View', notifications: 'Security alerts', notificationsDesc: 'Alert if a site shows risk signals again.', noNotifications: 'There are no new alerts.', settings: 'Preferences', language: 'Language', appearance: 'Appearance', light: 'Light', dark: 'Dark', textSize: 'Text size', privacy: 'Privacy', privacyBody: 'Yeray avoids analyzing password or card fields.', account: 'Yeray account', accountDemo: 'Demo access: this is not connected to a real account yet.', signIn: 'Sign in', createAccount: 'Create account', name: 'First name', surname: 'Last name', email: 'Email address', password: 'Password', repeatPassword: 'Repeat password', passwordRules: 'Password must include:', min8: 'At least 8 characters', uppercase: 'One uppercase letter', lowercase: 'One lowercase letter', number: 'One number', passwordsMatch: 'Passwords match', invalidRegistration: 'Review all requirements before creating the account.', signInDemo: 'Sign-in is prepared to connect to the backend.', createDemo: 'Registration data validated successfully.',
  },
} as const;

function Icon({ name }: { name: 'shield' | 'bell' | 'settings' | 'user' | 'clock' | 'globe' | 'bolt' | 'scan' | 'report' | 'history' | 'warning' | 'check' | 'eye' | 'back' | 'next' }) {
  const paths: Record<string, ReactNode> = {
    shield: <><path d="M12 3L20 6V11C20 16.2 16.8 20 12 22C7.2 20 4 16.2 4 11V6L12 3Z"/><path d="M8.5 12L11 14.5L15.8 9.5"/></>,
    bell: <><path d="M18 8A6 6 0 0 0 6 8C6 15 3 16 3 16H21C21 16 18 15 18 8Z"/><path d="M10 20H14"/></>,
    settings: <><path d="M4 7H14M18 7H20M4 17H8M12 17H20"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M5 21C5.8 17.1 8.3 15 12 15C15.7 15 18.2 17.1 19 21"/></>,
    clock: <><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12L15 14"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12H21M12 3C14.5 5.5 15.5 8.5 15.5 12C15.5 15.5 14.5 18.5 12 21M12 3C9.5 5.5 8.5 8.5 8.5 12C8.5 15.5 9.5 18.5 12 21"/></>,
    bolt: <path d="M13.5 2L5.5 13H11L10.5 22L18.5 10.5H13L13.5 2Z"/>,
    scan: <><path d="M8 4H5A1 1 0 0 0 4 5V8M16 4H19A1 1 0 0 1 20 5V8M20 16V19A1 1 0 0 1 19 20H16M8 20H5A1 1 0 0 1 4 19V16"/><circle cx="12" cy="12" r="3"/></>,
    report: <><path d="M6 21V4"/><path d="M6 4C11 1 14 7 19 4V14C14 17 11 11 6 14"/></>,
    history: <><path d="M4 7V3M4 3H8M4.5 6.5A9 9 0 1 1 3.5 15"/><path d="M12 7V12L15 14"/></>,
    warning: <><path d="M12 3L21 20H3L12 3Z"/><path d="M12 9V14M12 17H12.01"/></>,
    check: <path d="M5 12L9 16L19 6"/>, eye: <><path d="M2 12S5.5 6 12 6S22 12 22 12S18.5 18 12 18S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
    back: <path d="M11 5.5L4.5 12L11 18.5M5 12H19"/>, next: <path d="M13 5.5L19.5 12L13 18.5M19 12H5"/>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</g></svg>;
}

function App() {
  const [view, setView] = useState<View>('home');
  const [mode, setMode] = useState<Mode>(() => (localStorage.getItem('yeray-mode') as Mode) || 'balanced');
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem('yeray-language') === 'en' ? 'en' : 'es');
  const [theme, setTheme] = useState<Theme>(() => localStorage.getItem('yeray-theme') === 'dark' ? 'dark' : 'light');
  const [fontScale, setFontScale] = useState(() => Number(localStorage.getItem('yeray-font-scale')) || 1);
  const [notifications, setNotifications] = useState(() => localStorage.getItem('yeray-notifications') !== 'false');
  const [draftKey, setDraftKey] = useState('');
  const [domain, setDomain] = useState('Cargando...');
  const [riskState, setRiskState] = useState<RiskState>('pending');
  const [reportDomain, setReportDomain] = useState('');
  const [reportState, setReportState] = useState<RiskState>('pending');
  const [showSuspicious, setShowSuspicious] = useState(false);
  const [historyMessage, setHistoryMessage] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const raw = localStorage.getItem('yeray-history');
    if (raw) { try { return JSON.parse(raw); } catch {} }
    return [{ domain: 'example.com', state: 'risk', when: 'Hoy' }, { domain: 'tienda-segura.example', state: 'safe', when: 'Ayer' }];
  });
  const [reports, setReports] = useState<SavedReport[]>(() => {
    const raw = localStorage.getItem('yeray-reports');
    if (raw) { try { return JSON.parse(raw); } catch {} }
    return [];
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [selectionError, setSelectionError] = useState('');
  const [rating, setRating] = useState(50);
  const [details, setDetails] = useState('');
  const [imageName, setImageName] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [accountMode, setAccountMode] = useState<AccountMode>('signin');
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [accountMessage, setAccountMessage] = useState('');

  const t = I18N[language];
  const isValidMode = (value: string): value is Mode => ['agile', 'balanced', 'deep'].includes(value);

  useEffect(() => {
    if (!isValidMode(mode)) setMode('balanced');
  }, [mode]);

  useEffect(() => {
    const loadTab = async () => {
      try {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        if (!tab?.url || tab.id == null) return;
        const key = `yeray-report:${tab.id}:${tab.url}`;
        setDraftKey(key);
        const stored = await browser.storage.local.get(key);
        const draft = stored[key] as { details?: string; tags?: string[]; rating?: number; selectedText?: string; resume?: boolean } | undefined;
        if (draft) {
          setDetails(draft.details ?? ''); setSelectedTags(draft.tags ?? []); setRating(draft.rating ?? 50); setSelectedText(draft.selectedText ?? '');
          if (draft.resume) setView('reportForm');
        }
        const currentDomain = new URL(tab.url).hostname.replace(/^www\./, '') || 'Página actual';
        setDomain(currentDomain);
        setRiskState(currentDomain === 'example.com' ? 'risk' : 'pending');
      } catch {
        setDomain('Página actual');
        setRiskState('pending');
      }
    };
    void loadTab();
  }, []);

  useEffect(() => { localStorage.setItem('yeray-mode', mode); }, [mode]);
  useEffect(() => { localStorage.setItem('yeray-language', language); }, [language]);
  useEffect(() => { localStorage.setItem('yeray-theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('yeray-font-scale', String(fontScale)); }, [fontScale]);
  useEffect(() => { localStorage.setItem('yeray-notifications', String(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('yeray-history', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('yeray-reports', JSON.stringify(reports)); }, [reports]);

  const modeInfo = {
    agile: { label: t.agile, desc: t.agileDesc, time: t.agileTime, icon: 'bolt' as const, checks: ['reputation', 'thirdParty'] as const },
    balanced: { label: t.balanced, desc: t.balancedDesc, time: t.balancedTime, icon: 'shield' as const, checks: ['reputation', 'thirdParty', 'community', 'cookies'] as const },
    deep: { label: t.deep, desc: t.deepDesc, time: t.deepTime, icon: 'scan' as const, checks: ['reputation', 'thirdParty', 'ai', 'community', 'cookies', 'suspicious'] as const },
  };

  const checkNames = { reputation: t.reputation, thirdParty: t.thirdParty, ai: t.ai, community: t.community, cookies: t.cookies, suspicious: t.suspicious };
  const currentChecks = modeInfo[mode].checks;

  const Header = () => (
    <header className="header">
      <button className="brand-icon" type="button" onClick={() => setView('home')}><Icon name="shield" /></button>
      <div className="brand"><h1>Yeray</h1><p>{t.tagline}</p></div>
      <div className="header-actions">
        <button type="button" onClick={() => setView('notifications')}><Icon name="bell" /></button>
        <button type="button" onClick={() => setView('settings')}><Icon name="settings" /></button>
        <button type="button" onClick={() => setView('account')}><Icon name="user" /></button>
      </div>
    </header>
  );

  const Layout = ({ children }: { children: ReactNode }) => <div className={`yeray-app theme-${theme}`} style={{ '--font-scale': fontScale } as React.CSSProperties}><Header />{children}</div>;
  const Back = () => <button className="back-button" type="button" onClick={() => setView('home')}><Icon name="back" />{t.back}</button>;

  const openReport = (targetDomain = domain, targetState = riskState) => {
    setReportDomain(targetDomain); setReportState(targetState); setShowSuspicious(false); setView('report');
  };

  const resetReportForm = () => {
    setSelectionError(''); setReportSent(false); setView('reportForm');
  };

  const startSelection = async () => {
    try {
      setSelectionError('');
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error('No active tab');
      if (!draftKey || `yeray-report:${tab.id}:${tab.url}` !== draftKey) throw new Error('Page changed');
      await browser.storage.local.set({ [draftKey]: { details, tags: selectedTags, rating, selectedText, resume: true } });
      await browser.tabs.sendMessage(tab.id, { type: 'YERAY_START_TEXT_SELECTION', draftKey, expectedUrl: tab.url });
      window.close();
    } catch (error) {
      console.error(error);
      setSelectionError(t.selectionError);
    }
  };

  const sendReport = async () => {
    const item: SavedReport = { id: Date.now(), domain, tags: selectedTags, rating, details, selectedText, when: new Date().toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' }) };
    setReports((current) => [item, ...current]);
    if (draftKey) await browser.storage.local.remove(draftKey);
    setSelectedText(''); setReportSent(true);
  };

  const toggleTag = (tag: string) => setSelectedTags((current) => current.includes(tag) ? current.filter((x) => x !== tag) : [...current, tag]);

  const passwordRules = {
    min8: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    match: password.length > 0 && password === repeatPassword,
  };

  const handleAccount = (event: FormEvent) => {
    event.preventDefault();
    if (accountMode === 'signin') { setAccountMessage(t.signInDemo); return; }
    const valid = firstName.trim() && surname.trim() && email.trim() && Object.values(passwordRules).every(Boolean);
    setAccountMessage(valid ? t.createDemo : t.invalidRegistration);
  };

  if (view === 'report') {
    const score = reportState === 'risk' ? 91 : reportState === 'safe' ? 8 : null;
    return <Layout><main className="content"><Back /><h2 className="page-heading">{t.reportTitle}</h2>
      <section className={`score-card ${reportState}`}><div><strong>{reportDomain || domain}</strong><span className={`state-label ${reportState}`}>{reportState === 'risk' ? t.riskTitle : reportState === 'safe' ? t.safeTitle : t.pendingTitle}</span></div>{score === null ? <strong className="no-score">{t.noScore}</strong> : <div className="score"><strong>{score}</strong><span>/100</span></div>}</section>
      <h3 className="section-title">{t.checks} · {currentChecks.length}</h3>
      <div className="check-list">{currentChecks.map((key) => <div className="check-row" key={key}><span className={`check-state ${reportState}`}><Icon name={reportState === 'pending' ? 'clock' : reportState === 'risk' ? 'warning' : 'check'} /></span><div><strong>{checkNames[key]}</strong><small>{reportState === 'pending' ? t.pendingCheck : reportState === 'risk' ? t.riskCheck : t.safeCheck}</small></div></div>)}</div>
      <section className={`explanation ${reportState}`}><strong>{t.explanation}</strong><p>{reportState === 'pending' ? t.pendingExplanation : reportState === 'risk' ? t.riskExplanation : t.safeExplanation}</p></section>
      {reportState === 'risk' && <><button className="outline-button" type="button" onClick={() => setShowSuspicious(!showSuspicious)}><Icon name="eye" />{showSuspicious ? t.hideElements : t.suspiciousElements}</button>{showSuspicious && <div className="concern-list"><div>{t.concern1}</div><div>{t.concern2}</div><div>{t.concern3}</div></div>}</>}
    </main></Layout>;
  }

  if (view === 'reportForm') {
    const tags: Array<[string, string]> = [
      ['phishing', t.tagPhishing],
      ['price', t.tagPrice],
      ['privacy', t.tagPrivacy],
      ['pressure', t.tagPressure],
      ['payment', t.tagPayment],
      ['fakeDomain', t.tagFakeDomain],
      ['download', t.tagDownload],
      ['other', t.tagOther],
    ];
  
    return (
      <Layout>
        <main className="content">
          <Back />
  
          <h2 className="page-heading">
            {t.reportFormTitle}
          </h2>
  
          <section className="page-card">
            <small>{t.currentPage}</small>
            <strong>{domain}</strong>
          </section>
  
          {!reportSent ? (
            <>
              <h3 className="section-title">
                {t.reportPrompt}
              </h3>
  
              <div className="tag-grid">
                {tags.map(([key, label]) => (
                  <label
                    className={
                      selectedTags.includes(key)
                        ? 'selected'
                        : ''
                    }
                    key={key}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(key)}
                      onChange={() => toggleTag(key)}
                    />
  
                    <span>{label}</span>
                  </label>
                ))}
              </div>
  
              <label className="form-label">
                {t.selectText}
              </label>
  
              <button
                className="outline-button"
                type="button"
                onClick={() => void startSelection()}
              >
                <Icon name="eye" />
                {t.selectText}
              </button>
  
              {!selectedText && (
                <p className="hint">
                  {t.selectHint}
                </p>
              )}
  
              {selectionError && (
                <p className="error-box">
                  {selectionError}
                </p>
              )}
  
              {selectedText && (
                <div className="selected-text">
                  <strong>
                    {t.selectedText}
                  </strong>
  
                  <p>
                    “{selectedText}”
                  </p>
  
                  <button
                    type="button"
                    onClick={async () => {
                      setSelectedText('');
  
                      if (draftKey) { const data = await browser.storage.local.get(draftKey); await browser.storage.local.set({ [draftKey]: { ...(data[draftKey] as object), selectedText: '' } }); }
                    }}
                  >
                    {t.removeSelection}
                  </button>
                </div>
              )}
  
              <label className="form-label">
                {t.dangerRating}
              </label>
  
              <div className="rating-row">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={rating}
                  onChange={(e) =>
                    setRating(Number(e.target.value))
                  }
                />
  
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={rating}
                  onChange={(e) =>
                    setRating(
                      Math.max(
                        0,
                        Math.min(
                          100,
                          Number(e.target.value) || 0,
                        ),
                      ),
                    )
                  }
                />
  
                <span>/100</span>
              </div>
  
              <label className="form-label">
                {t.details}{' '}
                <span>{t.optional}</span>
              </label>
  
              <textarea
                maxLength={240}
                value={details}
                onChange={(e) =>
                  setDetails(e.target.value)
                }
                placeholder={t.detailsPlaceholder}
              />
  
              <label className="form-label">
                {t.evidence}{' '}
                <span>{t.optional}</span>
              </label>
  
              <label className="file-button">
                <strong>
                  {t.addImage}
                </strong>
  
                <small>
                  {t.imageFormats}
                </small>
  
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setImageName(
                      e.target.files?.[0]?.name || '',
                    )
                  }
                />
              </label>
  
              {imageName && (
                <p className="hint">
                  ✓ {imageName}
                </p>
              )}
  
              <button
                className="primary-button"
                type="button"
                onClick={() => void sendReport()}
              >
                {t.submit}
                <Icon name="next" />
              </button>
            </>
          ) : (
            <section className="success-card">
              <span className="success-icon">
                <Icon name="check" />
              </span>
  
              <strong>
                {t.reportSent}
              </strong>
  
              <p>
                {t.reportSaved}
              </p>
  
              <button
                className="outline-button"
                type="button"
                onClick={() => setView('history')}
              >
                {t.history}
              </button>
            </section>
          )}
        </main>
      </Layout>
    );
  }

  if (view === 'history') {
    const tagLabel = (tag: string) => ({ phishing: t.tagPhishing, price: t.tagPrice, privacy: t.tagPrivacy, pressure: t.tagPressure, payment: t.tagPayment, fakeDomain: t.tagFakeDomain, download: t.tagDownload, other: t.tagOther } as Record<string, string>)[tag] || tag;
    return <Layout><main className="content"><Back /><h2 className="page-heading">{t.history}</h2>{historyMessage && <p className="success-message">{historyMessage}</p>}<h3 className="section-title">{t.recentActivity}</h3>{history.length ? <div className="history-list">{history.map((item, i) => <div className="history-row" key={`${item.domain}-${i}`}><span className={`history-state ${item.state}`}><Icon name={item.state === 'risk' ? 'warning' : item.state === 'safe' ? 'check' : 'clock'} /></span><div><strong>{item.domain}</strong><small>{item.state === 'risk' ? t.highRisk : item.state === 'safe' ? t.noThreats : t.pending} · {item.when}</small></div><button type="button" onClick={() => openReport(item.domain, item.state)}>{t.view}</button></div>)}</div> : <div className="empty-state">{t.noHistory}</div>}
      <h3 className="section-title">{t.myReports}</h3>{reports.length ? <div className="report-list">{reports.map((item) => <article className="saved-report" key={item.id}><span><Icon name="report" /></span><div><strong>{item.domain}</strong><small>{item.rating}/100 · {item.when}</small>{item.tags.length > 0 && <small>{item.tags.map(tagLabel).join(' · ')}</small>}{item.selectedText && <p>“{item.selectedText}”</p>}{item.details && <p>{item.details}</p>}</div></article>)}</div> : <div className="empty-state">{t.noReports}</div>}
      <button className="danger-button" type="button" onClick={() => { setHistory([]); setHistoryMessage(t.historyCleared); }}>{t.clearHistory}</button>
    </main></Layout>;
  }

  if (view === 'notifications') {
    return <Layout><main className="content"><Back /><h2 className="page-heading">{t.notifications}</h2><section className="page-card setting-line"><div><strong>{t.notifications}</strong><small>{t.notificationsDesc}</small></div><input type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} /></section>{notifications && riskState === 'risk' ? <section className="notice risk"><Icon name="warning" /><div><strong>{t.riskTitle}</strong><p>{domain}</p><button type="button" onClick={() => openReport()}>{t.viewReport}</button></div></section> : <div className="empty-state">{t.noNotifications}</div>}</main></Layout>;
  }

  if (view === 'settings') {
    return <Layout><main className="content"><Back /><h2 className="page-heading">{t.settings}</h2><section className="page-card settings-card"><div className="setting-line"><strong>{t.language}</strong><select value={language} onChange={(e) => setLanguage(e.target.value as Language)}><option value="es">Español</option><option value="en">English</option></select></div><div className="setting-line"><strong>{t.appearance}</strong><select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}><option value="light">{t.light}</option><option value="dark">{t.dark}</option></select></div><div className="setting-line"><strong>{t.textSize}</strong><div><button type="button" onClick={() => setFontScale(Math.max(.9, fontScale - .05))}>A−</button><button type="button" onClick={() => setFontScale(Math.min(1.2, fontScale + .05))}>A+</button></div></div></section><section className="explanation"><strong>{t.privacy}</strong><p>{t.privacyBody}</p></section></main></Layout>;
  }

  if (view === 'account') {
    const creating = accountMode === 'create';
    return <Layout><main className="content"><Back /><h2 className="page-heading">{t.account}</h2><section className="page-card"><p>{t.accountDemo}</p></section><div className="account-tabs"><button className={!creating ? 'active' : ''} type="button" onClick={() => { setAccountMode('signin'); setAccountMessage(''); }}>{t.signIn}</button><button className={creating ? 'active' : ''} type="button" onClick={() => { setAccountMode('create'); setAccountMessage(''); }}>{t.createAccount}</button></div><form className="account-form" onSubmit={handleAccount}>{creating && <div className="name-grid"><label>{t.name}<input required value={firstName} onChange={(e) => setFirstName(e.target.value)} /></label><label>{t.surname}<input required value={surname} onChange={(e) => setSurname(e.target.value)} /></label></div>}<label>{t.email}<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label><label>{t.password}<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>{creating && <><label>{t.repeatPassword}<input type="password" required value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} /></label><div className="password-rules"><strong>{t.passwordRules}</strong>{[[passwordRules.min8, t.min8], [passwordRules.uppercase, t.uppercase], [passwordRules.lowercase, t.lowercase], [passwordRules.number, t.number], [passwordRules.match, t.passwordsMatch]].map(([ok, label]) => <span className={ok ? 'ok' : ''} key={String(label)}>{ok ? '✓' : '○'} {String(label)}</span>)}</div></>}<button className="primary-button" type="submit">{creating ? t.createAccount : t.signIn}</button></form>{accountMessage && <p className="success-message">{accountMessage}</p>}</main></Layout>;
  }

  return <Layout><main className="content"><section className="site-card"><span className="site-icon"><Icon name="globe" /></span><div><small>{t.currentPage}</small><strong>{domain}</strong></div><span className="active-badge">{t.active}</span></section>{riskState === 'risk' ? <section className="notice risk"><Icon name="warning" /><div><strong>{t.riskTitle}</strong><p>{t.riskBody}</p><small>{t.demo}</small></div></section> : riskState === 'safe' ? <section className="notice safe"><Icon name="check" /><div><strong>{t.safeTitle}</strong><p>{t.safeBody}</p></div></section> : <section className="notice pending"><Icon name="clock" /><div><strong>{t.pendingTitle}</strong><p>{t.pendingBody}</p></div></section>}
    <h3 className="section-title">{t.protection}</h3><p className="section-subtitle">{t.protectionDesc}</p><div className="mode-grid">{(['agile', 'balanced', 'deep'] as Mode[]).map((item) => <button className={mode === item ? 'selected' : ''} key={item} type="button" onClick={() => setMode(item)}><Icon name={modeInfo[item].icon} /><strong>{modeInfo[item].label}</strong><small>{modeInfo[item].time}</small></button>)}</div><section className="mode-info"><div><strong>{modeInfo[mode].label}</strong>{mode === 'balanced' && <span>{t.defaultMode}</span>}</div><p>{modeInfo[mode].desc}</p><small>{t.checks}: {currentChecks.length}</small></section><button className="primary-button" type="button" onClick={() => openReport()}>{t.viewReport}<Icon name="next" /></button><div className="secondary-grid"><button type="button" onClick={resetReportForm}><Icon name="report" />{t.report}</button><button type="button" onClick={() => setView('history')}><Icon name="history" />{t.history}</button></div></main></Layout>;
}

export default App;
