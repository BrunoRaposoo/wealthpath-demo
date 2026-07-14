"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { type Locale, routing } from "@/i18n/routing";

const FLAGS: Record<Locale, string> = {
  "pt-BR": "🇧🇷",
  "en-GB": "🇬🇧",
};

export function LocaleSwitcher() {
  const t = useTranslations("Nav");
  const tl = useTranslations("Locale");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onSelect(next: Locale) {
    if (next === locale || isPending) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={t("languageLabel")}
            className="w-9 h-9 rounded-full bg-[linear-gradient(135deg,#1868e0,#4f9dff)] text-white grid place-items-center font-bold text-sm"
          />
        }
      >
        <span aria-hidden="true">{FLAGS[locale as Locale]}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((l) => (
          <DropdownMenuItem
            key={l}
            onSelect={() => onSelect(l)}
            className="flex items-center gap-2"
          >
            <span aria-hidden="true">{FLAGS[l]}</span>
            <span>{tl(l)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
