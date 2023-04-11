export enum OpenAIModel {
  DAVINCI_TURBO = "gpt-3.5-turbo"
}

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
