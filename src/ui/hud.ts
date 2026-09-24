const LOW_HEALTH_RATIO = 0.3;

/** HUD en HTML sobre el canvas: vida (queso), oleada, dinero y cartel de inicio de oleada. */
export class Hud {
  private health: HTMLElement;
  private healthFill: HTMLElement;
  private healthGhost: HTMLElement;
  private healthText: HTMLElement;
  private waveText: HTMLElement;
  private moneyText: HTMLElement;
  private banner: HTMLElement;
  private last = { health: -1, wave: -1, money: -1 };

  constructor(private root: HTMLElement) {
    const get = (selector: string) => root.querySelector(selector) as HTMLElement;
    this.health = get(".health");
    this.healthFill = get(".cheese-fill");
    this.healthGhost = get(".cheese-ghost");
    this.healthText = get(".health-text");
    this.waveText = get(".wave");
    this.moneyText = get(".money");
    this.banner = get(".banner");

    // Las animaciones de "una sola vez" se quitan solas al terminar, para poder repetirlas.
    for (const el of [root, this.moneyText]) {
      el.addEventListener("animationend", (e) => {
        if (e.target === el) el.classList.remove("hurt", "bump");
      });
    }
  }

  /** Se llama cada frame; solo toca el DOM cuando algo cambió. */
  update(health: number, maxHealth: number, wave: number, money: number): void {
    const hp = Math.max(0, Math.ceil(health));
    if (hp !== this.last.health) {
      const width = `${(hp / maxHealth) * 100}%`;
      this.healthFill.style.width = width;
      this.healthGhost.style.width = width; // el CSS le da retraso: queda el rastro rosa
      this.healthText.textContent = String(hp);
      this.health.classList.toggle("low", hp / maxHealth <= LOW_HEALTH_RATIO);
      this.last.health = hp;
    }
    if (wave !== this.last.wave) {
      this.waveText.textContent = `Oleada ${wave}`;
      this.last.wave = wave;
    }
    if (money !== this.last.money) {
      this.moneyText.textContent = String(money);
      if (money > this.last.money && this.last.money >= 0) this.moneyText.classList.add("bump");
      this.last.money = money;
    }
  }

  /** Sacudida del HUD al recibir daño. Con daño continuo se repite cada vez que termina. */
  hurt(): void {
    this.root.classList.add("hurt");
  }

  showWaveBanner(wave: number): void {
    this.banner.textContent = `Oleada ${wave}`;
    // Reiniciar la animación CSS: sacar la clase, forzar reflow y volver a ponerla.
    this.banner.classList.remove("show");
    void this.banner.offsetWidth;
    this.banner.classList.add("show");
  }
}
