/**
 * Resolve country names and flag emoji to production flag artwork.
 *
 * Uses FlagCDN (HTTPS, global cache, consistent 3:2 crops) so quizzes never
 * depend on emoji rendering or localhost assets.
 */

const COUNTRY_ISO: Record<string, string> = {
  afghanistan: "af",
  albania: "al",
  algeria: "dz",
  andorra: "ad",
  angola: "ao",
  "antigua and barbuda": "ag",
  argentina: "ar",
  armenia: "am",
  australia: "au",
  austria: "at",
  azerbaijan: "az",
  bahamas: "bs",
  bahrain: "bh",
  bangladesh: "bd",
  barbados: "bb",
  belarus: "by",
  belgium: "be",
  belize: "bz",
  benin: "bj",
  bhutan: "bt",
  bolivia: "bo",
  "bosnia and herzegovina": "ba",
  botswana: "bw",
  brazil: "br",
  brunei: "bn",
  bulgaria: "bg",
  "burkina faso": "bf",
  burundi: "bi",
  "cabo verde": "cv",
  "cape verde": "cv",
  cambodia: "kh",
  cameroon: "cm",
  canada: "ca",
  "central african republic": "cf",
  chad: "td",
  chile: "cl",
  china: "cn",
  colombia: "co",
  comoros: "km",
  congo: "cg",
  "republic of the congo": "cg",
  "democratic republic of the congo": "cd",
  "dr congo": "cd",
  "costa rica": "cr",
  "cote divoire": "ci",
  "côte d'ivoire": "ci",
  "ivory coast": "ci",
  croatia: "hr",
  cuba: "cu",
  cyprus: "cy",
  czechia: "cz",
  "czech republic": "cz",
  denmark: "dk",
  djibouti: "dj",
  dominica: "dm",
  "dominican republic": "do",
  ecuador: "ec",
  egypt: "eg",
  "el salvador": "sv",
  england: "gb-eng",
  "equatorial guinea": "gq",
  eritrea: "er",
  estonia: "ee",
  eswatini: "sz",
  swaziland: "sz",
  ethiopia: "et",
  fiji: "fj",
  finland: "fi",
  france: "fr",
  gabon: "ga",
  gambia: "gm",
  "the gambia": "gm",
  georgia: "ge",
  germany: "de",
  ghana: "gh",
  greece: "gr",
  grenada: "gd",
  guatemala: "gt",
  guinea: "gn",
  "guinea-bissau": "gw",
  guyana: "gy",
  haiti: "ht",
  honduras: "hn",
  hungary: "hu",
  iceland: "is",
  india: "in",
  indonesia: "id",
  iran: "ir",
  iraq: "iq",
  ireland: "ie",
  israel: "il",
  italy: "it",
  jamaica: "jm",
  japan: "jp",
  jordan: "jo",
  kazakhstan: "kz",
  kenya: "ke",
  kiribati: "ki",
  kuwait: "kw",
  kyrgyzstan: "kg",
  laos: "la",
  latvia: "lv",
  lebanon: "lb",
  lesotho: "ls",
  liberia: "lr",
  libya: "ly",
  liechtenstein: "li",
  lithuania: "lt",
  luxembourg: "lu",
  madagascar: "mg",
  malawi: "mw",
  malaysia: "my",
  maldives: "mv",
  mali: "ml",
  malta: "mt",
  "marshall islands": "mh",
  mauritania: "mr",
  mauritius: "mu",
  mexico: "mx",
  micronesia: "fm",
  "federated states of micronesia": "fm",
  moldova: "md",
  monaco: "mc",
  mongolia: "mn",
  montenegro: "me",
  morocco: "ma",
  mozambique: "mz",
  myanmar: "mm",
  namibia: "na",
  nauru: "nr",
  nepal: "np",
  netherlands: "nl",
  "the netherlands": "nl",
  "new zealand": "nz",
  nicaragua: "ni",
  niger: "ne",
  nigeria: "ng",
  "north korea": "kp",
  "north macedonia": "mk",
  macedonia: "mk",
  norway: "no",
  oman: "om",
  pakistan: "pk",
  palau: "pw",
  palestine: "ps",
  panama: "pa",
  "papua new guinea": "pg",
  paraguay: "py",
  peru: "pe",
  philippines: "ph",
  poland: "pl",
  portugal: "pt",
  qatar: "qa",
  romania: "ro",
  russia: "ru",
  rwanda: "rw",
  "saint kitts and nevis": "kn",
  "saint lucia": "lc",
  "saint vincent and the grenadines": "vc",
  samoa: "ws",
  "san marino": "sm",
  "sao tome and principe": "st",
  "saudi arabia": "sa",
  scotland: "gb-sct",
  senegal: "sn",
  serbia: "rs",
  seychelles: "sc",
  "sierra leone": "sl",
  singapore: "sg",
  slovakia: "sk",
  slovenia: "si",
  "solomon islands": "sb",
  somalia: "so",
  "south africa": "za",
  "south korea": "kr",
  "south sudan": "ss",
  spain: "es",
  "sri lanka": "lk",
  sudan: "sd",
  suriname: "sr",
  sweden: "se",
  switzerland: "ch",
  syria: "sy",
  taiwan: "tw",
  tajikistan: "tj",
  tanzania: "tz",
  thailand: "th",
  "timor-leste": "tl",
  "east timor": "tl",
  togo: "tg",
  tonga: "to",
  "trinidad and tobago": "tt",
  tunisia: "tn",
  turkey: "tr",
  turkiye: "tr",
  türkiye: "tr",
  turkmenistan: "tm",
  tuvalu: "tv",
  uganda: "ug",
  ukraine: "ua",
  "united arab emirates": "ae",
  uae: "ae",
  "united kingdom": "gb",
  uk: "gb",
  "great britain": "gb",
  "united states": "us",
  "united states of america": "us",
  usa: "us",
  uruguay: "uy",
  uzbekistan: "uz",
  vanuatu: "vu",
  "vatican city": "va",
  venezuela: "ve",
  vietnam: "vn",
  wales: "gb-wls",
  yemen: "ye",
  zambia: "zm",
  zimbabwe: "zw",
};

