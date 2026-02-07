import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { CheckCircle2, XCircle, Clock, Key, FileText, ExternalLink } from 'lucide-react';
import type { HotkeyAttempt, ProposalAttempt } from '../../backend';

function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1_000_000);
  return date.toLocaleString();
}

function getStatusBadge(status: HotkeyAttempt['status'] | ProposalAttempt['status']) {
  switch (status.__kind__) {
    case 'success':
      return (
        <Badge variant="default" className="gap-1 bg-green-500/10 text-green-600 border-green-500/50">
          <CheckCircle2 className="h-3 w-3" />
          Success
        </Badge>
      );
    case 'failure':
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Failed
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
  }
}

function getStatusMessage(status: HotkeyAttempt['status'] | ProposalAttempt['status']): string {
  switch (status.__kind__) {
    case 'success':
      return status.success;
    case 'failure':
      return status.failure;
    case 'pending':
      return 'Processing...';
  }
}

export default function ActivityHistory() {
  const { data: userProfile } = useGetCallerUserProfile();

  const hotkeyAttempts = userProfile?.hotkeyAttempts || [];
  const proposalAttempts = userProfile?.proposalAttempts || [];

  return (
    <div className="max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>
            View your recent hotkey management actions and proposal submissions. The last 10 attempts of each type are shown.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="hotkeys" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
              <TabsTrigger value="hotkeys" className="gap-2">
                <Key className="h-4 w-4" />
                Hotkeys ({hotkeyAttempts.length})
              </TabsTrigger>
              <TabsTrigger value="proposals" className="gap-2">
                <FileText className="h-4 w-4" />
                Proposals ({proposalAttempts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hotkeys">
              {hotkeyAttempts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hotkey attempts yet</p>
                  <p className="text-sm mt-2">Add or remove hotkeys in the Neuron tab to see them here</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Neuron ID</TableHead>
                        <TableHead>Hotkey Principal</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hotkeyAttempts.map((attempt, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-xs whitespace-nowrap">
                            {formatTimestamp(attempt.timestamp)}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{attempt.neuronId}</TableCell>
                          <TableCell className="font-mono text-xs max-w-[200px] truncate">
                            {attempt.hotkey.toString()}
                          </TableCell>
                          <TableCell>{getStatusBadge(attempt.status)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[250px] truncate">
                            {getStatusMessage(attempt.status)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="proposals">
              {proposalAttempts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No proposal attempts yet</p>
                  <p className="text-sm mt-2">Submit a motion proposal in the Proposal tab to see it here</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Neuron ID</TableHead>
                        <TableHead>Proposal ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {proposalAttempts.map((attempt, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-xs whitespace-nowrap">
                            {formatTimestamp(attempt.timestamp)}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{attempt.neuronId}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {attempt.proposalId ? (
                              <a
                                href={`https://nns.ic0.app/proposal/?u=qoctq-giaaa-aaaaa-aaaea-cai&proposal=${attempt.proposalId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                              >
                                {attempt.proposalId}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(attempt.status)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[250px] truncate">
                            {getStatusMessage(attempt.status)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
