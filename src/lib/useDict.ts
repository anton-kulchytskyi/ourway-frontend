"use client";

import en from "@/dictionaries/en.json";
import uk from "@/dictionaries/uk.json";

const dicts = { en, uk } as Record<string, typeof en>;

export function useDict(lang: string) {
  return dicts[lang] ?? dicts.en;
}
