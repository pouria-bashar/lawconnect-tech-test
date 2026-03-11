"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";

interface Lawyer {
  name: string;
  specialty: string;
  rating: number;
  location: string;
  phone: string;
  email: string;
  bio: string;
}

export const FindLawyerToolUI = makeAssistantToolUI<
  {
    issueType: string;
    location?: string;
    description: string;
    formData?: Record<string, unknown>;
  },
  { lawyers: Lawyer[] }
>({
  toolName: "find_lawyer",
  render: ({ args, result, status }) => {
    const loading = status.type === "running";

    if (loading) {
      return (
        <div className="my-4 rounded-xl border bg-muted/30 p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Finding the best lawyers for your case...
          </div>
        </div>
      );
    }

    if (!result?.lawyers?.length) return null;

    return (
      <div className="my-4 flex flex-col gap-4">
        {result.lawyers.map((lawyer, i) => (
          <Card key={i} className="w-full">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{lawyer.name}</CardTitle>
                  <CardDescription>{lawyer.specialty}</CardDescription>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {"★".repeat(Math.round(lawyer.rating))} {lawyer.rating}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <p className="text-muted-foreground">{lawyer.bio}</p>
              <Separator />
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>📍 {lawyer.location}</span>
                <span>📞 {lawyer.phone}</span>
                <span>✉️ {lawyer.email}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  },
});
