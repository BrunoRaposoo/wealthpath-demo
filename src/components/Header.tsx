import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Link } from "@/i18n/navigation";

export function Header() {
  const t = useTranslations("Nav");
  return (
    <header className="flex items-center justify-between px-6 py-3.5">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8.5 h-8.5 rounded-[10px] bg-[linear-gradient(135deg,#0f9d76,#16c79a)] grid place-items-center text-white font-extrabold text-sm">
            W
          </div>
          <span className="font-extrabold text-lg">WealthPath</span>
        </div>
        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className="px-3.5 py-2 rounded-full font-semibold text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
          >
            {t("home")}
          </Link>
          <Link
            href="/projection"
            className="px-3.5 py-2 rounded-full font-semibold text-sm bg-accent text-accent-foreground cursor-pointer"
          >
            {t("projection")}
          </Link>
          <span className="px-3.5 py-2 rounded-full font-semibold text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            {t("reports")}
          </span>
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
