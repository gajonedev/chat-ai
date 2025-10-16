export type PresenceStatus = "online" | "away" | "offline"

export type ChatMember = {
  id: string
  name: string
  avatar: string
  title?: string
  presence: PresenceStatus
  role: "admin" | "member"
}

export type ChatWorkspace = {
  id: string
  name: string
  slug: string
  icon?: string
}

export type ChannelVisibility = "public" | "private"
export type ChannelKind = "channel" | "dm"

export type ChatChannel = {
  id: string
  workspaceId: string
  name: string
  description?: string
  visibility: ChannelVisibility
  kind: ChannelKind
  unreadCount?: number
  isMuted?: boolean
  memberIds: string[]
}

export type AttachmentType = "file" | "image" | "link"

export type ChatAttachment = {
  id: string
  type: AttachmentType
  name: string
  url: string
  sizeLabel?: string
  previewUrl?: string
}

export type ChatReaction = {
  id: string
  emoji: string
  userIds: string[]
}

export type ChatMessage = {
  id: string
  channelId: string
  authorId: string
  content: string
  createdAt: string
  updatedAt?: string
  attachments?: ChatAttachment[]
  reactions?: ChatReaction[]
  replyToId?: string
  repliesCount?: number
  threadParticipants?: string[]
  system?: boolean
}

export type ChatSidebarSection = {
  id: string
  title: string
  channelIds: string[]
}

export type ChatData = {
  workspaces: ChatWorkspace[]
  activeWorkspaceId: string
  members: ChatMember[]
  channels: ChatChannel[]
  sections: ChatSidebarSection[]
  messages: ChatMessage[]
  starredChannelIds: string[]
  currentUserId: string
}
