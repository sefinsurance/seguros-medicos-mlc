import React, { useEffect, useState } from "react";
import ContactBar from "@/components/home/ContactBar";

export default function NewsTopBar({ initialLang = "en" }) {
  const [lang, setLang] = useState(initialLang);
  // Hydrate from localStorage on mount so the toggle starts on the user's
  // remembered choice. ContactBar's own effect handles persistence going
  // forward; doing it here too avoids a one-frame flash of the default.
  useEffect(() => {
    try {
      const stored = localStorage.getItem("mlc_lang");
      if (stored === "en" || stored === "es") setLang(stored);
    } catch {}
  }, []);
  return <ContactBar lang={lang} setLang={setLang} />;
}
