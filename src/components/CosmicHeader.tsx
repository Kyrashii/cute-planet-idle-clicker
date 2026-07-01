import React from "react";
import { motion, AnimatePresence } from "motion/react";
import type { User } from "firebase/auth";
import { useHotStat } from "../game/hotStore";
import { Volume2, VolumeX, X, Swords, Menu } from "lucide-react";
import { HeaderMenuDrawer } from "./HeaderMenuDrawer";

interface CosmicHeaderProps {
  isNightStyle: boolean;
  showTutorial: boolean;
  life: number;
  galaxyShards: number;
  isMutedState: boolean;
  user: User | null;
  handleToggleMute: () => void;
  setShowMusicSettingsModal: (show: boolean) => void;
  setShowCloudSyncModal: (show: boolean) => void;
  setShowLeaderboardModal: (show: boolean) => void;
  setShowTutorial: React.Dispatch<React.SetStateAction<boolean>>;
  setShowResetDialog: (show: boolean) => void;
  formatCompactNumber: (num: number) => string;
  prestigeCount: number;
  onOpenGalaxyShardsShop: () => void;
  onOpenRoguelite: () => void;
  hasActiveRogueliteRun: boolean;
  rogueliteRunStatus?: string;
  inGlitchGalaxy?: boolean;
  showMenuDrawer: boolean;
  setShowMenuDrawer: (show: boolean) => void;
}

/**
 * Compact stat pill: emoji + value always visible, tiny uppercase label only
 * from md up (the label lives in `title` for smaller screens).
 */
const StatChip: React.FC<{
  emoji: string;
  value: string;
  label: string;
  htmlTitle: string;
  isNight: boolean;
  accentClassName: string;
  valueClassName?: string;
  labelClassName?: string;
  onClick?: () => void;
  testId?: string;
}> = ({
  emoji,
  value,
  label,
  htmlTitle,
  isNight,
  accentClassName,
  valueClassName = "",
  labelClassName = "",
  onClick,
  testId,
}) => {
  const shared = `inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 shadow-sm transition-colors duration-500 ${
    isNight ? "bg-cosmic-bg-mid text-cosmic-text" : ""
  } ${accentClassName}`;
  const inner = (
    <>
      <span className="text-sm leading-none select-none">{emoji}</span>
      <span className={`font-mono text-xs leading-none font-black sm:text-sm ${valueClassName}`}>
        {value}
      </span>
      <span
        className={`hidden font-mono text-[9px] leading-none font-black tracking-wider uppercase md:inline ${labelClassName}`}
      >
        {label}
      </span>
    </>
  );
  if (onClick) {
    return (
      <button
        onClick={onClick}
        title={htmlTitle}
        data-testid={testId}
        className={`${shared} cursor-pointer transition-all hover:scale-105 active:scale-95`}
      >
        {inner}
      </button>
    );
  }
  return (
    <div title={htmlTitle} data-testid={testId} className={shared}>
      {inner}
    </div>
  );
};

