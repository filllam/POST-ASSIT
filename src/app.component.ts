import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { GeminiService } from './services/gemini.service';
import { CommonModule } from '@angular/common';

type Language = 'zh-CN' | 'en' | 'fr' | 'zh-TW' | 'es' | 'ja' | 'ko';
type Mood = 'happy' | 'sad' | 'lonely' | 'tired' | 'excited' | 'angry' | 'hope' | 'advertisement';
type Tone = 'colloquial' | 'vulgar' | 'childish' | 'feminine' | 'masculine' | 'formal' | 'professional' | 'elegant' | 'classical' | 'poetic';

// Represents the language for the UI
interface UiLanguage {
  code: Language;
  name: string;
}

// Represents the language for post generation and text-to-speech
interface PostLanguage {
  code: string; // e.g., 'en-US', 'zh-CN'
  name: string;
  prompt: string;
}

interface MoodOption {
    key: Mood;
    nameKey: keyof (typeof translations)['en'];
}

interface ToneOption {
    key: Tone;
    nameKey: keyof (typeof translations)['en'];
}

const postLanguageOptions: PostLanguage[] = [
   { code: 'en-US', name: 'English', prompt: 'Use this image as inspiration to write an engaging post with a {mood} mood and a {tone} tone in English. Only provide the post content.' },
   { code: 'zh-CN', name: '简体中文', prompt: '请以此图片为灵感，用 {mood} 的心情和 {tone} 的语气，创作一个引人入胜的中文贴文。只提供贴文内容。' },
   { code: 'zh-TW', name: '繁體中文', prompt: '請以此圖片為靈感，用 {mood} 的心情與 {tone} 的語氣，創作一個引人入勝的繁體中文貼文。只提供貼文內容。' },
   { code: 'es-ES', name: 'Español', prompt: 'Usa esta imagen como inspiración para escribir una publicación atractiva con un estado de ánimo {mood} y un tono {tone} en español. Proporciona solo el contenido de la publicación.' },
   { code: 'fr-FR', name: 'Français', prompt: "Utilisez cette image comme inspiration pour écrire une publication captivante avec une humeur {mood} et un ton {tone} en français. Fournissez uniquement le contenu de la publication." },
   { code: 'ja-JP', name: '日本語', prompt: 'この画像をインスピレーションとして、{mood}な雰囲気と{tone}なトーンで魅力的な投稿を日本語で書いてください。投稿内容のみを提供してください。' },
   { code: 'ko-KR', name: '한국어', prompt: '이 이미지를 영감으로 삼아 {mood} 분위기와 {tone} 어조로 매력적인 게시물을 한국어로 작성해주세요. 게시물 내용만 제공해주세요.' }
];

