import { Link } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
    return (
        <nav className="bg-white shadow-sm border-b border-gray-100">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        SplitWise Clone
                    </Link>

                    <div className="flex items-center space-x-4">
                        <span className="text-gray-600">
                            Hello, <span className="font-semibold text-gray-900">{user.name}</span>
                        </span>
                        <button
                            onClick={onLogout}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors duration-200"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
