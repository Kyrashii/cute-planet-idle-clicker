import React from "react";
import type { User } from "firebase/auth";
import {
  Volume2,
  VolumeX,
  Settings,
  Cloud,
  Trophy,
  Info,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import { Modal } from "./ui/Modal";

interface HeaderMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isMutedState: boolean;
  user: User | null;
  handleToggleMute: () => void;
  setShowMusicSettingsModal: (show: boolean) => void;
  setShowCloudSyncModal: (show: boolean) => void;
  setShowLeaderboardModal: (show: boolean) => void;
  setShowTutorial: React.Dispatch<React.SetStateAction<boolean>>;
  setShowResetDialog: (show: boolean) => void;
  inGlitchGalaxy: boolean;
  onSecretCode: () => void;
}

interface MenuRowProps {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  danger?: boolean;
  disabled?: boolean;
  id?: string;
  onClick?: () => void;
  trailing?: React.ReactNode;
}

const MenuRow: React.FC<MenuRowProps> = ({
  icon,
  label,
  sub,
  danger = false,
  disabled = false,
  id,
  onClick,
  trailing,
}) => (
  <button
    type="button"
    id={id}
    onClick={onClick}
    disabled={disabled}
    className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-all ${
      disabled
        ? "cursor-not-allowed border-gray-700/60 bg-gray-950/60 text-gray-500 opacity-50"
        : danger
          ? "cursor-pointer border-cosmic-pink/50 bg-red-950/40 text-red-200 hover:bg-red-900/40 active:scale-[0.98]"
          : "cursor-pointer border-cosmic-accent/25 bg-cosmic-bg-mid text-cosmic-text hover:bg-cosmic-surface-mid active:scale-[0.98]"
    }`}
  >
    <span
      className={`relative flex size-9 shrink-0 items-center justify-center rounded-xl border ${
        danger ? "border-red-500/40 bg-red-950/50" : "border-cosmic-accent/30 bg-cosmic-surface-mid"
      }`}
    >
      {icon}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate font-sans text-xs font-black tracking-wider uppercase">
        {label}
      </span>
      {sub && (
        <span
          className={`block truncate text-[10px] font-bold ${danger ? "text-red-300/80" : "text-cosmic-text-muted"}`}
        >
          {sub}
        </span>
      )}
    </span>
    {trailing ??
      (!disabled && <ChevronRight className="size-4 shrink-0 text-cosmic-accent-muted" />)}
  </button>
);

/**
 * Utility menu drawer opened from the header hamburger. Hosts everything the
 * header row used to cram in: mute, music settings, cloud sync, leaderboard,
 * tutorial, reset and the secret-code input. Buttons that open modals leave
 * the drawer open underneath — Esc/back unwinds modal first, then drawer.
 */
export const HeaderMenuDrawer: React.FC<HeaderMenuDrawerProps> = ({
  isOpen,
  onClose,
  isMutedState,
  user,
  handleToggleMute,
  setShowMusicSettingsModal,
  setShowCloudSyncModal,
  setShowLeaderboardModal,
  setShowTutorial,
  setShowResetDialog,
  inGlitchGalaxy,
  onSecretCode,
}) => {
  const [secretInput, setSecretInput] = React.useState("");

  const handleSecretKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (secretInput.trim() === "hallodugeilesau") {
        onSecretCode();
      }
      setSecretInput("");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      presentation="drawer"
      panelClassName="border-3 border-cosmic-accent/50 bg-cosmic-bg-mid/95 text-cosmic-text shadow-2xl"
    >
      <div className="flex items-center justify-between border-b-3 border-cosmic-accent/30 p-4">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl select-none">🌟</span>
          <div>
            <span className="block text-[9px] font-black tracking-wider text-cosmic-accent-muted uppercase">
              Pastell-Kosmos
            </span>
            <h4 className="font-sans text-sm font-black tracking-wide uppercase">Menue</h4>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Menue schliessen"
          className="flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-cosmic-accent bg-cosmic-bg-mid text-lg font-bold text-purple-200 shadow-md transition-all hover:scale-110 hover:bg-cosmic-surface-hover active:scale-95"
        >
          ✕
        </button>
      </div>

      <div className="flex grow flex-col gap-2.5 overflow-y-auto p-4">
        <MenuRow
          icon={
            isMutedState ? (
              <VolumeX className="size-4 text-rose-350" />
            ) : (
              <Volume2 className="size-4 text-cosmic-pink" />
            )
          }
          label="Ton"
          sub={isMutedState ? "Stummgeschaltet" : "Eingeschaltet"}
          onClick={handleToggleMute}
          trailing={
            <span
              className={`rounded-full border px-2 py-0.5 font-mono text-[9px] font-black uppercase ${
                isMutedState
                  ? "border-rose-400/40 bg-rose-950/40 text-rose-300"
                  : "border-emerald-400/40 bg-emerald-950/40 text-emerald-300"
              }`}
            >
              {isMutedState ? "Aus" : "An"}
            </span>
          }
        />
        <MenuRow
          id="header_lofi_music_btn"
          icon={<Settings className="size-4 text-cosmic-accent" />}
          label="Sound & Einstellungen"
          sub="Musikstil, Schriftgroesse & mehr"
          onClick={() => setShowMusicSettingsModal(true)}
        />
        <MenuRow
          id="header_cloud_sync_btn"
          icon={
            <>
              <Cloud className="size-4 text-sky-400" />
              {user && (
                <span className="absolute -top-1 -right-1 size-2.5 animate-pulse rounded-full border border-black bg-emerald-400" />
              )}
            </>
          }
          label="Cloud Sync"
          sub={user ? "Verbunden" : "Backup & Synchronisation"}
          onClick={() => setShowCloudSyncModal(true)}
        />
        <MenuRow
          id="header_leaderboard_btn"
          icon={<Trophy className="size-4 text-amber-400" />}
          label="Bestenliste"
          sub="Globale Rangliste"
          onClick={() => setShowLeaderboardModal(true)}
        />
        <MenuRow
          icon={<Info className="size-4 text-cosmic-accent" />}
          label="Anleitung"
          sub="Kurze Einfuehrung ansehen"
          onClick={() => setShowTutorial(true)}
        />

        <div className="my-1 border-t border-cosmic-accent/15" />

        {inGlitchGalaxy ? (
          <MenuRow
            icon={<RotateCcw className="size-4 animate-spin" style={{ animationDuration: "6s" }} />}
            label="Spiel zuruecksetzen"
            sub="Blockiert in instabiler Galaxie"
            disabled
          />
        ) : (
          <MenuRow
            icon={<RotateCcw className="size-4 text-red-400" />}
            label="Spiel zuruecksetzen"
            sub="Alles auf Anfang"
            danger
            onClick={() => setShowResetDialog(true)}
          />
        )}
      </div>

      <div className="shrink-0 border-t border-cosmic-accent/15 p-4">
        <input
          type="text"
          placeholder="UWU"
          id="secret-code-input"
          value={secretInput}
          onChange={(e) => setSecretInput(e.target.value)}
          onKeyDown={handleSecretKeyDown}
          className="w-full rounded-xl border-2 border-cosmic-pink/40 bg-cosmic-bg-mid px-2.5 py-1.5 text-center font-mono text-xs font-black text-cosmic-text shadow-sm transition-all duration-300 placeholder-cosmic-pink/30 hover:bg-cosmic-surface-mid focus:border-cosmic-pink/90 focus:outline-none"
          title="Geheimer Text eingeben"
        />
      </div>
    </Modal>
  );
};
