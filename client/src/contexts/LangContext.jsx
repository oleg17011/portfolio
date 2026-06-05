import { createContext, useContext, useState } from 'react';

const TRANSLATIONS = {
  ru: {
    nav_home:        'Главная',
    nav_profile:     'Профиль',
    nav_panel:       'Панель',
    nav_logout:      'Выйти',
    nav_login:       'Вход',
    nav_register:    'Регистрация',
    
    home_title:      'Моё portfolio',
    home_subtitle:   'Учебные и практические проекты',
    profile_title:   'Редактировать профиль',
    admin_title:     'Панель управления',
    all_projects:    'Все проекты',
    your_projects:   'Ваши проекты',
    admin_control:   'Управление',
    
    field_name:      'Имя',
    field_group:     'Группа',
    field_iin:       'ИИН',
    field_email:     'Email',
    field_password:  'Пароль',
    field_title:     'Название',
    field_desc:      'Описание',
    field_tech:      'Технологии (через запятую)',
    field_diploma:   'Загрузить PDF или Изображение',
    field_public:    'Публичный проект',
    field_featured:  'Избранное',
    
    btn_save:        'Сохранить',
    btn_login:       'Войти',
    btn_register:    'Зарегистрироваться',
    btn_add:         'Добавить проект',
    btn_create:      'Создать проект',
    btn_delete:      'Удалить',
    btn_upload:      'Загрузить фото',
    btn_verify:      'Подтвердить код',
    btn_choose_file: 'Выбрать файл',
    btn_publish:     'Опубликовать',
    btn_add_to_db:   'Добавить в базу',
    
    status_loading:  'Загрузка...',
    status_empty:    'Проектов пока нет',
    status_error:    'Ошибка загрузки. Проверьте сервер.',
    status_saving:   'Сохранение...',
    status_no_file:  'Файл не выбран',
    
    twofa_title:     'Введите код',
    twofa_hint:      'Мы отправили 6-значный код на ваш email',
    twofa_resend:    'Отправить снова',
    
    theme_dark:      'Тёмная тема',
    theme_light:     'Светлая тема',
  },

  en: {
    nav_home:        'Home',
    nav_profile:     'Profile',
    nav_panel:       'Panel',
    nav_logout:      'Logout',
    nav_login:       'Login',
    nav_register:    'Register',
    home_title:      'My Portfolio',
    home_subtitle:   'Academic and professional projects',
    profile_title:   'Edit Profile',
    admin_title:     'Admin Panel',
    all_projects:    'All Projects',
    your_projects:   'Your Projects',
    admin_control:   'Admin Control',
    field_name:      'Name',
    field_group:     'Group',
    field_iin:       'IIN',
    field_email:     'Email',
    field_password:  'Password',
    field_title:     'Title',
    field_desc:      'Description',
    field_tech:      'Technologies (comma-separated)',
    field_diploma:   'Upload PDF or Image',
    field_public:    'Public project',
    field_featured:  'Featured',
    btn_save:        'Save',
    btn_login:       'Sign In',
    btn_register:    'Create Account',
    btn_add:         'Add Project',
    btn_create:      'Create Project',
    btn_delete:      'Delete',
    btn_upload:      'Upload Photo',
    btn_verify:      'Verify Code',
    btn_choose_file: 'Choose File',
    btn_publish:     'Publish',
    btn_add_to_db:   'Add to Database',
    status_loading:  'Loading...',
    status_empty:    'No projects yet',
    status_error:    'Load error. Check the server.',
    status_saving:   'Saving...',
    status_no_file:  'No file selected',
    twofa_title:     'Enter Code',
    twofa_hint:      'We sent a 6-digit code to your email',
    twofa_resend:    'Resend',
    theme_dark:      'Dark Mode',
    theme_light:     'Light Mode',
  },

  kk: {
    nav_home:        'Басты бет',
    nav_profile:     'Профиль',
    nav_panel:       'Басқару',
    nav_logout:      'Шығу',
    nav_login:       'Кіру',
    nav_register:    'Тіркелу',
    home_title:      'Менің портфолиом',
    home_subtitle:   'Оқу және практикалық жобалар',
    profile_title:   'Профильді өңдеу',
    admin_title:     'Басқару панелі',
    all_projects:    'Барлық жобалар',
    your_projects:   'Сіздің жобаларыңыз',
    admin_control:   'Басқару',
    field_name:      'Аты',
    field_group:     'Топ',
    field_iin:       'ЖСН',
    field_email:     'Email',
    field_password:  'Құпия сөз',
    field_title:     'Атауы',
    field_desc:      'Сипаттама',
    field_tech:      'Технологиялар (үтірмен)',
    field_diploma:   'PDF немесе Сурет жүктеу',
    field_public:    'Ашық жоба',
    field_featured:  'Таңдаулы',
    btn_save:        'Сақтау',
    btn_login:       'Кіру',
    btn_register:    'Тіркелу',
    btn_add:         'Жоба қосу',
    btn_create:      'Жоба жасау',
    btn_delete:      'Жою',
    btn_upload:      'Фото жүктеу',
    btn_verify:      'Кодты растау',
    btn_choose_file: 'Файл таңдау',
    btn_publish:     'Жариялау',
    btn_add_to_db:   'Дерекқорға қосу',
    status_loading:  'Жүктелуде...',
    status_empty:    'Жобалар әлі жоқ',
    status_error:    'Жүктеу қатесі. Серверді тексеріңіз.',
    status_saving:   'Сақталуда...',
    status_no_file:  'Файл таңдалмаған',
    twofa_title:     'Кодты енгізіңіз',
    twofa_hint:      'Email-ге 6 таңбалы код жібердік',
    twofa_resend:    'Қайта жіберу',
    theme_dark:      'Күңгірт тақырып',
    theme_light:     'Ашық тақырып',
  },
};

const LANG_CYCLE = ['ru', 'en', 'kk'];

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('lang') || 'ru';
    return LANG_CYCLE.includes(saved) ? saved : 'ru';
  });

  const toggleLang = () => {
    const next = LANG_CYCLE[(LANG_CYCLE.indexOf(lang) + 1) % LANG_CYCLE.length];
    setLang(next);
    localStorage.setItem('lang', next);
  };

  const setLanguage = (code) => {
    if (LANG_CYCLE.includes(code)) {
      setLang(code);
      localStorage.setItem('lang', code);
    }
  };

  const t = (key) =>
    TRANSLATIONS[lang]?.[key] ??
    TRANSLATIONS['ru']?.[key] ??
    key;

  return (
    <LangContext.Provider value={{ lang, toggleLang, setLanguage, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);