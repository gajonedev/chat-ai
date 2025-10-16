import type { ChatData } from "@/components/chat/types"

export const mockChatData: ChatData = {
  workspaces: [
    {
      id: "workspace-1",
      name: "Gajone Studio",
      slug: "gajone",
      icon: "🚀",
    },
  ],
  activeWorkspaceId: "workspace-1",
  members: [
    {
      id: "user-1",
      name: "Maya Laurent",
      avatar: "https://avatar.vercel.sh/maya.svg",
      title: "Product Design Lead",
      presence: "online",
      role: "admin",
    },
    {
      id: "user-2",
      name: "Jonas Dupont",
      avatar: "https://avatar.vercel.sh/jonas.svg",
      title: "Staff Engineer",
      presence: "away",
      role: "member",
    },
    {
      id: "user-3",
      name: "Inès Diallo",
      avatar: "https://avatar.vercel.sh/ines.svg",
      title: "AI Researcher",
      presence: "online",
      role: "member",
    },
    {
      id: "user-4",
      name: "Noah Bernard",
      avatar: "https://avatar.vercel.sh/noah.svg",
      title: "Customer Success",
      presence: "offline",
      role: "member",
    },
  ],
  channels: [
    {
      id: "channel-1",
      workspaceId: "workspace-1",
      name: "général",
      description: "Discussions ouvertes et annonces internes",
      visibility: "public",
      kind: "channel",
      unreadCount: 3,
      memberIds: ["user-1", "user-2", "user-3", "user-4"],
    },
    {
      id: "channel-2",
      workspaceId: "workspace-1",
      name: "produit-ai",
      description: "Roadmap IA, prototypes et feedback",
      visibility: "private",
      kind: "channel",
      memberIds: ["user-1", "user-2", "user-3"],
    },
    {
      id: "channel-3",
      workspaceId: "workspace-1",
      name: "support-clients",
      description: "Tickets clients et résolutions rapides",
      visibility: "public",
      kind: "channel",
      memberIds: ["user-1", "user-4"],
      isMuted: true,
    },
    {
      id: "channel-4",
      workspaceId: "workspace-1",
      name: "maya-laurent",
      description: "Messages directs avec Maya",
      visibility: "private",
      kind: "dm",
      memberIds: ["user-1", "user-2"],
    },
    {
      id: "channel-5",
      workspaceId: "workspace-1",
      name: "ines-diallo",
      description: "Messages directs avec Inès",
      visibility: "private",
      kind: "dm",
      memberIds: ["user-1", "user-3"],
    },
  ],
  sections: [
    {
      id: "section-starred",
      title: "Favoris",
      channelIds: ["channel-1"],
    },
    {
      id: "section-channels",
      title: "Canaux",
      channelIds: ["channel-1", "channel-2", "channel-3"],
    },
    {
      id: "section-dm",
      title: "Messages directs",
      channelIds: ["channel-4", "channel-5"],
    },
  ],
  messages: [
    {
      id: "message-1",
      channelId: "channel-1",
      authorId: "user-1",
      content:
        "👋 Bonjour tout le monde ! Petit rappel : on démo la nouvelle expérience de chat IA vendredi. Merci de m'envoyer vos updates d'ici jeudi soir.",
      createdAt: "2025-10-16T07:30:00Z",
      reactions: [
        {
          id: "reaction-1",
          emoji: "👍",
          userIds: ["user-2", "user-3"],
        },
      ],
    },
    {
      id: "message-2",
      channelId: "channel-1",
      authorId: "user-2",
      content:
        "On a branché le service temps réel sur le broker edge hier soir. Les tests de charge sont stables à 10k events/s.",
      createdAt: "2025-10-16T08:05:00Z",
      attachments: [
        {
          id: "attachment-1",
          type: "file",
          name: "rapport-charge.pdf",
          url: "https://example.com/reports/rapport-charge.pdf",
          sizeLabel: "2.1 Mo",
        },
      ],
    },
    {
      id: "message-3",
      channelId: "channel-1",
      authorId: "user-3",
      content:
        "J'ai poussé une itération sur la complétion de réponses : suggestions plus contextualisées, latence divisée par 2.",
      createdAt: "2025-10-16T08:32:00Z",
      reactions: [
        {
          id: "reaction-2",
          emoji: "🚀",
          userIds: ["user-1"],
        },
      ],
    },
    {
      id: "message-4",
      channelId: "channel-1",
      authorId: "user-4",
      content:
        "Les clients pilotes adorent l'interface shadcn. On a reçu deux demandes pour personnaliser les palettes de couleurs.",
      createdAt: "2025-10-16T09:10:00Z",
      repliesCount: 3,
      threadParticipants: ["user-1", "user-2"],
    },
  ],
  starredChannelIds: ["channel-1"],
  currentUserId: "user-1",
}

export function getMockChatData(): ChatData {
  return mockChatData
}
