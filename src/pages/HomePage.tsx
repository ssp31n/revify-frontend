import { Link } from "react-router-dom";
import { ArrowRight, Code, GitPullRequest, Zap } from "lucide-react";

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] py-12 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="max-w-3xl text-center space-y-8 relative z-10">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4 backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
          Build for Developers
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
          Code Review <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
            Without the PR
          </span>
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Skip the Git dance. Just upload your code, share a link, and start
          reviewing instantly. The fastest way to get feedback on your code
          snippets.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Link
            to="/sessions"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
          >
            Start Reviewing <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <a
            href="https://github.com/ssp31n/revify-frontend"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-8 py-3 text-base font-semibold hover:bg-accent hover:text-accent-foreground transition-all"
          >
            Documentation
          </a>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left">
          <div className="p-6 rounded-xl border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 text-primary">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Instant Setup</h3>
            <p className="text-muted-foreground text-sm">
              No repo permissions needed. Just drag, drop, and you're ready to
              review in seconds.
            </p>
          </div>
          <div className="p-6 rounded-xl border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4 text-blue-500">
              <Code className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Code Centric</h3>
            <p className="text-muted-foreground text-sm">
              Built-in syntax highlighting for 100+ languages. Clean, read-only
              view focused on the code.
            </p>
          </div>
          <div className="p-6 rounded-xl border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4 text-green-500">
              <GitPullRequest className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Threaded Comments</h3>
            <p className="text-muted-foreground text-sm">
              Discuss specific lines with threaded comments. Resolve discussions
              as you go.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
