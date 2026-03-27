/**
 * WhatsApp UI Components
 * 
 * Reusable components for the WhatsApp integration in seller dashboard
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Send, Image, FileText, CreditCard, Plus, X,
  Search, Clock, Zap, MoreHorizontal, Check, Copy, Trash2,
  Edit, Tag, Download, Upload, Phone, Video, Settings,
  ChevronDown, ChevronUp, Sparkles, Loader2
} from "lucide-react";
import { format } from "date-fns";

// ─── Quick Replies Panel ─────────────────────────────────────
interface QuickReply {
  _id: string;
  title: string;
  shortcut: string;
  message: string;
  category?: string;
  usageCount: number;
}

interface QuickRepliesPanelProps {
  quickReplies: QuickReply[];
  onSelect: (reply: QuickReply) => void;
  onCreate?: () => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export function QuickRepliesPanel({
  quickReplies,
  onSelect,
  onCreate,
  onDelete,
  isLoading
}: QuickRepliesPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>("all");

  const filteredReplies = quickReplies.filter(reply =>
    reply.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reply.shortcut.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reply.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(quickReplies.map(r => r.category || "General"))];

  return (
    <div className="glass rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          Quick Replies
        </h3>
        {onCreate && (
          <button
            onClick={onCreate}
            className="p-1.5 hover:bg-accent rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search quick replies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-accent/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
        />
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredReplies.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-4">
              No quick replies found
            </div>
          ) : (
            filteredReplies.map((reply) => (
              <motion.div
                key={reply._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => onSelect(reply)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">{reply.title}</span>
                      {reply.shortcut && (
                        <span className="text-xs px-1.5 py-0.5 bg-green-500/10 text-green-500 rounded font-mono">
                          {reply.shortcut}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{reply.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Used {reply.usageCount} times</span>
                    </div>
                  </div>
                  {onDelete && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(reply._id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Quick Reply Creator ─────────────────────────────────────
interface QuickReplyCreatorProps {
  onSave: (reply: { title: string; shortcut: string; message: string; category?: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function QuickReplyCreator({ onSave, onCancel, isLoading }: QuickReplyCreatorProps) {
  const [title, setTitle] = useState("");
  const [shortcut, setShortcut] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    onSave({ title, shortcut, message, category: category || undefined });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-4"
    >
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Create Quick Reply
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Greeting"
            className="w-full px-3 py-2 bg-accent/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Shortcut (optional)</label>
          <input
            type="text"
            value={shortcut}
            onChange={(e) => setShortcut(e.target.value)}
            placeholder="e.g., /hi"
            className="w-full px-3 py-2 bg-accent/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            rows={3}
            className="w-full px-3 py-2 bg-accent/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category (optional)</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 bg-accent/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
          >
            <option value="">General</option>
            <option value="greeting">Greeting</option>
            <option value="order">Order</option>
            <option value="payment">Payment</option>
            <option value="shipping">Shipping</option>
            <option value="support">Support</option>
          </select>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !title.trim() || !message.trim()}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ─── Template Selector ────────────────────────────────────────
interface Template {
  _id: string;
  name: string;
  category: string;
  content: string;
}

interface TemplateSelectorProps {
  templates: Template[];
  onSelect: (template: Template) => void;
  isLoading?: boolean;
}

export function TemplateSelector({ templates, onSelect, isLoading }: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(templates.map(t => t.category))];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="glass rounded-xl p-4">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Message Templates
      </h3>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-accent/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
        />
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
            selectedCategory === null
              ? "bg-green-500 text-white"
              : "bg-accent hover:bg-accent/80"
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap capitalize transition-colors ${
              selectedCategory === cat
                ? "bg-green-500 text-white"
                : "bg-accent hover:bg-accent/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredTemplates.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-4">
              No templates found
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <button
                key={template._id}
                onClick={() => onSelect(template)}
                className="w-full p-3 text-left rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors"
              >
                <div className="font-medium text-sm mb-1">{template.name}</div>
                <p className="text-xs text-muted-foreground line-clamp-2">{template.content}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Payment Link Generator ─────────────────────────────────
interface PaymentLinkGeneratorProps {
  onGenerate: (amount: number, description: string) => void;
  isLoading?: boolean;
}

export function PaymentLinkGenerator({ onGenerate, isLoading }: PaymentLinkGeneratorProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    onGenerate(parseInt(amount), description);
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
    }
  };

  return (
    <div className="glass rounded-xl p-4">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <CreditCard className="w-4 h-4" />
        Generate Payment Link
      </h3>

      {!generatedLink ? (
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount (UGX)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="50000"
              className="w-full px-3 py-2 bg-accent/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Order for..."
              className="w-full px-3 py-2 bg-accent/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !amount || !description}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Link
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-500 font-medium mb-2">Payment Link Generated!</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-background p-2 rounded overflow-x-auto">
                {generatedLink}
              </code>
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={() => setGeneratedLink(null)}
            className="w-full px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent transition-colors"
          >
            Generate Another
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Contact Card ───────────────────────────────────────────
interface WhatsAppContact {
  _id: string;
  name?: string;
  phone: string;
  tags: string[];
  lastSeenAt?: number;
}

interface ContactCardProps {
  contact: WhatsAppContact;
  onEdit?: () => void;
  onTag?: (tags: string[]) => void;
}

export function ContactCard({ contact, onEdit, onTag }: ContactCardProps) {
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    const updatedTags = [...contact.tags, newTag.trim()];
    onTag?.(updatedTags);
    setNewTag("");
    setShowTagInput(false);
  };

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
          {contact.name?.[0] || contact.phone[contact.phone.length - 1]}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium">{contact.name || "Unknown"}</h4>
          <p className="text-sm text-muted-foreground">{contact.phone}</p>
          {contact.lastSeenAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Last seen: {format(new Date(contact.lastSeenAt), "MMM d, h:mm a")}
            </p>
          )}
        </div>
        {onEdit && (
          <button onClick={onEdit} className="p-1 hover:bg-accent rounded">
            <Edit className="w-4 h-4" />
          </button>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Tags</span>
          <button
            onClick={() => setShowTagInput(!showTagInput)}
            className="text-xs text-green-500 hover:underline"
          >
            Add Tag
          </button>
        </div>

        <AnimatePresence>
          {showTagInput && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex gap-2 mb-2"
            >
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="New tag"
                className="flex-1 px-2 py-1 bg-accent rounded text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              />
              <button
                onClick={handleAddTag}
                className="px-2 py-1 bg-green-500 text-white rounded text-sm"
              >
                Add
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap gap-1">
          {contact.tags.length > 0 ? (
            contact.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-accent rounded-full text-xs"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">No tags</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Media Preview ─────────────────────────────────────────
interface MediaPreviewProps {
  type: "image" | "video" | "audio" | "document";
  url: string;
  caption?: string;
  onClose: () => void;
}

export function MediaPreview({ type, url, caption, onClose }: MediaPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 p-2 text-white hover:bg-white/20 rounded-lg"
        >
          <X className="w-6 h-6" />
        </button>

        {type === "image" && (
          <img src={url} alt={caption} className="max-w-full max-h-[80vh] rounded-lg" />
        )}
        {type === "video" && (
          <video src={url} controls className="max-w-full max-h-[80vh] rounded-lg" />
        )}
        {type === "audio" && (
          <div className="bg-card p-6 rounded-lg">
            <audio src={url} controls className="w-full" />
          </div>
        )}
        {type === "document" && (
          <div className="bg-card p-6 rounded-lg flex items-center gap-4">
            <FileText className="w-12 h-12 text-blue-500" />
            <div>
              <p className="font-medium">{caption || "Document"}</p>
              <a href={url} download className="text-sm text-green-500 hover:underline flex items-center gap-1 mt-1">
                <Download className="w-4 h-4" /> Download
              </a>
            </div>
          </div>
        )}

        {caption && type !== "document" && (
          <p className="text-white text-center mt-4">{caption}</p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Chat Input with Quick Actions ───────────────────────────
interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onQuickReply?: (message: string) => void;
  onAttach?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onQuickReply,
  onAttach,
  disabled,
  placeholder = "Type a message..."
}: ChatInputProps) {
  const [showQuickActions, setShowQuickActions] = useState(false);

  return (
    <div className="border-t border-border/50 p-4">
      {/* Quick Actions Dropdown */}
      <AnimatePresence>
        {showQuickActions && onQuickReply && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-3 p-3 bg-card rounded-lg border border-border"
          >
            <p className="text-xs text-muted-foreground mb-2">Quick Actions</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { onQuickReply("Thanks for your message! I'll get back to you shortly."); setShowQuickActions(false); }}
                className="px-3 py-1.5 bg-accent hover:bg-accent/80 rounded-lg text-xs"
              >
                Quick Reply
              </button>
              <button
                onClick={() => { onQuickReply("Let me check on that for you..."); setShowQuickActions(false); }}
                className="px-3 py-1.5 bg-accent hover:bg-accent/80 rounded-lg text-xs"
              >
                Checking...
              </button>
              <button
                onClick={() => { onQuickReply("Could you please provide more details?"); setShowQuickActions(false); }}
                className="px-3 py-1.5 bg-accent hover:bg-accent/80 rounded-lg text-xs"
              >
                Need Info
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        {onAttach && (
          <button
            onClick={onAttach}
            disabled={disabled}
            className="p-2.5 hover:bg-accent rounded-xl transition-colors disabled:opacity-50"
          >
            <Image className="w-5 h-5" />
          </button>
        )}

        {onQuickReply && (
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            disabled={disabled}
            className={`p-2.5 rounded-xl transition-colors disabled:opacity-50 ${
              showQuickActions ? "bg-green-500 text-white" : "hover:bg-accent"
            }`}
          >
            <Zap className="w-5 h-5" />
          </button>
        )}

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSend()}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-4 py-2.5 bg-accent/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50"
        />

        <button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="p-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}