export const CosmicHeader: React.FC<CosmicHeaderProps> = React.memo(
  ({
    isNightStyle,
    showTutorial,
    life,
    galaxyShards,
    isMutedState,
    user,
    handleToggleMute,
    setShowMusicSettingsModal,
    setShowCloudSyncModal,
    setShowLeaderboardModal,
    setShowTutorial,
    setShowResetDialog,
    formatCompactNumber,
    prestigeCount,
    onOpenGalaxyShardsShop,
    onOpenRoguelite,
    hasActiveRogueliteRun,
    rogueliteRunStatus,
    inGlitchGalaxy = false,
    showMenuDrawer,
    setShowMenuDrawer,
  }) => {
    const liveLife = useHotStat((s) => s.life) || life;
    const [showVideo, setShowVideo] = React.useState(false);
    const [videoVolume, setVideoVolume] = React.useState(0.8);
    const [videoMuted, setVideoMuted] = React.useState(false);
    const videoRef = React.useRef<HTMLVideoElement>(null);

    React.useEffect(() => {
      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        if (showVideo && e.code === "Space") {
          e.preventDefault();
        }
      };
      if (showVideo) {
        window.addEventListener("keydown", handleGlobalKeyDown);
      }
      return () => {
        window.removeEventListener("keydown", handleGlobalKeyDown);
      };
    }, [showVideo]);

    React.useEffect(() => {
      if (videoRef.current) {
        videoRef.current.volume = videoVolume;
        videoRef.current.muted = videoMuted;
      }
    }, [videoVolume, videoMuted, showVideo]);

    return (
      <>
        <header
          className={`sticky top-0 z-20 border-b-4 px-3 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] shadow-md backdrop-blur-md transition-all duration-500 game:p-4 sm:px-6 ${
            isNightStyle ? "bg-cosmic-bg/85 border-cosmic-accent/50 text-cosmic-text" : ""
          } ${showTutorial ? "blur-md pointer-events-none select-none" : ""}`}
        >
          <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between gap-2">
            {/* Logo Title area */}
            <div className="flex min-w-0 items-center gap-2">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="text-2xl select-none sm:text-3xl"
              >
                🪐
              </motion.span>
              <div className="min-w-0">
                <h1
                  className={`truncate font-sans text-sm font-black tracking-[0.12em] uppercase sm:text-base ${
                    isNightStyle ? "text-cosmic-text" : ""
                  }`}
                >
                  Pastell-Kosmos
                </h1>
                <p
                  className={`mt-0.5 hidden text-[10px] font-bold sm:block sm:text-xs ${
                    isNightStyle ? "text-cosmic-accent-muted" : ""
                  }`}
                >
                  Belebe deinen suessen Begleiter
                </p>
              </div>
            </div>

            {/* Stats, roguelite entry & menu */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
              <StatChip
                emoji="💖"
                value={formatCompactNumber(liveLife)}
                label="Leben"
                htmlTitle={`Erspieltes Leben: ${Math.floor(liveLife).toLocaleString("de-DE")}`}
                isNight={isNightStyle}
                accentClassName="border-cosmic-pink/60"
                valueClassName={isNightStyle ? "text-cosmic-text" : ""}
                labelClassName="text-cosmic-pink"
              />

              {(galaxyShards > 0 || prestigeCount > 0) && (
                <StatChip
                  emoji="🌌"
                  value={galaxyShards.toLocaleString("de-DE")}
                  label="Splitter"
                  htmlTitle="Galaktischen Splitter-Shop oeffnen 🌌"
                  isNight={isNightStyle}
                  accentClassName="border-fuchsia-400"
                  valueClassName="text-fuchsia-200"
                  labelClassName="text-fuchsia-300"
                  onClick={onOpenGalaxyShardsShop}
                />
              )}

              <button
                onClick={onOpenRoguelite}
                data-testid="open-roguelite-button"
                className={`group relative flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2 shadow-sm transition-all ${
                  hasActiveRogueliteRun
                    ? "border-fuchsia-300/70 bg-linear-to-r from-cosmic-ink via-cosmic-bg-mid to-sky-950 text-white shadow-[0_0_30px_rgba(202,165,254,0.22)]"
                    : "border-cosmic-accent/50 bg-cosmic-bg-mid hover:bg-cosmic-surface-mid text-cosmic-text"
                }`}
                title="Galaxie-Roguelite oeffnen"
              >
                <Swords
                  className={`size-4 ${hasActiveRogueliteRun ? "text-fuchsia-200" : "text-cosmic-pink"} ${hasActiveRogueliteRun ? "animate-pulse" : ""}`}
                />
                <div className="hidden text-left lg:block">
                  <div className="font-mono text-[9px] font-black tracking-[0.18em] text-cosmic-accent-muted uppercase">
                    Rogue-Lite
                  </div>
                  <div className="text-[10px] font-black tracking-[0.12em] uppercase">
                    {hasActiveRogueliteRun ? (rogueliteRunStatus ?? "Run aktiv") : "Start"}
                  </div>
                </div>
                {hasActiveRogueliteRun && (
                  <span className="absolute -top-1.5 -right-1.5 size-3.5 animate-pulse rounded-full border border-white/30 bg-fuchsia-400" />
                )}
              </button>

              <button
                onClick={() => setShowMenuDrawer(true)}
                aria-label="Menue oeffnen"
                id="header_menu_btn"
                className="cursor-pointer rounded-xl border-2 border-cosmic-accent/50 bg-cosmic-bg-mid p-2.5 text-cosmic-text shadow-sm transition-all hover:bg-cosmic-surface-mid active:translate-y-px active:scale-95"
                title="Menue oeffnen"
              >
                <Menu className="size-4 text-cosmic-accent" />
              </button>
            </div>
          </div>
        </header>

        <HeaderMenuDrawer
          isOpen={showMenuDrawer}
          onClose={() => setShowMenuDrawer(false)}
          isMutedState={isMutedState}
          user={user}
          handleToggleMute={handleToggleMute}
          setShowMusicSettingsModal={setShowMusicSettingsModal}
          setShowCloudSyncModal={setShowCloudSyncModal}
          setShowLeaderboardModal={setShowLeaderboardModal}
          setShowTutorial={setShowTutorial}
          setShowResetDialog={setShowResetDialog}
          inGlitchGalaxy={inGlitchGalaxy}
          onSecretCode={() => setShowVideo(true)}
        />

        <AnimatePresence>
          {showVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="fixed inset-0 z-9999 flex items-center justify-center bg-transparent pointer-events-none select-none"
            >
              {/* Close button with interactive state */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowVideo(false);
                }}
                className="absolute top-6 right-6 z-10000 p-3 rounded-full bg-black/65 border border-white/20 text-white hover:bg-black/85 hover:scale-105 active:scale-95 transition-all shadow-lg pointer-events-auto cursor-pointer flex items-center justify-center animate-bounce"
                title="Schliessen"
                style={{ animationDuration: "3s" }}
                id="close-secret-video"
              >
                <X className="size-6" />
              </button>

              {/* Immersive Video frame container */}
              <div
                className="relative size-full max-w-full max-h-full flex items-center justify-center p-4 md:p-8 pointer-events-none"
                onClick={(e) => e.stopPropagation()}
              >
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video
                  ref={videoRef}
                  src="/assets/stuff/hihihi.webm"
                  autoPlay
                  playsInline
                  onEnded={() => setShowVideo(false)}
                  onPause={() => {
                    if (showVideo && videoRef.current) {
                      videoRef.current.play().catch(() => {});
                    }
                  }}
                  className="max-w-full max-h-full rounded-2xl shadow-2xl pointer-events-none bg-transparent"
                  id="secret-video-player"
                />

                {/* Custom volume controller locked from pausing/seeking */}
                <div
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10000 flex items-center gap-3 px-4 py-2 bg-black/85 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg pointer-events-auto"
                  id="custom-video-volume-controls"
                >
                  <button
                    onClick={() => setVideoMuted((prev) => !prev)}
                    className="flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-white/15 active:scale-95 text-white transition-all cursor-pointer"
                    title={videoMuted ? "Ton einschalten" : "Ton stummschalten"}
                  >
                    {videoMuted || videoVolume === 0 ? (
                      <VolumeX className="size-5 text-rose-400" />
                    ) : (
                      <Volume2 className="size-5 text-cosmic-pink animate-pulse" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={videoMuted ? 0 : videoVolume}
                    onChange={(e) => {
                      setVideoVolume(parseFloat(e.target.value));
                      setVideoMuted(false);
                    }}
                    className="w-24 sm:w-32 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cosmic-pink hover:accent-fuchsia-400 transition-all"
                    title="Lautstaerke einstellen"
                  />
                  <span className="text-[10px] font-mono font-bold text-white/80 select-none w-8 text-right">
                    {Math.round((videoMuted ? 0 : videoVolume) * 100)}%
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  },
);

CosmicHeader.displayName = "CosmicHeader";
