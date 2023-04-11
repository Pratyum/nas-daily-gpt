export enum OpenAIModel {
  DAVINCI_TURBO = "gpt-3.5-turbo"
}

export type PGEssay = {
  title: string;
  url: string;
  date: string;
  thanks: string;
  content: string;
  length: number;
  tokens: number;
  chunks: PGChunk[];
};

export type PGChunk = {
  essay_title: string;
  essay_url: string;
  essay_date: string;
  essay_thanks: string;
  content: string;
  content_length: number;
  content_tokens: number;
  embedding: number[];
};

export type PGJSON = {
  current_date: string;
  author: string;
  url: string;
  length: number;
  tokens: number;
  essays: PGEssay[];
};

export type CaptionObject = {
  text: string;
  start: string;
  dur: string;
}


export type VideoObject = {
  videoId: string;
  title: string;
  description: string;
  publishTime: string;
  thumbnails : {
    default: {
      url: string;
      width: number;
      height: number;
    },
    medium: {
      url: string;
      width: number;
      height: number;
    },
    high: {
      url: string;
      width: number;
      height: number;
    },
  }
}

export type VideoChunk = {
    trimmedText: string;
    contentLength: number;
    contentTokens: number;
    embedding: never[];
}

export type VideoObjectWithCaptions = VideoObject & {
  captions: CaptionObject[];
  transcript: string;
  transcriptChunks?: VideoChunk[];
}

export type ChannelObject = {
  channelId: string;
  title: string;
  videos: VideoObjectWithCaptions[];
}

export type DBVideoChunk = {
  title : string;
  video_id : string;
  publishtime : string;
  description : string;
  content : string;
  contentlength : number;
  contenttokens : number;
  embedding : number[];
}
