import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'fa' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const translations: Record<Language, Record<string, string>> = {
  fa: {
    // Navigation
    'dashboard': 'داشبورد',
    'connections': 'اتصالات',
    'panels': 'پنل‌ها',
    'device_ip': 'IP دستگاه',
    'add_device': 'افزودن دستگاه',
    'add_new_device': 'افزودن دستگاه جدید',
    'dashboard_info': 'بکاپ و اشتراک گذاری',
    'settings': 'تنظیمات',
    'logout': 'خروج',
    'main_menu': 'منوی اصلی',
    'iot_management_panel': 'پنل مدیریت آتسون',
    
    // Settings
    'appearance': 'ظاهر',
    'language': 'زبان',
    'light': 'روشن',
    'dark': 'تاریک',
    'auto': 'اتومات',
    'persian': 'فارسی',
    'english': 'انگلیسی',
    'save': 'ذخیره',
    'cancel': 'انصراف',
    'delete': 'حذف',
    'edit': 'ویرایش',
    'add': 'افزودن',
    'theme': 'تم رنگی',
    'app_language': 'زبان برنامه',
    'select_language': 'زبان مورد نظر خود را انتخاب کنید',
    'dark_theme': 'تم تاریک',
    'light_theme': 'تم روشن',
    'auto_theme': 'تم اتومات فعال شد',
    'clear_all_settings': 'پاک کردن تمام تنظیمات',
    'clear_all_settings_desc': 'همه تنظیمات پاک شده و برنامه به حالت اولیه باز می‌گردد',
    'clear_settings_confirm': 'آیا مطمئن هستید؟ این عمل تمام تنظیمات را پاک می‌کند.',
    'settings_cleared': 'تمام تنظیمات پاک شد',
    
    // Dashboard
    'no_panels': 'هیچ پنلی وجود ندارد',
    'no_panels_desc': 'پنل‌های سوییچ برای کنترل دستگاه‌های خود ایجاد کنید و از هر جا به آن‌ها دسترسی داشته باشید',
    'create_first_panel': 'ایجاد اولین پنل',
    'layout_mode_active': 'حالت چیدمان فعال - پنل‌ها را جابجا کنید',
    'confirm': 'تأیید',
    'hold_to_rearrange': 'برای تغییر چیدمان، ۳ ثانیه انگشت خود را روی صفحه نگه دارید',
    
    // Connections
    'connection_management': 'مدیریت اتصالات',
    'create_manage_mqtt': 'اتصالات MQTT خود را ایجاد و مدیریت کنید',
    'new_connection': 'اتصال جدید',
    'connection_name': 'نام اتصال',
    'broker_address': 'آدرس بروکر',
    'port': 'پورت',
    'network_protocol': 'پروتکل شبکه',
    'path': 'مسیر (Path)',
    'username': 'نام کاربری',
    'password': 'رمز عبور',
    'optional': 'اختیاری',
    'auto_connect': 'اتصال خودکار',
    'create_connection': 'ایجاد اتصال',
    'no_connections': 'هیچ اتصالی وجود ندارد',
    'no_connections_desc': 'برای شروع کار با پنل IoT، اولین اتصال MQTT خود را ایجاد کنید',
    'create_first_connection': 'ایجاد اولین اتصال',
    'enter_broker_info': 'اطلاعات بروکر MQTT خود را وارد کنید',
    'my_connection': 'اتصال من',
    
    // Switches
    'switch_panels_management': 'مدیریت پنل‌های سوییچ',
    'create_switch_panels': 'پنل‌های کنترل دستگاه‌های IoT خود را ایجاد کنید',
    'new_panel': 'پنل جدید',
    'new_switch_panel': 'پنل سوییچ جدید',
    'enter_switch_info': 'اطلاعات سوییچ خود را وارد کنید',
    'connection': 'اتصال',
    'select_connection': 'یک اتصال انتخاب کنید',
    'panel_name': 'نام پنل',
    'icon_emoji': 'آیکون (Emoji)',
    'enter_emoji': 'یک emoji برای نمایش روی دکمه وارد کنید (اختیاری)',
    'topic': 'توپیک (Topic)',
    'payload_on': 'Payload روشن',
    'payload_off': 'Payload خاموش',
    'qos_level': 'QoS Level',
    'retain_message': 'Retain Message',
    'retain_message_desc': 'پیام را در بروکر ذخیره کند تا دستگاه‌های جدید آخرین وضعیت را دریافت کنند',
    'create_panel': 'ایجاد پنل',
    'need_connection_first': 'برای ایجاد پنل سوییچ، ابتدا باید یک اتصال MQTT ایجاد کنید.',
    'main_switch': 'سوییچ اصلی',
    
    // URI Launcher
    'uri_launcher_management': 'می توانید آی پی دستگاه خود را مشاهده کنید.',
    'add_panel': 'افزودن پنل',
    'edit_panel': 'ویرایش پنل',
    'add_new_panel': 'افزودن پنل جدید',
    'enter_uri_launcher_info': 'اطلاعات URI Launcher را وارد کنید',
    'select_connection_placeholder': 'انتخاب اتصال',
    'fill_all_fields': 'لطفاً همه فیلدها را پر کنید',
    'panel_edited_success': 'پنل با موفقیت ویرایش شد',
    'panel_added_success': 'پنل با موفقیت اضافه شد',
    'panel_deleted': 'پنل حذف شد',
    'are_you_sure': 'آیا مطمئن هستید؟',
    'awaiting_receipt': 'در انتظار دریافت...',
    'uri_opened': 'URI باز شد',
    'uri_not_received': 'URI دریافت نشده است',
    'device_web_access_note': 'توجه : برای اتصال به صفحه وب خود دستگاه حتما باید به همان وایفای ای که دستگاه متصل هست متصل باشید ، در غیر این صورت دسترسی به پنل تحت وب خود دستگاه امکان پذیر نیست.',
    
    // Add Device
    'add_from_backup': 'افزودن دستگاه جدید',
    'add_from_backup_desc': 'برای افزودن دستگاه جدید فایل کانفیگ دستگاه خود را آپلود کنید.',
    'select_backup_file': 'آپلود فایل تنظیمات دستگاه جدید',
    'loading': 'در حال بارگذاری...',
    'note': 'توجه:',
    'add_not_replace_note': 'این عملیات تنظیمات جدید را به تنظیمات فعلی شما اضافه می‌کند و آن‌ها را جایگزین نمی‌کند. برای جایگزینی کامل از بخش "اطلاعات داشبورد" استفاده کنید.',
    'devices_added_success': 'دستگاه‌ها با موفقیت اضافه شدند. لطفا صفحه را رفرش کنید.',
    'file_read_error': 'خطا در خواندن فایل. لطفا از معتبر بودن فایل اطمینان حاصل کنید.',
    'add_new_devices': 'در این قسمت می توانید دستگاه های خود را اضافه کنید',
    'invalid_file': 'فایل نامعتبر است',
    
    // Device Wizard
    'step': 'مرحله',
    'of': 'از',
    'continue': 'ادامه',
    'wizard_step1_title': 'آماده‌سازی فایل کانفیگ',
    'wizard_step1_text': 'قبل از شروع ، فایل کانفیگ دستگاه خود را باید دانلود کرده و در دسترس داشته باشید ، در مرحله آخر به آن نیاز خواهیم داشت',
    'wizard_step1_checkbox': 'فایل کانفیگ را دارم و در دسترس هست',
    'wizard_step2_title': 'روشن کردن دستگاه',
    'wizard_step2_text': 'لطفا دستگاه خود را روشن کنید ، چراغ دستگاه باید به صورت مکرر چشمک بزند',
    'wizard_step2_checkbox': 'دستگاه روشن هست و درحال چشمک زدن به صورت مکرر میباشد.',
    'wizard_step3_title': 'اتصال به وایفای دستگاه',
    'wizard_step3_text': 'دستگاه شما در حالت هات اسپات قرار دارد ، لطفا اتصال به اینترنت سیم کارت خود را خاموش کنید و تنها وایفای گوشیتان را روشن بگذارید و به تنظیمات گوشی خود بروید و از قسمت وایفای به وایفای دستگاه متصل شوید. رمز وایفای دستگاه atson.ir میباشد.',
    'wizard_step3_checkbox': 'به وایفای دستگاه با موفقیت متصل شدم و اتصال برقرار است.',
    'wizard_step4_title': 'تنظیمات دستگاه',
    'wizard_step4_checkbox': 'اطلاعات مورد نظر را برای دستگاه معرفی کردم و دکمه ذخیره تنظیمات و اتصال رو زدم',
    'wizard_step5_title': 'آپلود فایل کانفیگ',
    'wizard_step5_text': 'لطفا فایل کانفیگ دستگاه خود را آپلود کنید',
    'wizard_step5_button': 'آپلود فایل کانفیگ دستگاه',
    'reload': 'بارگذاری مجدد',
    
    'backup_settings': 'پشتیبان‌گیری و بازیابی تنظیمات',
    'backup_settings_desc': 'تنظیمات و اطلاعات داشبورد خود را ذخیره یا بازیابی کنید',
    'get_backup_file': 'دریافت فایل پشتیبان',
    'restore_settings': 'بازیابی تنظیمات',
    'select_json_file': 'انتخاب فایل JSON',
    'backup_content': 'اطلاعات قابل ذخیره:',
    'backup_content_desc': 'با دریافت فایل پشتیبان تمام تنظیمات خود را ذخیره میکنید و از قسمت بازیابی تنظیمات میتوانید تنظیمات خود را آپلود کنید.',
    'mqtt_connections': 'اتصالات MQTT',
    'button_panels': 'پنل‌های دکمه',
    'switch_panels': 'پنل‌های سوییچ',
    'uri_launchers': 'لانچرهای URI',
    'app_settings': 'تنظیمات برنامه',
    'backup_downloaded': 'فایل پشتیبان دانلود شد',
    'settings_restored': 'تنظیمات با موفقیت بازیابی شدند',
    'refresh_page': 'لطفاً صفحه را رفرش کنید',
    'restore_replace_note': 'توجه: این عملیات تنظیمات جدید را به جای تنظیمات فعلی شما جایگزین می‌کند.',
    
    // Login
    'login': 'ورود',
    'enter_credentials': 'نام کاربری و رمز عبور را وارد کنید',
    'login_button': 'ورود به سیستم',
    'invalid_credentials': 'نام کاربری یا رمز عبور اشتباه است',
    
    // Common
    'success': 'موفق',
    'error': 'خطا',
    'connected': 'متصل',
    'disconnected': 'قطع شده',
    'connecting': 'در حال اتصال',
    'logout_success': 'خروج موفقیت‌آمیز',
  },
  en: {
    // Navigation
    'dashboard': 'Dashboard',
    'connections': 'Connections',
    'panels': 'Panels',
    'device_ip': 'Device IP',
    'add_device': 'Add Device',
    'add_new_device': 'Add New Device',
    'dashboard_info': 'Backup & Share',
    'settings': 'Settings',
    'logout': 'Logout',
    'main_menu': 'Main Menu',
    'iot_management_panel': 'ATSON Management Panel',
    
    // Settings
    'appearance': 'Appearance',
    'language': 'Language',
    'light': 'Light',
    'dark': 'Dark',
    'auto': 'Auto',
    'persian': 'Persian',
    'english': 'English',
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'add': 'Add',
    'theme': 'Color Theme',
    'app_language': 'App Language',
    'select_language': 'Select your preferred language',
    'dark_theme': 'Dark Theme',
    'light_theme': 'Light Theme',
    'auto_theme': 'Auto theme enabled',
    'clear_all_settings': 'Clear All Settings',
    'clear_all_settings_desc': 'All settings will be cleared and the app will return to initial state',
    'clear_settings_confirm': 'Are you sure? This will clear all settings.',
    'settings_cleared': 'All settings cleared',
    
    // Dashboard
    'no_panels': 'No Panels',
    'no_panels_desc': 'Create switch panels to control your devices and access them from anywhere',
    'create_first_panel': 'Create First Panel',
    'layout_mode_active': 'Layout mode active - drag panels to rearrange',
    'confirm': 'Confirm',
    'hold_to_rearrange': 'Hold for 3 seconds to rearrange panels',
    
    // Connections
    'connection_management': 'Connection Management',
    'create_manage_mqtt': 'Create and manage your MQTT connections',
    'new_connection': 'New Connection',
    'connection_name': 'Connection Name',
    'broker_address': 'Broker Address',
    'port': 'Port',
    'network_protocol': 'Network Protocol',
    'path': 'Path',
    'username': 'Username',
    'password': 'Password',
    'optional': 'Optional',
    'auto_connect': 'Auto Connect',
    'create_connection': 'Create Connection',
    'no_connections': 'No Connections',
    'no_connections_desc': 'Create your first MQTT connection to get started with IoT panel',
    'create_first_connection': 'Create First Connection',
    'enter_broker_info': 'Enter your MQTT broker information',
    'my_connection': 'My Connection',
    
    // Switches
    'switch_panels_management': 'Switch Panels Management',
    'create_switch_panels': 'Create control panels for your IoT devices',
    'new_panel': 'New Panel',
    'new_switch_panel': 'New Switch Panel',
    'enter_switch_info': 'Enter your switch information',
    'connection': 'Connection',
    'select_connection': 'Select a connection',
    'panel_name': 'Panel Name',
    'icon_emoji': 'Icon (Emoji)',
    'enter_emoji': 'Enter an emoji to display on the button (optional)',
    'topic': 'Topic',
    'payload_on': 'Payload On',
    'payload_off': 'Payload Off',
    'qos_level': 'QoS Level',
    'retain_message': 'Retain Message',
    'retain_message_desc': 'Store message on broker so new devices receive the latest status',
    'create_panel': 'Create Panel',
    'need_connection_first': 'You need to create an MQTT connection first to create a switch panel.',
    'main_switch': 'Main Switch',
    
    // URI Launcher
    'uri_launcher_management': 'You can view your device IP here.',
    'add_panel': 'Add Panel',
    'edit_panel': 'Edit Panel',
    'add_new_panel': 'Add New Panel',
    'enter_uri_launcher_info': 'Enter URI Launcher information',
    'select_connection_placeholder': 'Select Connection',
    'fill_all_fields': 'Please fill all fields',
    'panel_edited_success': 'Panel edited successfully',
    'panel_added_success': 'Panel added successfully',
    'panel_deleted': 'Panel deleted',
    'are_you_sure': 'Are you sure?',
    'awaiting_receipt': 'Awaiting receipt...',
    'uri_opened': 'URI opened',
    'uri_not_received': 'URI not received',
    'device_web_access_note': 'Note: To connect to your device web panel, you must be connected to the same WiFi as your device, otherwise access to the device web panel will not be possible.',
    
    // Add Device
    'add_from_backup': 'Add New Device',
    'add_from_backup_desc': 'Upload your device config file to add new device.',
    'select_backup_file': 'Upload New Device Settings File',
    'loading': 'Loading...',
    'note': 'Note:',
    'add_not_replace_note': 'This operation adds new settings to your current settings without replacing them. For complete replacement, use the "Dashboard Info" section.',
    'devices_added_success': 'Devices added successfully. Please refresh the page.',
    'file_read_error': 'Error reading file. Please make sure the file is valid.',
    'add_new_devices': 'Here you can add your devices',
    'invalid_file': 'Invalid file',
    
    // Device Wizard
    'step': 'Step',
    'of': 'of',
    'continue': 'Continue',
    'wizard_step1_title': 'Prepare Config File',
    'wizard_step1_text': 'Before starting, you need to download your device config file and have it ready. We will need it in the last step.',
    'wizard_step1_checkbox': 'I have the config file and it is accessible',
    'wizard_step2_title': 'Turn On Device',
    'wizard_step2_text': 'Please turn on your device. The device light should blink repeatedly.',
    'wizard_step2_checkbox': 'The device is on and blinking repeatedly.',
    'wizard_step3_title': 'Connect to Device WiFi',
    'wizard_step3_text': 'Your device is in hotspot mode. Please turn off your mobile data and keep only WiFi on. Go to your phone settings and connect to the device WiFi. The WiFi password is atson.ir',
    'wizard_step3_checkbox': 'I have successfully connected to the device WiFi.',
    'wizard_step4_title': 'Device Settings',
    'wizard_step4_checkbox': 'I have entered the required information for the device and pressed the save settings and connect button.',
    'wizard_step5_title': 'Upload Config File',
    'wizard_step5_text': 'Please upload your device config file',
    'wizard_step5_button': 'Upload Device Config File',
    'reload': 'Reload',
    
    'backup_settings': 'Backup and Restore Settings',
    'backup_settings_desc': 'Save or restore your dashboard settings and data',
    'get_backup_file': 'Download Backup File',
    'restore_settings': 'Restore Settings',
    'select_json_file': 'Select JSON File',
    'backup_content': 'Backup Content:',
    'backup_content_desc': 'By downloading the backup file, you save all your settings and from the restore settings section you can upload your settings.',
    'mqtt_connections': 'MQTT Connections',
    'button_panels': 'Button Panels',
    'switch_panels': 'Switch Panels',
    'uri_launchers': 'URI Launchers',
    'app_settings': 'App Settings',
    'backup_downloaded': 'Backup file downloaded',
    'settings_restored': 'Settings restored successfully',
    'refresh_page': 'Please refresh the page',
    'restore_replace_note': 'Note: This operation will replace your current settings with the new settings.',
    
    // Login
    'login': 'Login',
    'enter_credentials': 'Enter your username and password',
    'login_button': 'Sign In',
    'invalid_credentials': 'Invalid username or password',
    
    // Common
    'success': 'Success',
    'error': 'Error',
    'connected': 'Connected',
    'disconnected': 'Disconnected',
    'connecting': 'Connecting',
    'logout_success': 'Logged out successfully',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('fa');

  useEffect(() => {
    const savedLang = localStorage.getItem('app_language') as Language;
    if (savedLang && (savedLang === 'fa' || savedLang === 'en')) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const dir = language === 'fa' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};