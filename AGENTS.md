# Next.js App Router — Conventions & Coding Patterns

> Tài liệu bắt buộc cho Agent khi tạo, chỉnh sửa hoặc sinh code trong dự án Next.js App Router.
> Mọi file, folder và pattern phải tuân thủ đúng chuẩn Next.js official docs.

---

## 1. PROJECT STRUCTURE

### 1.1 Cấu trúc thư mục chuẩn

```
my-app/
├── app/
│   ├── layout.tsx                  # Root layout (bắt buộc, chứa <html> và <body>)
│   ├── page.tsx                    # Trang chủ "/"
│   ├── globals.css
│   ├── (marketing)/                # Route group — không ảnh hưởng URL
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── (shop)/
│   │   ├── layout.tsx
│   │   ├── cart/page.tsx           # "/cart"
│   │   └── account/page.tsx        # "/account"
│   ├── blog/
│   │   ├── page.tsx                # "/blog"
│   │   ├── [slug]/
│   │   │   └── page.tsx            # "/blog/:slug"
│   │   ├── _components/            # Private folder — không là route
│   │   │   └── PostCard.tsx
│   │   └── _lib/
│   │       └── data.ts
│   ├── lib/
│   │   └── actions.ts              # Server Actions tập trung
│   └── ui/                         # Shared UI components
│       ├── button.tsx
│       └── form.tsx
├── public/
├── next.config.js
├── tsconfig.json
├── package.json
└── .env.local
```

### 1.2 Quy tắc đặt tên thư mục

| Pattern          | Ý nghĩa                                     |
| ---------------- | ------------------------------------------- |
| `folder/`        | Route segment thông thường                  |
| `[folder]/`      | Dynamic segment — nhận param từ URL         |
| `[...folder]/`   | Catch-all segment                           |
| `[[...folder]]/` | Optional catch-all segment                  |
| `(folder)/`      | Route group — nhóm logic, **không vào URL** |
| `_folder/`       | Private folder — **không tham gia routing** |
| `@folder/`       | Named slot cho Parallel Routes              |

### 1.3 Các file đặc biệt (Special Files)

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

### 1.4 Component Hierarchy (thứ tự render)

```
<Layout>
  <Template>
    <ErrorBoundary fallback={<Error />}>
      <Suspense fallback={<Loading />}>
        <ErrorBoundary fallback={<NotFound />}>
          <Page />
        </ErrorBoundary>
      </Suspense>
    </ErrorBoundary>
  </Template>
</Layout>
```

---

## 2. SERVER vs CLIENT COMPONENTS

### 2.1 Quy tắc mặc định

- **Mặc định tất cả component trong `app/` là Server Components.**
- Chỉ thêm `'use client'` khi component cần: `useState`, `useEffect`, event handlers, browser APIs.

### 2.2 Server Component (mặc định)

```tsx
// app/posts/page.tsx — KHÔNG cần 'use client'
import { db } from "@/lib/db";

export default async function PostsPage() {
  const posts = await db.post.findMany();

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

### 2.3 Client Component

```tsx
// app/ui/counter.tsx
"use client"; // ← BẮT BUỘC đặt đầu file

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}
```

### 2.4 Nguyên tắc kết hợp

- Server Component **có thể import** Client Component.
- Client Component **KHÔNG thể import** Server Component trực tiếp — dùng `children` prop thay thế.
- Đẩy `'use client'` boundary **xuống thấp nhất có thể** (leaf components).

---

## 3. LAYOUTS & PAGES

### 3.1 Root Layout (bắt buộc)

```tsx
// app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My App",
  description: "Description",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### 3.2 Nested Layout

```tsx
// app/blog/layout.tsx
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <nav>{/* Blog navigation */}</nav>
      {children}
    </section>
  );
}
```

### 3.3 Page với dynamic params (Next.js 15+: params là Promise)

```tsx
// app/blog/[slug]/page.tsx
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  return <h1>Post: {slug}</h1>;
}
```

### 3.4 Loading UI

```tsx
// app/blog/loading.tsx
export default function Loading() {
  return <div>Loading...</div>;
}
```

### 3.5 Error UI (phải là Client Component)

