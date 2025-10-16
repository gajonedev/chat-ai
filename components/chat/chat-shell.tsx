"use client"

import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import {
  BellIcon,
  BellOffIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  HashIcon,
  LockIcon,
  MessageCircleIcon,
  PaperclipIcon,
  PlusIcon,
  ReplyIcon,
  SearchIcon,
  SendHorizonalIcon,
  SmileIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react"
import { toast } from "sonner"

import type {
  ChatChannel,
  ChatData,
  ChatMember,
  ChatMessage,
  PresenceStatus,
} from "@/components/chat/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const presenceLabels: Record<PresenceStatus, string> = {
  online: "En ligne",
  away: "Absent",
  offline: "Hors ligne",
}

const presenceColors: Record<PresenceStatus, string> = {
  online: "bg-emerald-500",
  away: "bg-amber-500",
  offline: "bg-muted",
}

function getInitials(name: string) {
  const [first = "", second = ""] = name.split(" ")
  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase()
}

type ChatShellProps = {
  data: ChatData
  initialChannelId?: string
}

export function ChatShell({ data, initialChannelId }: ChatShellProps) {
  const channelIndex = React.useMemo(() => {
    return new Map(data.channels.map((channel) => [channel.id, channel]))
  }, [data.channels])

  const memberIndex = React.useMemo(() => {
    return new Map(data.members.map((member) => [member.id, member]))
  }, [data.members])

  const defaultChannelId = React.useMemo(() => {
    if (initialChannelId && channelIndex.has(initialChannelId)) {
      return initialChannelId
    }
    const sectionWithChannels = data.sections.find((section) => section.channelIds.length > 0)
    if (sectionWithChannels) {
      const firstValid = sectionWithChannels.channelIds.find((id) => channelIndex.has(id))
      if (firstValid) {
        return firstValid
      }
    }
    const firstChannel = data.channels.find((channel) => channel.workspaceId === data.activeWorkspaceId)
    return firstChannel?.id ?? ""
  }, [channelIndex, data.activeWorkspaceId, data.channels, data.sections, initialChannelId])

  const [activeChannelId, setActiveChannelId] = React.useState<string>(defaultChannelId)
  const [composerValue, setComposerValue] = React.useState("")

  const activeChannel = activeChannelId ? channelIndex.get(activeChannelId) ?? null : null

  const messagesForChannel = React.useMemo(() => {
    if (!activeChannel) return []
    return data.messages
      .filter((message) => message.channelId === activeChannel.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }, [activeChannel, data.messages])

  const participants = React.useMemo(() => {
    if (!activeChannel) return []
    return activeChannel.memberIds
      .map((memberId) => memberIndex.get(memberId))
      .filter(Boolean) as ChatMember[]
  }, [activeChannel, memberIndex])

  const currentUser = memberIndex.get(data.currentUserId) ?? null

  const handleSelectChannel = React.useCallback((channelId: string) => {
    setActiveChannelId(channelId)
  }, [])

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!composerValue.trim()) {
        return
      }
      toast.success("Message envoyé (mode démo)")
      setComposerValue("")
    },
    [composerValue]
  )

  if (!activeChannel) {
    return (
      <SidebarProvider>
        <div className="flex h-dvh flex-col items-center justify-center gap-4">
          <SparklesIcon className="text-muted-foreground size-10" />
          <div className="max-w-sm text-center">
            <h1 className="text-lg font-semibold">Bienvenue dans Chat AI</h1>
            <p className="text-sm text-muted-foreground">
              Crée un canal pour commencer à discuter avec ton équipe.
            </p>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <AppSidebar
          data={data}
          currentUser={currentUser}
          activeChannelId={activeChannelId}
          onSelectChannel={handleSelectChannel}
        />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center border-b px-4">
          <div className="flex flex-1 items-center gap-3">
            <SidebarTrigger className="md:hidden" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold">
                  {activeChannel.kind === "dm" ? (
                    <PrivateConversationName
                      channel={activeChannel}
                      currentUserId={data.currentUserId}
                      members={memberIndex}
                    />
                  ) : (
                    `#${activeChannel.name}`
                  )}
                </span>
                {activeChannel.kind === "channel" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="gap-1">
                        {activeChannel.visibility === "private" ? (
                          <LockIcon className="size-3" />
                        ) : (
                          <HashIcon className="size-3" />
                        )}
                        <span className="text-xs capitalize">
                          {activeChannel.visibility === "private" ? "privé" : "public"}
                        </span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      {activeChannel.visibility === "private"
                        ? "Seuls les membres invités voient ce canal"
                        : "Visible par tous les membres du workspace"}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              {activeChannel.description ? (
                <p className="text-xs text-muted-foreground">
                  {activeChannel.description}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {activeChannel.kind === "dm"
                    ? "Conversation directe"
                    : `${participants.length} membre${participants.length > 1 ? "s" : ""}`}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-md border px-2 py-1 md:flex">
              <SearchIcon className="text-muted-foreground size-4" />
              <Input
                placeholder="Rechercher"
                className="h-7 border-none bg-transparent p-0 text-sm focus-visible:ring-0"
              />
            </div>
            <Button size="icon" variant="ghost">
              <UsersIcon className="size-4" />
              <span className="sr-only">Afficher les membres</span>
            </Button>
            <Button size="icon" variant="ghost">
              <BellIcon className="size-4" />
              <span className="sr-only">Notifications</span>
            </Button>
          </div>
        </header>
        <Separator className="md:hidden" />
        <div className="flex min-h-0 flex-1 flex-col">
          <ConversationTimeline
            messages={messagesForChannel}
            members={memberIndex}
            currentUserId={data.currentUserId}
          />
          <footer className="border-t p-4">
            <MessageComposer
              value={composerValue}
              onChange={setComposerValue}
              onSubmit={handleSubmit}
              activeChannel={activeChannel}
              currentUser={currentUser}
              members={memberIndex}
            />
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

type AppSidebarProps = {
  data: ChatData
  activeChannelId: string
  onSelectChannel: (channelId: string) => void
  currentUser: ChatMember | null
}

function AppSidebar({ data, activeChannelId, onSelectChannel, currentUser }: AppSidebarProps) {
  const memberIndex = React.useMemo(() => {
    return new Map(data.members.map((member) => [member.id, member]))
  }, [data.members])

  const workspace = data.workspaces.find((item) => item.id === data.activeWorkspaceId)
  const currentWorkspaceName = workspace?.name ?? "Workspace"

  return (
    <>
      <SidebarHeader>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-9 justify-between gap-2">
              <span className="truncate text-sm font-medium">
                {workspace?.icon ? `${workspace.icon} ${currentWorkspaceName}` : currentWorkspaceName}
              </span>
              <ChevronsUpDownIcon className="text-muted-foreground size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            {data.workspaces.map((item) => (
              <DropdownMenuItem key={item.id} className="flex items-center gap-2">
                <span className="text-base" aria-hidden>
                  {item.icon ?? "💬"}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-muted-foreground">{item.slug}</span>
                </div>
              </DropdownMenuItem>
            ))}
            <Separator className="my-1" />
            <DropdownMenuItem className="gap-2 text-sm">
              <PlusIcon className="size-4" />
              Créer un workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Input placeholder="Rechercher" className="h-8" />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        {data.sections.map((section) => {
          const channels = section.channelIds
            .map((channelId) => data.channels.find((channel) => channel.id === channelId))
            .filter(Boolean) as ChatChannel[]

          if (channels.length === 0) {
            return null
          }

          return (
            <SidebarGroup key={section.id}>
              <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {channels.map((channel) => {
                    const isActive = channel.id === activeChannelId
                    const display = getChannelDisplayName({
                      channel,
                      currentUserId: data.currentUserId,
                      memberIndex,
                    })

                    const isMuted = channel.isMuted
                    const unreadCount = channel.unreadCount ?? 0

                    return (
                      <SidebarMenuItem key={channel.id}>
                        <SidebarMenuButton
                          onClick={() => onSelectChannel(channel.id)}
                          isActive={isActive}
                          tooltip={display.tooltip}
                          className="gap-2"
                        >
                          {display.icon}
                          <span className="truncate">{display.label}</span>
                        </SidebarMenuButton>
                        {unreadCount > 0 && (
                          <SidebarMenuBadge className="bg-primary/10 text-primary">
                            {unreadCount}
                          </SidebarMenuBadge>
                        )}
                        {isMuted && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <SidebarMenuBadge className="bg-muted text-muted-foreground">
                                  <BellOffIcon className="size-3" />
                                </SidebarMenuBadge>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>Notifications désactivées</TooltipContent>
                          </Tooltip>
                        )}
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>
      <SidebarFooter>
        {currentUser && (
          <Button
            variant="ghost"
            className="h-auto justify-start gap-3 px-2 py-2"
          >
            <div className="relative">
              <Avatar className="size-9">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full border-2 border-sidebar",
                  presenceColors[currentUser.presence]
                )}
              />
            </div>
            <div className="flex min-w-0 flex-col text-left">
              <span className="truncate text-sm font-medium">{currentUser.name}</span>
              {currentUser.title && (
                <span className="truncate text-xs text-muted-foreground">
                  {currentUser.title}
                </span>
              )}
            </div>
          </Button>
        )}
      </SidebarFooter>
    </>
  )
}

type ChannelDisplayConfig = {
  label: string
  tooltip?: string
  icon: React.ReactNode
}

type ChannelDisplayParams = {
  channel: ChatChannel
  currentUserId: string
  memberIndex: Map<string, ChatMember>
}

function getChannelDisplayName({ channel, currentUserId, memberIndex }: ChannelDisplayParams): ChannelDisplayConfig {
  if (channel.kind === "dm") {
    const otherId = channel.memberIds.find((memberId) => memberId !== currentUserId)
    const otherMember = otherId ? memberIndex.get(otherId) : undefined
    if (otherMember) {
      return {
        label: otherMember.name,
        tooltip: `${presenceLabels[otherMember.presence]} · ${otherMember.title ?? ""}`.trim(),
        icon: (
          <div className="relative">
            <Avatar className="size-5">
              <AvatarImage src={otherMember.avatar} alt={otherMember.name} />
              <AvatarFallback>{getInitials(otherMember.name)}</AvatarFallback>
            </Avatar>
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 flex size-2.5 items-center justify-center rounded-full border border-sidebar",
                presenceColors[otherMember.presence]
              )}
            />
          </div>
        ),
      }
    }

    return {
      label: channel.name,
      icon: <MessageCircleIcon className="size-4" />,
    }
  }

  return {
    label: `#${channel.name}`,
    tooltip: channel.description,
    icon:
      channel.visibility === "private" ? (
        <LockIcon className="size-4" />
      ) : (
        <HashIcon className="size-4" />
      ),
  }
}

type PrivateConversationNameProps = {
  channel: ChatChannel
  currentUserId: string
  members: Map<string, ChatMember>
}

function PrivateConversationName({ channel, currentUserId, members }: PrivateConversationNameProps) {
  const otherId = channel.memberIds.find((memberId) => memberId !== currentUserId)
  const otherMember = otherId ? members.get(otherId) : undefined
  return <span>{otherMember ? otherMember.name : channel.name}</span>
}

type ConversationTimelineProps = {
  messages: ChatMessage[]
  members: Map<string, ChatMember>
  currentUserId: string
}

function ConversationTimeline({ messages, members, currentUserId }: ConversationTimelineProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <SparklesIcon className="text-muted-foreground size-10" />
        <div className="max-w-sm text-center">
          <h2 className="text-base font-semibold">Aucun message pour l'instant</h2>
          <p className="text-sm text-muted-foreground">
            Sois le premier à démarrer la discussion.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1" type="always">
      <div className="flex flex-col gap-6 px-4 py-6" role="list">
        {messages.map((message) => {
          const author = members.get(message.authorId)
          return (
            <MessageItem
              key={message.id}
              message={message}
              author={author ?? null}
              isCurrentUser={message.authorId === currentUserId}
              participants={message.threadParticipants?.map((participantId) => members.get(participantId) ?? null) ?? []}
            />
          )
        })}
      </div>
    </ScrollArea>
  )
}

type MessageItemProps = {
  message: ChatMessage
  author: ChatMember | null
  isCurrentUser: boolean
  participants: (ChatMember | null)[]
}

function MessageItem({ message, author, isCurrentUser, participants }: MessageItemProps) {
  const timestamp = React.useMemo(() => {
    return formatDistanceToNow(new Date(message.createdAt), {
      addSuffix: true,
      locale: fr,
    })
  }, [message.createdAt])

  return (
    <article className="flex gap-3" role="listitem">
      <Avatar className="size-10">
        <AvatarImage src={author?.avatar} alt={author?.name} />
        <AvatarFallback>{author ? getInitials(author.name) : "?"}</AvatarFallback>
      </Avatar>
      <div className="flex flex-1 flex-col">
        <header className="flex items-baseline gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">
              {author ? author.name : "Utilisateur inconnu"}
            </span>
            {author?.title && (
              <span className="text-xs text-muted-foreground">{author.title}</span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
          {isCurrentUser && <Badge className="text-[10px]">toi</Badge>}
        </header>
        <div className="mt-2 space-y-3">
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
            {message.content}
          </p>
          {message.attachments?.length ? (
            <div className="grid gap-2">
              {message.attachments.map((attachment) => (
                <AttachmentCard key={attachment.id} attachment={attachment} />
              ))}
            </div>
          ) : null}
          {message.reactions?.length ? (
            <div className="flex flex-wrap gap-2">
              {message.reactions.map((reaction) => (
                <Button
                  key={reaction.id}
                  size="sm"
                  variant="secondary"
                  className="h-7 gap-1 rounded-full px-2 text-xs"
                >
                  <span>{reaction.emoji}</span>
                  <span className="font-medium">{reaction.userIds.length}</span>
                </Button>
              ))}
            </div>
          ) : null}
        </div>
        {message.repliesCount ? (
          <div className="mt-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 px-0 text-sm text-muted-foreground hover:text-foreground"
            >
              <ReplyIcon className="size-4" />
              {message.repliesCount} réponse{message.repliesCount > 1 ? "s" : ""}
            </Button>
            <div className="flex items-center -space-x-2">
              {participants.slice(0, 3).map((participant, index) => {
                if (!participant) return null
                return (
                  <Avatar key={`${participant.id}-${index}`} className="size-6 border-2 border-background">
                    <AvatarImage src={participant.avatar} alt={participant.name} />
                    <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
                  </Avatar>
                )
              })}
              {participants.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{participants.length - 3}
                </span>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  )
}

type AttachmentCardProps = {
  attachment: NonNullable<ChatMessage["attachments"]>[number]
}

function AttachmentCard({ attachment }: AttachmentCardProps) {
  return (
    <a
      href={attachment.url}
      className="flex items-center gap-3 rounded-lg border bg-card p-3 text-sm shadow-sm transition hover:bg-accent hover:text-accent-foreground"
    >
      <PaperclipIcon className="size-4" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium">{attachment.name}</span>
        {attachment.sizeLabel ? (
          <span className="text-xs text-muted-foreground">{attachment.sizeLabel}</span>
        ) : null}
      </div>
      <ChevronRightIcon className="text-muted-foreground size-4" />
    </a>
  )
}

type MessageComposerProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  activeChannel: ChatChannel
  currentUser: ChatMember | null
  members: Map<string, ChatMember>
}

function MessageComposer({ value, onChange, onSubmit, activeChannel, currentUser, members }: MessageComposerProps) {
  const placeholder = React.useMemo(() => {
    if (activeChannel.kind !== "dm") {
      return `Message #${activeChannel.name}`
    }
    const otherId = activeChannel.memberIds.find((memberId) => memberId !== currentUser?.id)
    const otherMember = otherId ? members.get(otherId) : undefined
    return otherMember
      ? `Envoyer un message à ${otherMember.name}`
      : `Envoyer un message`
  }, [activeChannel, currentUser?.id, members])

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Appuie sur Entrée pour envoyer</span>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" size="icon" variant="ghost">
            <PaperclipIcon className="size-4" />
            <span className="sr-only">Joindre un fichier</span>
          </Button>
          <Button type="button" size="icon" variant="ghost">
            <SmileIcon className="size-4" />
            <span className="sr-only">Insérer un emoji</span>
          </Button>
        </div>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Label htmlFor="chat-message" className="sr-only">
          Message
        </Label>
        <Textarea
          id="chat-message"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-h-[120px] resize-none border-0 focus-visible:ring-0"
        />
        <div className="flex items-center justify-end gap-2 border-t bg-muted/40 px-3 py-2">
          <Button type="submit" size="sm" disabled={!value.trim()} className="gap-1">
            Envoyer
            <SendHorizonalIcon className="size-4" />
          </Button>
        </div>
      </div>
    </form>
  )
}
