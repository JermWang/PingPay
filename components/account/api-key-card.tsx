"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { GlowButton } from "@/components/shared/GlowButton"
import { Copy, Eye, EyeOff, Trash2, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { ApiKey } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ApiKeyCardProps {
  apiKey: ApiKey
  plainKey?: string // Only provided on initial creation
  onRevoke?: () => void
}

export function ApiKeyCard({ apiKey, plainKey, onRevoke }: ApiKeyCardProps) {
  const [showFullKey, setShowFullKey] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const displayKey = plainKey || apiKey.key_prefix

  return (
    <Card className="bg-white/5 border-white/10 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold text-sm">
            {apiKey.name || "Unnamed Key"}
          </h3>
          <p className="text-xs text-muted-foreground">
            Created {formatDate(apiKey.created_at)}
          </p>
          {apiKey.last_used_at && (
            <p className="text-xs text-muted-foreground">
              Last used {formatDate(apiKey.last_used_at)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {apiKey.is_active ? (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
              Active
            </span>
          ) : (
            <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-1 rounded">
              Revoked
            </span>
          )}
        </div>
      </div>

      {/* API Key Display */}
      {plainKey && (
        <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg p-3 text-xs text-amber-100">
          <strong>⚠️ Save this key now!</strong> For security, it won't be shown again.
        </div>
      )}

      <div className="bg-black/40 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <code className="text-xs font-mono break-all flex-1">
            {showFullKey && plainKey ? plainKey : displayKey}
          </code>
          <div className="flex items-center gap-1 flex-shrink-0">
            {plainKey && (
              <button
                onClick={() => setShowFullKey(!showFullKey)}
                className="text-cyan-400 hover:text-cyan-300 p-1.5 rounded hover:bg-white/5"
                title={showFullKey ? "Hide key" : "Show full key"}
              >
                {showFullKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={() => copyToClipboard(plainKey || apiKey.key_prefix)}
              className="text-cyan-400 hover:text-cyan-300 p-1.5 rounded hover:bg-white/5"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Usage Example */}
      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          Usage example
        </summary>
        <div className="mt-2 bg-black/40 rounded p-2 overflow-x-auto">
          <code className="text-[10px] text-green-400">
            curl -H "Authorization: Bearer {plainKey || 'YOUR_API_KEY'}"
            https://pingpay.app/api/solana/balance?address=...
          </code>
        </div>
      </details>

      {/* Actions */}
      {apiKey.is_active && (
        <div className="flex gap-2 pt-2 border-t border-white/10">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded hover:bg-red-500/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
                Revoke
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="backdrop-blur-xl bg-white/5 border border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will immediately disable this API key. Any applications using it will no longer work.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onRevoke}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Revoke Key
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </Card>
  )
}

