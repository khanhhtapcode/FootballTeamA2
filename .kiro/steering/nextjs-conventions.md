---
inclusion: always
---

# Next.js App Router — Conventions & Coding Patterns

> Rule bắt buộc cho Kiro khi tạo, chỉnh sửa hoặc sinh code trong dự án Next.js App Router này.
> Mọi file, folder và pattern phải tuân thủ đúng chuẩn Next.js official docs.

---

## 1. PROJECT STRUCTURE

### 1.1 Quy tắc đặt tên thư mục

| Pattern          | Ý nghĩa                                     |
| ---------------- | ------------------------------------------- |
| `folder/`        | Route segment thông thường                  |
| `[folder]/`      | Dynamic segment — nhận param từ URL         |
| `[...folder]/`   | Catch-all segment                           |
| `[[...folder]]/` | Optional catch-all segment                  |
| `(folder)/`      | Route group — nhóm logic, **không vào URL** |
| `_folder/`       | Private folder — **không tham gia routing** |
| `@folder/`       | Named slot cho Parallel Routes              |

### 1.2 Các file đặc biệt (Special Files)

| File           | Extension     | Công dụng                                                       |
| -------------- | ------------- | --------------------------------------------------------------- |
| `layout`       | `.tsx` `.jsx` | Shared UI bọc quanh trang con, **không re-render khi navigate** |
| `page`         | `.tsx` `.jsx` | Nội dung trang, **bắt buộc để route được public**               |
| `loading`      | `.tsx` `.jsx` | UI loading (React Suspense boundary)                            |
| `error`        | `.tsx` `.jsx` | UI lỗi (React Error Boundary), **phải là Client Component**     |
| `not-found`    | `.tsx` `.jsx` | UI trang 404                                                    |
| `route`        | `.ts`         | API endpoint — không dùng chung segment với `page`              |
| `template`     | `.tsx` `.jsx` | Giống layout nhưng **re-render mỗi lần navigate**               |
| `default`      | `.tsx` `.jsx` | Fallback cho Parallel Routes                                    |
| `global-error` | `.tsx` `.jsx` | Bắt lỗi toàn app, phải có `<html>` và `<body>`                  |

### 1.3 Component Hierarchy (thứ tự render)

```
<Layout> → <Template> → <ErrorBoundary> → <Suspense fallback={Loading}> → <ErrorBoundary fallback={NotFound}> → <Page>
```

---

## 2. SERVER vs CLIENT COMPONENTS

- **Mặc định mọi component trong `app/` là Server Component.**
- Chỉ thêm `'use client'` khi cần: `useState`, `useEffect`, event handlers, browser APIs. Đặt `'use client'` ở **đầu file**.
- Server Component **có thể import** Client Component.
- Client Component **KHÔNG thể import** Server Component trực tiếp — dùng `children` prop.
- Đẩy boundary `'use client'` **xuống thấp nhất có thể** (leaf components).

---

## 3. LAYOUTS & PAGES

- Root Layout (`app/layout.tsx`) **bắt buộc** có `<html lang>` và `<body>`.
- Dynamic params là **Promise** (Next.js 15+) → phải `await`:
  ```tsx
  type Props = { params: Promise<{ slug: string }> };
  export default async function Page({ params }: Props) {
    const { slug } = await params;
  }
  ```
- `error.tsx` **bắt buộc** là Client Component (`'use client'`), nhận `{ error, reset }`.
- `loading.tsx` dùng làm Suspense boundary.
- `not-found.tsx` cho UI 404.

---

## 4. DATA FETCHING

- Fetch initial data trong **Server Component async**, không dùng `useEffect`.
- Luôn khai báo caching strategy rõ ràng:
  ```ts
  fetch(url, { cache: "force-cache" });        // Cache (mặc định)
  fetch(url, { cache: "no-store" });            // Dynamic, không cache
  fetch(url, { next: { revalidate: 60 } });     // ISR sau 60s
  fetch(url, { next: { tags: ["posts"] } });    // Tag-based revalidation
  ```

---

## 5. MUTATING DATA — DỰ ÁN NÀY DÙNG REST API

> Dự án này **không dùng Server Actions cho mutation**. Mọi thao tác ghi dữ liệu đi qua **REST API** (`app/api/**/route.ts`) + **tầng service** (`lib/services/*.ts`). FE gọi API bằng `fetch` rồi `router.refresh()`.

### 5.1 Kiến trúc 3 tầng

```
Client Component (fetch)  →  Route Handler (HTTP + auth)  →  Service (business logic + DB)
   lib/api-client.ts          app/api/**/route.ts              lib/services/*.ts
```

- **Service** (`lib/services/*.ts`): logic nghiệp vụ + truy vấn DB thuần. Không HTTP, không `revalidate`. Ném `ApiError(status, message)` khi validate fail. Dùng lại được cho cả route handler lẫn Server Component (vd `ensureFundRecordsForYear` gọi trực tiếp trong `funds/page.tsx`).
- **Route Handler** (`app/api/**/route.ts`): mỏng — `requireAuth()` → parse JSON body → gọi service → `revalidatePath()` → `ok(data, status)`. Bọc trong `try/catch` trả `handleError(error)`.
- **Helper server** (`lib/api.ts`): `ApiError`, `requireAuth`, `ok`, `handleError`.
- **Helper client** (`lib/api-client.ts`): `apiFetch(url, { method, body })` — tự set header JSON, ném `Error` với message từ `{ error }` của response.

### 5.2 Quy tắc bắt buộc

