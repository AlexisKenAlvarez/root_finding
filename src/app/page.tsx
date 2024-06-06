import dynamic from "next/dynamic";
const Hero = dynamic(() => import("@/views/Hero"), {ssr: false});

const Page = () => {
  return (
    <div>
      <Hero />
    </div>
  );
};

export default Page;
