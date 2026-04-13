const API_BASE_URL = 'http://localhost:4000/api';

type RequestOptions = RequestInit & {
    json?: unknown;
};

export async function apiRequest<T = any>(
    path: string,
    options: RequestOptions = {},
): Promise<T> {
    const { json, headers, ...rest } = options;

    const response = await fetch(`${API_BASE_URL}${path}`, {
        credentials: 'include',
        headers: {
            ...(json ? { 'Content-Type': 'application/json' } : {}),
            ...(headers || {}),
        },
        body: json ? JSON.stringify(json) : rest.body,
        ...rest,
    });

    let data: any = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        throw new Error(data?.message || 'Ошибка запроса');
    }

    return data as T;
}