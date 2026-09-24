// Opciones del jugador, guardadas en localStorage. Si el navegador no deja leer/escribir
// (modo privado, storage bloqueado), se usan los valores por defecto sin romper nada.

const STORAGE_KEY = "ratdance.settings.v1";

export interface Settings {
  sensitivity: number; // multiplicador de la sensibilidad base del mouse
}

const DEFAULTS: Settings = { sensitivity: 1 };
const SENSITIVITY_MIN = 0.2;
const SENSITIVITY_MAX = 3;
const SENSITIVITY_STEP = 0.1;

export function loadSettings(): Settings {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Partial<Settings>;
    const sensitivity = Number(saved.sensitivity);
    return {
      sensitivity: Number.isFinite(sensitivity)
        ? Math.min(SENSITIVITY_MAX, Math.max(SENSITIVITY_MIN, sensitivity))
        : DEFAULTS.sensitivity,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Sin storage: la opción vale solo para esta sesión.
  }
}

/** Panel de opciones (visible en inicio y pausa). Avisa cada cambio y lo guarda. */
export class SettingsPanel {
  constructor(root: HTMLElement, settings: Settings, onChange: (settings: Settings) => void) {
    root.innerHTML = `
      <h2>Opciones</h2>
      <label class="setting">
        <span>Sensibilidad del mouse</span>
        <input type="range" min="${SENSITIVITY_MIN}" max="${SENSITIVITY_MAX}" step="${SENSITIVITY_STEP}">
        <output></output>
      </label>`;
    const slider = root.querySelector("input") as HTMLInputElement;
    const value = root.querySelector("output") as HTMLOutputElement;

    const show = () => (value.textContent = `${settings.sensitivity.toFixed(1)}x`);
    slider.value = String(settings.sensitivity);
    show();

    slider.addEventListener("input", () => {
      settings.sensitivity = Number(slider.value);
      show();
      onChange(settings);
      saveSettings(settings);
    });
  }
}
