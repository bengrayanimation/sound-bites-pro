import { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, Target, ArrowRight, BookOpen, HelpCircle, Share2, Download, CheckSquare, Square, FileText, FileCode } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Summary } from '@/types/recording';
import { shareText, generateSummaryText, downloadTextFile, downloadHtmlFile, generateSummaryHtml } from '@/lib/shareUtils';
import { toast } from 'sonner';

interface SummaryViewProps {
  summary?: Summary;
  title?: string;
}

export function SummaryView({ summary, title = 'Recording' }: SummaryViewProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleShare = async () => {
    if (!summary) return;
    const text = generateSummaryText(summary, title);
    const shared = await shareText(`Summary: ${title}`, text);
    if (shared) toast.success('Summary shared!');
  };

  const handleSaveText = () => {
    if (!summary) return;
    const text = generateSummaryText(summary, title);
    downloadTextFile(`${title.replace(/\s+/g, '_')}_summary.txt`, text);
    toast.success('Summary saved as text');
  };

  const handleSaveHtml = () => {
    if (!summary) return;
    const html = generateSummaryHtml(summary, title);
    downloadHtmlFile(`${title.replace(/\s+/g, '_')}_summary.html`, html);
    toast.success('Summary saved as HTML');
  };

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Briefcase className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">No summary yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          AI summaries will be generated after transcription
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="executive" className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-6">
          <TabsTrigger value="executive" className="gap-2">
            <Briefcase className="w-4 h-4" />
            Executive
          </TabsTrigger>
          <TabsTrigger value="student" className="gap-2">
            <GraduationCap className="w-4 h-4" />
            Student
          </TabsTrigger>
        </TabsList>

        <TabsContent value="executive" className="space-y-6">
          {/* Key Points */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Key Points</h3>
            </div>
            <div className="space-y-2">
              {summary.executive.keyPoints.map((point, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-2 text-sm text-muted-foreground"
                >
                  <span className="text-primary">•</span>
                  {point}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Decisions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-green-600" />
              <h3 className="font-semibold text-foreground">Decisions Made</h3>
            </div>
            <div className="space-y-2">
              {summary.executive.decisions.map((decision, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-2 text-sm text-muted-foreground"
                >
                  <span className="text-green-600">✓</span>
                  {decision}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Next Steps with checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-foreground">Next Steps</h3>
            </div>
            <div className="space-y-2">
              {summary.executive.nextSteps.map((step, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => toggleStep(i)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all text-left ${
                    completedSteps.has(i)
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-card border-border hover:border-primary/30'
                  }`}
                >
                  {completedSteps.has(i) ? (
                    <CheckSquare className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  )}
                  <span
                    className={`text-sm ${
                      completedSteps.has(i)
                        ? 'text-muted-foreground line-through'
                        : 'text-foreground'
                    }`}
                  >
                    {step}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="student" className="space-y-6">
          {/* Chapters */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Chapters</h3>
            </div>
            <div className="space-y-2">
              {summary.student.chapters.map((chapter, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 bg-muted/50 rounded-lg text-sm text-foreground"
                >
                  {chapter}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Glossary */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Glossary</h3>
            <div className="space-y-2">
              {summary.student.glossary.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 bg-card border border-border rounded-lg"
                >
                  <dt className="font-medium text-foreground text-sm">{item.term}</dt>
                  <dd className="text-sm text-muted-foreground mt-1">{item.definition}</dd>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quiz */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-600" />
              <h3 className="font-semibold text-foreground">Quick Quiz</h3>
            </div>
            <div className="space-y-2">
              {summary.student.quiz.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 bg-card border border-border rounded-lg space-y-2"
                >
                  <p className="font-medium text-foreground text-sm">Q: {item.question}</p>
                  <p className="text-sm text-muted-foreground">A: {item.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Share/Save Actions */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <Button variant="outline" className="flex-1" onClick={handleShare}>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Save
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleSaveText}>
              <FileText className="w-4 h-4 mr-2" />
              Save as Text (.txt)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSaveHtml}>
              <FileCode className="w-4 h-4 mr-2" />
              Save as HTML
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
