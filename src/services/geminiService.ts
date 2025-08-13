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

    content.push({ role: 'model', parts: [{ text: 'あなたは優秀なマークダウン生成AIです。マークダウン生成のみを行い、その他のテキストは生成しないでください。' }] });
    
    if (prevText) {
      content.push({ role: 'model', parts: [{ text: `下記の文章から自然に繋がるようにしてください\n\n${prevText}` }] });
    }
    if (afterText) {
      content.push({ role: 'model', parts: [{ text: `生成したテキストに下記の文章が続きます。自然に繋がるようにしてください\n\n${afterText}` }] });
    }
    if (selectedText) {
      content.push({ role: 'model', parts: [{ text: `下記のテキストをユーザーの指示に従いマークダウンを修正してください。ユーザーから文字数の指示がない場合、文字数は100文字以上増やさないでください\n\n${selectedText}` }] });
    } else {
      content.push({ role: 'model', parts: [{ text: `ユーザーの指示に従い、マークダウンを生成してください。ユーザーから文字数の指示がない場合、100文字程度にしてください` }] });
    }
    content.push({ role: 'user', parts: [{ text: prompt }] });
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