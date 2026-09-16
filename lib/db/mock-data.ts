import {
  User,
  SocialAccount,
  SocialPage,
  PostWithVariants,
  MediaAsset,
  AnalyticsSnapshot,
} from "./types";

export const initialUser: User = {
  id: "usr_default",
  email: "owner@fubber.io",
  name: "Fubber Admin",
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const initialAccounts: SocialAccount[] = [];
export const initialPages: SocialPage[] = [];
export const initialMediaAssets: MediaAsset[] = [];
export const initialPosts: PostWithVariants[] = [];
export const initialAnalyticsSnapshots: AnalyticsSnapshot[] = [];
