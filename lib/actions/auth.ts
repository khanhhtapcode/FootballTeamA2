"use server"

import { signIn, signOut } from "@/lib/auth"
import { AuthError } from "next-auth"
function isRedirectError(error: any): boolean {
  return (
    error &&
    typeof error === "object" &&
    "digest" in error &&
    typeof error.digest === "string" &&
    error.digest.startsWith("NEXT_REDIRECT;")
  )
}

export async function authenticate(prevState: any, formData: FormData) {
  try {
    await signIn("credentials", formData, { redirectTo: "/" })
  } catch (error) {
    if (isRedirectError(error)) {
        throw error
    }
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Tên đăng nhập hoặc mật khẩu không đúng."
        default:
          return "Đã xảy ra lỗi khi đăng nhập."
      }
    }
    throw error
  }
}

export async function logOut() {
    await signOut()
}
