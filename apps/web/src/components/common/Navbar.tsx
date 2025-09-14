'use client'

import Link from "next/link";
import { Button } from "../ui/button";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "../ui/navigation-menu";
import { logoutAction } from "@/app/auth/login/actions";
import { UserRole } from "@sibyl/shared";

export default function Navbar({ isAuthenticated, role }: { isAuthenticated: boolean, role: string }) {
    const isLawyer = role === UserRole.LAWYER
    return (
        <nav>
            <div className="flex justify-between px-4 py-2">
                <div>
                    <h1 className="tracking-tight">Legal Marketplace</h1>
                </div>
                <div className="space-x-2">
                    {!isAuthenticated && (
                        <>
                            <Button size={'sm'} variant={'link'}>
                                <Link href="/auth/signup/client">Signup as Client</Link>
                            </Button>
                            <Button size={'sm'} variant={'link'}>
                                <Link href="/auth/signup/lawyer">Signup as Lawyer</Link>
                            </Button>
                        </>
                    )}

                    {isAuthenticated && role && (
                        <>
                            <Link href={`/dashboard/${role.toLowerCase()}`}>
                                <Button size={'sm'} variant={'link'} onClick={() => { logoutAction() }}>
                                    Dashboard
                                </Button>
                            </Link>

                            {
                                isLawyer &&
                                <Link href='/dashboard/lawyer/quotes'>
                                    <Button size={'sm'} variant={'link'}>
                                        My Quotes
                                    </Button>
                                </Link>
                            }

                            <Button size={'sm'} variant={'link'} onClick={() => { logoutAction() }}>
                                Logout
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}