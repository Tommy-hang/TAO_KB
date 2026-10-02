export interface LLMProvider {
  generate(input: { system: string; prompt: string; temperature?: number }): Promise<string>;
}
export class CompatibleProvider implements LLMProvider {
  private base: string;
  private key: string;
  private model: string;
  constructor() {
    this.base = process.env.KB_LLM_BASE_URL || '';
    this.key = process.env.KB_LLM_API_KEY || '';
    this.model = process.env.KB_LLM_MODEL || '';
    if (!this.base || !this.key || !this.model)
      throw new Error(
        'API 模式需要 KB_LLM_API_KEY、KB_LLM_BASE_URL、KB_LLM_MODEL；也可以使用默认手动模式。',
      );
    const url = new URL(this.base);
    if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname))
      throw new Error('远程 Provider 必须使用 HTTPS。');
  }
  async generate({
    system,
    prompt,
    temperature = 0.2,
  }: {
    system: string;
    prompt: string;
    temperature?: number;
  }) {
    const response = await fetch(`${this.base.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        temperature,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
      }),
      signal: AbortSignal.timeout(180000),
    });
    if (!response.ok)
      throw new Error(
        `Provider 请求失败（HTTP ${response.status}）。请检查模型、地址及账户权限；没有记录密钥或请求正文。`,
      );
    const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Provider 返回空内容。');
    return content;
  }
}
