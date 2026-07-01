import React from "react";
import { MUSIC_STYLES, setMusicStyle, playPop, MusicStyleId } from "../../utils/audio";
import { FONT_SCALE_OPTIONS, type FontScaleOption } from "../../hooks/useDisplayPreferences";
import { Modal } from "../ui/Modal";

interface MusicSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isNight: boolean;
  musicStyleState: MusicStyleId;
  setMusicStyleState: (style: MusicStyleId) => void;
  isLowMemory: boolean;
  setIsLowMemory: (val: boolean) => void;
  fontScale: FontScaleOption;
  setFontScale: (value: FontScaleOption) => void;
}

export const MusicSettingsModal: React.FC<MusicSettingsModalProps> = React.memo(
  ({
    isOpen,
    onClose,
    isNight,
    musicStyleState,
    setMusicStyleState,
    isLowMemory,
    setIsLowMemory,
    fontScale,
    setFontScale,
  }) => {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        panelClassName={`flex flex-col max-w-md w-full max-h-[85vh] shadow-2xl rounded-3xl overflow-hidden border-3 transition-colors duration-500 text-cosmic-text ${
          isNight
            ? "bg-cosmic-bg-mid/95 border-cosmic-accent/70"
            : "bg-amber-50/95 border-amber-400 text-slate-800"
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-4 sm:p-5 border-b-3 flex items-center justify-between shrink-0 transition-colors duration-500 ${
            isNight ? "border-cosmic-accent/45 bg-cosmic-bg" : "border-amber-300 bg-amber-100"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-2xl select-none">🎛️</span>
            <div>
              <span
                className={`text-[9px] uppercase font-black tracking-wider block ${
                  isNight ? "text-cosmic-accent" : "text-amber-800"
                }`}
              >
                LOFI SOUND & EINSTELLUNGEN
              </span>
              <h4
                className={`font-sans font-black text-sm uppercase tracking-wide ${
                  isNight ? "text-cosmic-text" : "text-slate-800"
                }`}
              >
                Musik & Leistung anpassen
              </h4>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`size-8  rounded-full flex items-center justify-center font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer ${
              isNight
                ? "bg-cosmic-bg border-2 border-cosmic-accent/60 text-cosmic-text hover:bg-cosmic-surface-mid"
                : "bg-white border-2 border-amber-300 text-amber-955 hover:bg-amber-50"
            }`}
            id="close_music_settings_btn"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 grow overflow-y-auto space-y-4">
          {/* Lo-Fi Music Channel Presets */}
          <div className="space-y-3">
            <h5
              className={`font-sans font-black text-[10px] uppercase tracking-wider font-mono px-1 ${
                isNight ? "text-cosmic-accent-muted" : "text-amber-800"
              }`}
            >
              🎵 Waehle deine Lofi-Atmosphaere (Procedural)
            </h5>

            <div className="space-y-2.5">
              {MUSIC_STYLES.map((style) => {
                const isActive = musicStyleState === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => {
                      setMusicStyle(style.id);
                      setMusicStyleState(style.id);
                      playPop();
                    }}
                    className={`w-full text-left p-3 rounded-2xl border-2 flex items-start gap-3 transition-all active:scale-[0.99] cursor-pointer ${
                      isActive
                        ? isNight
                          ? "bg-linear-to-r from-cosmic-surface-hover to-cosmic-bg-mid border-cosmic-accent shadow-[0_0_12px_rgba(202,165,254,0.25)]"
                          : "bg-linear-to-r from-amber-100 to-amber-50/50 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                        : isNight
                          ? "bg-cosmic-bg-mid/55 border-cosmic-accent/10 text-slate-300 hover:border-cosmic-accent/45 hover:bg-cosmic-bg-mid/65 text-cosmic-text"
                          : "bg-white/80 border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50"
                    }`}
                  >
                    <span className="text-3xl select-none shrink-0 mt-0.5">{style.emoji}</span>
                    <div className="grow">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-sans font-black text-xs uppercase tracking-wide leading-none ${
                            isActive
                              ? isNight
                                ? "text-cosmic-text"
                                : "text-amber-955"
                              : isNight
                                ? "text-slate-200"
                                : "text-slate-800"
                          }`}
                        >
                          {style.name}
                        </span>
                        {isActive && (
                          <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 animate-pulse border border-emerald-500/30">
                            Aktiv
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-[10px] font-semibold mt-1 leading-normal ${
                          isActive
                            ? isNight
                              ? "text-cosmic-accent"
                              : "text-amber-900"
                            : isNight
                              ? "text-cosmic-accent-muted/75"
                              : "text-slate-500"
                        }`}
                      >
                        {style.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t-2 border-cosmic-accent/15">
            <h5
              className={`font-sans font-black text-[10px] uppercase tracking-wider font-mono px-1 ${
                isNight ? "text-cosmic-accent-muted" : "text-amber-800"
              }`}
            >
              🔤 Schriftgroesse
            </h5>

            <div
              className={`p-3.5 rounded-2.5xl border-2 space-y-3 transition-all ${
                isNight
                  ? "bg-cosmic-bg-mid/55 border-cosmic-accent/10"
                  : "bg-white/80 border-slate-200"
              }`}
            >
              <div className="space-y-1">
                <span
                  className={`font-sans font-black text-xs uppercase tracking-wide block ${
                    isNight ? "text-slate-200" : "text-slate-800"
                  }`}
                >
                  Globale Spiel-Schrift
                </span>
                <p
                  className={`text-[10px] font-semibold leading-normal ${
                    isNight ? "text-cosmic-accent-muted/75" : "text-slate-500"
                  }`}
                >
                  Passt die gesamte UI in festen Stufen an, ohne das bestehende Layout aus dem Takt
                  zu bringen.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {FONT_SCALE_OPTIONS.map((option) => {
                  const isActive = option === fontScale;
                  const label = option === 100 ? "Standard" : `${option}%`;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setFontScale(option);
                        playPop();
                      }}
                      className={`min-h-11 px-3 py-2 rounded-xl border-2 font-mono font-black text-[11px] leading-tight cursor-pointer transition-all duration-150 ${
                        isActive
                          ? isNight
                            ? "bg-cosmic-accent/20 border-cosmic-accent text-cosmic-text shadow-[0_0_12px_rgba(202,165,254,0.22)]"
                            : "bg-amber-100 border-amber-400 text-slate-900 shadow-sm"
                          : isNight
                            ? "bg-slate-900/30 border-slate-700 text-slate-300 hover:border-cosmic-accent/45 hover:bg-cosmic-bg-mid/65"
                            : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-amber-50 hover:border-amber-300"
                      }`}
                      aria-pressed={isActive}
                    >
                      <span className="block">{label}</span>
                      <span className="block text-[9px] opacity-80">
                        {option < 100 ? "Kompakt" : option === 100 ? "100%" : "Groesser"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Performance Settings Segment */}
          <div className="space-y-3 pt-4 border-t-2 border-cosmic-accent/15">
            <h5
              className={`font-sans font-black text-[10px] uppercase tracking-wider font-mono px-1 ${
                isNight ? "text-cosmic-accent-muted" : "text-amber-800"
              }`}
            >
              ⚙️ Grafikleistung (Performance)
            </h5>

            <div
              className={`p-3.5 rounded-2.5xl border-2 flex items-center justify-between gap-4 transition-all ${
                isNight
                  ? "bg-cosmic-bg-mid/55 border-cosmic-accent/10"
                  : "bg-white/80 border-slate-200"
              }`}
            >
              <div className="grow">
                <span
                  className={`font-sans font-black text-xs uppercase tracking-wide block ${
                    isNight ? "text-slate-200" : "text-slate-800"
                  }`}
                >
                  Low-Memory-Modus
                </span>
                <p
                  className={`text-[10px] font-semibold mt-1 leading-normal ${
                    isNight ? "text-cosmic-accent-muted/75" : "text-slate-500"
                  }`}
                >
                  Reduziert schwebende Texte, kosmische Event-Partikel und Hintergrund-Tiere
                  erheblich, um aeltere Mobilgeraete zu entlasten.
                </p>
              </div>

              <button
                onClick={() => {
                  setIsLowMemory(!isLowMemory);
                  playPop();
                }}
                className={`px-3 py-1.5 rounded-xl border-2 font-mono font-black text-[11px] uppercase tracking-wider cursor-pointer select-none transition-all duration-150 ${
                  isLowMemory
                    ? isNight
                      ? "bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.2)]"
                      : "bg-orange-500 border-amber-600 text-white shadow-sm"
                    : isNight
                      ? "bg-slate-850/40 border-slate-700 text-slate-400 hover:border-slate-500"
                      : "bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {isLowMemory ? "AN (Sparsam)" : "AUS"}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`p-4 text-[10px] text-center font-mono font-semibold opacity-75 leading-relaxed shrink-0 border-t transition-colors duration-500 ${
            isNight
              ? "bg-cosmic-bg border-cosmic-accent/25 text-cosmic-accent-muted"
              : "bg-amber-100/60 border-amber-200 text-amber-900"
          }`}
        >
          Alle Klaenge werden in Echtzeit berechnet und verbrauchen kein Datenvolumen. Rain-Preset
          erzeugt sanftes analoges Rauschen.
        </div>
      </Modal>
    );
  },
);

MusicSettingsModal.displayName = "MusicSettingsModal";
