// Korean translations - using English as fallback for now
// Professional translation recommended
export default {
  common: {
    appName: 'A3Note',
    save: '저장',
    cancel: '취소',
    delete: '삭제',
    rename: '이름 바꾸기',
    close: '닫기',
    open: '열기',
    create: '만들기',
    edit: '편집',
    copy: '복사',
    paste: '붙여넣기',
    cut: '잘라내기',
    undo: '실행 취소',
    redo: '다시 실행',
    yes: '예',
    no: '아니오',
    ok: '확인',
    loading: '로딩 중...',
    saving: '저장 중...',
    saved: '저장됨',
    error: '오류',
    success: '성공',
    warning: '경고',
    info: '정보'
  },
  toolbar: {
    toggleSidebar: '사이드바 전환',
    openWorkspace: '작업 공간 열기',
    newFile: '새 파일',
    newFileShortcut: '새 파일 (⌘+N)',
    save: '저장',
    saveShortcut: '저장 (⌘+S)',
    saving: '저장 중...',
    search: '검색',
    searchShortcut: '검색 (⌘+Shift+F)',
    settings: '설정',
    themeToggle: '테마 전환',
    switchToLight: '라이트 모드로 전환',
    switchToDark: '다크 모드로 전환'
  },
  sidebar: {
    title: '파일',
    refresh: '새로 고침',
    delete: '삭제',
    noFiles: '파일이 없습니다. 첫 번째 노트를 만드세요!',
    file: '파일',
    folder: '폴더',
    contextMenu: {
      open: '열기',
      rename: '이름 바꾸기',
      delete: '삭제',
      copyPath: '경로 복사',
      newFile: '새 파일',
      newFolder: '새 폴더'
    },
    prompts: {
      enterFileName: '파일 이름을 입력하세요:',
      enterFolderName: '폴더 이름을 입력하세요:',
      enterNewName: '새 이름을 입력하세요:',
      confirmDelete: '이 파일을 삭제하시겠습니까?'
    }
  },
  settings: {
    title: '설정',
    appearance: '외관',
    editor: '편집기',
    behavior: '동작',
    language: '언어',
    theme: '테마',
    fontSize: '글꼴 크기',
    fontFamily: '글꼴',
    lineHeight: '줄 높이',
    tabSize: '탭 크기',
    autoSave: '자동 저장',
    autoSaveDelay: '자동 저장 지연',
    spellCheck: '맞춤법 검사',
    wordWrap: '자동 줄 바꿈',
    showLineNumbers: '줄 번호 표시',
    showMinimap: '미니맵 표시',
    save: '저장',
    reset: '기본값으로 재설정',
    close: '닫기',
    themes: {
      light: '라이트',
      dark: '다크',
      darkWarm: '다크 (따뜻한)'
    },
    languages: {
      'zh-CN': '中文（简体）',
      'en-US': 'English',
      'ja-JP': '日本語',
      'ko-KR': '한국어',
      'zh-TW': '中文（繁體）',
      'th-TH': 'ไทย',
      'vi-VN': 'Tiếng Việt',
      'id-ID': 'Bahasa Indonesia',
      'ms-MY': 'Bahasa Melayu',
      'hi-IN': 'हिन्दी',
      'fr-FR': 'Français',
      'de-DE': 'Deutsch',
      'es-ES': 'Español',
      'it-IT': 'Italiano',
      'pt-BR': 'Português',
      'ru-RU': 'Русский',
      'pl-PL': 'Polski',
      'nl-NL': 'Nederlands',
      'sv-SE': 'Svenska',
      'tr-TR': 'Türkçe',
      'ar-SA': 'العربية',
      'he-IL': 'עברית',
      'fa-IR': 'فارسی',
      'uk-UA': 'Українська'
    },
    messages: {
      saved: '설정이 저장되었습니다',
      reset: '설정이 재설정되었습니다'
    }
  },
  commandPalette: {
    placeholder: '명령 검색...',
    noResults: '명령을 찾을 수 없습니다',
    commands: {
      newFile: '새 파일',
      saveFile: '파일 저장',
      openWorkspace: '작업 공간 열기',
      toggleSidebar: '사이드바 전환',
      toggleSearch: '검색 전환',
      togglePreview: '미리보기 전환'
    },
    shortcuts: {
      cmdN: '⌘+N',
      cmdS: '⌘+S',
      cmdB: '⌘+B',
      cmdShiftF: '⌘+Shift+F',
      cmdE: '⌘+E'
    }
  },
  statusBar: {
    words: '단어',
    lines: '줄',
    characters: '문자',
    position: 'Ln {{line}}, Col {{column}}',
    language: 'Markdown',
    noFile: '열린 파일 없음'
  },
  welcome: {
    title: 'A3Note에 오신 것을 환영합니다',
    subtitle: '현대적인 Markdown 노트 앱',
    openWorkspace: '작업 공간 열기',
    description: '시작하려면 폴더를 선택하세요',
    features: {
      title: '기능',
      markdown: 'Markdown 지원',
      preview: '실시간 미리보기',
      search: '전체 텍스트 검색',
      themes: '여러 테마'
    }
  },
  messages: {
    errors: {
      fileNotFound: '파일을 찾을 수 없습니다',
      cannotReadFile: '파일을 읽을 수 없습니다',
      cannotSaveFile: '파일을 저장할 수 없습니다',
      cannotDeleteFile: '파일을 삭제할 수 없습니다',
      cannotCreateFile: '파일을 만들 수 없습니다',
      invalidFileName: '잘못된 파일 이름',
      fileAlreadyExists: '파일이 이미 존재합니다'
    },
    success: {
      fileSaved: '파일이 저장되었습니다',
      fileDeleted: '파일이 삭제되었습니다',
      fileCreated: '파일이 생성되었습니다',
      fileRenamed: '파일 이름이 변경되었습니다'
    },
    confirmations: {
      deleteFile: '"{{fileName}}"을(를) 삭제하시겠습니까?',
      unsavedChanges: '저장되지 않은 변경 사항이 있습니다. 저장하시겠습니까?'
    }
  }
};
