import axios from 'axios';

export interface StackOverflowQueryPayload {
  query: string;
  tags?: string[];
  page?: number;
  pageSize?: number;
}

export interface StackOverflowQueryResult {
  success: boolean;
  data: any;
  error?: string;
}

const SO_AGENTS_BASE_URL = 'https://agents.stackoverflow.com/v1';

export async function queryStackOverflow(
  payload: StackOverflowQueryPayload,
  apiToken?: string
): Promise<StackOverflowQueryResult> {
  try {
    const response = await axios.post(
      `${SO_AGENTS_BASE_URL}/query`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          ...(apiToken && { Authorization: `Bearer ${apiToken}` }),
        },
        timeout: 10000,
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (err: any) {
    return {
      success: false,
      data: null,
      error: err.response?.data?.message || err.message || 'Unknown network error',
    };
  }
}
