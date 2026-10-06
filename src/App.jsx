import { useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'super-dzialania-settings-v1';
const PIN = '0987';
const OP_ORDER = ['addition', 'subtraction', 'multiplication', 'division'];

const OP_LABELS = {
  addition: { name: 'Dodawanie', sign: '+', emoji: '🍎' },
  subtraction: { name: 'Odejmowanie', sign: '−', emoji: '🚀' },
  multiplication: { name: 'Mnożenie', sign: '×', emoji: '⭐' },
  division: { name: 'Dzielenie', sign: '÷', emoji: '🍪' },
};

const NUMBER_RANGES = {
  '0-9': { label: '0–9', min: 0, max: 9 },
  '10-99': { label: '10–99', min: 10, max: 99 },
  '100-999': { label: '100–999', min: 100, max: 999 },
};

const DEFAULT_SETTINGS = {
  selectedOperations: [...OP_ORDER],
  numberRanges: {
    addition: '0-9',
    subtraction: '0-9',
  },
  digits: {
    addition: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    subtraction: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    multiplication: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    division: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  starTimes: {
    five: 20,
    four: 35,
    three: 55,
    two: 80,
  },
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      selectedOperations: Array.isArray(parsed.selectedOperations) && parsed.selectedOperations.length
        ? parsed.selectedOperations.filter((operation) => OP_ORDER.includes(operation))
        : [...DEFAULT_SETTINGS.selectedOperations],
      numberRanges: { ...DEFAULT_SETTINGS.numberRanges, ...(parsed.numberRanges ?? {}) },
      digits: { ...DEFAULT_SETTINGS.digits, ...(parsed.digits ?? {}) },
      starTimes: { ...DEFAULT_SETTINGS.starTimes, ...(parsed.starTimes ?? {}) },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function formatTime(seconds) {
  const whole = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(whole / 60);
  const secs = whole % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getStars(seconds, starTimes) {
  if (seconds <= starTimes.five) return 5;
  if (seconds <= starTimes.four) return 4;
  if (seconds <= starTimes.three) return 3;
  if (seconds <= starTimes.two) return 2;
  return 1;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomQuestion(operation, settings) {
  if (operation === 'addition' || operation === 'subtraction') {
    const rangeKey = settings.numberRanges?.[operation] ?? '0-9';
    const range = NUMBER_RANGES[rangeKey] ?? NUMBER_RANGES['0-9'];
    let a = randomInt(range.min, range.max);
    let b = randomInt(range.min, range.max);
    if (operation === 'subtraction' && b > a) [a, b] = [b, a];
    return { a, b, op: operation === 'addition' ? '+' : '−', answer: operation === 'addition' ? a + b : a - b };
  }

  const digits = settings.digits;
  const allowed = digits[operation].filter((d) => Number.isInteger(d));
  if (allowed.length === 0) return null;

  if (operation === 'multiplication') {
    const a = randomItem(allowed);
    const b = randomItem(allowed);
    return { a, b, op: '×', answer: a * b };
  }

  const validPairs = [];
  for (const a of allowed) {
    for (const b of allowed) {
      if (b !== 0 && a % b === 0) validPairs.push([a, b]);
    }
  }
  const [a, b] = randomItem(validPairs.length ? validPairs : [[0, 1]]);
  return { a, b, op: '÷', answer: a / b };
}

function hasEnoughForOperation(operation, settings) {
  if (operation === 'addition' || operation === 'subtraction') return Boolean(NUMBER_RANGES[settings.numberRanges?.[operation] ?? '0-9']);
  const digits = settings.digits;
  const allowed = digits[operation] ?? [];
  if (allowed.length === 0) return false;
  if (operation === 'division') {
    return allowed.some((a) => allowed.some((b) => b !== 0 && a % b === 0));
  }
  return true;
}

function createRound(settings) {
  const enabled = (settings.selectedOperations ?? OP_ORDER).filter((operation) => OP_ORDER.includes(operation));
  const operations = shuffle(enabled.filter((operation) => hasEnoughForOperation(operation, settings)));
  const pickedOperations = operations.length ? operations : ['addition'];
  const questions = [];
  for (let i = 0; i < 5; i += 1) {
    const operation = pickedOperations[i % pickedOperations.length];
    const question = getRandomQuestion(operation, settings);
    questions.push(question ?? { a: 1, b: 1, op: '+', answer: 2, operation: 'addition' });
  }
  return questions.map((question, index) => ({
    ...question,
    operation: question.operation ?? pickedOperations[index % pickedOperations.length],
    id: `${Date.now()}-${index}-${Math.random()}`,
  }));
}

function speak(text) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pl-PL';
    utterance.rate = 1.05;
    utterance.pitch = 1.15;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch {
    // Speech is an optional enhancement.
  }
}

function UnicornRun({ celebrate = false }) {
  return (
    <div className={`unicorn-run ${celebrate ? 'is-celebration' : ''}`} aria-hidden="true">
      <span className="unicorn unicorn-one">🦄</span>
      <span className="unicorn unicorn-two">🦄</span>
      <span className="spark spark-one">✦</span>
      <span className="spark spark-two">✦</span>
      <span className="spark spark-three">✦</span>
    </div>
  );
}

function OperationToggle({ operation, active, disabled, onClick }) {
  const meta = OP_LABELS[operation];
  return (
    <button
      type="button"
      className={`operation-toggle ${active ? 'is-active' : ''}`}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="operation-toggle-icon">{meta.emoji}</span>
      <span className="operation-toggle-copy">
        <strong>{meta.name}</strong>
        <small>{active ? 'Włączone' : 'Wyłączone'}</small>
      </span>
      <span className="operation-toggle-check">{active ? '✓' : ''}</span>
    </button>
  );
}

function DigitButton({ digit, active, disabled, onClick }) {
  return (
    <button
      type="button"
      className={`digit-toggle ${active ? 'is-active' : ''}`}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
    >
      {digit}
    </button>
  );
}

function SettingsModal({ settings, onSave, onClose }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(settings)));

  const updateNumberRange = (operation, rangeKey) => {
    setDraft((current) => ({
      ...current,
      numberRanges: { ...current.numberRanges, [operation]: rangeKey },
    }));
  };

  const updateOperation = (operation) => {
    setDraft((current) => {
      const selected = current.selectedOperations ?? OP_ORDER;
      const next = selected.includes(operation)
        ? selected.filter((item) => item !== operation)
        : [...selected, operation];
      return { ...current, selectedOperations: next };
    });
  };

  const updateDigits = (operation, digit) => {
    setDraft((current) => {
      const list = current.digits[operation];
      const next = list.includes(digit) ? list.filter((item) => item !== digit) : [...list, digit].sort((a, b) => a - b);
      return { ...current, digits: { ...current.digits, [operation]: next } };
    });
  };

  const tryUnlock = () => {
    if (pin === PIN) {
      setUnlocked(true);
      setPinError('');
    } else {
      setPinError('Nieprawidłowy PIN. Ustawienia pozostały zablokowane.');
      setPin('');
    }
  };

  const save = () => {
    if (!unlocked) return;
    onSave(draft);
    onClose();
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className="modal-header">
          <div>
            <span className="eyebrow">KOŁO ZĘBATE</span>
            <h2 id="settings-title">Ustawienia gry ⚙️</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Zamknij ustawienia">×</button>
        </div>

        {!unlocked && (
          <div className="lock-card">
            <div className="lock-icon">🔒</div>
            <div>
              <strong>Ustawienia są zablokowane</strong>
              <p>Podaj PIN, aby zmienić poziomy trudności i progi gwiazdek.</p>
            </div>
          </div>
        )}

        <div className="pin-row">
          <input
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={pin}
            onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
            onKeyDown={(event) => event.key === 'Enter' && tryUnlock()}
            placeholder="PIN"
            aria-label="PIN"
            className="pin-input"
            disabled={unlocked}
          />
          <button type="button" className="secondary-button" onClick={tryUnlock} disabled={unlocked || pin.length !== 4}>
            {unlocked ? 'Odblokowane ✓' : 'Odblokuj'}
          </button>
        </div>
        {pinError && <div className="form-error" role="alert">{pinError}</div>}

        <div className={`settings-content ${unlocked ? '' : 'is-locked'}`} aria-disabled={!unlocked}>
          <div className="settings-section">
            <div className="section-title-row">
              <div>
                <span className="eyebrow">DZIAŁANIA</span>
                <h3>Co ćwiczymy w tej grze?</h3>
              </div>
              <span className="tiny-note">Możesz wybrać jedno, dwa lub wszystkie.</span>
            </div>
            <div className="operation-choice-grid">
              {OP_ORDER.map((operation) => (
                <OperationToggle
                  key={operation}
                  operation={operation}
                  active={(draft.selectedOperations ?? OP_ORDER).includes(operation)}
                  disabled={!unlocked}
                  onClick={() => updateOperation(operation)}
                />
              ))}
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title-row">
              <div>
                <span className="eyebrow">POZIOMY TRUDNOŚCI</span>
                <h3>Jak duże liczby mają pojawiać się w dodawaniu i odejmowaniu?</h3>
              </div>
              <span className="tiny-note">Większy zakres = trudniejsze zadania.</span>
            </div>

            <div className="range-settings-grid">
              {['addition', 'subtraction'].map((operation) => {
                const enabled = (draft.selectedOperations ?? OP_ORDER).includes(operation);
                return (
                  <div className={`operation-card range-card ${enabled ? '' : 'is-disabled'}`} key={operation}>
                    <div className="operation-card-title">
                      <span className="operation-emoji">{OP_LABELS[operation].emoji}</span>
                      <strong>{OP_LABELS[operation].name}</strong>
                      {!enabled && <span className="operation-disabled-label">wyłączone</span>}
                    </div>
                    <div className="range-choice-grid">
                      {Object.entries(NUMBER_RANGES).map(([key, range]) => (
                        <label className={`range-choice ${(draft.numberRanges?.[operation] ?? '0-9') === key ? 'is-active' : ''}`} key={key}>
                          <input
                            type="radio"
                            name={`range-${operation}`}
                            value={key}
                            checked={(draft.numberRanges?.[operation] ?? '0-9') === key}
                            disabled={!unlocked || !enabled}
                            onChange={() => updateNumberRange(operation, key)}
                          />
                          <span>{range.label}</span>
                        </label>
                      ))}
                    </div>
                    <div className="operation-hint">Obie liczby w zadaniu losują się z wybranego zakresu.</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title-row">
              <div>
                <span className="eyebrow">TABLICZKA</span>
                <h3>Jakie cyfry mogą pojawiać się w mnożeniu i dzieleniu?</h3>
              </div>
              <span className="tiny-note">Tutaj nadal wybierasz konkretne cyfry.</span>
            </div>

            <div className="operation-settings-grid">
              {['multiplication', 'division'].map((operation) => {
                const enabled = (draft.selectedOperations ?? OP_ORDER).includes(operation);
                return (
                  <div className={`operation-card ${enabled ? '' : 'is-disabled'}`} key={operation}>
                    <div className="operation-card-title">
                      <span className="operation-emoji">{OP_LABELS[operation].emoji}</span>
                      <strong>{OP_LABELS[operation].name}</strong>
                      {!enabled && <span className="operation-disabled-label">wyłączone</span>}
                    </div>
                    <div className="digit-grid">
                      {Array.from({ length: 10 }, (_, digit) => (
                        <DigitButton
                          key={digit}
                          digit={digit}
                          active={draft.digits[operation].includes(digit)}
                          disabled={!unlocked || !enabled}
                          onClick={() => updateDigits(operation, digit)}
                        />
                      ))}
                    </div>
                    {operation === 'division' && <div className="operation-hint">0 nie może być dzielnikiem. Gra wybiera tylko przykłady z całkowitym wynikiem.</div>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title-row">
              <div>
                <span className="eyebrow">GWIAZDKI</span>
                <h3>Progi czasowe</h3>
              </div>
              <span className="tiny-note">1★ jest zawsze gwarantowane.</span>
            </div>
            <div className="star-times-grid">
              {[['five', '5', 'do'], ['four', '4', 'do'], ['three', '3', 'do'], ['two', '2', 'do']].map(([key, star, prefix]) => (
                <label className="star-time-card" key={key}>
                  <span className="star-label">{star}★</span>
                  <span className="star-prefix">{prefix}</span>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={draft.starTimes[key]}
                    disabled={!unlocked}
                    onChange={(event) => setDraft((current) => ({
                      ...current,
                      starTimes: { ...current.starTimes, [key]: Math.max(1, Number(event.target.value)) },
                    }))}
                  />
                  <span className="star-unit">sek.</span>
                </label>
              ))}
            </div>
            <p className="settings-note">Progi muszą rosnąć: czas na 5★ &lt; 4★ &lt; 3★ &lt; 2★. Wynik powyżej progu 2★ daje 1★.</p>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="ghost-button" onClick={onClose}>Anuluj</button>
          <button
            type="button"
            className="primary-button"
            disabled={!unlocked}
            onClick={() => {
              const sortedTimes = { ...draft.starTimes };
              const valid = sortedTimes.five < sortedTimes.four && sortedTimes.four < sortedTimes.three && sortedTimes.three < sortedTimes.two;
              if (!valid) {
                setPinError('Progi muszą rosnąć: 5★ < 4★ < 3★ < 2★.');
                return;
              }
              const cleanDigits = { ...draft.digits };
              const selected = draft.selectedOperations ?? OP_ORDER;
              if (selected.length === 0) {
                setPinError('Wybierz przynajmniej jedno działanie.');
                return;
              }
              const invalid = selected.some((op) => (op === 'addition' || op === 'subtraction') ? !NUMBER_RANGES[draft.numberRanges?.[op]] : (cleanDigits[op].length === 0 || !hasEnoughForOperation(op, { ...draft, digits: cleanDigits })));
              if (invalid) {
                setPinError('Sprawdź ustawienia wybranych działań. Dla dzielenia musi istnieć przynajmniej jeden poprawny przykład.');
                return;
              }
              save();
            }}
          >
            Zapisz ustawienia
          </button>
        </div>
      </section>
    </div>
  );
}

function Keypad({ onDigit, onBackspace, onClear, onSubmit, disabled }) {
  const keys = [7, 8, 9, 4, 5, 6, 1, 2, 3];
  return (
    <div className="keypad" aria-label="Klawiatura cyfr">
      {keys.map((digit) => (
        <button key={digit} type="button" className="keypad-key" disabled={disabled} onClick={() => onDigit(String(digit))}>{digit}</button>
      ))}
      <button type="button" className="keypad-key utility" disabled={disabled} onClick={onClear}>C</button>
      <button type="button" className="keypad-key" disabled={disabled} onClick={() => onDigit('0')}>0</button>
      <button type="button" className="keypad-key utility" disabled={disabled} onClick={onBackspace}>⌫</button>
      <button type="button" className="submit-button" disabled={disabled} onClick={onSubmit}>SPRAWDŹ ✓</button>
    </div>
  );
}

function RoundResult({ elapsed, stars, mistakes, onAgain, onSettings }) {
  const message = stars === 5 ? 'Super szybko!' : stars >= 3 ? 'Świetna robota!' : 'Brawo — każda runda to krok do przodu!';
  return (
    <section className="result-card pop-in">
      <div className="result-confetti" aria-hidden="true">🎉 ✨ 🎈 ⭐</div>
      <span className="eyebrow">RUNDA ZAKOŃCZONA</span>
      <h2>{message}</h2>
      <div className="result-stars" aria-label={`${stars} gwiazdek`}>{'★'.repeat(stars)}<span>{'★'.repeat(5 - stars)}</span></div>
      <div className="result-stats">
        <div><span>CZAS</span><strong>{formatTime(elapsed)}</strong></div>
        <div><span>POMYŁKI</span><strong>{mistakes}</strong></div>
      </div>
      <div className="result-actions">
        <button type="button" className="primary-button big" onClick={onAgain}>Zagraj jeszcze raz 🚀</button>
        <button type="button" className="secondary-button big" onClick={onSettings}>⚙️ Ustawienia</button>
      </div>
    </section>
  );
}

export default function App() {
  const [settings, setSettings] = useState(loadSettings);
  const [screen, setScreen] = useState('game');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState(() => createRound(loadSettings()));
  const [answer, setAnswer] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [wrongPulse, setWrongPulse] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const startedAtRef = useRef(Date.now());

  const question = questions[questionIndex];
  const currentOperation = OP_LABELS[question?.operation ?? 'addition'];

  useEffect(() => {
    if (screen !== 'game') return undefined;
    const id = window.setInterval(() => setElapsed((Date.now() - startedAtRef.current) / 1000), 200);
    return () => window.clearInterval(id);
  }, [screen]);

  useEffect(() => {
    const handleKey = (event) => {
      if (settingsOpen || screen !== 'game') return;
      if (/^\d$/.test(event.key)) {
        setAnswer((value) => `${value}${event.key}`.slice(0, 4));
      } else if (event.key === 'Backspace') {
        setAnswer((value) => value.slice(0, -1));
      } else if (event.key === 'Escape') {
        setAnswer('');
      } else if (event.key === 'Enter') {
        event.preventDefault();
        submitAnswer();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [screen, settingsOpen, questionIndex, answer, questions]);

  const liveTime = useMemo(() => formatTime(elapsed), [elapsed]);

  const startRound = () => {
    setQuestions(createRound(settings));
    setQuestionIndex(0);
    setAnswer('');
    setMistakes(0);
    setFeedback('');
    setWrongPulse(false);
    setCelebrate(false);
    setElapsed(0);
    startedAtRef.current = Date.now();
    setScreen('game');
  };

  const handleSaveSettings = (nextSettings) => {
    const normalized = {
      ...nextSettings,
      selectedOperations: [...(nextSettings.selectedOperations ?? OP_ORDER)].filter((op) => OP_ORDER.includes(op)),
      numberRanges: {
        addition: NUMBER_RANGES[nextSettings.numberRanges?.addition] ? nextSettings.numberRanges.addition : '0-9',
        subtraction: NUMBER_RANGES[nextSettings.numberRanges?.subtraction] ? nextSettings.numberRanges.subtraction : '0-9',
      },
      digits: Object.fromEntries(OP_ORDER.map((op) => [op, [...nextSettings.digits[op]].sort((a, b) => a - b)])),
      starTimes: {
        five: Number(nextSettings.starTimes.five),
        four: Number(nextSettings.starTimes.four),
        three: Number(nextSettings.starTimes.three),
        two: Number(nextSettings.starTimes.two),
      },
    };
    setSettings(normalized);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  };

  function submitAnswer() {
    if (!answer || !question) return;
    const numeric = Number(answer);
    if (numeric === question.answer) {
      setFeedback('Dobrze! ⭐');
      setCelebrate(true);
      window.setTimeout(() => setCelebrate(false), 1500);
      speak('Brawo!');
      window.setTimeout(() => {
        if (questionIndex === 4) {
          const finalElapsed = (Date.now() - startedAtRef.current) / 1000;
          setElapsed(finalElapsed);
          setScreen('result');
        } else {
          setQuestionIndex((index) => index + 1);
          setAnswer('');
          setFeedback('');
        }
      }, 250);
    } else {
      setMistakes((value) => value + 1);
      setFeedback('Jeszcze raz! Spróbuj spokojnie 💪');
      setWrongPulse(true);
      window.setTimeout(() => setWrongPulse(false), 360);
      speak('Spróbuj jeszcze raz');
    }
  }

  const openSettings = () => setSettingsOpen(true);
  const stars = screen === 'result' ? getStars(elapsed, settings.starTimes) : 0;

  return (
    <main className="app-shell">
      <div className="background-orb orb-one" />
      <div className="background-orb orb-two" />
      <UnicornRun celebrate={celebrate} />

      <header className="topbar">
        <button type="button" className="brand" onClick={startRound} aria-label="Rozpocznij nową rundę">
          <span className="brand-badge">✦</span>
          <span><strong>Super</strong> Działania</span>
        </button>
        <div className="topbar-right">
          {screen === 'game' && (
            <div className="timer-pill" aria-label={`Czas ${liveTime}`}><span>⏱️</span>{liveTime}</div>
          )}
          <button type="button" className="settings-button" onClick={openSettings} aria-label="Otwórz ustawienia" title="Ustawienia">
            ⚙️
          </button>
        </div>
      </header>

      <div className="content">
        {screen === 'game' && question && (
          <section className="game-layout">
            <div className="game-meta">
              <div>
                <span className="eyebrow">MISJA {questionIndex + 1} / 5</span>
                <div className="progress-track" aria-label={`Postęp ${questionIndex + 1} z 5`}>
                  <div className="progress-fill" style={{ width: `${((questionIndex + 1) / 5) * 100}%` }} />
                </div>
              </div>
              <div className="operation-chip">{currentOperation.emoji} {currentOperation.name}</div>
            </div>

            <div className={`question-card ${wrongPulse ? 'shake' : ''} ${celebrate ? 'correct-glow' : ''}`}>
              <div className="question-mascot" aria-hidden="true">🦊</div>
              <div className="question-label">Ile to jest?</div>
              <div className="equation" aria-live="polite">
                <span>{question.a}</span><span className="equation-sign">{question.op}</span><span>{question.b}</span><span className="equation-sign">=</span>
                <span className="answer-slot">{answer || '?'}</span>
              </div>
              <div className={`feedback ${feedback ? 'visible' : ''}`} aria-live="polite">{feedback || 'Wpisz odpowiedź i zatwierdź.'}</div>
            </div>

            <Keypad
              disabled={false}
              onDigit={(digit) => setAnswer((value) => `${value}${digit}`.slice(0, 4))}
              onBackspace={() => setAnswer((value) => value.slice(0, -1))}
              onClear={() => setAnswer('')}
              onSubmit={submitAnswer}
            />

            <div className="helper-row"><span>⌨️ Możesz też użyć klawiatury komputera.</span><span>Każde zadanie trzeba rozwiązać poprawnie.</span></div>
          </section>
        )}

        {screen === 'result' && <RoundResult elapsed={elapsed} stars={stars} mistakes={mistakes} onAgain={startRound} onSettings={openSettings} />}
      </div>

      <footer className="app-footer">Runda = 5 działań • ustawienia zapisują się na tym urządzeniu</footer>

      {settingsOpen && <SettingsModal settings={settings} onSave={handleSaveSettings} onClose={() => setSettingsOpen(false)} />}
    </main>
  );
}
