import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { WalletProvider } from "@/lib/walletProvider";
import { NotificationProvider } from "@/components/NotificationSystem";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <NotificationProvider>
          <Router />
          <Toaster />
        </NotificationProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
