import { z } from "zod";
import { isIP } from "node:net";

export type TavilySearchDepth = "basic" | "advanced";

export interface TavilySearchResult {
  title: string;
  url: string;
  snippet: string;
  score: number | null;
  publishedAt: string | null;
}

export interface TavilySearchResponse {
  query: string;
  searchDepth: TavilySearchDepth;
  results: TavilySearchResult[];
  creditsUsed: number;
  requestId: string | null;
  retrievedAt: string;
}

export interface WebSearchAdapter {
  search(query: string): Promise<TavilySearchResponse>;
}

const responseSchema = z.object({
  query: z.string(),
  results: z.array(z.object({
    title: z.string(),
    url: z.string(),
    content: z.string(),
    score: z.number().nullable().optional(),
    published_date: z.string().nullable().optional(),
  })).max(20),
  usage: z.object({ credits: z.number().int().min(0).max(20) }).optional(),
  request_id: z.string().nullable().optional(),
});

function normalizedPublicUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (!(["http:", "https:"] as string[]).includes(url.protocol) || url.username || url.password) return null;
    const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
    if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return null;
    if (isIP(host) === 4) {
      if (/^(127\.|0\.|10\.|192\.168\.|169\.254\.)/.test(host)) return null;
      const private172 = /^172\.(\d{1,3})\./.exec(host);
      if (private172 && Number(private172[1]) >= 16 && Number(private172[1]) <= 31) return null;
    }
    if (isIP(host) === 6 && (host === "::1" || /^(fc|fd|fe80)/i.test(host))) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export class TavilyProviderError extends Error {
  constructor(message: string, readonly status: number, readonly code: string, readonly retryable: boolean, cause?: unknown) {
    super(message, { cause });
    this.name = "TavilyProviderError";
  }
}

export class TavilySearchAdapter implements WebSearchAdapter {
  constructor(
    private readonly apiKey: string,
    private readonly options: { baseUrl?: string; searchDepth: TavilySearchDepth; maxResults: number; timeoutMs?: number },
    private readonly fetcher: typeof fetch = fetch,
  ) {
    if (!apiKey) throw new Error("TAVILY_API_KEY is required for Tavily search");
    if (options.maxResults < 1 || options.maxResults > 5) throw new Error("Tavily maxResults must be between 1 and 5");
  }

  async search(rawQuery: string): Promise<TavilySearchResponse> {
    const query = rawQuery.trim();
    if (query.length < 3 || query.length > 500) throw new Error("Tavily search query must be between 3 and 500 characters");
    let response: Response;
    try {
      response = await this.fetcher(`${(this.options.baseUrl ?? "https://api.tavily.com").replace(/\/$/, "")}/search`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          search_depth: this.options.searchDepth,
          max_results: this.options.maxResults,
          topic: "general",
          chunks_per_source: 1,
          include_published_date: true,
          include_answer: false,
          include_raw_content: false,
          include_images: false,
          include_favicon: false,
          include_usage: true,
          auto_parameters: false,
          safe_search: true,
        }),
        signal: AbortSignal.timeout(this.options.timeoutMs ?? 15_000),
      });
    } catch (error) {
      throw new TavilyProviderError("Tavily search did not respond within the configured limit.", 504, "WEB_SEARCH_TIMEOUT", true, error);
    }
    if (!response.ok) {
      const retryable = response.status === 429 || response.status >= 500;
      const message = response.status === 401 || response.status === 403
        ? "Tavily rejected the configured API key. Check TAVILY_API_KEY."
        : response.status === 429 || response.status === 432 || response.status === 433
          ? "Tavily search is rate limited or its provider usage limit has been reached."
          : "Tavily search returned an unsuccessful response.";
      throw new TavilyProviderError(message, retryable ? 503 : 502, response.status === 401 || response.status === 403 ? "WEB_SEARCH_AUTH_FAILED" : "WEB_SEARCH_FAILED", retryable);
    }
    const declaredLength = Number(response.headers.get("content-length") ?? 0);
    if (declaredLength > 256_000) throw new TavilyProviderError("Tavily response exceeded the configured size limit.", 502, "WEB_SEARCH_RESPONSE_TOO_LARGE", false);
    const text = await response.text();
    if (text.length > 256_000) throw new TavilyProviderError("Tavily response exceeded the configured size limit.", 502, "WEB_SEARCH_RESPONSE_TOO_LARGE", false);
    let parsed: z.infer<typeof responseSchema>;
    try {
      parsed = responseSchema.parse(JSON.parse(text));
    } catch (error) {
      throw new TavilyProviderError("Tavily returned an invalid response.", 502, "WEB_SEARCH_INVALID_RESPONSE", false, error);
    }
    return {
      query: parsed.query,
      searchDepth: this.options.searchDepth,
      creditsUsed: parsed.usage?.credits ?? (this.options.searchDepth === "advanced" ? 2 : 1),
      requestId: parsed.request_id ?? null,
      retrievedAt: new Date().toISOString(),
      results: parsed.results.flatMap((item) => {
        const url = normalizedPublicUrl(item.url);
        return url ? [{ title: item.title.slice(0, 300), url, snippet: item.content.slice(0, 1_500), score: item.score ?? null, publishedAt: item.published_date ?? null }] : [];
      }).slice(0, this.options.maxResults),
    };
  }
}
