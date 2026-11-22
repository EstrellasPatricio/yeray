import { useEffect, useState } from 'react';
import { browser } from 'wxt/browser';

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
      <path d="M12 3L20 6V11C20 16.2 16.8 20 12 22C7.2 20 4 16.2 4 11V6L12 3Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 12L11 14.5L15.8 9.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function App() {
  const domain = window.location.hostname.replace(/^www\./, '');
  const isRiskDemo = domain === 'example.com';

  const [warningVisible, setWarningVisible] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [selectionActive, setSelectionActive] = useState(false);
  const [selectionSaved, setSelectionSaved] = useState(false);

  useEffect(() => {
    const handleMessage = (message: unknown) => {
      if (
        typeof message === 'object' &&
        message !== null &&
        'type' in message &&
        message.type === 'YERAY_START_TEXT_SELECTION'
      ) {
        setSelectionActive(true);
        setSelectionSaved(false);
      }
    };

    browser.runtime.onMessage.addListener(handleMessage);
    return () => browser.runtime.onMessage.removeListener(handleMessage);
  }, []);

  useEffect(() => {
    if (!selectionActive) return;

    const captureSelection = async () => {
      const selectedText = window.getSelection()?.toString().trim() ?? '';
      if (!selectedText) return;

      await browser.storage.local.set({
        'yeray-selected-text': selectedText,
        'yeray-selected-domain': domain,
        'yeray-selected-url': window.location.href,
      });

      window.getSelection()?.removeAllRanges();
      setSelectionActive(false);
      setSelectionSaved(true);

      window.setTimeout(() => setSelectionSaved(false), 2600);
    };

    document.addEventListener('mouseup', captureSelection);
    return () => document.removeEventListener('mouseup', captureSelection);
  }, [selectionActive, domain]);

  if (!isRiskDemo && !selectionActive && !selectionSaved) {
    return null;
  }

  return (
    <>
      {selectionActive && (
        <div style={{ position: 'fixed', top: '22px', left: '50%', transform: 'translateX(-50%)', width: '340px', padding: '12px 14px', background: '#0F3D56', color: '#fff', borderRadius: '12px', boxShadow: '0 12px 35px rgba(15,61,86,.22)', fontFamily: 'Inter, "Segoe UI", Arial, sans-serif', zIndex: 2147483647 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: '#176B85', borderRadius: '9px' }}>
              <ShieldIcon />
            </div>
            <div style={{ flex: 1 }}>
              <strong style={{ display: 'block', fontSize: '12px' }}>Selecciona el texto sospechoso</strong>
              <span style={{ display: 'block', marginTop: '3px', opacity: .86, fontSize: '9.5px', lineHeight: 1.4 }}>
                Marca con el ratón el texto que quieras añadir al reporte.
              </span>
            </div>
            <button type="button" onClick={() => setSelectionActive(false)} style={{ width: '28px', height: '28px', padding: 0, background: 'transparent', color: '#fff', border: 0, cursor: 'pointer', fontSize: '20px' }}>×</button>
          </div>
        </div>
      )}

      {selectionSaved && (
        <div style={{ position: 'fixed', top: '22px', left: '50%', transform: 'translateX(-50%)', padding: '10px 14px', background: '#EAF5EE', color: '#167245', border: '1px solid #BFDCCB', borderRadius: '10px', boxShadow: '0 8px 24px rgba(15,61,86,.16)', fontFamily: 'Inter, "Segoe UI", Arial, sans-serif', fontSize: '11px', fontWeight: 700, zIndex: 2147483647 }}>
          ✓ Texto guardado para el reporte
        </div>
      )}

      {isRiskDemo && warningVisible && (
        <div style={{ position: 'fixed', top: '22px', right: '22px', width: '320px', background: '#fff', color: '#16343A', border: '1px solid #C7DCE3', borderRadius: '15px', boxShadow: '0 12px 35px rgba(15,61,86,.18)', overflow: 'hidden', fontFamily: 'Inter, "Segoe UI", Arial, sans-serif', zIndex: 2147483646 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 11px', borderBottom: '1px solid #E6F2F6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#176B85', color: '#fff', borderRadius: '9px' }}><ShieldIcon /></div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ color: '#0F3D56', fontSize: '12px' }}>Yeray</strong>
                <span style={{ marginTop: '2px', color: '#55727A', fontSize: '8.5px' }}>Protección inteligente</span>
              </div>
            </div>
            <button type="button" onClick={() => setWarningVisible(false)} style={{ width: '28px', height: '28px', padding: 0, background: 'transparent', color: '#55727A', border: 0, cursor: 'pointer', fontSize: '22px' }}>×</button>
          </div>

          <div style={{ display: 'flex', gap: '10px', margin: '11px', padding: '12px', background: '#FCE8E8', borderLeft: '4px solid #BE2929', borderRadius: '11px' }}>
            <div style={{ width: '29px', height: '29px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#BE2929', fontWeight: 800 }}>!</div>
            <div>
              <strong style={{ display: 'block', color: '#BE2929', fontSize: '12px' }}>Esta página podría ser fraudulenta</strong>
              <p style={{ margin: '6px 0 0', fontSize: '10.5px', lineHeight: 1.5 }}>Caso de riesgo de demostración. Evita introducir datos personales o de pago.</p>
            </div>
          </div>

          {showDetails && (
            <div style={{ margin: '0 11px 11px', padding: '10px 11px', background: '#E6F2F6', borderRadius: '10px' }}>
              <strong style={{ color: '#176B85', fontSize: '10.5px' }}>¿Por qué aparece este aviso?</strong>
              <p style={{ margin: '5px 0 0', fontSize: '9.5px', lineHeight: 1.45 }}>Este resultado es de demostración. El análisis real llegará desde el backend.</p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 11px 11px' }}>
            <button type="button" onClick={() => setShowDetails(!showDetails)} style={{ padding: '8px 12px', background: '#0F3D56', color: '#fff', border: 0, borderRadius: '9px', cursor: 'pointer', fontSize: '10px', fontWeight: 700 }}>
              {showDetails ? 'Ocultar detalles' : 'Ver detalles'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
