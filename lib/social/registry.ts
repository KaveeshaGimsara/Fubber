import { PlatformType } from "../db/types";
import { SocialPublisher } from "./types";
import { facebookPublisher } from "./facebook/publisher";
import { instagramPublisher } from "./instagram/publisher";
import { threadsPublisher } from "./threads/publisher";
import { xPublisher } from "./x/publisher";
import { pinterestPublisher } from "./pinterest/publisher";
import { youtubePublisher } from "./youtube/publisher";
import { linkedinPublisher } from "./linkedin/publisher";

const publishers: Record<PlatformType, SocialPublisher> = {
  facebook: facebookPublisher,
  instagram: instagramPublisher,
  threads: threadsPublisher,
  x: xPublisher,
  pinterest: pinterestPublisher,
  youtube: youtubePublisher,
  linkedin: linkedinPublisher,
};

export function getPublisher(platform: PlatformType): SocialPublisher {
  const pub = publishers[platform];
  if (!pub) {
    throw new Error(`Unsupported platform: ${platform}`);
  }
  return pub;
}

export function getAllPublishers(): SocialPublisher[] {
  return Object.values(publishers);
}