function normaliseName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** ISO 3166-1 alpha-2 (or FlagCDN subdivision) for a country label. */
export function isoFromCountryName(name: string | undefined | null): string | null {
  if (!name) return null;
  const key = normaliseName(name);
  if (!key) return null;
  if (COUNTRY_ISO[key]) return COUNTRY_ISO[key] ?? null;
  if (/^[a-z]{2}$/.test(key)) return key;
  if (/^[a-z]{2} [a-z]{3}$/.test(key)) return key.replace(" ", "-");
  return null;
}

/** Regional-indicator emoji (🇯🇵) → jp. */
export function isoFromFlagEmoji(glyph: string | undefined | null): string | null {
  if (!glyph) return null;
  const codes = Array.from(glyph, (char) => char.codePointAt(0) ?? 0);
  if (
    codes.length >= 2 &&
    codes[0]! >= 0x1f1e6 &&
    codes[0]! <= 0x1f1ff &&
    codes[1]! >= 0x1f1e6 &&
    codes[1]! <= 0x1f1ff
  ) {
    const a = String.fromCharCode(codes[0]! - 0x1f1e6 + 65);
    const b = String.fromCharCode(codes[1]! - 0x1f1e6 + 65);
    return `${a}${b}`.toLowerCase();
  }
  // Black flag tag sequences: England, Scotland, Wales.
  if (codes[0] === 0x1f3f4 && codes.includes(0xe007f)) {
    const tags = codes
      .filter((code) => code >= 0xe0061 && code <= 0xe007a)
      .map((code) => String.fromCharCode(code - 0xe0061 + 97))
      .join("");
    if (tags === "gbeng") return "gb-eng";
    if (tags === "gbsct") return "gb-sct";
    if (tags === "gbwls") return "gb-wls";
  }
  return null;
}

export function isoFromFlagArt(art: string | undefined | null): string | null {
  if (!art) return null;
  const trimmed = art.trim();
  const prefixed = trimmed.match(/^(?:flag:|flag-)([a-z]{2}(?:-[a-z]{3})?)$/i);
  if (prefixed?.[1]) return prefixed[1].toLowerCase();
  if (trimmed.toLowerCase().startsWith("flag:")) {
    return isoFromCountryName(trimmed.slice(5));
  }
  return isoFromCountryName(trimmed);
}

export function flagImageUrl(iso: string, width: 80 | 160 | 320 | 640 = 320): string {
  return `https://flagcdn.com/w${width}/${iso.toLowerCase()}.png`;
}

export function resolveFlagUrl(input: {
  glyph?: string;
  art?: string;
  label?: string;
  width?: 80 | 160 | 320 | 640;
}): string | null {
  const iso =
    isoFromFlagEmoji(input.glyph) ?? isoFromFlagArt(input.art) ?? isoFromCountryName(input.label);
  return iso ? flagImageUrl(iso, input.width ?? 320) : null;
}
