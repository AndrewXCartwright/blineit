import { Link } from "react-router-dom";
import { Twitter, Linkedin, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © {currentYear} The Origin. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Powered by B-LINE-IT Inc.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link 
              to="/terms" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("footer.terms", "Terms of Service")}
            </Link>
            <span className="text-muted-foreground/50">|</span>
            <Link 
              to="/privacy" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("footer.privacy", "Privacy Policy")}
            </Link>
            <span className="text-muted-foreground/50">|</span>
            <Link 
              to="/contact-support" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("footer.contact", "Contact")}
            </Link>
          </nav>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a 
              href="https://twitter.com/theorigin_io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-full"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a 
              href="https://linkedin.com/company/theorigin" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-full"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a 
              href="https://discord.gg/theorigin" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-full"
              aria-label="Discord"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;