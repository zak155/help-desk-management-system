// src/components/tickets/CommentSection.tsx
"use client";

import { useState, useTransition } from "react";
import { createCommentAction } from "@/actions/comments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentItem {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    name: string;
    role: string;
  };
}

interface CommentSectionProps {
  ticketId: string;
  comments: CommentItem[];
}

export function CommentSection({ ticketId, comments }: CommentSectionProps) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setError(null);
    startTransition(async () => {
      const res = await createCommentAction(ticketId, content);
      if (res?.error) {
        setError(res.error);
      } else {
        setContent(""); // Clear input on success
      }
    });
  };

  return (
    <div className="rounded-lg border bg-card p-6 space-y-6">
      <h2 className="text-lg font-semibold">Discussion & Updates</h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <p className="text-xs font-medium text-destructive">{error}</p>}
        <Textarea
          placeholder="Write a message or update on this ticket..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isPending}
          rows={3}
          className="resize-none"
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending || !content.trim()} size="sm">
            {isPending ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4 divide-y">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-2">
            No comments yet. Start the conversation!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="pt-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {comment.author.name} ({comment.author.role})
                </span>
                <span>{new Date(comment.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}