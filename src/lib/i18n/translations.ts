export const translations = {
  en: {
    // Header
    appName: 'TON Shield',
    appDescription: 'AI-powered security scanner',
    connectWallet: 'Connect Wallet',
    forTransactionAnalysis: 'For transaction analysis',
    
    // Quick Check
    quickCheck: 'Quick Check',
    scanLinkBot: 'Scan Link/Telegram Bots',
    checkURLBotSafety: 'Check URL & Bot safety',
    address: 'Address',
    checkWallet: 'Check wallet',
    jetton: 'Jetton',
    analyzeToken: 'Analyze token',
    walletConnections: 'Wallet Connections',
    domainsTokensNFTs: 'Domains, Tokens, NFTs',
    
    // Recent Activity
    recentActivity: 'Recent Activity',
    recentHistory: 'Recent History',
    viewAll: 'View All',
    loading: 'Loading...',
    noActivity: 'No recent activity',
    
    // History types
    linkCheck: 'Link Check',
    addressCheck: 'Address Check',
    jettonCheck: 'Jetton Check',
    transactionCheck: 'Transaction Check',
    transaction: 'Transaction',
    
    // Risk levels
    safe: 'SAFE',
    warning: 'WARNING',
    critical: 'CRITICAL',
    
    // Theme
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    
    // Navigation
    home: 'Home',
    dashboard: 'Dashboard',
    settings: 'Settings',
  },
  ru: {
    // Header
    appName: 'TON Shield',
    appDescription: 'AI сканер безопасности',
    connectWallet: 'Подключить Кошелёк',
    forTransactionAnalysis: 'Для анализа транзакций',
    
    // Quick Check
    quickCheck: 'Быстрая Проверка',
    scanLinkBot: 'Проверить Ссылку/Telegram Ботов',
    checkURLBotSafety: 'Проверить URL и безопасность ботов',
    address: 'Адрес',
    checkWallet: 'Проверить кошелёк',
    jetton: 'Жеттон',
    analyzeToken: 'Анализ токена',
    walletConnections: 'Подключения Кошелька',
    domainsTokensNFTs: 'Домены, Токены, NFT',
    
    // Recent Activity
    recentActivity: 'Недавняя Активность',
    recentHistory: 'Недавняя История',
    viewAll: 'Показать Всё',
    loading: 'Загрузка...',
    noActivity: 'Нет недавней активности',
    
    // History types
    linkCheck: 'Проверка Ссылки',
    addressCheck: 'Проверка Адреса',
    jettonCheck: 'Проверка Жеттона',
    transactionCheck: 'Проверка Транзакции',
    transaction: 'Транзакция',
    
    // Risk levels
    safe: 'БЕЗОПАСНО',
    warning: 'ВНИМАНИЕ',
    critical: 'КРИТИЧНО',
    
    // Theme
    lightMode: 'Светлая Тема',
    darkMode: 'Тёмная Тема',
    
    // Navigation
    home: 'Главная',
    dashboard: 'Панель',
    settings: 'Настройки',
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
