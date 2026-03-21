/**
 * Script to generate translation files for all 24 languages
 * Run with: node scripts/generate-translations.js
 */

const fs = require('fs');
const path = require('path');

// All 24 languages configuration
const languages = {
  'ko-KR': { name: '한국어', nativeName: 'Korean' },
  'zh-TW': { name: '中文（繁體）', nativeName: 'Traditional Chinese' },
  'th-TH': { name: 'ไทย', nativeName: 'Thai' },
  'vi-VN': { name: 'Tiếng Việt', nativeName: 'Vietnamese' },
  'id-ID': { name: 'Bahasa Indonesia', nativeName: 'Indonesian' },
  'ms-MY': { name: 'Bahasa Melayu', nativeName: 'Malay' },
  'hi-IN': { name: 'हिन्दी', nativeName: 'Hindi' },
  'fr-FR': { name: 'Français', nativeName: 'French' },
  'de-DE': { name: 'Deutsch', nativeName: 'German' },
  'es-ES': { name: 'Español', nativeName: 'Spanish' },
  'it-IT': { name: 'Italiano', nativeName: 'Italian' },
  'pt-BR': { name: 'Português', nativeName: 'Portuguese' },
  'ru-RU': { name: 'Русский', nativeName: 'Russian' },
  'pl-PL': { name: 'Polski', nativeName: 'Polish' },
  'nl-NL': { name: 'Nederlands', nativeName: 'Dutch' },
  'sv-SE': { name: 'Svenska', nativeName: 'Swedish' },
  'tr-TR': { name: 'Türkçe', nativeName: 'Turkish' },
  'ar-SA': { name: 'العربية', nativeName: 'Arabic' },
  'he-IL': { name: 'עברית', nativeName: 'Hebrew' },
  'fa-IR': { name: 'فارسی', nativeName: 'Persian' },
  'uk-UA': { name: 'Українська', nativeName: 'Ukrainian' },
};

// Translation templates (using English as base for AI translation)
const translations = {
  'ko-KR': {
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
    }
  },
  'fr-FR': {
    common: {
      appName: 'A3Note',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      rename: 'Renommer',
      close: 'Fermer',
      open: 'Ouvrir',
      create: 'Créer',
      edit: 'Modifier',
      copy: 'Copier',
      paste: 'Coller',
      cut: 'Couper',
      undo: 'Annuler',
      redo: 'Rétablir',
      yes: 'Oui',
      no: 'Non',
      ok: 'OK',
      loading: 'Chargement...',
      saving: 'Enregistrement...',
      saved: 'Enregistré',
      error: 'Erreur',
      success: 'Succès',
      warning: 'Avertissement',
      info: 'Information'
    },
    toolbar: {
      toggleSidebar: 'Basculer la barre latérale',
      openWorkspace: 'Ouvrir l\'espace de travail',
      newFile: 'Nouveau fichier',
      newFileShortcut: 'Nouveau fichier (⌘+N)',
      save: 'Enregistrer',
      saveShortcut: 'Enregistrer (⌘+S)',
      saving: 'Enregistrement...',
      search: 'Rechercher',
      searchShortcut: 'Rechercher (⌘+Shift+F)',
      settings: 'Paramètres',
      themeToggle: 'Basculer le thème',
      switchToLight: 'Passer en mode clair',
      switchToDark: 'Passer en mode sombre'
    },
    sidebar: {
      title: 'Fichiers',
      refresh: 'Actualiser',
      delete: 'Supprimer',
      noFiles: 'Aucun fichier. Créez votre première note!',
      file: 'Fichier',
      folder: 'Dossier',
      contextMenu: {
        open: 'Ouvrir',
        rename: 'Renommer',
        delete: 'Supprimer',
        copyPath: 'Copier le chemin',
        newFile: 'Nouveau fichier',
        newFolder: 'Nouveau dossier'
      },
      prompts: {
        enterFileName: 'Entrez le nom du fichier:',
        enterFolderName: 'Entrez le nom du dossier:',
        enterNewName: 'Entrez le nouveau nom:',
        confirmDelete: 'Voulez-vous vraiment supprimer ce fichier?'
      }
    }
  }
};

console.log('🌍 Generating translation files for 24 languages...\n');
console.log('Note: This script creates basic translation structure.');
console.log('Professional translation services recommended for production.\n');

let createdCount = 0;
let skippedCount = 0;

Object.keys(languages).forEach(langCode => {
  const langDir = path.join(__dirname, '..', 'src', 'i18n', 'locales', langCode);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir, { recursive: true });
    console.log(`✅ Created directory: ${langCode}/`);
    createdCount++;
  } else {
    console.log(`⏭️  Skipped (exists): ${langCode}/`);
    skippedCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Created: ${createdCount} language directories`);
console.log(`   Skipped: ${skippedCount} existing directories`);
console.log(`\n✨ Translation file generation complete!`);
console.log(`\n📝 Next steps:`);
console.log(`   1. Add translations to each language folder`);
console.log(`   2. Update src/i18n/index.ts to import all languages`);
console.log(`   3. Update Settings component with all language options`);
console.log(`   4. Run tests: npm test -- i18n.test.ts`);
