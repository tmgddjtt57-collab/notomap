(() => {
  if (window.__notoMapDetailPanelBuiltIn) return;
  const boundMarkers = new WeakSet();

  const baseBind = bind;
  const baseRender = render;
  const baseMarkers = markers;
  const baseSelectSpot = selectSpot;

  bind = function () {
    baseBind();
    ensureDetailPanel();
    injectDetailPanelStyles();
  };

  render = function () {
    baseRender();
    renderSpotDetail();
  };

  markers = function () {
    baseMarkers();
    bindMarkerClicks();
  };

  selectSpot = function (id, open) {
    baseSelectSpot(id, open);
    renderSpotDetail();
  };

  function bindMarkerClicks() {
    if (!S.markers) return;
    S.markers.forEach((marker) => {
      if (boundMarkers.has(marker)) return;
      boundMarkers.add(marker);
      marker.on("click", () => setTimeout(renderSpotDetail, 0));
    });
  }

  function ensureDetailPanel() {
    if (document.getElementById("mapDetailPanel")) return;
    const mapWrap = document.querySelector(".map-wrap");
    if (!mapWrap) return;
    const panel = document.createElement("aside");
    panel.id = "mapDetailPanel";
    panel.className = "map-detail-panel";
    panel.setAttribute("aria-hidden", "true");
    panel.onclick = handleDetailClick;
    mapWrap.insertAdjacentElement("afterend", panel);
  }

  function handleDetailClick(ev) {
    const action = ev.target.closest("[data-action]");
    if (!action) return;
    ev.stopPropagation();
    if (action.dataset.action === "close-detail") {
      S.selected = "";
      list();
      renderSpotDetail();
    }
    if (action.dataset.action === "lightbox") openLightbox(action.dataset.src, action.dataset.caption || "");
    if (action.dataset.action === "edit") editSpot(action.dataset.id);
  }

  function renderSpotDetail() {
    ensureDetailPanel();
    const panel = document.getElementById("mapDetailPanel");
    if (!panel) return;
    const p = S.spots.find((x) => x.id === S.selected);
    if (!p) {
      panel.setAttribute("aria-hidden", "true");
      panel.innerHTML = "";
      document.body.classList.remove("detail-open");
      return;
    }
    const title = txt(p, "title");
    const main = photo(p);
    const location = p.locationText || (valid(Number(p.lat), Number(p.lng)) ? `${Number(p.lat).toFixed(6)}, ${Number(p.lng).toFixed(6)}` : "");
    const gallery = (p.photos || [])
      .slice(1)
      .map((x) => `<button type="button" data-action="lightbox" data-src="${attr(x.src)}" data-caption="${attr(title)}"><img src="${attr(x.src)}" alt="" loading="lazy"></button>`)
      .join("");
    const edit = S.role === "editor" ? `<button class="secondary-button" type="button" data-action="edit" data-id="${attr(p.id)}">${esc(tr("edit"))}</button>` : "";
    panel.setAttribute("aria-hidden", "false");
    document.body.classList.add("detail-open");
    panel.innerHTML = `
      <div class="map-detail-head">
        <div>
          <p class="eyebrow">${esc(tr("photos"))}</p>
          <h2>${esc(title)}</h2>
        </div>
        <button class="icon-button" type="button" data-action="close-detail" title="閉じる" aria-label="閉じる">
          <i data-lucide="x"></i>
        </button>
      </div>
      ${main ? `<button class="map-detail-main" type="button" data-action="lightbox" data-src="${attr(main)}" data-caption="${attr(title)}"><img src="${attr(main)}" alt="" loading="lazy"></button>` : `<div class="map-detail-main empty">${esc(tr("photos"))}</div>`}
      <div class="map-detail-body">
        <p class="map-detail-place">${esc(txt(p, "municipality"))}</p>
        <p class="map-detail-description">${esc(txt(p, "description"))}</p>
        ${location ? `<p class="map-detail-location"><strong>${esc(tr("locationInfo"))}</strong><br>${esc(location)}</p>` : ""}
        ${gallery ? `<div class="map-detail-gallery">${gallery}</div>` : ""}
        ${edit ? `<div class="map-detail-actions">${edit}</div>` : ""}
      </div>
    `;
    if (window.lucide?.createIcons) window.lucide.createIcons();
  }

  function injectDetailPanelStyles() {
    if (document.getElementById("detailPanelFixStyles")) return;
    const style = document.createElement("style");
    style.id = "detailPanelFixStyles";
    style.textContent = `
      .map-detail-panel {
        display: none;
        min-height: 0;
        overflow: auto;
        padding: 18px;
        background: var(--paper);
        border-left: 1px solid var(--line);
      }
      body.detail-open .map-detail-panel { display: block; }
      .map-detail-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 14px;
      }
      .map-detail-head h2 {
        margin: 0;
        font-size: 1.08rem;
        line-height: 1.35;
        letter-spacing: 0;
      }
      .map-detail-main {
        width: 100%;
        aspect-ratio: 4 / 3;
        display: grid;
        place-items: center;
        padding: 0;
        overflow: hidden;
        border: 1px solid var(--line);
        border-radius: var(--radius);
        background: #dfe5ef;
        cursor: pointer;
      }
      .map-detail-main img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .map-detail-main.empty {
        color: var(--muted);
        font-weight: 800;
      }
      .map-detail-body {
        display: grid;
        gap: 12px;
        margin-top: 14px;
      }
      .map-detail-place,
      .map-detail-description,
      .map-detail-location {
        margin: 0;
        color: var(--muted);
        line-height: 1.65;
        font-size: .9rem;
      }
      .map-detail-place {
        color: var(--navy-800);
        font-weight: 900;
      }
      .map-detail-description {
        white-space: pre-line;
      }
      .map-detail-gallery {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
        gap: 8px;
      }
      .map-detail-gallery button {
        aspect-ratio: 1;
        padding: 0;
        overflow: hidden;
        border: 1px solid var(--line);
        border-radius: 6px;
        background: #fff;
        cursor: pointer;
      }
      .map-detail-gallery img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .map-detail-actions {
        display: flex;
        justify-content: flex-end;
      }
      @media (min-width: 761px) {
        body.detail-open.viewer .workspace,
        body.detail-open.editor:not(.drawer-open) .workspace {
          grid-template-columns: minmax(292px, 340px) minmax(0, 1fr) minmax(300px, 380px);
        }
        body.detail-open.editor.drawer-open .workspace {
          grid-template-columns: minmax(292px, 320px) minmax(0, 1fr) minmax(300px, 360px) minmax(330px, 420px);
        }
      }
      @media (min-width: 761px) and (max-width: 1080px) {
        body.detail-open.viewer .workspace,
        body.detail-open.editor .workspace {
          grid-template-columns: minmax(280px, 320px) minmax(0, 1fr) minmax(280px, 340px);
        }
      }
      @media (max-width: 760px) {
        .panel { order: 3; }
        .map-detail-panel {
          order: 2;
          padding: 14px;
          border-left: 0;
          border-top: 1px solid var(--line);
          overflow: visible;
        }
      }
    `;
    document.head.appendChild(style);
  }
})();
