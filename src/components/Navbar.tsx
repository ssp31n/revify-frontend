import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="border-b h-14 flex items-center px-4 md:px-6 bg-background">
      <div className="flex items-center gap-6 w-full max-w-6xl mx-auto">
        <Link to="/" className="font-bold text-xl flex items-center gap-2">
          Revify
        </Link>
        <div className="flex gap-4 text-sm font-medium text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/sessions" className="hover:text-primary transition-colors">
            Sessions
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