```tsx
// app/blog/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### 3.6 Not Found

```tsx
// app/blog/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <Link href="/">Go Home</Link>
    </div>
  );
}
```

---

## 4. DATA FETCHING

### 4.1 Fetch trong Server Component

```tsx
// app/posts/page.tsx
async function getPosts() {
  const res = await fetch("https://api.example.com/posts", {
    next: { revalidate: 3600 }, // ISR: revalidate mỗi 1 giờ
  });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();
  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  );
}
```

### 4.2 Caching options

```ts
fetch(url, { cache: "force-cache" }); // Cache mãi mãi (mặc định)
fetch(url, { cache: "no-store" }); // Không cache (dynamic)
fetch(url, { next: { revalidate: 60 } }); // ISR — revalidate sau 60s
fetch(url, { next: { tags: ["posts"] } }); // Tag-based revalidation
```

---

## 5. SERVER ACTIONS (MUTATING DATA)

### 5.1 Quy tắc bắt buộc

- Server Actions **phải là async function**.
- **Bắt buộc có `'use server'`** — đặt đầu function (inline) hoặc đầu file (tập trung).
- **Bắt buộc verify authentication/authorization** trước khi thực hiện bất kỳ mutation nào.
- Sau khi mutation, phải **revalidate cache** hoặc **redirect**.

### 5.2 File tập trung actions: `app/lib/actions.ts`

```ts
// app/lib/actions.ts
"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPost(formData: FormData) {
  // 1. Verify auth
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // 2. Extract data
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  // 3. Mutate (DB call)
  // await db.post.create({ data: { title, content, userId: session.user.id } })

  // 4. Revalidate cache
  revalidatePath("/posts");

  // 5. Redirect
  redirect("/posts");
}

export async function deletePost(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const id = formData.get("id") as string;

  // Verify ownership trước khi xoá
  // const post = await db.post.findUnique({ where: { id } })
  // if (post?.userId !== session.user.id) throw new Error('Forbidden')

  // await db.post.delete({ where: { id } })
  revalidatePath("/posts");
}

export async function updatePost(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Mutate...
  revalidatePath("/posts");
}
```

### 5.3 Inline action trong Server Component

```tsx
// app/posts/page.tsx
import { revalidatePath } from "next/cache";

export default function PostsPage() {
  async function createPost(formData: FormData) {
    "use server";
    // mutation logic...
    revalidatePath("/posts");
  }

  return (
    <form action={createPost}>
      <input name="title" type="text" />
      <button type="submit">Create</button>
    </form>
  );
}
```

### 5.4 Gọi Server Action từ Client Component

```tsx
// app/ui/post-form.tsx
"use client";

import { createPost } from "@/app/lib/actions";

export function PostForm() {
  return (
    <form action={createPost}>
      <input type="text" name="title" />
      <input type="text" name="content" />
      <button type="submit">Create</button>
    </form>
  );
}
```

### 5.5 Truyền action qua props

```tsx
// app/ui/client-component.tsx
"use client";

export default function ClientComponent({
  updateItemAction,
}: {
  updateItemAction: (formData: FormData) => void;
}) {
  return <form action={updateItemAction}>{/* ... */}</form>;
}
```

### 5.6 Pending state với useActionState

```tsx
// app/ui/submit-button.tsx
"use client";

import { useActionState, startTransition } from "react";
import { createPost } from "@/app/lib/actions";

export function SubmitButton() {
  const [state, action, pending] = useActionState(createPost, null);

  return (
    <button onClick={() => startTransition(action)} disabled={pending}>
      {pending ? "Saving..." : "Create Post"}
    </button>
  );
}
```

### 5.7 Event handler (onClick)

```tsx
// app/ui/like-button.tsx
"use client";

import { incrementLike } from "@/app/lib/actions";
import { useState } from "react";

export default function LikeButton({ initialLikes }: { initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);

  return (
    <button
      onClick={async () => {
        const updated = await incrementLike();
        setLikes(updated);
      }}
    >
      ❤️ {likes}
    </button>
  );
}
```

### 5.8 useEffect để trigger action tự động

```tsx
// app/ui/view-count.tsx
"use client";

import { incrementViews } from "@/app/lib/actions";
import { useState, useEffect, useTransition } from "react";

export default function ViewCount({ initialViews }: { initialViews: number }) {
  const [views, setViews] = useState(initialViews);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const updated = await incrementViews();
      setViews(updated);
    });
  }, []);

  return <p>Total Views: {views}</p>;
}
```

### 5.9 Refresh & Revalidate sau mutation

```ts
// Refresh router (không revalidate tag)
import { refresh } from "next/cache";
refresh();

// Revalidate theo path
import { revalidatePath } from "next/cache";
revalidatePath("/posts");

