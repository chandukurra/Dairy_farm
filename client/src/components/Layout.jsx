import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="app-shell d-flex min-vh-100">
            <Sidebar />
            <div className="app-content flex-grow-1 d-flex flex-column">
                <Navbar />
                <main className="app-main p-4 flex-grow-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
