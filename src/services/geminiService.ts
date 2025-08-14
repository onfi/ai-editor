import { GoogleGenAI, type Content } from '@google/genai';

export interface AIRequest {
  prompt: string;
  prevText?: string;
  selectedText?: string;
  afterText?: string;
}

export interface AIResponse {
  text: string;
  success: boolean;
  error?: string;
}

export class GeminiService {
  private client: GoogleGenAI | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.initialize(apiKey);
    }
  }

  initialize(apiKey: string) {
    try {
      this.client = new GoogleGenAI({ apiKey });
    } catch (error) {
      console.error('Failed to initialize Gemini client:', error);
      this.client = null;
    }
  }

  private buildPrompt(request: AIRequest): Content[] {
    const content: Content[] = [];
    const { prompt, prevText, selectedText, afterText } = request;

    let systemPrompt = 'あなたは万人受けするゴーストライターです。プロンプトに沿った自然なテキスト生成を行います。あなたの応答やユーザーへの指示などは生成しないでください。';
    if(prevText || afterText) {
      systemPrompt += `\n\n下記の書きかけのテキストの{ここに生成}に入れる文章を生成してください。\n\n---\n\n${prevText}\n\n{ここに生成}\n\n${afterText}`
    }
    content.push({ role: 'user', parts: [{ text: systemPrompt }] });

    content.push({ role: 'model', parts: [{ text: `承知しました。プロンプトをどうぞ。` }] });

    if(selectedText) {
      content.push({ role: 'user', parts: [{ text: prompt + `\n\n下記の---以降の文章を変更してください。\n\n---\n\n${selectedText}` }] });
    } else {
      content.push({ role: 'user', parts: [{ text: prompt }] });
    }
    return content;
  }

  async generateText(request: AIRequest): Promise<AIResponse> {
    if (!this.client) {
      return {
        text: '',
        success: false,
        error: 'Gemini APIが初期化されていません。設定でAPIキーを確認してください。'
      };
    }

    try {      
      const result = await this.client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: this.buildPrompt(request)
      });

      return {
        text: result.text || '',
        success: true
      };
    } catch (error: any) {
      console.error('Gemini API error:', error);
      
      let errorMessage = 'AIテキスト生成中にエラーが発生しました。';
      
      if (error.status === 400) {
        errorMessage = 'リクエストが無効です。プロンプトを確認してください。';
      } else if (error.status === 401) {
        errorMessage = 'APIキーが無効です。設定で確認してください。';
      } else if (error.status === 429) {
        errorMessage = 'API使用制限に達しました。しばらく待ってから再試行してください。';
      } else if (error.status === 500) {
        errorMessage = 'Gemini APIサーバーでエラーが発生しました。';
      }

      return {
        text: '',
        success: false,
        error: errorMessage
      };
    }
  }

  isInitialized(): boolean {
    return this.client !== null;
  }
}

// シングルトンインスタンス
let geminiService: GeminiService | null = null;

export const getGeminiService = (apiKey?: string): GeminiService => {
  if (!geminiService) {
    geminiService = new GeminiService(apiKey);
  } else if (apiKey && !geminiService.isInitialized()) {
    geminiService.initialize(apiKey);
  }
  
  return geminiService;
};

export default GeminiService;