// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { motion } from "framer-motion";

import { cn } from "~/lib/utils";

export function Welcome({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("flex flex-col", className)}
      style={{ transition: "all 0.2s ease-out" }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h3 className="mb-2 text-center text-3xl font-medium">
        你好！
      </h3>
      <div className="text-muted-foreground px-4 text-center text-lg">
        这是使用最前沿的大语言模型构建的AI助手,帮助你解决风貌领域的复杂问题。
      </div>
    </motion.div>
  );
}
