"use client"

import { FaGithub } from "react-icons/fa";
import { Button } from "./button";

const Nav = () => {
  return (
    <nav className="w-full bg-primary/90 py-5 px-7 drop-shadow-md flex justify-between items-center">
      <h1 className="text-white text-center text-2xl font-bold">RootFinder</h1>
      <Button className="w-10 h-10 grid place-content-center rounded-full bg-slate-100">
        <FaGithub fill="black" size={30} />
      </Button>
    </nav>
  );
};

export default Nav;
