import { useState } from 'react';

function App() {
  const [visible, setVisible] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  if (!visible) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '22px',
        right: '22px',
        width: '320px',
        background: '#FFFFFF',
        color: '#16343A',
        border: '1px solid #C7DCE3',
        borderRadius: '15px',
        boxShadow:
          '0 12px 35px rgba(15, 61, 86, 0.18), 0 3px 10px rgba(15, 61, 86, 0.10)',
        overflow: 'hidden',
        fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
        zIndex: 2147483647,
      }}
    >
      {/* CABECERA */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 11px',
          background: '#FFFFFF',
          borderBottom: '1px solid #E6F2F6',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background: '#176B85',
              color: '#FFFFFF',
              borderRadius: '9px',
              fontSize: '13px',
              fontWeight: 800,
            }}
          >
            Y
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <strong
              style={{
                color: '#0F3D56',
                fontSize: '12px',
                fontWeight: 800,
                lineHeight: 1.2,
              }}
            >
              Yeray
            </strong>

            <span
              style={{
                marginTop: '2px',
                color: '#55727A',
                fontSize: '8.5px',
              }}
            >
              Protección inteligente
            </span>
          </div>
        </div>

        <button
          onClick={() => setVisible(false)}
          aria-label="Cerrar aviso"
          style={{
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            background: 'transparent',
            color: '#55727A',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '22px',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      {/* ALERTA */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          margin: '11px',
          padding: '12px',
          background: '#FCE8E8',
          borderLeft: '4px solid #BE2929',
          borderRadius: '11px',
        }}
      >
        <div
          style={{
            width: '29px',
            height: '29px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            background: 'rgba(190, 41, 41, 0.10)',
            color: '#BE2929',
            borderRadius: '9px',
            fontSize: '15px',
            fontWeight: 800,
          }}
        >
          !
        </div>

        <div
          style={{
            flex: 1,
          }}
        >
          <strong
            style={{
              display: 'block',
              color: '#BE2929',
              fontSize: '12px',
              fontWeight: 800,
              lineHeight: 1.35,
            }}
          >
            Esta página podría ser fraudulenta
          </strong>

          <p
            style={{
              margin: '6px 0 0',
              color: '#16343A',
              fontSize: '10.5px',
              lineHeight: 1.5,
            }}
          >
            Hemos detectado señales de riesgo. Evita introducir datos
            personales o de pago.
          </p>
        </div>
      </div>

      {/* DETALLES */}
      {showDetails && (
        <div
          style={{
            margin: '0 11px 11px',
            padding: '10px 11px',
            background: '#E6F2F6',
            borderRadius: '10px',
          }}
        >
          <strong
            style={{
              display: 'block',
              color: '#176B85',
              fontSize: '10.5px',
              fontWeight: 800,
            }}
          >
            ¿Por qué aparece este aviso?
          </strong>

          <p
            style={{
              margin: '5px 0 0',
              color: '#16343A',
              fontSize: '9.5px',
              lineHeight: 1.45,
            }}
          >
            Yeray ha detectado elementos que podrían indicar una página
            engañosa. Revisa la información antes de continuar.
          </p>
        </div>
      )}

      {/* BOTÓN */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '0 11px 11px',
        }}
      >
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            padding: '8px 12px',
            background: '#0F3D56',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '9px',
            cursor: 'pointer',
            fontSize: '10px',
            fontWeight: 700,
          }}
        >
          {showDetails ? 'Ocultar detalles' : 'Ver detalles'}
        </button>
      </div>
    </div>
  );
}

export default App;