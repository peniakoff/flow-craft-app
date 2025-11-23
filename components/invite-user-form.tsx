"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AppwriteException } from "appwrite";
import { Loader2, Mail, UserPlus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z
  .object({
    userId: z.string().optional().or(z.literal("")),
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .optional()
      .or(z.literal("")),
    email: z.string().email("Please enter a valid email address"),
  })
  .refine(
    (data) => {
      // Either userId or email must be provided, but not both
      const hasUserId = data.userId && data.userId.trim().length > 0;
      const hasEmail = data.email && data.email.trim().length > 0;
      return hasUserId || hasEmail;
    },
    {
      message: "Please provide either a User ID or an email address",
      path: ["email"],
    }
  );

type FormData = z.infer<typeof formSchema>;

interface InviteUserFormProps {
  teamId: string;
  onInvite: (
    teamId: string,
    userId: string,
    userName: string,
    userEmail: string
  ) => Promise<void>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function InviteUserForm({
  teamId,
  onInvite,
  onSuccess,
  onCancel,
}: InviteUserFormProps) {
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      name: "",
      email: "",
    },
  });

  const handleSubmit = async (data: FormData) => {
    setIsInviting(true);
    try {
      const hasUserId = data.userId && data.userId.trim().length > 0;

      if (hasUserId) {
        // Add user directly by userId (no email confirmation needed)
        await onInvite(teamId, data.userId!, data.name || "", data.email);

        toast({
          title: "Success",
          description: `User added to the team successfully.`,
        });
      } else {
        // Send email invitation (requires confirmation)
        await onInvite(teamId, "", data.name || "", data.email);

        toast({
          title: "Success",
          description: `Invitation sent to ${data.email}. They will receive an email to join the team.`,
        });
      }

      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Invite error:", error);
      const message =
        error instanceof AppwriteException
          ? error.message
          : "Failed to invite user";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Mail className="h-4 w-4" />
        <AlertDescription>
          <strong>Option 1:</strong> Enter a User ID to add an existing user
          directly (no email needed).
          <br />
          <strong>Option 2:</strong> Enter an email address to send an
          invitation (requires confirmation).
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User ID (for existing users)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., 673bd39e002e5fa8ce77"
                    {...field}
                    disabled={isInviting}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground mt-1">
                  Find User ID in Appwrite Console → Auth → Users
                </p>
              </FormItem>
            )}
          />

          <div className="text-center text-sm text-muted-foreground">
            — OR —
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address (for new invitations)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="user@example.com"
                    {...field}
                    disabled={isInviting}
                    type="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    {...field}
                    disabled={isInviting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isInviting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isInviting}>
              {isInviting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
