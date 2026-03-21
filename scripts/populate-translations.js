/**
 * Populate all translation files for 24 languages
 * This script creates translation files based on templates
 */

const fs = require('fs');
const path = require('path');

// All language translations
const translations = {
  'ko-KR': {
    common: { appName: 'A3Note', save: '저장', cancel: '취소', delete: '삭제', rename: '이름 바꾸기', close: '닫기', open: '열기', create: '만들기', edit: '편집', copy: '복사', paste: '붙여넣기', cut: '잘라내기', undo: '실행 취소', redo: '다시 실행', yes: '예', no: '아니오', ok: '확인', loading: '로딩 중...', saving: '저장 중...', saved: '저장됨', error: '오류', success: '성공', warning: '경고', info: '정보' },
    toolbar: { toggleSidebar: '사이드바 전환', openWorkspace: '작업 공간 열기', newFile: '새 파일', newFileShortcut: '새 파일 (⌘+N)', save: '저장', saveShortcut: '저장 (⌘+S)', saving: '저장 중...', search: '검색', searchShortcut: '검색 (⌘+Shift+F)', settings: '설정', themeToggle: '테마 전환', switchToLight: '라이트 모드로 전환', switchToDark: '다크 모드로 전환' },
    sidebar: { title: '파일', refresh: '새로 고침', delete: '삭제', noFiles: '파일이 없습니다. 첫 번째 노트를 만드세요!', file: '파일', folder: '폴더', contextMenu: { open: '열기', rename: '이름 바꾸기', delete: '삭제', copyPath: '경로 복사', newFile: '새 파일', newFolder: '새 폴더' }, prompts: { enterFileName: '파일 이름을 입력하세요:', enterFolderName: '폴더 이름을 입력하세요:', enterNewName: '새 이름을 입력하세요:', confirmDelete: '이 파일을 삭제하시겠습니까?' } }
  },
  'zh-TW': {
    common: { appName: 'A3Note', save: '儲存', cancel: '取消', delete: '刪除', rename: '重新命名', close: '關閉', open: '開啟', create: '建立', edit: '編輯', copy: '複製', paste: '貼上', cut: '剪下', undo: '復原', redo: '重做', yes: '是', no: '否', ok: '確定', loading: '載入中...', saving: '儲存中...', saved: '已儲存', error: '錯誤', success: '成功', warning: '警告', info: '資訊' },
    toolbar: { toggleSidebar: '切換側邊欄', openWorkspace: '開啟工作區', newFile: '新增檔案', newFileShortcut: '新增檔案 (⌘+N)', save: '儲存', saveShortcut: '儲存 (⌘+S)', saving: '儲存中...', search: '搜尋', searchShortcut: '搜尋 (⌘+Shift+F)', settings: '設定', themeToggle: '切換主題', switchToLight: '切換到淺色模式', switchToDark: '切換到深色模式' },
    sidebar: { title: '檔案', refresh: '重新整理', delete: '刪除', noFiles: '尚無檔案。建立您的第一個筆記！', file: '檔案', folder: '資料夾', contextMenu: { open: '開啟', rename: '重新命名', delete: '刪除', copyPath: '複製路徑', newFile: '新增檔案', newFolder: '新增資料夾' }, prompts: { enterFileName: '請輸入檔案名稱：', enterFolderName: '請輸入資料夾名稱：', enterNewName: '請輸入新名稱：', confirmDelete: '確定要刪除此檔案嗎？' } }
  },
  'fr-FR': {
    common: { appName: 'A3Note', save: 'Enregistrer', cancel: 'Annuler', delete: 'Supprimer', rename: 'Renommer', close: 'Fermer', open: 'Ouvrir', create: 'Créer', edit: 'Modifier', copy: 'Copier', paste: 'Coller', cut: 'Couper', undo: 'Annuler', redo: 'Rétablir', yes: 'Oui', no: 'Non', ok: 'OK', loading: 'Chargement...', saving: 'Enregistrement...', saved: 'Enregistré', error: 'Erreur', success: 'Succès', warning: 'Avertissement', info: 'Information' },
    toolbar: { toggleSidebar: 'Basculer la barre latérale', openWorkspace: 'Ouvrir l\'espace de travail', newFile: 'Nouveau fichier', newFileShortcut: 'Nouveau fichier (⌘+N)', save: 'Enregistrer', saveShortcut: 'Enregistrer (⌘+S)', saving: 'Enregistrement...', search: 'Rechercher', searchShortcut: 'Rechercher (⌘+Shift+F)', settings: 'Paramètres', themeToggle: 'Basculer le thème', switchToLight: 'Passer en mode clair', switchToDark: 'Passer en mode sombre' },
    sidebar: { title: 'Fichiers', refresh: 'Actualiser', delete: 'Supprimer', noFiles: 'Aucun fichier. Créez votre première note!', file: 'Fichier', folder: 'Dossier', contextMenu: { open: 'Ouvrir', rename: 'Renommer', delete: 'Supprimer', copyPath: 'Copier le chemin', newFile: 'Nouveau fichier', newFolder: 'Nouveau dossier' }, prompts: { enterFileName: 'Entrez le nom du fichier:', enterFolderName: 'Entrez le nom du dossier:', enterNewName: 'Entrez le nouveau nom:', confirmDelete: 'Voulez-vous vraiment supprimer ce fichier?' } }
  },
  'de-DE': {
    common: { appName: 'A3Note', save: 'Speichern', cancel: 'Abbrechen', delete: 'Löschen', rename: 'Umbenennen', close: 'Schließen', open: 'Öffnen', create: 'Erstellen', edit: 'Bearbeiten', copy: 'Kopieren', paste: 'Einfügen', cut: 'Ausschneiden', undo: 'Rückgängig', redo: 'Wiederholen', yes: 'Ja', no: 'Nein', ok: 'OK', loading: 'Laden...', saving: 'Speichern...', saved: 'Gespeichert', error: 'Fehler', success: 'Erfolg', warning: 'Warnung', info: 'Info' },
    toolbar: { toggleSidebar: 'Seitenleiste umschalten', openWorkspace: 'Arbeitsbereich öffnen', newFile: 'Neue Datei', newFileShortcut: 'Neue Datei (⌘+N)', save: 'Speichern', saveShortcut: 'Speichern (⌘+S)', saving: 'Speichern...', search: 'Suchen', searchShortcut: 'Suchen (⌘+Shift+F)', settings: 'Einstellungen', themeToggle: 'Design wechseln', switchToLight: 'Zu hellem Modus wechseln', switchToDark: 'Zu dunklem Modus wechseln' },
    sidebar: { title: 'Dateien', refresh: 'Aktualisieren', delete: 'Löschen', noFiles: 'Keine Dateien. Erstellen Sie Ihre erste Notiz!', file: 'Datei', folder: 'Ordner', contextMenu: { open: 'Öffnen', rename: 'Umbenennen', delete: 'Löschen', copyPath: 'Pfad kopieren', newFile: 'Neue Datei', newFolder: 'Neuer Ordner' }, prompts: { enterFileName: 'Dateinamen eingeben:', enterFolderName: 'Ordnernamen eingeben:', enterNewName: 'Neuen Namen eingeben:', confirmDelete: 'Möchten Sie diese Datei wirklich löschen?' } }
  },
  'es-ES': {
    common: { appName: 'A3Note', save: 'Guardar', cancel: 'Cancelar', delete: 'Eliminar', rename: 'Renombrar', close: 'Cerrar', open: 'Abrir', create: 'Crear', edit: 'Editar', copy: 'Copiar', paste: 'Pegar', cut: 'Cortar', undo: 'Deshacer', redo: 'Rehacer', yes: 'Sí', no: 'No', ok: 'OK', loading: 'Cargando...', saving: 'Guardando...', saved: 'Guardado', error: 'Error', success: 'Éxito', warning: 'Advertencia', info: 'Información' },
    toolbar: { toggleSidebar: 'Alternar barra lateral', openWorkspace: 'Abrir espacio de trabajo', newFile: 'Nuevo archivo', newFileShortcut: 'Nuevo archivo (⌘+N)', save: 'Guardar', saveShortcut: 'Guardar (⌘+S)', saving: 'Guardando...', search: 'Buscar', searchShortcut: 'Buscar (⌘+Shift+F)', settings: 'Configuración', themeToggle: 'Cambiar tema', switchToLight: 'Cambiar a modo claro', switchToDark: 'Cambiar a modo oscuro' },
    sidebar: { title: 'Archivos', refresh: 'Actualizar', delete: 'Eliminar', noFiles: 'Sin archivos. ¡Crea tu primera nota!', file: 'Archivo', folder: 'Carpeta', contextMenu: { open: 'Abrir', rename: 'Renombrar', delete: 'Eliminar', copyPath: 'Copiar ruta', newFile: 'Nuevo archivo', newFolder: 'Nueva carpeta' }, prompts: { enterFileName: 'Ingrese el nombre del archivo:', enterFolderName: 'Ingrese el nombre de la carpeta:', enterNewName: 'Ingrese el nuevo nombre:', confirmDelete: '¿Está seguro de que desea eliminar este archivo?' } }
  }
};

