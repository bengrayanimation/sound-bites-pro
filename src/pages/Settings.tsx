import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Cpu,
  Cloud,
  Globe,
  Moon,
  Sun,
  CreditCard,
  Shield,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useRecordingStore } from '@/stores/recordingStore';
import { useState } from 'react';

export default function Settings() {
  const navigate = useNavigate();
  const { isPro, upgradeToPro, freeRecordingsLeft } = useRecordingStore();
  const [useCloudTranscription, setUseCloudTranscription] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 p-4 border-b border-border bg-background/95 backdrop-blur-sm">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold text-foreground">Settings</h1>
      </header>

      <main className="p-4 space-y-6">
        {/* Subscription card */}
        {!isPro && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-record">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-foreground mb-1">Upgrade to Pro</h2>
                <p className="text-sm text-muted-foreground mb-3">
                  {freeRecordingsLeft} free recordings left. Go Pro for unlimited access.
                </p>
                <Button size="sm" onClick={upgradeToPro}>
                  Upgrade — £4.99/month
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {isPro && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-card border border-border rounded-2xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">SoundBites Pro</h2>
                <p className="text-sm text-muted-foreground">You have full access to all features</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Transcription settings */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
            Transcription
          </h2>
          <div className="bg-card border border-border rounded-2xl divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">On-device</p>
                  <p className="text-xs text-muted-foreground">Private, works offline</p>
                </div>
              </div>
              <Switch
                checked={!useCloudTranscription}
                onCheckedChange={(checked) => setUseCloudTranscription(!checked)}
              />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Cloud</p>
                  <p className="text-xs text-muted-foreground">Faster, more accurate</p>
                </div>
              </div>
              <Switch
                checked={useCloudTranscription}
                onCheckedChange={setUseCloudTranscription}
              />
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
            Preferences
          </h2>
          <div className="bg-card border border-border rounded-2xl divide-y divide-border">
            <button className="flex items-center justify-between p-4 w-full text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Language</p>
                  <p className="text-xs text-muted-foreground">English (UK)</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  {isDarkMode ? (
                    <Moon className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Sun className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">
                    {isDarkMode ? 'On' : 'Off'}
                  </p>
                </div>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
            </div>
          </div>
        </section>

        {/* Account */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
            Account
          </h2>
          <div className="bg-card border border-border rounded-2xl divide-y divide-border">
            <button className="flex items-center justify-between p-4 w-full text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Subscription</p>
                  <p className="text-xs text-muted-foreground">
                    {isPro ? 'Pro — £4.99/month' : 'Free plan'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="flex items-center justify-between p-4 w-full text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Privacy</p>
                  <p className="text-xs text-muted-foreground">Data & permissions</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </section>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          SoundBites v1.0.0
        </p>
      </main>
    </div>
  );
}
