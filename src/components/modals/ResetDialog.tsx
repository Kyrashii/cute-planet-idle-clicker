import React from "react";
import { Modal } from "../ui/Modal";

interface ResetDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ResetDialog: React.FC<ResetDialogProps> = React.memo(
  ({ isOpen, onConfirm, onCancel }) => {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onCancel}
        panelClassName="bg-cosmic-bg-mid/95 border-3 border-cosmic-pink rounded-3.5xl p-6 max-w-sm w-full shadow-2xl text-cosmic-text"
      >
        <h5 className="font-sans font-black text-brand-pink text-base uppercase tracking-wider">
          Spielstand zuruecksetzen?
        </h5>
        <p className="font-sans text-xs/relaxed text-cosmic-accent-muted font-semibold mt-2.5 ">
          Moechtest du deinen suessen Kosmos wirklich zuruecksetzen? Alle deine gezuechteten
          Haeschen, Kueken und helfenden Sterne werden geloescht. Dies kann nicht aufgehoben werden!
        </p>
        <div className="mt-5 flex gap-3 font-black">
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 bg-red-650 hover:bg-rose-700 text-white border-2 border-cosmic-accent/60 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer shadow-md"
          >
            Loeschen 🌠
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 bg-cosmic-surface-mid hover:bg-cosmic-surface-hover text-white border-2 border-cosmic-accent/60 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer shadow-md"
          >
            Behalten 🌸
          </button>
        </div>
      </Modal>
    );
  },
);

ResetDialog.displayName = "ResetDialog";
