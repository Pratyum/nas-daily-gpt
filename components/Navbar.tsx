import { FC } from "react";
import { IconExternalLink } from "@tabler/icons-react";

export const Navbar: FC = () => {
  return (
    <div className="flex h-[60px] border-b border-gray-300 py-2 px-8 items-center justify-between">
      <div className="flex items-center text-2xl font-bold">
        <a
          className="hover:opacity-50"
          href="https://nas-daily-gpt.vercel.app"
        >
          Nas Daily GPT
        </a>
      </div>
      <div>
        <a
          className="flex items-center hover:opacity-50"
          href="http://www.youtube.com/@NasDaily"
          target="_blank"
          rel="noreferrer"
        >
          <div className="hidden sm:flex">@NasDaily</div>

          <IconExternalLink
            className="ml-1"
            size={20}
          />
        </a>
      </div>
    </div>
  );
};
