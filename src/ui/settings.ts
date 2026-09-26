// Opciones del jugador, guardadas en localStorage. Si el navegador no deja leer/escribir
// (modo privado, storage bloqueado), se usan los valores por defecto sin romper nada.

const STORAGE_KEY = "ratdance.settings.v1";

export interface Settings {
  sensitivity: number; // multiplicador de la sensibilidad base del mouse
  volume: number; // 0 a 1
}

interface SliderDef {
  key: keyof Settings;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  format: (value: number) => string;
}

const SLIDERS: SliderDef[] = [
  {
    key: "sensitivity",
    label: "Sensibilidad del mouse",
    min: 0.2,
    max: 3,
    step: 0.1,
    default: 1,
    format: (v) => `${v.toFixed(1)}x`,
  },
  { key: "volume", label: "Volumen", min: 0, max: 1, step: 0.05, default: 0.7, format: (v) => `${Math.round(v * 100)}%` },
];

export function loadSettings(): Settings {
  let saved: Partial<Record<keyof Settings, unknown>> = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    // Sin storage o JSON roto: valores por defecto.
  }
  const settings = {} as Settings;
  for (const s of SLIDERS) {
    const value = Number(saved[s.key]);
    settings[s.key] = Number.isFinite(value) ? Math.min(s.max, Math.max(s.min, value)) : s.default;
  }
  return settings;
}

function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Sin storage: las opciones valen solo para esta sesión.
  }
}

/** Panel de opciones (se abre desde el menú y la pausa). Avisa cada cambio y lo guarda. */
export class SettingsPanel {
  constructor(root: HTMLElement, settings: Settings, onChange: (settings: Settings) => void) {
    root.innerHTML = `<h2>Opciones</h2>`;
    for (const s of SLIDERS) {
      const row = document.createElement("label");
      row.className = "setting";
      row.innerHTML = `<span>${s.label}</span><input type="range" min="${s.min}" max="${s.max}" step="${s.step}"><output></output>`;
      const slider = row.querySelector("input") as HTMLInputElement;
      const output = row.querySelector("output") as HTMLOutputElement;

      slider.value = String(settings[s.key]);
      output.textContent = s.format(settings[s.key]);
      slider.addEventListener("input", () => {
        settings[s.key] = Number(slider.value);
        output.textContent = s.format(settings[s.key]);
        onChange(settings);
        saveSettings(settings);
      });
      root.append(row);
    }
  }
}
