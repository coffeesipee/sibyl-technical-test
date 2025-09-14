import CaseForm from "@/components/case-form";
import { cookies } from "next/headers";
import { CookieKey } from "@/lib/cookie";
import { redirect } from "next/navigation";
import { createCase } from "./actions";

export default async function NewCase() {
    const token = await cookies().get(CookieKey.AUTH_TOKEN)?.value
    if (!token) {
        redirect('/auth/login')
    }

    return <CaseForm
        createCase={createCase}
        token={token}
    />
}