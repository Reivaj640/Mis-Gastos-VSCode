"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`text-center py-12 px-4 ${className}`}
    >
      <div className="relative inline-block mb-4">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full blur-xl" />
        <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-full">
          <Icon className="h-12 w-12 text-primary/60" />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="gap-2 shadow-sm"
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
