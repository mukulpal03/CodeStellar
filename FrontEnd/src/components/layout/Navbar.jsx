import { Link } from "@tanstack/react-router";

const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Codestellar
        </Link>
        <div className="space-x-4">
          <Link
            to="/problems"
            className="hover:text-gray-300"
            activeProps={{ className: "font-bold" }}
          >
            Problems
          </Link>
          <Link
            to="/login"
            className="hover:text-gray-300"
            activeProps={{ className: "font-bold" }}
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="hover:text-gray-300"
            activeProps={{ className: "font-bold" }}
          >
            Signup
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;