1. Route handler **luôn `await requireAuth()` đầu tiên** trước mọi mutation.
2. Validate trong service, ném `ApiError` với status đúng: `400` (sai input), `401` (chưa auth), `404` (không tìm thấy), `409` (trùng/conflict).
3. Sau mutation, route handler gọi `revalidatePath()` cho các trang bị ảnh hưởng.
4. Client sau khi `apiFetch` thành công phải gọi `router.refresh()` để re-render Server Component và lấy dữ liệu mới.
5. Dynamic route params là Promise → `const { id } = await params`.
6. Logic nghiệp vụ đặt ở `lib/services/`, **không** nhồi vào route handler hay component.
7. Response: tạo mới trả `201`, còn lại `200`; lỗi trả `{ error: string }` kèm status.

### 5.3 Mẫu Route Handler

```ts
// app/api/members/route.ts
export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()
    const member = await createMember(body)
    revalidatePath("/members")
    return ok(member, 201)
  } catch (error) {
    return handleError(error)
  }
}
```

### 5.4 Mẫu gọi từ Client Component

```tsx
"use client"
const router = useRouter()
await apiFetch("/api/members", { method: "POST", body: { fullName } })
router.refresh()
```

### 5.5 Bản đồ REST API hiện có

| Method | Endpoint                       | Mô tả                                  |
| ------ | ------------------------------ | -------------------------------------- |
| POST   | `/api/members`                 | Tạo thành viên (auto tạo quỹ năm nay)  |
| PATCH  | `/api/members/:id`             | Cập nhật trạng thái thành viên         |
| POST   | `/api/schedules`               | Tạo lịch thi đấu                       |
| PATCH  | `/api/schedules/:id`           | Cập nhật trạng thái lịch               |
| POST   | `/api/matches`                 | Thêm kết quả trận (auto sinh chi phí)  |
| POST   | `/api/jerseys`                 | Tạo đơn áo                             |
| POST   | `/api/jerseys/:id/payments`    | Ghi nhận một lần thu tiền áo           |
| PATCH  | `/api/funds`                   | Cập nhật trạng thái 1 ô quỹ            |
| POST   | `/api/funds/bulk`              | Đóng quỹ hàng loạt                     |
| POST   | `/api/expenses`                | Ghi nhận chi phí                       |

> Auth (đăng nhập/đăng xuất) vẫn dùng NextAuth ở `lib/actions/auth.ts` vì không phải CRUD resource.

---

## 6. API ROUTE HANDLERS

- Dùng `route.ts` với các export `GET`, `POST`, `DELETE`... trả về `NextResponse.json(...)`.
- **Không đặt `route.ts` và `page.tsx` trong cùng một route segment.**

---

## 7. METADATA & SEO

- Static: export `const metadata: Metadata`.
- Dynamic: export `async function generateMetadata({ params })` — nhớ `await params`.

---

## 8. PARALLEL ROUTES & INTERCEPTING ROUTES

| Pattern          | Ý nghĩa                                         |
| ---------------- | ----------------------------------------------- |
| `@folder`        | Named slot — render song song trong cùng layout |
| `(.)folder`      | Intercept cùng cấp                              |
| `(..)folder`     | Intercept cấp cha                               |
| `(..)(..)folder` | Intercept 2 cấp trên                            |
| `(...)folder`    | Intercept từ root                               |

---

## 9. CHECKLIST TRƯỚC KHI TẠO/SỬA FILE

- [ ] Tên file đúng convention (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`)?
- [ ] Component có cần `'use client'`? (hooks/events → có; chỉ render/fetch → không)
- [ ] Mutation đi qua REST API (`app/api/**/route.ts`) + service (`lib/services/`), KHÔNG dùng Server Action?
- [ ] Route handler có `await requireAuth()` đầu tiên, `revalidatePath()` sau mutation?
- [ ] Service ném `ApiError` đúng status (400/401/404/409)?
- [ ] Client gọi `apiFetch` xong có `router.refresh()`?
- [ ] Dynamic route params dùng `await params`?
- [ ] `error.tsx` có `'use client'`?
- [ ] Root layout có `<html>` và `<body>`?
- [ ] `global-error.tsx` có `<html>` và `<body>`?
- [ ] `route.ts` không nằm chung segment với `page.tsx`?
- [ ] Fetch khai báo caching strategy rõ ràng?
- [ ] `revalidatePath()` / `revalidateTag()` được gọi TRƯỚC `redirect()`?

---

## 10. ANTI-PATTERNS CẦN TRÁNH

| ❌ Sai                                            | ✅ Đúng                                                                    |
| ------------------------------------------------- | -------------------------------------------------------------------------- |
| Dùng Server Action cho mutation                   | Gọi REST API (`/api/...`) qua `apiFetch`, logic ở `lib/services/`         |
| Nhồi logic nghiệp vụ vào route handler/component   | Tách vào `lib/services/*.ts`, route handler chỉ lo HTTP + auth            |
| Quên `requireAuth()` trong route handler           | Luôn `await requireAuth()` đầu tiên                                        |
| Quên `router.refresh()` sau khi `fetch` mutation   | Gọi `router.refresh()` để re-render Server Component                      |
| Ném `Error` chung trong service                    | Ném `ApiError(status, message)` để trả đúng HTTP status                   |
| Đặt `page.tsx` và `route.ts` cùng segment         | Tách ra segment khác nhau                                                  |
| Dùng `useEffect` để fetch initial data            | Fetch trong Server Component async                                         |
| Import Server Component vào Client Component       | Truyền qua `children` prop                                                 |
| Quên `await params` trong Next.js 15+             | `const { id } = await params`                                              |
| `error.tsx` không có `'use client'`               | Bắt buộc là Client Component                                               |
