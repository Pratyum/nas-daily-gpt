import { IconBrandGithub, IconBrandTwitter } from "@tabler/icons-react";

import { FC } from "react";

export const Footer: FC = () => {
  return (
    <div className="flex h-[50px] border-t border-gray-300 py-2 px-8 items-center sm:justify-between justify-center">
      <div className="hidden sm:flex"></div>

      <div className="hidden text-sm italic sm:flex">
        Created by
        <a
          className="mx-1 hover:opacity-50"
          href="https://twitter.com/mckaywrigley"
          target="_blank"
          rel="noreferrer"
        >
          Pratyum Jagannath
        </a>
        based on the videos of
        <a
          className="ml-1 hover:opacity-50"
          href="https://twitter.com/paulg"
          target="_blank"
          rel="noreferrer"
        >
          Nas Daily
        </a>
        .
      </div>

      <div className="flex space-x-4">
        {/* <a
          className="flex items-center hover:opacity-50"
          href="https://twitter.com/mckaywrigley"
          target="_blank"
          rel="noreferrer"
        >
          <IconBrandTwitter size={24} />
        </a> */}

        <a
          className="flex items-center hover:opacity-50"
          href="https://github.com/Pratyum/nas-daily-gpt"
          target="_blank"
          rel="noreferrer"
        >
          <IconBrandGithub size={24} />
        </a>
      </div>
    </div>
  );
};
