"use client";

import type { ReactNode, RefObject } from "react";

type Props = {
  isOpen: boolean;
  title: string;
  closeLabel: string;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  renderCloseIcon: () => ReactNode;
  children: ReactNode;
};

export default function DashboardInfoModal({
  isOpen,
  title,
  closeLabel,
  closeButtonRef,
  onClose,
  renderCloseIcon,
  children,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="modalBackdrop" onClick={onClose}>
      <div
        className="modalCard panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modalHeader">
          <h3 className="sectionTitle" id="info-modal-title">{title}</h3>
          <button
            ref={closeButtonRef}
            type="button"
            className="modalCloseBtn"
            onClick={onClose}
            aria-label={closeLabel}
            title={closeLabel}
          >
            {renderCloseIcon()}
          </button>
        </div>
        <div className="modalBody">{children}</div>
      </div>
    </div>
  );
}
