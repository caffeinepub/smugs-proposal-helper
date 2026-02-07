import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginButton from './components/auth/LoginButton';
import NeuronManager from './components/neuron/NeuronManager';
import ProposalForm from './components/proposals/ProposalForm';
import ActivityHistory from './components/history/ActivityHistory';
import { Loader2, Swords, FileText, History } from 'lucide-react';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="border-b-2 border-border bg-card pixel-shadow">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded bg-primary/20 flex items-center justify-center pixel-border">
                <img 
                  src="/assets/generated/dk-emblem.dim_256x256.png" 
                  alt="Dragon Knight Emblem"
                  className="h-10 w-10 pixelated"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground pixel-text">smugs proposal helper</h1>
                <p className="text-xs text-muted-foreground">tell the network how you really feel</p>
              </div>
            </div>
            <LoginButton />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md pixel-border pixel-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-24 w-24 rounded bg-primary/20 flex items-center justify-center pixel-border">
                <img 
                  src="/assets/generated/dk-emblem.dim_256x256.png" 
                  alt="Dragon Knight Emblem"
                  className="h-20 w-20 pixelated"
                />
              </div>
              <CardTitle className="text-2xl pixel-text">smugs proposal helper</CardTitle>
              <CardDescription className="text-base">
                tell the network how you really feel
              </CardDescription>
              <CardDescription className="text-sm mt-2">
                Sign in with Internet Identity to manage your neuron hotkeys and submit motion proposals to the Network Nervous System.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              <LoginButton />
            </CardContent>
          </Card>
        </main>

        <footer className="border-t-2 border-border bg-card py-6 pixel-shadow">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            © 2026. Built with ❤️ using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              caffeine.ai
            </a>
          </div>
        </footer>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b-2 border-border bg-card sticky top-0 z-50 pixel-shadow">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded bg-primary/20 flex items-center justify-center pixel-border">
              <img 
                src="/assets/generated/dk-emblem.dim_256x256.png" 
                alt="Dragon Knight Emblem"
                className="h-10 w-10 pixelated"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground pixel-text">smugs proposal helper</h1>
              <p className="text-xs text-muted-foreground">tell the network how you really feel</p>
            </div>
          </div>
          <LoginButton />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs defaultValue="neuron" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8 pixel-border">
            <TabsTrigger value="neuron" className="flex items-center gap-2 pixel-text">
              <Swords className="h-4 w-4" />
              <span className="hidden sm:inline">Neuron</span>
            </TabsTrigger>
            <TabsTrigger value="proposal" className="flex items-center gap-2 pixel-text">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Proposal</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 pixel-text">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="neuron" className="space-y-6">
            <NeuronManager />
          </TabsContent>

          <TabsContent value="proposal" className="space-y-6">
            <ProposalForm />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <ActivityHistory />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t-2 border-border bg-card py-6 mt-auto pixel-shadow">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026. Built with ❤️ using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-primary transition-colors font-medium"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
