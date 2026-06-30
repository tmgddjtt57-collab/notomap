(() => {
  const NOTO_TOWN = { ja: "能登町", en: "Noto Town", ko: "노토초", zh: "能登町" };
  const NOTO_TOWN_ALIASES = ["#nototown", "nototown", "noto town"];

  addAliases("Noto Town", NOTO_TOWN_ALIASES);

  const baseRender = render;
  render = function () {
    correctDefaultAreaGroups();
    baseRender();
  };

  function correctDefaultAreaGroups() {
    if (!Array.isArray(S.spots)) return;
    S.spots.forEach((p) => {
      if (!p || !isDefaultArea(p) || !hasAlias(p, NOTO_TOWN_ALIASES)) return;
      p.municipality = { ...NOTO_TOWN };
      p.group = NOTO_TOWN.ja;
    });
  }

  function isDefaultArea(p) {
    const group = p.group || p.municipality?.ja || "";
    return !group || group === "能登半島" || p.municipality?.en === "Noto Peninsula";
  }

  function hasAlias(p, aliases) {
    const text = [
      p.group,
      p.locationText,
      values(p.title),
      values(p.description),
      values(p.municipality),
    ].join("\n").toLowerCase();
    return aliases.some((alias) => text.includes(alias.toLowerCase()));
  }

  function values(value) {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") return Object.values(value).join("\n");
    return String(value);
  }

  function addAliases(enName, aliases) {
    const item = Array.isArray(MUNICIPAL) ? MUNICIPAL.find((m) => m.en === enName) : null;
    if (!item) return;
    item.aliases ||= [];
    aliases.forEach((alias) => {
      if (!item.aliases.some((x) => x.toLowerCase() === alias.toLowerCase())) item.aliases.push(alias);
    });
  }
})();