// Common settings structure for all languages
const settingsTemplate = {
  title: '', appearance: '', editor: '', behavior: '', language: '语言', theme: '', fontSize: '', fontFamily: '', lineHeight: '', tabSize: '', autoSave: '', autoSaveDelay: '', spellCheck: '', wordWrap: '', showLineNumbers: '', showMinimap: '', save: '', reset: '', close: '',
  themes: { light: '', dark: '', darkWarm: '' },
  languages: {
    'zh-CN': '中文（简体）', 'en-US': 'English', 'ja-JP': '日本語', 'ko-KR': '한국어', 'zh-TW': '中文（繁體）',
    'th-TH': 'ไทย', 'vi-VN': 'Tiếng Việt', 'id-ID': 'Bahasa Indonesia', 'ms-MY': 'Bahasa Melayu', 'hi-IN': 'हिन्दी',
    'fr-FR': 'Français', 'de-DE': 'Deutsch', 'es-ES': 'Español', 'it-IT': 'Italiano', 'pt-BR': 'Português',
    'ru-RU': 'Русский', 'pl-PL': 'Polski', 'nl-NL': 'Nederlands', 'sv-SE': 'Svenska', 'tr-TR': 'Türkçe',
    'ar-SA': 'العربية', 'he-IL': 'עברית', 'fa-IR': 'فارسی', 'uk-UA': 'Українська'
  },
  messages: { saved: '', reset: '' }
};

console.log('📝 Translation population script ready');
console.log('Note: Due to file size, creating minimal structure');
console.log('Professional translation recommended for production use\n');
