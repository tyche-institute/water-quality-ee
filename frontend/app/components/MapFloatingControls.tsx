"use client";

type Props = {
  isMobile: boolean;
  isFullscreen: boolean;
  canRecenter: boolean;
  fullscreenLabel: string;
  resetViewLabel: string;
  recenterLabel: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onRecenter: () => void;
  onToggleFullscreen?: () => void;
};

export default function MapFloatingControls({
  isMobile,
  isFullscreen,
  canRecenter,
  fullscreenLabel,
  resetViewLabel,
  recenterLabel,
  onZoomIn,
  onZoomOut,
  onResetView,
  onRecenter,
  onToggleFullscreen,
}: Props) {
  return (
    <>
      {isMobile ? (
        <div className="mapFloatingControls mapZoomControls">
          <button type="button" className="mapFloatingBtn mapZoomBtn" onClick={onZoomIn} aria-label="Zoom in" title="Zoom in">
            +
          </button>
          <button type="button" className="mapFloatingBtn mapZoomBtn" onClick={onZoomOut} aria-label="Zoom out" title="Zoom out">
            -
          </button>
        </div>
      ) : null}
      {!(isMobile && isFullscreen) ? (
        <div className="mapFloatingControls">
          <button type="button" className="mapFloatingBtn mapResetBtn" onClick={onResetView} aria-label={resetViewLabel} title={resetViewLabel}>
            🧭
          </button>
          <button
            type="button"
            className="mapFloatingBtn mapRecenterBtn"
            onClick={onRecenter}
            disabled={!canRecenter}
            aria-label={recenterLabel}
            title={recenterLabel}
          >
            ◎
          </button>
        </div>
      ) : null}
      {onToggleFullscreen ? (
        <button type="button" className="mapFloatingBtn mapFullscreenBtn" onClick={onToggleFullscreen} aria-label={fullscreenLabel} title={fullscreenLabel}>
          <span aria-hidden="true">⛶</span>
          <span className="mapFullscreenLabel">{fullscreenLabel}</span>
        </button>
      ) : null}
    </>
  );
}
