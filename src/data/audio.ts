import type { InstrumentCue, MusicCues, SampleCue } from "../systems/AudioSystem";
import musicUrl from "../assets/audio/rat_dance_soundtrack.ogg";
import damageUrl from "../assets/audio/damage.mp3";
import gameOverUrl from "../assets/audio/game_over.mp3";

// Archivos de audio y sus marcas, medidas analizando la forma de onda de cada archivo.

// Música (44,1 kHz):
// - 0–3,3 s es la cuenta de entrada; después la pieza se repite cada 3.950.651 muestras.
//   Cualquier inicio de loop posterior a la intro empalma igual; 4 s deja margen.
// - Entre el 1er y 2do golpe de la intro sobran 0,424 s de silencio (los golpes van cada
//   0,5587 s): se saltea, cortando en cruces por cero para que no haga "clic".
export const MUSIC: { url: string; cues: MusicCues } = {
  url: musicUrl,
  cues: {
    loopStart: 4,
    loopEnd: 4 + 3950651 / 44100,
    skip: [0.91322, 1.33739],
  },
};

// Daño: el archivo dura 4,1 s pero el sonido está entre 0,709 y 1,125 s (antes, silencio).
export const DAMAGE_SOUND: SampleCue = { url: damageUrl, start: 0.705, duration: 0.42 };

// Game over: se usa como instrumento para tocar el "trombón triste". Es un "womp" que arranca
// en ~541 Hz (Do#5 un poco bajo) y cae deslizándose hasta ~218 Hz. Útil entre 0,660 y 0,985 s.
export const GAME_OVER_SOUND: InstrumentCue = { url: gameOverUrl, start: 0.655, duration: 0.33, pitch: 541 };
