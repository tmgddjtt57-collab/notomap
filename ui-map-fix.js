(() => {
  const NOTO_BOUNDS = [
    [36.72, 136.48],
    [37.58, 137.38],
  ];
  const HIMI_MUNICIPALITY = { ja: "氷見市", en: "Himi City", ko: "히미시", zh: "冰见市" };
  const HIMI_ALIASES = ["氷見", "himi", "himi city", "#himicity", "히미", "冰见"];
  let correctedSpotsRef = null;
  let correctedSpotsLength = -1;

  installAreaVocabulary();

  const baseBind = bind;
  const baseRender = render;

  render = function () {
    applyAreaCorrections();
    baseRender();
  };

  filtered = function (id = S.group) {
    applyAreaCorrections();
    return id === "all" ? S.spots : S.spots.filter((p) => gid(p.group || p.municipality?.ja) === id);
  };

  bind = function () {
    baseBind();
    injectUiFixStyles();
    E.spotList.onclick = handleSpotListClick;
    E.groupList.onclick = handleGroupClick;
    const clear = document.getElementById("clearFilterButton");
    if (clear) clear.onclick = () => setGroup("all");
  };

  list = function () {
    applyAreaCorrections();
    const rows = filtered();
    S.expandedDescriptions ||= new Set();
    if (!rows.length) {
      E.spotList.innerHTML = `<p class="passkey-copy">${esc(tr("noPhotos"))}</p>`;
      return;
    }
    E.spotList.innerHTML = rows.map((p) => {
      const img = photo(p);
      const fullDescription = txt(p, "description");
      const expanded = S.expandedDescriptions.has(p.id);
      const needsMore = fullDescription.length > 120;
      const description = needsMore && !expanded ? short(fullDescription, 120) : fullDescription;
      const more = needsMore ? `<button class="text-button spot-more-button" type="button" data-action="toggle-description" data-id="${attr(p.id)}">${expanded ? "閉じる" : "もっと見る"}</button>` : "";
      const actions = S.role === "editor" ? `<div class="spot-actions"><button class="secondary-button" data-action="edit" data-id="${attr(p.id)}">${esc(tr("edit"))}</button><button class="danger-button" data-action="delete" data-id="${attr(p.id)}">${esc(tr("delete"))}</button></div>` : "";
      return `<article class="spot-card${p.id === S.selected ? " active" : ""}" data-id="${attr(p.id)}"><div class="spot-thumb">${img ? `<img src="${attr(img)}" alt="" loading="lazy" onerror="this.remove()">` : ""}</div><div class="spot-meta"><h3>${esc(txt(p, "title"))}</h3><p>${esc(txt(p, "municipality"))}</p><p class="spot-description${expanded ? " expanded" : ""}">${esc(description)}</p>${more}${actions}</div></article>`;
    }).join("");
  };

  markers = function () {
    if (!S.map || !window.L) return;
    applyAreaCorrections();
    ensurePhotoLayer();
    S.layer.clearLayers();
    S.markers.clear();
    const bounds = [];
    filtered().forEach((p) => {
      const c = spotCoords(p);
      if (!c || !valid(c.lat, c.lng)) return;
      p.lat = c.lat;
      p.lng = c.lng;
      const mk = L.marker([p.lat, p.lng], { icon: icon(photo(p)) }).bindPopup(popup(p), { maxWidth: 320, autoPan: false });
      mk.on("click", () => {
        S.selected = p.id;
        list();
      });
      S.layer.addLayer(mk);
      S.markers.set(p.id, mk);
      bounds.push([p.lat, p.lng]);
    });
    fitVisibleMarkers(bounds);
  };

  icon = function (src) {
    const inner = src ? `<img src="${attr(src)}" alt="" loading="lazy" onerror="this.parentElement.classList.add('empty');this.remove()">` : `<span>${esc(tr("photos").slice(0, 1))}</span>`;
    return L.divIcon({ className: "", html: `<div class="photo-marker"><div class="marker-photo-frame${src ? "" : " empty"}">${inner}</div></div>`, iconSize: [54, 64], iconAnchor: [27, 64], popupAnchor: [0, -62] });
  };

  selectSpot = function (id, open) {
    S.selected = id;
    const p = S.spots.find((x) => x.id === id);
    const mk = S.markers.get(id);
    if (open && p && S.map) S.map.setView([p.lat, p.lng], Math.max(S.map.getZoom(), 12), { animate: true });
    if (open && mk) mk.openPopup();
    list();
  };

  function handleSpotListClick(ev) {
    const act = ev.target.closest("[data-action]");
    if (act?.dataset.action === "toggle-description") {
      ev.preventDefault();
      ev.stopPropagation();
      S.expandedDescriptions ||= new Set();
      if (S.expandedDescriptions.has(act.dataset.id)) S.expandedDescriptions.delete(act.dataset.id);
      else S.expandedDescriptions.add(act.dataset.id);
      list();
      return;
    }
    if (act?.dataset.action === "edit") return editSpot(act.dataset.id);
    if (act?.dataset.action === "delete") return removeSpot(act.dataset.id);
    const card = ev.target.closest(".spot-card");
    if (card) selectSpot(card.dataset.id, true);
  }

  function handleGroupClick(ev) {
    const button = ev.target.closest("[data-group]");
    if (button) setGroup(button.dataset.group || "all");
  }

  function installAreaVocabulary() {
    if (Array.isArray(MUNICIPAL) && !MUNICIPAL.some((m) => m.ja === HIMI_MUNICIPALITY.ja || m.en === HIMI_MUNICIPALITY.en)) {
      MUNICIPAL.splice(4, 0, { ...HIMI_MUNICIPALITY, aliases: ["氷見", "himi", "himi city"] });
    }
    Object.assign(I.ja, {
      regionEyebrow: "能登半島・氷見市",
      regionTitle: "能登・氷見の風景をめぐるデジタル美術館",
      regionCopy: "能登半島と氷見市の海、里山、集落、季節の色を写真と位置情報で記録し、世界の来訪者に紹介する地図です。",
    });
    Object.assign(I.en, {
      regionEyebrow: "Noto Peninsula and Himi City",
      regionTitle: "A digital museum for Noto and Himi landscapes",
      regionCopy: "A map sharing the sea, villages, seasons and cultural memory of the Noto Peninsula and Himi City through photos and location data.",
    });
    Object.assign(I.ko, {
      regionEyebrow: "노토반도・히미시",
      regionTitle: "노토와 히미의 풍경을 기록하는 디지털 미술관",
      regionCopy: "노토반도와 히미시의 바다, 마을, 계절과 문화의 기억을 사진과 위치 정보로 소개하는 지도입니다.",
    });
    Object.assign(I.zh, {
      regionEyebrow: "能登半岛・冰见市",
      regionTitle: "记录能登与冰见风景的数字美术馆",
      regionCopy: "用照片和位置信息介绍能登半岛与冰见市的海、村落、季节和文化记忆的地图。",
    });
  }

  function applyAreaCorrections() {
    if (!Array.isArray(S.spots)) return;
    if (S.spots === correctedSpotsRef && S.spots.length === correctedSpotsLength) return;
    S.spots.forEach((p) => {
      if (!p || !isHimiSpot(p)) return;
      p.municipality = { ...HIMI_MUNICIPALITY };
      p.group = HIMI_MUNICIPALITY.ja;
      const c = spotCoords(p);
      if (c && valid(c.lat, c.lng)) {
        p.lat = c.lat;
        p.lng = c.lng;
      }
    });
    correctedSpotsRef = S.spots;
    correctedSpotsLength = S.spots.length;
  }

  function isHimiSpot(p) {
    const haystack = [
      p.group,
      p.locationText,
      textValues(p.title),
      textValues(p.description),
      textValues(p.municipality),
    ].join("\n").toLowerCase();
    return HIMI_ALIASES.some((alias) => haystack.includes(alias.toLowerCase()));
  }

  function textValues(value) {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") return Object.values(value).join("\n");
    return String(value);
  }

  function setGroup(group) {
    S.group = group || "all";
    S.fitMapKey = "";
    S.selected = "";
    render();
  }

  function ensurePhotoLayer() {
    const mode = window.L?.markerClusterGroup ? "cluster" : "plain";
    if (S.layerMode === mode) return;
    if (S.layer && S.map?.removeLayer) S.map.removeLayer(S.layer);
    S.layer = mode === "cluster"
      ? L.markerClusterGroup({
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          spiderfyOnMaxZoom: true,
          disableClusteringAtZoom: 13,
          maxClusterRadius: 54,
          chunkedLoading: true,
        })
      : L.layerGroup();
    S.layer.addTo(S.map);
    S.layerMode = mode;
  }

  function spotCoords(p) {
    const fromText = robustCoords(p.locationText);
    const lat = Number(p.lat);
    const lng = Number(p.lng);
    if (fromText && (!valid(lat, lng) || (Math.abs(lat) < 0.000001 && Math.abs(lng) < 0.000001))) return fromText;
    return valid(lat, lng) ? { lat, lng } : fromText;
  }

  function robustCoords(value) {
    const normalized = String(value || "")
      .replace(/[’‘′＇]/g, "'")
      .replace(/[“”″]/g, '"')
      .replace(/[Ｎｎ]/g, "N")
      .replace(/[Ｓｓ]/g, "S")
      .replace(/[Ｅｅ]/g, "E")
      .replace(/[Ｗｗ]/g, "W")
      .replace(/，/g, ",");
    return coords(normalized);
  }

  function fitVisibleMarkers(bounds) {
    if (!bounds.length || !S.map?.fitBounds || !window.L?.latLngBounds) return;
    const isAll = S.group === "all";
    const targetBounds = isAll ? NOTO_BOUNDS : bounds;
    const key = `${S.group}:${isAll ? "noto" : bounds.length}:${targetBounds.map((x) => x.join(",")).join("|")}`;
    if (S.fitMapKey === key) return;
    S.fitMapKey = key;
    if (!isAll && bounds.length === 1) {
      S.map.setView(bounds[0], Math.max(S.map.getZoom(), 12), { animate: false });
      return;
    }
    S.map.fitBounds(L.latLngBounds(targetBounds), { padding: [28, 28], maxZoom: isAll ? 10 : 12, animate: false });
  }

  function injectUiFixStyles() {
    if (document.getElementById("uiMapFixStyles")) return;
    const style = document.createElement("style");
    style.id = "uiMapFixStyles";
    style.textContent = `
      .spot-description { white-space: pre-line; }
      .spot-more-button { min-height: 28px; margin-top: 4px; font-size: .78rem; font-weight: 800; color: var(--navy-800); }
      .spot-more-button:hover { text-decoration: underline; }
      .leaflet-popup-content .popup-card { max-height: min(70vh, 560px); overflow: auto; }
      @media (min-width: 761px) {
        .app-shell { min-height: 100vh; height: 100vh; display: flex; flex-direction: column; }
        .workspace { flex: 1; min-height: 0; overflow: hidden; }
        .panel, .drawer { min-height: 0; overscroll-behavior: contain; }
        .map-wrap { min-height: 0; height: 100%; }
        #map { min-height: 0; height: 100%; }
      }
      @media (max-width: 760px) {
        .app-shell { height: auto; min-height: 100vh; }
        .workspace, body.editor.drawer-open .workspace { overflow: visible; }
        .panel { overflow: visible; }
        .map-wrap, #map { height: 58vh; }
      }
    `;
    document.head.appendChild(style);
  }
})();
