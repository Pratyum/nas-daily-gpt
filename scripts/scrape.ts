import { CaptionObject, ChannelObject, VideoObject, VideoObjectWithCaptions } from "@/types";

import { OAuth2Client } from "google-auth-library";
import { encode } from "gpt-3-encoder";
import fs from "fs";
import { getSubtitles } from "youtube-captions-scraper";
import { google } from "googleapis";
import { loadEnvConfig } from "@next/env";

const BASE_URL = "http://www.paulgraham.com/";
const CHUNK_SIZE = 200;

loadEnvConfig("");

console.log("Loaded");
const client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const scopes = [
  "https://www.googleapis.com/auth/youtube.force-ssl",
  "https://www.googleapis.com/auth/youtubepartner",
  "https://www.googleapis.com/auth/youtube.readonly",
];

const authorizeUrl = client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
});

console.log(
  `Open this URL in your browser to authorize the app: ${authorizeUrl}`
);

// After authorizing, the user will be redirected to the redirect URI specified in the client.
// The URL will contain a "code" parameter that can be used to exchange for an access token and refresh token.
const code =
  "4/0AVHEtk65ZZXLkfBuNm5Lbk22EC-z4neGmNHzRtLbc5cCOTxDegG24_FUdMuzfsXbeyW9kw";

async function getTokens() {
  try {
    const { tokens } = await client.getToken(code);
    console.log(tokens);
  } catch (error) {
    console.error(error);
  }
}

const auth = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

auth.setCredentials({
  access_token: process.env.ACCESS_TOKEN,
  refresh_token: process.env.REFRESH_TOKEN,
});

const youtube = google.youtube({
  version: "v3",
  auth,
});


// Make the API request to retrieve the video IDs
async function getVideoIds(channelId: string, maxResults: number) {
  try {
    let nextPageToken: string | undefined = undefined;
    let videoIds: VideoObject[] = [];

    do {
      const response: any = await youtube.search.list({
        channelId: channelId,
        part: "snippet",
        type: "video",
        maxResults: maxResults,
        pageToken: nextPageToken,
      }  as any);
      videoIds = videoIds.concat(
        response.data.items.map((item: any) => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          publishTime: item.snippet.publishedAt,
          thumbnails: item.snippet.thumbnails,
        }))
      );
      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    return videoIds;
  } catch (error) {
    console.error(error);
    return [];
  }
}

const videoId = "pdlDmk3uCXw";


const chunkVideoScript = (videoObject : VideoObjectWithCaptions) => {
  const { title, transcript, description,  } = videoObject;

  let transcriptTextChunks = [];

  if (encode(transcript).length > CHUNK_SIZE) {
    const split = transcript.split(". ");
    let chunkText = "";

    for (let i = 0; i < split.length; i++) {
      const sentence = split[i];
      const sentenceTokenLength = encode(sentence);
      const chunkTextTokenLength = encode(chunkText).length;

      if (chunkTextTokenLength + sentenceTokenLength.length > CHUNK_SIZE) {
        transcriptTextChunks.push(chunkText);
        chunkText = "";
      }

      if (sentence[sentence.length - 1].match(/[a-z0-9]/i)) {
        chunkText += sentence + ". ";
      } else {
        chunkText += sentence + " ";
      }
    }

    transcriptTextChunks.push(chunkText.trim());
  } else {
    transcriptTextChunks.push(transcript.trim());
  }

  const transcriptChunks = transcriptTextChunks.map((text) => {
    const trimmedText = text.trim();

    const video = {
      trimmedText: trimmedText,
      contentLength: trimmedText.length,
      contentTokens: encode(trimmedText).length,
      embedding: [],
    };

    return video;
  });

  if (transcriptChunks.length > 1) {
    for (let i = 0; i < transcriptChunks.length; i++) {
      const chunk = transcriptChunks[i];
      const prevChunk = transcriptChunks[i - 1];

      if (chunk.contentTokens < 100 && prevChunk) {
        prevChunk.trimmedText += " " + chunk.trimmedText;
        prevChunk.contentLength += chunk.contentLength;
        prevChunk.contentTokens += chunk.contentTokens;
        transcriptChunks.splice(i, 1);
        i--;
      }
    }
  }

  const chunkedSection: VideoObjectWithCaptions = {
    ...videoObject,
    transcriptChunks: transcriptChunks,
  };

  return chunkedSection;
};

(async () => {
  console.log("starting");
  // getTokens();
  // await getVideoTranscripts(videoId);
  // getSubtitles(videoId);
  const channelId = "UCJsUvAqDzczYv2UpFmu4PcA";
  const videoIds: VideoObject[] = await getVideoIds(channelId, 100);
  console.log("videoIds", videoIds.length);
  const videoPromises = videoIds.map(async (videoId) => {
    const captions: CaptionObject[]  = await getSubtitles({
      videoID: videoId.videoId, // youtube video id
      lang: "en", // default: `en`
    });
    return captions;
  });
  const responses = await Promise.allSettled(videoPromises);
  const videoIdsWithCaptions = videoIds.reduce((acc: VideoObjectWithCaptions[], videoObject, i) => {
    const response = responses[i];
    if (response.status === "fulfilled") {
      const captions = response.value;
      const transcript = captions.reduce((acc, caption) => acc + " " + caption.text, "");
      const { transcriptChunks } = chunkVideoScript({...videoObject, transcript, captions});
      const videoObjectWithCaption: VideoObjectWithCaptions = {
        ...videoObject,
        captions,
        transcript: transcript,
        transcriptChunks: transcriptChunks
      };
      fs.writeFileSync(`scripts/transcripts/${videoId}.json`, JSON.stringify(videoObjectWithCaption));

      acc.push(videoObjectWithCaption);
    }else{
      console.log("rejected", videoObject.videoId);
    }

    return acc;
  }, []);

  const json : ChannelObject = {
    channelId,
    videos: videoIdsWithCaptions,
    title: 'NasDaily'
  }
  fs.writeFileSync("scripts/youtube.json", JSON.stringify(json));

  console.log("done");

})();