// Revalidate theo tag
import { revalidateTag } from "next/cache";
revalidateTag("posts");
```

### 5.10 Redirect sau mutation

```ts
// Phải gọi revalidatePath/revalidateTag TRƯỚC redirect
// Vì redirect() throw exception — code sau không chạy
revalidatePath("/posts");
redirect("/posts");
```

### 5.11 Cookies trong Server Action

```ts
// app/lib/actions.ts
"use server";

import { cookies } from "next/headers";

export async function setTheme(formData: FormData) {
  const cookieStore = await cookies();
  const theme = formData.get("theme") as string;

  cookieStore.set("name", theme); // Set cookie
  // cookieStore.get('name')?.value     // Get cookie
  // cookieStore.delete('name')         // Delete cookie
}
```

---

## 6. API ROUTE HANDLERS

```ts
// app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  // const posts = await db.post.findMany()
  return NextResponse.json({ posts: [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // const post = await db.post.create({ data: body })
  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ success: true });
}
```

> ⚠️ Không đặt `route.ts` và `page.tsx` trong cùng một route segment.

---

## 7. METADATA & SEO

```tsx
// Static metadata
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Read our blog",
  openGraph: {
    title: "Blog",
    description: "Read our blog",
  },
};

// Dynamic metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // const post = await getPost(slug)
  return {
    title: `Post: ${slug}`,
  };
}
```

---

## 8. PARALLEL ROUTES & INTERCEPTING ROUTES

```
app/
├── layout.tsx              # Nhận cả @sidebar và @main
├── @sidebar/
│   └── page.tsx            # Slot sidebar
├── @main/
│   └── page.tsx            # Slot main
└── blog/
    ├── page.tsx            # "/blog" — danh sách
    └── (.)post/
        └── [id]/
            └── page.tsx    # Intercept "/post/:id" — hiển thị dạng modal
```

| Pattern          | Ý nghĩa                                         |
| ---------------- | ----------------------------------------------- |
| `@folder`        | Named slot — render song song trong cùng layout |
| `(.)folder`      | Intercept cùng cấp                              |
| `(..)folder`     | Intercept cấp cha                               |
| `(..)(..)folder` | Intercept 2 cấp trên                            |
| `(...)folder`    | Intercept từ root                               |

---

## 9. CHECKLIST CHO AGENT

Trước khi tạo hoặc sửa bất kỳ file nào, kiểm tra:

- [ ] Tên file đúng convention? (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`)
- [ ] Component có cần `'use client'`? Nếu dùng hooks/events → có. Nếu chỉ render/fetch → không.
- [ ] Server Action có `'use server'`? Có verify auth? Có revalidate/redirect sau mutation?
- [ ] Dynamic route params dùng `await params`? (Next.js 15+: `params` là Promise)
- [ ] `error.tsx` có `'use client'`? (bắt buộc)
- [ ] Root layout có `<html>` và `<body>`?
- [ ] `global-error.tsx` có `<html>` và `<body>`?
- [ ] `route.ts` không nằm chung segment với `page.tsx`?
- [ ] Fetch có khai báo caching strategy rõ ràng? (`cache`, `revalidate`, `tags`)
- [ ] `revalidatePath()` / `revalidateTag()` được gọi TRƯỚC `redirect()`?

---

## 10. ANTI-PATTERNS CẦN TRÁNH

| ❌ Sai                                            | ✅ Đúng                                                                    |
| ------------------------------------------------- | -------------------------------------------------------------------------- |
| Định nghĩa Server Function trong Client Component | Định nghĩa trong file riêng có `'use server'`, import vào Client Component |
| Quên verify auth trong Server Action              | Luôn `await auth()` và check session đầu tiên                              |
| Đặt `page.tsx` và `route.ts` cùng segment         | Tách ra segment khác nhau                                                  |
| Dùng `useEffect` để fetch initial data            | Fetch trong Server Component async                                         |
| Import Server Component vào Client Component      | Truyền qua `children` prop                                                 |
| Quên `await params` trong Next.js 15+             | `const { slug } = await params`                                            |
| Gọi `redirect()` rồi mới `revalidatePath()`       | `revalidatePath()` trước, `redirect()` sau                                 |
| `global-error.tsx` thiếu `<html>`, `<body>`       | Bắt buộc có vì thay thế root layout                                        |
| `error.tsx` không có `'use client'`               | Bắt buộc là Client Component                                               |
| Đặt logic mutation trực tiếp trong component      | Tách vào `app/lib/actions.ts`                                              |
