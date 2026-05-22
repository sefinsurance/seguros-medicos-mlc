import React, { useState } from "react";
import ContactBar from "@/components/home/ContactBar";

export default function NewsTopBar({ initialLang = "en" }) {
  const [lang, setLang] = useState(initialLang);
  return <ContactBar lang={lang} setLang={setLang} />;
}
