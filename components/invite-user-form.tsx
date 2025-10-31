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

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Please enter a valid email address"),
});

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
      name: "",
      email: "",
    },
  });

  const handleSubmit = async (data: FormData) => {
    setIsInviting(true);
    try {
      // Use Appwrite Teams API to invite by email
      // This creates a membership with pending status and sends an invitation email
      // Pass name to ensure it's stored in userName field of membership
      await onInvite(teamId, "", data.name || "", data.email);

      toast({
        title: "Success",
        description: `Invitation sent to ${data.email}. They will receive an email to join the team.`,
      });

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
          Enter an email address to invite them to this team. They will receive
          an invitation email.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
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
