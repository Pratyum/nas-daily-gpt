import { ChannelObject, VideoObjectWithCaptions } from "@/types";
import { Configuration, OpenAIApi } from "openai";

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import { loadEnvConfig } from "@next/env";

loadEnvConfig("");

const generateEmbeddings = async (videos: VideoObjectWithCaptions[]) => {
  const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  for (let i = 0; i < videos.length; i++) {
    const section = videos[i];
    if(section?.transcriptChunks){
      for (let j = 0; j < section.transcriptChunks.length; j++) {
        const chunk = section.transcriptChunks[j];
  
        const { trimmedText } = chunk;
  
        const embeddingResponse = await openai.createEmbedding({
          model: "text-embedding-ada-002",
          input: trimmedText
        });
  
        const [{ embedding }] = embeddingResponse.data.data;
  
        const { data, error } = await supabase
          .from("nas_daily_videos")
          .insert({
            title: section.title,
            video_id: section.videoId,
            publishtime: section.publishTime,
            description: section.description,
            content: trimmedText,
            contentlength: chunk.contentLength,
            contenttokens: chunk.contentTokens,
            embedding
          })
          .select("*");
  
        if (error) {
          console.log("error", error);
        } else {
          console.log("saved", i, j);
        }
  
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }
  }
};

(async () => {
  const channel: ChannelObject = JSON.parse(fs.readFileSync("scripts/youtube.json", "utf8"));
  console.log(`Generating embeddings for ${channel.videos.length} videos...`);
  await generateEmbeddings(channel.videos);
  console.log("Done!");
})();
