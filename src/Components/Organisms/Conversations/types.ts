import { QueryType } from "@modules/Common/common.interface";
import {
  ProjectConversationTypes, ProjectListForChatTypes, ProjectTypes
} from "@modules/Project/types";

export type ConversationTypes = {
  data: ProjectConversationTypes[]
  meta?: QueryType
  loading: {
    default?: boolean;
    reload?: boolean
  }
  showEndMessage?: boolean
}

export type AddConversationType = {
  message: string;
}

export type ConversationsStateType = {
  content: string;
  loading: boolean;
}

export type SelectedFileType = {
  path: string
  open: boolean
}

export type DetailsType = {
  collapsed: boolean;
  fetched: boolean;
}

export type UpdateProjectsListProps = {
  message: ProjectConversationTypes;
  _Project: ProjectTypes;
  _ProjectConversations: ProjectListForChatTypes["ProjectConversation"];
  _ProjectMembers: ProjectListForChatTypes["ProjectMembers"];
  unreadConversationCount: number;
}
