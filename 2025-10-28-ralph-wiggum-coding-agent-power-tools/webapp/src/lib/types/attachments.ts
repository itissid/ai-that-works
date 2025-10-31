import type { Attachment } from "@/generated/prisma";

export interface AttachmentWithUser extends Attachment {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}
