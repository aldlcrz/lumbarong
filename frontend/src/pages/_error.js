import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

function Error({ statusCode }) {
    return (
        <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <AlertTriangle size={40} className="text-amber-600" />
                    </div>

                    <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
                        {statusCode ? `Error ${statusCode} Occurred` : 'An unexpected error occurred'}
                    </h1>

                    <p className="text-gray-500 font-medium mb-10 leading-relaxed">
                        We encountered a temporary technical issue. Please try refreshing the page.
                    </p>

                    <button
                        onClick={() => window.location.reload()}
                        className="bg-red-600 text-white h-12 px-8 rounded-xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-xl shadow-red-200 mx-auto"
                    >
                        <RefreshCw size={18} />
                        Refresh Page
                    </button>
                </motion.div>
            </div>
        </div>
    );
}

Error.getInitialProps = ({ res, err }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};

export default Error;
