// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { Check, Copy, Headphones, Pencil, Undo2, X, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { ScrollContainer } from "~/components/deer-flow/scroll-container";
import { Tooltip } from "~/components/deer-flow/tooltip";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { Message } from "~/core/messages";
import { useReplay } from "~/core/replay";
import { closeResearch, listenToPodcast, useStore } from "~/core/store";
import { cn } from "~/lib/utils";

import { ResearchActivitiesBlock } from "./research-activities-block";
import { ResearchReportBlock } from "./research-report-block";

export function ResearchBlock({
  className,
  researchId = null,
}: {
  className?: string;
  researchId: string | null;
}) {
  const t = useTranslations("chat.research");
  const reportId = useStore((state) =>
    researchId ? state.researchReportIds.get(researchId) : undefined,
  );
  const [activeTab, setActiveTab] = useState("activities");
  const hasReport = useStore((state) =>
    researchId ? state.researchReportIds.has(researchId) : false,
  );
  const reportStreaming = useStore((state) =>
    reportId ? (state.messages.get(reportId)?.isStreaming ?? false) : false,
  );
  const { isReplay } = useReplay();
  useEffect(() => {
    if (hasReport) {
      setActiveTab("report");
    }
  }, [hasReport]);

  const handleGeneratePodcast = useCallback(async () => {
    if (!researchId) {
      return;
    }
    await listenToPodcast(researchId);
  }, [researchId]);

  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    if (!reportId) {
      return;
    }
    const report = useStore.getState().messages.get(reportId);
    if (!report) {
      return;
    }
    void navigator.clipboard.writeText(report.content);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  }, [reportId]);

  // Download all reports as markdown
  const handleDownload = useCallback(() => {
    const state = useStore.getState();
    const { researchIds, researchReportIds, messages } = state;

    const allReports: Array<{ researchId: string; reportId: string; report: Message; index: number }> = [];

    researchIds.forEach((researchId, index) => {
      const reportId = researchReportIds.get(researchId);
      if (reportId) {
        const report = messages.get(reportId);
        if (report) {
          allReports.push({
            researchId,
            reportId,
            report,
            index: index + 1
          });
        }
      }
    });

    if (allReports.length === 0) {
      console.log("没有找到任何report");
      return;
    }

    console.log("所有reports:", allReports);
    let markdownContent = ``;

     // 分离大纲和其他报告
     const outlineReport = allReports.find(({ index }) => index === 1); // 大纲
     const otherReports = allReports.filter(({ index }) => index > 1); // 概述、分析、综述说明

     if (outlineReport) {
       const outlineContent = outlineReport.report.content;

       const summaryIndex = outlineContent.indexOf('## 要点总结');
       const referenceIndex = outlineContent.indexOf('## 关键引用');

       if (summaryIndex !== -1 && referenceIndex !== -1) {
         const beforeSummary = outlineContent.substring(0, summaryIndex);

         const summaryEndIndex = outlineContent.indexOf('\n\n', summaryIndex);
         const summarySection = summaryEndIndex !== -1
           ? outlineContent.substring(summaryIndex, summaryEndIndex + 2)
           : outlineContent.substring(summaryIndex);

         const referenceEndIndex = outlineContent.indexOf('\n\n', referenceIndex);
         const referenceSection = referenceEndIndex !== -1
           ? outlineContent.substring(referenceIndex, referenceEndIndex + 2)
           : outlineContent.substring(referenceIndex);

         const afterReference = referenceEndIndex !== -1
           ? outlineContent.substring(referenceEndIndex + 2)
           : '';

         markdownContent += beforeSummary;
         markdownContent += summarySection;

         otherReports.forEach(({ report }) => {
           markdownContent += report.content + '\n\n';
         });

         markdownContent += referenceSection;
         markdownContent += afterReference;
       } else {
         markdownContent += outlineContent + '\n\n';
         otherReports.forEach(({ report }) => {
           markdownContent += report.content + '\n\n';
         });
       }
     } else {
       allReports.forEach(({ report }) => {
         markdownContent += report.content + '\n\n';
       });
     }

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const filename = `research-reports-${timestamp}.md`;
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }, []);


  const handleEdit = useCallback(() => {
    setEditing((editing) => !editing);
  }, []);

  // When the research id changes, set the active tab to activities
  useEffect(() => {
    if (!hasReport) {
      setActiveTab("activities");
    }
  }, [hasReport, researchId]);

  return (
    <div className={cn("h-full w-full", className)}>
      <Card className={cn("relative h-full w-full pt-4", className)}>
        <div className="absolute right-4 flex h-9 items-center justify-center">
          {hasReport && !reportStreaming && (
            <>
              <Tooltip title={t("generatePodcast")}>
                <Button
                  className="text-gray-400"
                  size="icon"
                  variant="ghost"
                  disabled={isReplay}
                  onClick={handleGeneratePodcast}
                >
                  <Headphones />
                </Button>
              </Tooltip>
              <Tooltip title={t("edit")}>
                <Button
                  className="text-gray-400"
                  size="icon"
                  variant="ghost"
                  disabled={isReplay}
                  onClick={handleEdit}
                >
                  {editing ? <Undo2 /> : <Pencil />}
                </Button>
              </Tooltip>
              <Tooltip title={t("copy")}>
                <Button
                  className="text-gray-400"
                  size="icon"
                  variant="ghost"
                  onClick={handleCopy}
                >
                  {copied ? <Check /> : <Copy />}
                </Button>
              </Tooltip>
              <Tooltip title={t("downloadReport")}>
                <Button
                  className="text-gray-400"
                  size="icon"
                  variant="ghost"
                  onClick={handleDownload}
                >
                  <Download />
                </Button>
              </Tooltip>
            </>
          )}
          <Tooltip title={t("close")}>
            <Button
              className="text-gray-400"
              size="sm"
              variant="ghost"
              onClick={() => {
                closeResearch();
              }}
            >
              <X />
            </Button>
          </Tooltip>
        </div>
        <Tabs
          className="flex h-full w-full flex-col"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value)}
        >
          <div className="flex w-full justify-center">
            <TabsList className="">
              <TabsTrigger
                className="px-8"
                value="report"
                disabled={!hasReport}
              >
                {t("report")}
              </TabsTrigger>
              <TabsTrigger className="px-8" value="activities">
                {t("activities")}
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent
            className="h-full min-h-0 flex-grow px-8"
            value="report"
            forceMount
            hidden={activeTab !== "report"}
          >
            <ScrollContainer
              className="px-5pb-20 h-full"
              scrollShadowColor="var(--card)"
              autoScrollToBottom={!hasReport || reportStreaming}
            >
              {reportId && researchId && (
                <ResearchReportBlock
                  className="mt-4"
                  researchId={researchId}
                  messageId={reportId}
                  editing={editing}
                />
              )}
            </ScrollContainer>
          </TabsContent>
          <TabsContent
            className="h-full min-h-0 flex-grow px-8"
            value="activities"
            forceMount
            hidden={activeTab !== "activities"}
          >
            <ScrollContainer
              className="h-full"
              scrollShadowColor="var(--card)"
              autoScrollToBottom={!hasReport || reportStreaming}
            >
              {researchId && (
                <ResearchActivitiesBlock
                  className="mt-4"
                  researchId={researchId}
                />
              )}
            </ScrollContainer>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