const translations = {
  'en': {
    title: 'Post Generation Assistant',
    subtitle: 'Upload an image and let AI craft a post inspired by it.',
    uploadHeader: 'Your Image',
    uploadPlaceholder: 'Click to upload an image',
    selectImage: 'Select Image',
    changeImage: 'Change Image',
    downloadImage: 'Download Image',
    postHeader: 'Generated Post',
    postLanguage: 'Post Language',
    postPlaceholder: 'Your post will appear here once generated.',
    loading: 'Generating your post...',
    errorTitle: 'An error occurred',
    readPost: 'Read Post Aloud',
    stopReading: 'Stop Reading',
    copyPost: 'Copy',
    copied: 'Copied!',
    share: 'Share',
    sharePost: 'Share',
    shareOnX: 'Share on X',
    shareOnFacebook: 'Share on Facebook',
    shareOnThreads: 'Share on Threads',
    shareOnInstagram: 'Share on Instagram',
    instagramHelp: 'To share on Instagram, first post the downloaded image, then paste the copied post.',
    mood: 'Mood',
    happy: 'Happy',
    sad: 'Sad',
    lonely: 'Lonely',
    tired: 'Tired',
    excited: 'Excited',
    angry: 'Angry',
    hope: 'Hope',
    advertisement: 'Advertisement',
    generatePost: 'Generate Post',
    tone: 'Tone',
    colloquial: 'Colloquial',
    vulgar: 'Vulgar',
    childish: 'Childish',
    feminine: 'Feminine',
    masculine: 'Masculine',
    formal: 'Formal',
    professional: 'Professional',
    elegant: 'Elegant',
    classical: 'Classical',
    poetic: 'Poetic'
  },
  'zh-CN': {
    title: '贴文生成助手',
    subtitle: '上传一张图片，让 AI 为您创作一篇贴文。',
    uploadHeader: '您的图片',
    uploadPlaceholder: '点击上传图片',
    selectImage: '选择图片',
    changeImage: '更换图片',
    downloadImage: '下载图片',
    postHeader: '生成的贴文',
    postLanguage: '贴文语言',
    postPlaceholder: '您的贴文将在此生成。',
    loading: '正在生成您的贴文...',
    errorTitle: '发生错误',
    readPost: '朗读贴文',
    stopReading: '停止朗读',
    copyPost: '复制',
    copied: '已复制！',
    share: '分享',
    sharePost: '分享',
    shareOnX: '分享到 X',
    shareOnFacebook: '分享到 Facebook',
    shareOnThreads: '分享到 Threads',
    shareOnInstagram: '分享到 Instagram',
    instagramHelp: '分享到 Instagram，请先发布下载的图片，然后粘贴已复制的贴文。',
    mood: '心情',
    happy: '开心',
    sad: '悲伤',
    lonely: '孤单',
    tired: '疲倦',
    excited: '兴奋',
    angry: '愤怒',
    hope: '希望',
    advertisement: '广告',
    generatePost: '生成贴文',
    tone: '语气',
    colloquial: '口语',
    vulgar: '粗俗',
    childish: '幼稚',
    feminine: '女生',
    masculine: '男生',
    formal: '书面语',
    professional: '专业',
    elegant: '优雅',
    classical: '古典',
    poetic: '诗词'
  },
   'zh-TW': {
    title: '貼文生成助手',
    subtitle: '上傳一張圖片，讓 AI 為您創作一篇貼文。',
    uploadHeader: '您的圖片',
    uploadPlaceholder: '點擊上傳圖片',
    selectImage: '選擇圖片',
    changeImage: '更換圖片',
    downloadImage: '下載圖片',
    postHeader: '生成的貼文',
    postLanguage: '貼文語言',
    postPlaceholder: '您的貼文將在此生成。',
    loading: '正在生成您的貼文...',
    errorTitle: '發生錯誤',
    readPost: '朗讀貼文',
    stopReading: '停止朗讀',
    copyPost: '複製',
    copied: '已複製！',
    share: '分享',
    sharePost: '分享',
    shareOnX: '分享到 X',
    shareOnFacebook: '分享到 Facebook',
    shareOnThreads: '分享到 Threads',
    shareOnInstagram: '分享到 Instagram',
    instagramHelp: '分享到 Instagram，請先發布下載的圖片，然後貼上已複製的貼文。',
    mood: '心情',
    happy: '開心',
    sad: '悲傷',
    lonely: '孤單',
    tired: '疲倦',
    excited: '興奮',
    angry: '憤怒',
    hope: '希望',
    advertisement: '廣告',
    generatePost: '生成貼文',
    tone: '語氣',
    colloquial: '口語',
    vulgar: '粗俗',
    childish: '幼稚',
    feminine: '女生',
    masculine: '男生',
    formal: '書面語',
    professional: '專業',
    elegant: '優雅',
    classical: '古典',
    poetic: '詩詞'
  },
  'fr': {
    title: 'Assistant de Génération de Posts',
    subtitle: 'Téléchargez une image et laissez l\'IA créer une publication inspirée.',
    uploadHeader: 'Votre Image',
    uploadPlaceholder: 'Cliquez pour télécharger une image',
    selectImage: 'Sélectionner une image',
    changeImage: 'Changer d\'image',
    downloadImage: 'Télécharger l\'image',
    postHeader: 'Publication Générée',
    postLanguage: 'Langue de la publication',
    postPlaceholder: 'Votre publication apparaîtra ici une fois générée.',
    loading: 'Génération de votre publication...',
    errorTitle: 'Une erreur est survenue',
    readPost: 'Lire la publication à voix haute',
    stopReading: 'Arrêter la lecture',
    copyPost: 'Copier',
    copied: 'Copié !',
    share: 'Partager',
    sharePost: 'Partager',
    shareOnX: 'Partager sur X',
    shareOnFacebook: 'Partager sur Facebook',
    shareOnThreads: 'Partager sur Threads',
    shareOnInstagram: 'Partager sur Instagram',
    instagramHelp: 'Pour partager sur Instagram, publiez d\'abord l\'image téléchargée, puis collez la publication copiée.',
    mood: 'Humeur',
    happy: 'Joyeux',
    sad: 'Triste',
    lonely: 'Solitaire',
    tired: 'Fatigué',
    excited: 'Excité',
    angry: 'En colère',
    hope: 'Espoir',
    advertisement: 'Publicité',
    generatePost: 'Générer la publication',
    tone: 'Ton',
    colloquial: 'Familier',
    vulgar: 'Vulgaire',
    childish: 'Enfantin',
    feminine: 'Féminin',
    masculine: 'Masculin',
    formal: 'Formel',
    professional: 'Professionnel',
    elegant: 'Élégant',
    classical: 'Classique',
    poetic: 'Poétique'
  },
  'es': {
    title: 'Asistente de Generación de Publicaciones',
    subtitle: 'Sube una imagen y deja que la IA cree una publicación inspirada en ella.',
    uploadHeader: 'Tu Imagen',
    uploadPlaceholder: 'Haz clic para subir una imagen',
    selectImage: 'Seleccionar Imagen',
    changeImage: 'Cambiar Imagen',
    downloadImage: 'Descargar Imagen',
    postHeader: 'Publicación Generada',
    postLanguage: 'Idioma de la Publicación',
    postPlaceholder: 'Tu publicación aparecerá aquí una vez generada.',
    loading: 'Generando tu publicación...',
    errorTitle: 'Ocurrió un error',
    readPost: 'Leer Publicación en Voz Alta',
    stopReading: 'Detener Lectura',
    copyPost: 'Copiar',
    copied: '¡Copiado!',
    share: 'Compartir',
    sharePost: 'Compartir',
    shareOnX: 'Compartir en X',
    shareOnFacebook: 'Compartir en Facebook',
    shareOnThreads: 'Compartir en Threads',
    shareOnInstagram: 'Compartir en Instagram',
    instagramHelp: 'Para compartir en Instagram, primero publica la imagen descargada y luego pega la publicación copiada.',
    mood: 'Ánimo',
    happy: 'Feliz',
    sad: 'Triste',
    lonely: 'Solitario',
    tired: 'Cansado',
    excited: 'Emocionado',
    angry: 'Enojado',
    hope: 'Esperanza',
    advertisement: 'Anuncio',
    generatePost: 'Generar Publicación',
    tone: 'Tono',
    colloquial: 'Coloquial',
    vulgar: 'Vulgar',
    childish: 'Infantil',
    feminine: 'Femenino',
    masculine: 'Masculino',
    formal: 'Formal',
    professional: 'Profesional',
    elegant: 'Elegante',
    classical: 'Clásico',
    poetic: 'Poético'
  },
  'ja': {
    title: '投稿生成アシスタント',
    subtitle: '画像をアップロードして、AIにインスピレーションを得た投稿を作成させましょう。',
    uploadHeader: 'あなたの画像',
    uploadPlaceholder: 'クリックして画像をアップロード',
    selectImage: '画像を選択',
    changeImage: '画像を変更',
    downloadImage: '画像をダウンロード',
    postHeader: '生成された投稿',
    postLanguage: '投稿の言語',
    postPlaceholder: '生成されると、ここに投稿が表示されます。',
    loading: '投稿を生成中...',
    errorTitle: 'エラーが発生しました',
    readPost: '投稿を読み上げる',
    stopReading: '読み上げを停止',
    copyPost: 'コピー',
    copied: 'コピーしました！',
    share: '共有',
    sharePost: '共有',
    shareOnX: 'Xで共有',
    shareOnFacebook: 'Facebookで共有',
    shareOnThreads: 'Threadsで共有',
    shareOnInstagram: 'Instagramで共有',
    instagramHelp: 'Instagramで共有するには、まずダウンロードした画像を投稿し、次にコピーした投稿を貼り付けてください。',
    mood: '気分',
    happy: '嬉しい',
    sad: '悲しい',
    lonely: '寂しい',
    tired: '疲れた',
    excited: '興奮した',
    angry: '怒っている',
    hope: '希望',
    advertisement: '広告',
    generatePost: '投稿を生成',
    tone: 'トーン',
    colloquial: '口語',
    vulgar: '俗語',
    childish: '子供っぽい',
    feminine: '女性らしい',
    masculine: '男性らしい',
    formal: '書き言葉',
    professional: 'プロフェッショナル',
    elegant: 'エレガント',
    classical: 'クラシック',
    poetic: '詩的'
  },
  'ko': {
    title: 'AI 포스트 생성 도우미',
    subtitle: '이미지를 업로드하고 AI가 영감을 받아 포스트를 작성하게 하세요.',
    uploadHeader: '내 이미지',
    uploadPlaceholder: '클릭하여 이미지 업로드',
    selectImage: '이미지 선택',
    changeImage: '이미지 변경',
    downloadImage: '이미지 다운로드',
    postHeader: '생성된 포스트',
    postLanguage: '포스트 언어',
    postPlaceholder: '포스트가 생성되면 여기에 표시됩니다.',
    loading: '포스트 생성 중...',
    errorTitle: '오류가 발생했습니다',
    readPost: '포스트 읽어주기',
    stopReading: '읽기 중지',
    copyPost: '복사',
    copied: '복사됨!',
    share: '공유',
    sharePost: '공유',
    shareOnX: 'X에 공유',
    shareOnFacebook: 'Facebook에 공유',
    shareOnThreads: 'Threads에 공유',
    shareOnInstagram: 'Instagram에 공유',
    instagramHelp: 'Instagram에 공유하려면 먼저 다운로드한 이미지를 게시한 다음 복사한 포스트를 붙여넣으세요.',
    mood: '분위기',
    happy: '행복',
    sad: '슬픔',
    lonely: '외로움',
    tired: '피곤함',
    excited: '신남',
    angry: '화남',
    hope: '희망',
    advertisement: '광고',
    generatePost: '포스트 생성',
    tone: '어조',
    colloquial: '구어체',
    vulgar: '비속어',
    childish: '유치함',
    feminine: '여성스러움',
    masculine: '남성스러움',
    formal: '문어체',
    professional: '전문적',
    elegant: '우아함',
    classical: '고전적',
    poetic: '시적'
  }
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private geminiService = inject(GeminiService);

  // --- State Signals ---
  language = signal<Language>('zh-TW');
  uploadedImage = signal<string | null>(null);
  uploadedFile = signal<File | null>(null);
  generatedPost = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  postLanguage = signal<string>(postLanguageOptions[2].code); // Default to Traditional Chinese
  selectedMood = signal<Mood>('happy');
  selectedTone = signal<Tone>('colloquial');
  isSpeaking = signal<boolean>(false);
  isCopied = signal<boolean>(false);

  // --- Constants and Derived State ---
  readonly uiLanguages: UiLanguage[] = [
    { code: 'en', name: 'English' },
    { code: 'zh-CN', name: '简体中文' },
    { code: 'zh-TW', name: '繁體中文' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
  ];
  readonly postLanguages = postLanguageOptions;
  readonly moodOptions: MoodOption[] = [
      { key: 'happy', nameKey: 'happy' },
      { key: 'sad', nameKey: 'sad' },
      { key: 'lonely', nameKey: 'lonely' },
      { key: 'tired', nameKey: 'tired' },
      { key: 'excited', nameKey: 'excited' },
      { key: 'angry', nameKey: 'angry' },
      { key: 'hope', nameKey: 'hope' },
      { key: 'advertisement', nameKey: 'advertisement' },
  ];
   readonly toneOptions: ToneOption[] = [
      { key: 'colloquial', nameKey: 'colloquial' },
      { key: 'vulgar', nameKey: 'vulgar' },
      { key: 'childish', nameKey: 'childish' },
      { key: 'feminine', nameKey: 'feminine' },
      { key: 'masculine', nameKey: 'masculine' },
      { key: 'formal', nameKey: 'formal' },
      { key: 'professional', nameKey: 'professional' },
      { key: 'elegant', nameKey: 'elegant' },
      { key: 'classical', nameKey: 'classical' },
      { key: 'poetic', nameKey: 'poetic' },
  ];
  readonly isWebShareSupported = !!navigator.share;
  
  private synth: SpeechSynthesis;
  private utterance: SpeechSynthesisUtterance | null = null;
  
  uiText = computed(() => translations[this.language()]);
  shareText = computed(() => this.generatedPost() ?? '');
  
  shareOnXLink = computed(() => `https://twitter.com/intent/tweet?text=${encodeURIComponent(this.shareText())}`);
  shareOnFacebookLink = computed(() => `https://www.facebook.com/sharer/sharer.php?u=example.com&quote=${encodeURIComponent(this.shareText())}`);
  shareOnThreadsLink = computed(() => `https://www.threads.net/intent/post?text=${encodeURIComponent(this.shareText())}`);

  constructor() {
    this.synth = window.speechSynthesis;
    window.addEventListener('beforeunload', () => this.stopSpeech());
  }

  // --- UI Interaction Methods ---

  setUiLanguage(langCode: Language) {
    this.language.set(langCode);
  }

  triggerFileInput() {
    document.getElementById('fileInput')?.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.uploadedFile.set(file);
      const reader = new FileReader();
      reader.onload = (e) => this.uploadedImage.set(e.target?.result as string);
      reader.readAsDataURL(file);
      this.generatedPost.set(null);
      this.error.set(null);
      this.stopSpeech();
    }
  }

  setPostLanguage(langCode: any) {
    this.postLanguage.set(langCode);
  }

  setMood(mood: any) {
    this.selectedMood.set(mood);
  }

  setTone(tone: any) {
    this.selectedTone.set(tone);
  }

  async generatePost() {
    const file = this.uploadedFile();
    if (!file) return;

    this.isLoading.set(true);
    this.error.set(null);
    this.generatedPost.set(null);
    this.stopSpeech();

    try {
      const selectedLang = this.postLanguages.find(l => l.code === this.postLanguage());
      const selectedMoodText = translations[this.language()][this.selectedMood()];
      const selectedToneText = translations[this.language()][this.selectedTone()];
      
      const prompt = selectedLang?.prompt
        .replace('{mood}', selectedMoodText)
        .replace('{tone}', selectedToneText) ?? 'Write a post based on this image.';

      const post = await this.geminiService.generatePostFromImage(file, prompt);
      this.generatedPost.set(post);
    } catch (err: any) {
      this.error.set(err.message || 'An unknown error occurred.');
    } finally {
      this.isLoading.set(false);
    }
  }
  
  // --- Action Methods ---

  toggleSpeech() {
    if (this.isSpeaking()) {
      this.stopSpeech();
    } else {
      this.readAloud();
    }
  }

  private readAloud() {
    const post = this.generatedPost();
    if (!post || !this.synth) return;

    this.stopSpeech();

    this.utterance = new SpeechSynthesisUtterance(post);
    this.utterance.lang = this.postLanguage();
    
    this.utterance.onstart = () => this.isSpeaking.set(true);
    this.utterance.onend = () => this.isSpeaking.set(false);
    this.utterance.onerror = () => this.isSpeaking.set(false);
    
    this.synth.speak(this.utterance);
  }
  
  private stopSpeech() {
    if (this.synth.speaking) {
      this.synth.cancel();
      this.isSpeaking.set(false);
    }
  }

  copyPost() {
    const post = this.generatedPost();
    if (!post) return;

    navigator.clipboard.writeText(post).then(() => {
      this.isCopied.set(true);
      setTimeout(() => this.isCopied.set(false), 2000);
    });
  }

  async share() {
    const file = this.uploadedFile();
    const text = this.shareText();
    if (!file || !text || !navigator.share) return;
    
    try {
      await navigator.share({
        title: this.uiText().title,
        text: text,
        files: [file],
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }

  shareOnInstagram() {
    alert(this.uiText().instagramHelp);
  }
}