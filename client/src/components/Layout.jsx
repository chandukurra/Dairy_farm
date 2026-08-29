import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="d-flex min-vh-100 bg-light">
            <Sidebar />
            <div className="flex-grow-1 d-flex flex-column">
                <Navbar />
                <main className="p-4 flex-grow-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;