"use client";

import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Nav = () => {
  return (
    <nav className="w-full bg-primary/90 py-5 px-7 drop-shadow-md flex justify-between items-center">
      <Link href="/">
        <h1 className="text-white text-center text-2xl font-bold">
          RootFinder
        </h1>
      </Link>
      <a
        href="https://github.com/AlexisKenAlvarez/root_finding"
        rel="noopener noreferrer"
        target="_blank"
      >
        <Button className="w-10 h-10 grid place-content-center rounded-full bg-slate-100 hover:bg-white/90">
          <FaGithub fill="black" size={30} />
        </Button>
      </a>
    </nav>
  );
};

export default Nav;
