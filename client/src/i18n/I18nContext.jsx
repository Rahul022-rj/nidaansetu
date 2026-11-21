import { createContext, useContext, useEffect, useMemo, useState } from "react";
import hi from "./hi.json";
import en from "./en.json";

// Tiny i18n: flat JSON dictionaries, {{var}} interpolation, Hindi (Roman script) first.
const DICTS = { hi, en };
const KEY = "nidaansetu_lang";
const Ctx = createContext(null);

function readLang() {
  try {
    return localStorage.getItem(KEY) === "en" ? "en" : "hi";
  } catch {
    return "hi";
  }
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(readLang);
  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(KEY, lang);
    } catch {
      /* storage blocked: keep in memory */
    }
  }, [lang]);

  const value = useMemo(() => {
    const t = (key, vars) => {
      let s = DICTS[lang][key] ?? DICTS.hi[key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{{${k}}}`, String(v));
      return s;
    };
    return { lang, t, toggle: () => setLang((l) => (l === "hi" ? "en" : "hi")) };
  }, [lang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useT = () => useContext(Ctx);
