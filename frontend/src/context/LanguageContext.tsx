import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'es' | 'fr' | 'ar' | 'pt' | 'de' | 'ja';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

export const translations: Translations = {
  welcome: {
    en: "👋 Welcome to OmniStadium! I'm your AI matchday assistant. Ask me to find the shortest food queues, navigate to your seat, or check the weather!",
    es: "👋 ¡Bienvenido a OmniStadium! Soy tu asistente de IA. Pídeme encontrar las colas de comida más cortas o revisar el clima.",
    fr: "👋 Bienvenue à OmniStadium! Je suis votre assistant IA. Demandez-moi de trouver les files d'attente les plus courtes ou de vérifier la météo!",
    ar: "👋 مرحبًا بك في OmniStadium! أنا مساعد الذكاء الاصطناعي الخاص بك في يوم المباراة. اسألني للعثور على أقصر طوابير الطعام أو التحقق من الطقس!",
    pt: "👋 Bem-vindo ao OmniStadium! Sou seu assistente de IA. Peça-me para encontrar as filas de comida mais curtas ou verificar o clima!",
    de: "👋 Willkommen im OmniStadium! Ich bin dein KI-Assistent. Frag mich nach den kürzesten Essensschlangen oder dem Wetter!",
    ja: "👋 OmniStadiumへようこそ！私はAIアシスタントです。一番短い食事の列を見つけたり、天気をチェックしたりしてください！"
  },
  assistant_title: {
    en: "Fan Assistant",
    es: "Asistente de Fan",
    fr: "Assistant Fan",
    ar: "مساعد المشجع",
    pt: "Assistente de Fã",
    de: "Fan-Assistent",
    ja: "ファンアシスタント"
  },
  seat: {
    en: "Seat: North Lower, Row B",
    es: "Asiento: Norte Inferior, Fila B",
    fr: "Siège: Nord Inférieur, Rang B",
    ar: "المقعد: شمالي سفلي، صف ب",
    pt: "Assento: Norte Inferior, Fila B",
    de: "Sitzplatz: Nord unten, Reihe B",
    ja: "座席：ノースロワー、B列"
  },
  placeholder: {
    en: "Ask your stadium assistant...",
    es: "Pregúntale a tu asistente de estadio...",
    fr: "Demandez à votre assistant de stade...",
    ar: "اسأل مساعد الملعب الخاص بك...",
    pt: "Pergunte ao seu assistente de estádio...",
    de: "Frag deinen Stadion-Assistenten...",
    ja: "スタジアムアシスタントに聞いてください..."
  },
  routed_via: {
    en: "ROUTED VIA:",
    es: "ENRUTADO POR:",
    fr: "ROUTÉ VIA:",
    ar: "موجه عبر:",
    pt: "ROTEADO VIA:",
    de: "WEITERGELEITET ÜBER:",
    ja: "ルーティング経由:"
  },
  signin: {
    en: "Sign In", es: "Iniciar sesión", fr: "Se connecter", ar: "تسجيل الدخول", pt: "Entrar", de: "Anmelden", ja: "サインイン"
  },
  hero_title: {
    en: "The Future of Stadium Intelligence.", es: "El futuro de la inteligencia de estadios.", fr: "L'avenir de l'intelligence des stades.", ar: "مستقبل ذكاء الملاعب.", pt: "O Futuro da Inteligência de Estádios.", de: "Die Zukunft der Stadionintelligenz.", ja: "スタジアム・インテリジェンスの未来。"
  },
  hero_subtitle: {
    en: "A unified AI platform for the FIFA World Cup 2026™.", es: "Una plataforma unificada de IA para la Copa Mundial de la FIFA 2026™.", fr: "Une plateforme d'IA unifiée pour la Coupe du Monde de la FIFA 2026™.", ar: "منصة ذكاء اصطناعي موحدة لكأس العالم 2026™.", pt: "Uma plataforma unificada de IA para a Copa do Mundo da FIFA 2026™.", de: "Eine einheitliche KI-Plattform für die FIFA WM 2026™.", ja: "FIFAワールドカップ2026™の統合AIプラットフォーム。"
  },
  home_team: { en: "Home", es: "Local", fr: "Domicile", ar: "صاحب الأرض", pt: "Casa", de: "Heim", ja: "ホーム" },
  away_team: { en: "Away", es: "Visitante", fr: "Extérieur", ar: "الضيف", pt: "Visitante", de: "Auswärts", ja: "アウェイ" },
  live_match: { en: "Live Match", es: "Partido en Vivo", fr: "Match en Direct", ar: "مباراة مباشرة", pt: "Partida ao Vivo", de: "Live-Spiel", ja: "ライブマッチ" },
  ops_title: { en: "Command Center", es: "Centro de Comando", fr: "Centre de Commandement", ar: "مركز القيادة", pt: "Centro de Comando", de: "Kommandozentrale", ja: "コマンドセンター" },
  ops_desc: { en: "Real-time crowd heatmaps and operational oversight.", es: "Mapas de calor de multitudes y supervisión.", fr: "Cartes thermiques des foules et supervision.", ar: "خرائط حرارية للجمهور وإشراف تشغيلي.", pt: "Mapas de calor em tempo real e supervisão.", de: "Echtzeit-Crowd-Heatmaps und Überwachung.", ja: "リアルタイムの群衆ヒートマップと監視。" },
  ops_link: { en: "Launch Dashboard", es: "Iniciar Panel", fr: "Lancer le Tableau de Bord", ar: "تشغيل لوحة المعلومات", pt: "Iniciar Painel", de: "Dashboard starten", ja: "ダッシュボードを起動" },
  fan_title: { en: "Fan Experience", es: "Experiencia del Fan", fr: "Expérience Fan", ar: "تجربة المشجع", pt: "Experiência do Fã", de: "Fan-Erlebnis", ja: "ファンエクスペリエンス" },
  fan_desc: { en: "Intelligent companion for navigation and stadium assistance.", es: "Compañero inteligente para navegación y asistencia.", fr: "Compagnon intelligent pour la navigation et l'assistance.", ar: "رفيق ذكي للتنقل ومساعدة الملعب.", pt: "Companheiro inteligente para navegação e assistência.", de: "Intelligenter Begleiter für Navigation und Assistenz.", ja: "ナビゲーションとスタジアム支援のためのインテリジェントなコンパニオン。" },
  fan_link: { en: "Open Fan App", es: "Abrir App Fan", fr: "Ouvrir l'App Fan", ar: "فتح تطبيق المشجع", pt: "Abrir App Fã", de: "Fan-App öffnen", ja: "ファンアプリを開く" }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  // Handle RTL layout for Arabic
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: keyof typeof translations) => {
    return translations[key][language] || translations[key]['en'];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
