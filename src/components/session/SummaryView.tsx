import { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, Target, ArrowRight, BookOpen, HelpCircle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Summary } from '@/types/recording';

interface SummaryViewProps {
  summary?: Summary;
}

export function SummaryView({ summary }: SummaryViewProps) {
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

        {/* Next Steps */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-foreground">Next Steps</h3>
          </div>
          <div className="space-y-2">
            {summary.executive.nextSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-2 text-sm text-muted-foreground"
              >
                <span className="text-blue-600">{i + 1}.</span>
                {step}
              </motion.div>
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
  );
}
