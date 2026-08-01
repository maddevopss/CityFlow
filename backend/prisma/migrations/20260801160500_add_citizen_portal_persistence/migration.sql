CREATE TABLE "CitizenRequest" (
  "id" UUID NOT NULL,
  "municipalityId" INTEGER NOT NULL,
  "citizenId" UUID NOT NULL,
  "assignedTo" UUID,
  "assignedTeam" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'OTHER',
  "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
  "location" JSONB,
  "attachments" JSONB NOT NULL DEFAULT '[]',
  "resolution" TEXT,
  "assignedAt" TIMESTAMP(3),
  "resolvedAt" TIMESTAMP(3),
  "closedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CitizenRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CitizenRequestEvent" (
  "id" UUID NOT NULL,
  "municipalityId" INTEGER NOT NULL,
  "requestId" UUID NOT NULL,
  "actorId" UUID,
  "eventType" TEXT NOT NULL,
  "fromStatus" TEXT,
  "toStatus" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CitizenRequestEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CitizenMessage" (
  "id" UUID NOT NULL,
  "municipalityId" INTEGER NOT NULL,
  "requestId" UUID NOT NULL,
  "authorId" UUID NOT NULL,
  "body" TEXT NOT NULL,
  "visibility" TEXT NOT NULL DEFAULT 'CITIZEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CitizenMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
  "id" UUID NOT NULL,
  "municipalityId" INTEGER NOT NULL,
  "recipientId" UUID NOT NULL,
  "requestId" UUID,
  "eventType" TEXT NOT NULL,
  "channel" TEXT NOT NULL DEFAULT 'IN_APP',
  "subject" TEXT,
  "body" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "nextAttemptAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3),
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CitizenRequest_municipalityId_status_updatedAt_idx" ON "CitizenRequest"("municipalityId", "status", "updatedAt");
CREATE INDEX "CitizenRequest_municipalityId_citizenId_updatedAt_idx" ON "CitizenRequest"("municipalityId", "citizenId", "updatedAt");
CREATE INDEX "CitizenRequest_municipalityId_assignedTo_status_idx" ON "CitizenRequest"("municipalityId", "assignedTo", "status");
CREATE INDEX "CitizenRequest_category_status_idx" ON "CitizenRequest"("category", "status");
CREATE INDEX "CitizenRequestEvent_municipalityId_requestId_createdAt_idx" ON "CitizenRequestEvent"("municipalityId", "requestId", "createdAt");
CREATE INDEX "CitizenRequestEvent_actorId_createdAt_idx" ON "CitizenRequestEvent"("actorId", "createdAt");
CREATE INDEX "CitizenMessage_municipalityId_requestId_createdAt_idx" ON "CitizenMessage"("municipalityId", "requestId", "createdAt");
CREATE INDEX "CitizenMessage_authorId_createdAt_idx" ON "CitizenMessage"("authorId", "createdAt");
CREATE INDEX "Notification_municipalityId_recipientId_status_createdAt_idx" ON "Notification"("municipalityId", "recipientId", "status", "createdAt");
CREATE INDEX "Notification_municipalityId_eventType_createdAt_idx" ON "Notification"("municipalityId", "eventType", "createdAt");
CREATE INDEX "Notification_nextAttemptAt_status_idx" ON "Notification"("nextAttemptAt", "status");

ALTER TABLE "CitizenRequest" ADD CONSTRAINT "CitizenRequest_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "Municipality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CitizenRequest" ADD CONSTRAINT "CitizenRequest_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CitizenRequest" ADD CONSTRAINT "CitizenRequest_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CitizenRequestEvent" ADD CONSTRAINT "CitizenRequestEvent_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "Municipality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CitizenRequestEvent" ADD CONSTRAINT "CitizenRequestEvent_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "CitizenRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CitizenRequestEvent" ADD CONSTRAINT "CitizenRequestEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CitizenMessage" ADD CONSTRAINT "CitizenMessage_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "Municipality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CitizenMessage" ADD CONSTRAINT "CitizenMessage_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "CitizenRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CitizenMessage" ADD CONSTRAINT "CitizenMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "Municipality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "CitizenRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
