(() => {
  if (window.__notoDesignPolishExternalLoaded) return;
  window.__notoDesignPolishExternalLoaded = true;

  const style = document.createElement("style");
  style.id = "notoDesignPolishExternalStyles";
  style.textContent = `
    :root {
      --line: #d5deec;
      --line-strong: #b9c7d9;
      --paper: #f4f7fb;
      --panel-soft: #f8fafc;
      --gold: #c2a15d;
      --shadow-soft: 0 12px 28px rgba(7, 20, 38, 0.08);
    }
    html, body { height: 100%; }
    body {
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }
    .topbar {
      gap: 16px;
      padding: 12px clamp(16px, 2.8vw, 30px);
      background: linear-gradient(90deg, var(--navy-950) 0%, var(--navy-900) 62%, var(--navy-800) 100%);
      box-shadow: 0 10px 30px rgba(7, 20, 38, 0.18);
    }
    .brand-block {
      display: grid;
      gap: 2px;
    }
    .brand-block h1 {
      font-size: clamp(1.12rem, 2.1vw, 1.72rem);
      line-height: 1.16;
      max-width: 22em;
    }
    .toolbar {
      justify-content: flex-end;
      flex-wrap: wrap;
    }
    .museum-link {
      border-color: rgba(194, 161, 93, 0.62);
      box-shadow: 0 8px 18px rgba(7, 20, 38, 0.12);
    }
    .field input,
    .field textarea,
    .field select,
    .paste-import-field textarea {
      transition: border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
    }
    .details-trigger {
      transition: background 0.16s ease, border-color 0.16s ease, transform 0.16s ease;
    }
    .details-trigger:hover {
      background: rgba(255, 255, 255, 0.14);
      border-color: rgba(255, 255, 255, 0.34);
    }
    .details-panel {
      z-index: 950;
    }
    .workspace {
      grid-template-columns: clamp(304px, 24vw, 372px) minmax(0, 1fr);
      background: #e8eef6;
    }
    body.editor.drawer-open .workspace {
      grid-template-columns: clamp(292px, 22vw, 340px) minmax(0, 1fr) clamp(330px, 27vw, 430px);
    }
    .panel,
    .drawer,
    .map-detail-panel {
      background: linear-gradient(180deg, var(--paper), #eef3f9);
      scrollbar-gutter: stable;
    }
    .panel {
      display: grid;
      align-content: start;
      gap: 14px;
      padding: clamp(14px, 1.6vw, 22px);
    }
    .drawer,
    .map-detail-panel {
      padding: clamp(14px, 1.6vw, 22px);
    }
    .region-summary,
    .filter-section,
    .spot-section,
    form {
      padding: 16px;
      box-shadow: var(--shadow-soft);
    }
    .region-summary {
      border-top: 3px solid var(--gold);
    }
    .filter-section,
    .spot-section {
      margin-top: 0;
    }
    .group-chip {
      font-size: 0.82rem;
      font-weight: 800;
      transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease, transform 0.16s ease;
    }
    .group-chip:hover {
      border-color: var(--gold);
      transform: translateY(-1px);
    }
    .spot-card {
      position: relative;
      grid-template-columns: 82px minmax(0, 1fr);
      gap: 12px;
      padding: 10px;
      transition: border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease;
    }
    .spot-card::before {
      content: "";
      position: absolute;
      inset: 10px auto 10px 0;
      width: 3px;
      border-radius: 0 3px 3px 0;
      background: transparent;
    }
    .spot-card:hover {
      border-color: rgba(194, 161, 93, 0.72);
      box-shadow: var(--shadow-soft);
      transform: translateY(-1px);
    }
    .spot-card.active::before {
      background: var(--gold);
    }
    .spot-thumb {
      width: 82px;
      height: 82px;
    }
    .spot-meta h3 {
      display: -webkit-box;
      overflow: hidden;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
    .spot-description {
      display: -webkit-box;
      overflow: hidden;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
    }
    .spot-description.expanded {
      display: block;
      overflow: visible;
    }
    .map-wrap {
      background: #dce5f0;
      border-left: 1px solid var(--line);
      isolation: isolate;
    }
    .map-wrap::after {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      box-shadow: inset 0 0 0 1px rgba(7, 20, 38, 0.08), inset 0 18px 32px rgba(7, 20, 38, 0.06);
      z-index: 500;
    }
    .map-status,
    .completion-toast {
      max-width: min(92vw, 560px);
    }
    .primary-button,
    .secondary-button,
    .danger-button,
    .icon-button {
      transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease;
    }
    .primary-button:hover,
    .secondary-button:hover,
    .danger-button:hover,
    .icon-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 18px rgba(7, 20, 38, 0.1);
    }
    .photo-picker-button {
      justify-content: center;
      min-height: 44px;
    }
    .batch-photo-item {
      grid-template-columns: 96px minmax(0, 1fr);
      gap: 12px;
      background: var(--panel-soft);
    }
    .batch-photo-thumb {
      width: 96px;
      height: 96px;
    }
    .form-actions {
      position: sticky;
      bottom: -1px;
      padding-top: 12px;
      background: linear-gradient(180deg, rgba(244, 247, 251, 0), var(--paper) 34%);
    }
    .map-detail-head {
      position: sticky;
      top: 0;
      z-index: 2;
      margin: calc(clamp(16px, 1.6vw, 22px) * -1) calc(clamp(16px, 1.6vw, 22px) * -1) 16px;
      padding: clamp(16px, 1.6vw, 22px);
      background: linear-gradient(180deg, var(--paper), rgba(244, 247, 251, 0.94));
      border-bottom: 1px solid var(--line);
    }
    .map-detail-head h2 {
      font-size: 1.12rem;
      line-height: 1.32;
    }
    .map-detail-main {
      border-color: var(--line-strong);
      box-shadow: var(--shadow-soft);
    }
    .map-detail-body {
      gap: 14px;
    }
    .map-detail-description,
    .map-detail-location {
      overflow-wrap: anywhere;
    }
    .map-detail-location {
      padding: 10px 12px;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: #fff;
    }
    .map-detail-gallery {
      grid-template-columns: repeat(auto-fill, minmax(78px, 1fr));
    }
    .map-detail-gallery button {
      border-color: var(--line-strong);
      transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
    }
    .map-detail-gallery button:hover {
      transform: translateY(-1px);
      border-color: var(--gold);
      box-shadow: var(--shadow-soft);
    }
    @media (min-width: 901px) {
      .app-shell {
        min-height: 100vh;
        height: 100vh;
      }
      .workspace {
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }
      .panel,
      .drawer,
      .map-detail-panel {
        min-height: 0;
        overscroll-behavior: contain;
      }
      .map-wrap,
      #map {
        min-height: 0;
        height: 100%;
      }
      body.detail-open.viewer .workspace,
      body.detail-open.editor:not(.drawer-open) .workspace {
        grid-template-columns: clamp(304px, 23vw, 360px) minmax(360px, 1fr) clamp(320px, 24vw, 390px);
      }
      body.detail-open.editor.drawer-open .workspace {
        grid-template-columns: minmax(286px, 320px) minmax(320px, 1fr) minmax(300px, 360px) minmax(330px, 420px);
      }
    }
    @media (min-width: 901px) and (max-width: 1180px) {
      body.detail-open.viewer .workspace,
      body.detail-open.editor .workspace {
        grid-template-columns: minmax(280px, 320px) minmax(0, 1fr) minmax(300px, 350px);
      }
    }
    @media (max-width: 1080px) {
      body.editor.drawer-open .workspace,
      .workspace {
        grid-template-columns: minmax(300px, 340px) minmax(0, 1fr);
      }
      body.editor.drawer-open .drawer {
        top: 82px;
      }
    }
    @media (max-width: 900px) {
      .app-shell {
        height: auto;
        min-height: 100vh;
      }
      .topbar {
        position: relative;
        align-items: flex-start;
        flex-direction: column;
        gap: 10px;
        padding: 12px;
      }
      .brand-block {
        width: 100%;
      }
      .brand-block h1 {
        font-size: 1.12rem;
        line-height: 1.22;
      }
      .toolbar {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        width: 100%;
        align-items: end;
        gap: 8px;
      }
      .museum-link {
        grid-column: 1 / -1;
        width: 100%;
        min-height: 36px;
        padding-inline: 10px;
        font-size: 0.83rem;
      }
      .language-control,
      .field-compact {
        min-width: 0;
      }
      .field-compact {
        min-width: 118px;
      }
      .details-menu {
        justify-self: end;
      }
      .workspace,
      body.editor.drawer-open .workspace {
        display: flex;
        flex-direction: column;
        overflow: visible;
      }
      .panel {
        order: 3;
        overflow: visible;
        border-right: 0;
        border-top: 1px solid var(--line);
        padding: 14px;
      }
      .map-wrap {
        order: 1;
        border-left: 0;
      }
      .map-wrap,
      #map {
        height: 60svh;
        min-height: 60svh;
      }
      .map-detail-panel {
        order: 2;
        padding: 14px;
        border-left: 0;
        border-top: 1px solid var(--line);
        overflow: visible;
      }
      .map-detail-head {
        position: static;
        margin: -14px -14px 14px;
        padding: 14px;
      }
      body.editor.drawer-open .drawer {
        top: auto;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        max-height: 82vh;
        border-radius: 8px 8px 0 0;
      }
      .details-panel {
        right: auto;
        left: 0;
      }
      .spot-card {
        grid-template-columns: 74px minmax(0, 1fr);
        gap: 10px;
      }
      .spot-thumb {
        width: 74px;
        height: 74px;
      }
      .region-summary,
      .filter-section,
      .spot-section,
      form {
        padding: 14px;
      }
      .form-grid,
      .batch-photo-item {
        grid-template-columns: 1fr;
      }
      .batch-photo-thumb {
        width: 100%;
        height: 160px;
      }
    }
  `;

  function moveStyleToEnd() {
    document.head.appendChild(style);
  }

  moveStyleToEnd();
  document.addEventListener("DOMContentLoaded", () => setTimeout(moveStyleToEnd, 0), { once: true });
  window.addEventListener("load", moveStyleToEnd, { once: true });
})();
