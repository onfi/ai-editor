import { GoogleGenerativeAI } from '@google/genai';

export interface AIRequest {
  prompt: string;
  context?: string;
  selectedText?: string;
  type: 'generate' | 'edit' | 'summarize' | 'translate' | 'improve';
}

export interface AIResponse {
  text: string;
  success: boolean;
  error?: string;
}

export class GeminiService {
  private client: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.initialize(apiKey);
    }
  }

  initialize(apiKey: string) {
    try {
      this.client = new GoogleGenerativeAI(apiKey);
      this.model = this.client.getGenerativeModel({ model: 'gemini-pro' });
    } catch (error) {
      console.error('Failed to initialize Gemini client:', error);
      this.client = null;
      this.model = null;
    }
  }

  private buildPrompt(request: AIRequest): string {
    const { prompt, context, selectedText, type } = request;
    
    let systemPrompt = '';
    
    switch (type) {
      case 'generate':
        systemPrompt = 'あなたは優秀なテキスト生成AIです。ユーザーの要求に応じて、適切で有用なテキストを生成してください。';
        break;
      case 'edit':
        systemPrompt = 'あなたは優秀な文章校正・編集AIです。選択されたテキストを改善してください。';
        break;
      case 'summarize':
        systemPrompt = 'あなたは優秀な要約AIです。提供されたテキストを簡潔に要約してください。';
        break;
      case 'translate':
        systemPrompt = 'あなたは優秀な翻訳AIです。適切な言語に翻訳してください。';
        break;
      case 'improve':
        systemPrompt = 'あなたは優秀な文章改善AIです。提供されたテキストをより良く改善してください。';
        break;
      default:
        systemPrompt = 'あなたは優秀なAIアシスタントです。';
    }

    let fullPrompt = systemPrompt + '\n\n';
    
    if (selectedText) {
      fullPrompt += `選択されたテキスト:\n${selectedText}\n\n`;
    }
    
    if (context && context !== selectedText) {
      fullPrompt += `コンテキスト:\n${context}\n\n`;
    }
    
    fullPrompt += `ユーザーの要求:\n${prompt}`;
    
    return fullPrompt;
  }

  async generateText(request: AIRequest): Promise<AIResponse> {
    if (!this.model) {
      return {
        text: '',
        success: false,
        error: 'Gemini APIが初期化されていません。設定でAPIキーを確認してください。'
      };
    }

    try {
      const fullPrompt = this.buildPrompt(request);
      
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      return {
        text,
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

  async generateTextStream(
    request: AIRequest,
    onChunk: (chunk: string) => void
  ): Promise<AIResponse> {
    if (!this.model) {
      return {
        text: '',
        success: false,
        error: 'Gemini APIが初期化されていません。'
      };
    }

    try {
      const fullPrompt = this.buildPrompt(request);
      
      const result = await this.model.generateContentStream(fullPrompt);
      let fullText = '';

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        onChunk(chunkText);
      }

      return {
        text: fullText,
        success: true
      };
    } catch (error: any) {
      console.error('Gemini streaming error:', error);
      return {
        text: '',
        success: false,
        error: 'ストリーミング生成中にエラーが発生しました。'
      };
    }
  }

  isInitialized(): boolean {
    return this.client !== null && this.model !== null;
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