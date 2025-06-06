"use client";
import Link from "next/link";
import React from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";

type Props = {
  credits: number;
  email: string;
};

const Navbar = ({ credits, email }: Props) => {
  return (
    <header className="bg-background sticky top-0 z-10 flex justify-center border-b">
      <div className="container flex h-16 items-center justify-between px-4 py-2">
        <Link href={email ? "/dashboard" : "/"} className="flex items-center">
          <div className="font-sans text-xl font-medium tracking-tight">
            <span className="text-foreground">Podcast Clipper</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />

          <div className="flex items-center gap-2">
            <Badge
              variant={"secondary"}
              className="h-8 px-3 py-5 text-xs font-medium"
            >
              {credits} credits
            </Badge>
            <Button
              className="h-8 text-xs font-medium"
              variant={"outline"}
              size={"sm"}
              asChild
            >
              <Link href={"/dashboard/billing"}>Buy more!</Link>
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={"ghost"}
                className="relative size-8 rounded-full p-0"
              >
                <Avatar>
                  <AvatarFallback>{email.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>
                <p className="text-muted-foreground text-xs">{email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={"/dashboard"}>Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href={"/dashboard/billing"}>Billing</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ redirectTo: "/" })}
                className="text-destructive cursor-pointer"
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
