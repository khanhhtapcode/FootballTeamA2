/**
 * Helper gọi REST API từ phía client (Client Components).
 *
 * - Tự set header JSON và serialize body.
 * - Nếu response không OK, đọc { error } từ body và ném Error để component bắt và toast.
 *
 * Ví dụ:
 *   await apiFetch("/api/members", { method: "POST", body: { fullName: "A" } })
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const { method = "GET", body } = options

  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const message = (data && (data as { error?: string }).error) || "Có lỗi xảy ra"
    throw new Error(message)
  }

  return data as T
}
