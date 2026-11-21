import { useState } from 'react';
import './App.css';

type Mode = 'agil' | 'equilibrado' | 'profundo';
type View = 'home' | 'informe' | 'reportar' | 'historial';

function ArrowRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden="true"
    >
      <path
        d="M13.2 5.4a1.4 1.4 0 0 1 2 0l5.2 5.2a1.4 1.4 0 0 1 0 2l-5.2 5.2a1.4 1.4 0 1 1-2-2l2.8-2.8H5.5a1.5 1.5 0 0 1 0-3H16l-2.8-2.8a1.4 1.4 0 0 1 0-2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ArrowLeft() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      style={{ transform: 'rotate(180deg)' }}
    >
      <path
        d="M13.2 5.4a1.4 1.4 0 0 1 2 0l5.2 5.2a1.4 1.4 0 0 1 0 2l-5.2 5.2a1.4 1.4 0 1 1-2-2l2.8-2.8H5.5a1.5 1.5 0 0 1 0-3H16l-2.8-2.8a1.4 1.4 0 0 1 0-2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function App() {
  const [mode, setMode] = useState<Mode>('equilibrado');
  const [view, setView] = useState<View>('home');

  const [reportSent, setReportSent] = useState(false);
  const [details, setDetails] = useState('');
  const [selectedImage, setSelectedImage] = useState('');

  const modeData = {
    agil: {
      title: 'Ágil',
      description:
        'Consulta la reputación del sitio y busca amenazas críticas.',
      detail: 'Análisis rápido',
    },

    equilibrado: {
      title: 'Equilibrado',
      description:
        'Combina reputación web y análisis estructural para equilibrar profundidad y rapidez.',
      detail: 'Recomendado',
    },

    profundo: {
      title: 'Profundo',
      description:
        'Revisa contenido, privacidad y posibles tácticas de engaño antes de continuar.',
      detail: 'Análisis completo',
    },
  };

  const Header = () => (
    <header className="header">
      <div className="brand-icon">Y</div>

      <div className="brand">
        <h1>Yeray</h1>
        <p>Protección inteligente</p>
      </div>
    </header>
  );

  if (view === 'informe') {
    return (
      <div className="yeray-app">
        <Header />

        <main className="content report-view">
          <button
            className="back-button"
            onClick={() => setView('home')}
          >
            <ArrowLeft />
            Volver
          </button>

          <div className="report-heading">
            <span className="overline">ANÁLISIS DEL SITIO</span>
            <h2>Informe de seguridad</h2>
          </div>

          <section className="score-card">
            <div className="score-top">
              <div>
                <span className="domain-label">ejemplo.com</span>

                <div className="danger-label">
                  <span className="danger-dot"></span>
                  Posible fraude
                </div>
              </div>

              <div className="score">
                <strong>91</strong>
                <span>/100</span>
              </div>
            </div>

            <div className="score-divider"></div>

            <p>
              Se han detectado señales importantes de riesgo.
              Revisa los resultados antes de continuar.
            </p>
          </section>

          <div className="section-heading">
            <h3>Comprobaciones</h3>
            <span>5 resultados</span>
          </div>

          <div className="checks">
            <div className="check-item">
              <div className="check-icon danger-check">!</div>

              <div className="check-copy">
                <strong>Reputación de URL</strong>
                <span>Varias señales de riesgo</span>
              </div>

              <span className="check-arrow">›</span>
            </div>

            <div className="check-item">
              <div className="check-icon">AI</div>

              <div className="check-copy">
                <strong>Análisis de contenido e IA</strong>
                <span>Presión y condiciones poco claras</span>
              </div>

              <span className="check-arrow">›</span>
            </div>

            <div className="check-item">
              <div className="check-icon">◎</div>

              <div className="check-copy">
                <strong>Reportes comunitarios</strong>
                <span>Reportes pendientes de revisión</span>
              </div>

              <span className="check-arrow">›</span>
            </div>

            <div className="check-item">
              <div className="check-icon">◈</div>

              <div className="check-copy">
                <strong>Cookies y privacidad</strong>
                <span>Revisar opciones de seguimiento</span>
              </div>

              <span className="check-arrow">›</span>
            </div>

            <div className="check-item">
              <div className="check-icon">?</div>

              <div className="check-copy">
                <strong>Elementos sospechosos</strong>
                <span>Se han detectado 3 elementos</span>
              </div>

              <span className="check-arrow">›</span>
            </div>
          </div>

          <section className="explanation">
            <span className="explanation-title">
              ¿Por qué este resultado?
            </span>

            <p>
              Se han observado señales de presión para comprar
              y elementos que conviene revisar antes de compartir
              información personal o realizar un pago.
            </p>
          </section>
        </main>
      </div>
    );
  }

  if (view === 'reportar') {
    return (
      <div className="yeray-app">
        <Header />

        <main className="content">
          <button
            className="back-button"
            onClick={() => {
              setView('home');
              setReportSent(false);
            }}
          >
            <ArrowLeft />
            Volver
          </button>

          <div className="report-heading">
            <span className="overline">REPORTE COMUNITARIO</span>
            <h2>Reportar página</h2>
          </div>

          <section className="report-site">
            <span>Página que estás reportando</span>
            <strong>ejemplo.com</strong>
          </section>

          {!reportSent ? (
            <>
              <h3 className="form-title">
                ¿Qué te ha parecido sospechoso?
              </h3>

              <div className="tag-options">
                <label>
                  <input type="checkbox" />
                  <span>Suplantación</span>
                </label>

                <label>
                  <input type="checkbox" />
                  <span>Precio engañoso</span>
                </label>

                <label>
                  <input type="checkbox" />
                  <span>Privacidad o cookies</span>
                </label>

                <label>
                  <input type="checkbox" />
                  <span>Presión para comprar</span>
                </label>

                <label>
                  <input type="checkbox" />
                  <span>Pago sospechoso</span>
                </label>

                <label>
                  <input type="checkbox" />
                  <span>Web o dominio falso</span>
                </label>

                <label>
                  <input type="checkbox" />
                  <span>Descarga sospechosa</span>
                </label>

                <label>
                  <input type="checkbox" />
                  <span>Otro</span>
                </label>
              </div>

              <label className="details-label">
                Detalles <span>(opcional)</span>
              </label>

              <textarea
                value={details}
                onChange={(event) =>
                  setDetails(event.target.value)
                }
                placeholder="Describe brevemente qué has visto..."
              />

              <div className="attachment-section">
                <div className="attachment-heading">
                  <strong>
                    Adjuntar evidencia <span>(opcional)</span>
                  </strong>
                </div>

                <label className="attachment-button">
                  <span className="attachment-icon">＋</span>

                  <div>
                    <strong>Añadir captura o imagen</strong>
                    <span>PNG, JPG o similar</span>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];

                      if (file) {
                        setSelectedImage(file.name);
                      }
                    }}
                  />
                </label>

                {selectedImage && (
                  <div className="selected-file">
                    <span>✓</span>

                    <div>
                      <strong>Imagen seleccionada</strong>
                      <small>{selectedImage}</small>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedImage('')}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <p className="privacy-note">
                No incluyas contraseñas, datos bancarios
                ni información personal.
              </p>

              <button
                className="report-button"
                onClick={() => setReportSent(true)}
              >
                <span>Enviar reporte</span>
                <ArrowRight />
              </button>
            </>
          ) : (
            <section className="success-card">
              <div className="success-icon">✓</div>

              <strong>Reporte enviado</strong>

              <p>
                Gracias. Tu reporte se tendrá en cuenta para
                mejorar la información disponible sobre esta página.
              </p>

              <button
                className="secondary-action"
                onClick={() => {
                  setView('home');
                  setReportSent(false);
                  setDetails('');
                  setSelectedImage('');
                }}
              >
                Volver al inicio
              </button>
            </section>
          )}
        </main>
      </div>
    );
  }

  if (view === 'historial') {
    return (
      <div className="yeray-app">
        <Header />

        <main className="content">
          <button
            className="back-button"
            onClick={() => setView('home')}
          >
            <ArrowLeft />
            Volver
          </button>

          <div className="report-heading">
            <span className="overline">ACTIVIDAD RECIENTE</span>
            <h2>Historial</h2>
          </div>

          <p className="history-description">
            Páginas analizadas recientemente por Yeray.
          </p>

          <div className="history-list">
            <div className="history-item">
              <div className="history-status danger-history">
                !
              </div>

              <div className="history-copy">
                <strong>ejemplo.com</strong>
                <span>Riesgo elevado · Hoy, 10:42</span>
              </div>

              <button onClick={() => setView('informe')}>
                Ver
              </button>
            </div>

            <div className="history-item">
              <div className="history-status safe-history">
                ✓
              </div>

              <div className="history-copy">
                <strong>tienda-segura.com</strong>
                <span>Sin amenazas · Ayer</span>
              </div>

              <button>Ver</button>
            </div>

            <div className="history-item">
              <div className="history-status safe-history">
                ✓
              </div>

              <div className="history-copy">
                <strong>universidad.es</strong>
                <span>Sin amenazas · 19 nov.</span>
              </div>

              <button>Ver</button>
            </div>
          </div>

          <p className="privacy-note history-note">
            El historial mostrado es una demostración y todavía
            no está conectado al backend.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="yeray-app">
      <Header />

      <main className="content">
        <section className="site-card">
          <div className="site-icon">◉</div>

          <div className="site-copy">
            <span>Página actual</span>
            <strong>ejemplo.com</strong>
          </div>

          <span className="active-badge">Activo</span>
        </section>

        <section className="risk-alert">
          <div className="risk-alert-icon">!</div>

          <div>
            <strong>Peligro: posible fraude</strong>

            <p>
              Hemos detectado señales de riesgo.
              Evita introducir datos personales o de pago.
            </p>
          </div>
        </section>

        <div className="section-heading protection-heading">
          <div>
            <h3>Nivel de protección</h3>

            <span>
              Elige cómo quieres analizar las páginas
            </span>
          </div>
        </div>

        <div className="modes">
          {(Object.keys(modeData) as Mode[]).map((item) => (
            <button
              key={item}
              className={mode === item ? 'selected' : ''}
              onClick={() => setMode(item)}
            >
              <strong>{modeData[item].title}</strong>
              <span>{modeData[item].detail}</span>
            </button>
          ))}
        </div>

        <section className="mode-description">
          <div className="mode-description-top">
            <strong>{modeData[mode].title}</strong>

            {mode === 'equilibrado' && (
              <span className="recommended">
                Recomendado
              </span>
            )}
          </div>

          <p>{modeData[mode].description}</p>
        </section>

        <button
          className="report-button"
          onClick={() => setView('informe')}
        >
          <span>Ver informe de seguridad</span>
          <ArrowRight />
        </button>

        <div className="secondary-buttons">
          <button onClick={() => setView('reportar')}>
            <span className="secondary-icon">!</span>
            Reportar
          </button>

          <button onClick={() => setView('historial')}>
            <span className="secondary-icon">↺</span>
            Historial
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;