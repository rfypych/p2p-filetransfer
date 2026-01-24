export default function Footer({ onPrivacyClick, onTermsClick }) {
    return (
        <footer className="px-6 py-4 sm:px-8 sm:py-6 md:px-12 md:py-8 bg-[#080808] border-t border-white/5 text-[10px] sm:text-xs text-gray-600 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 transition-colors duration-500 hover:text-gray-500">
            <div className="flex gap-2 sm:gap-4">
                <span>&copy; {new Date().getFullYear()} AirNode</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Serverless WebRTC</span>
            </div>

            <div className="flex gap-4 sm:gap-6">
                <a
                    href="https://github.com/rfypych/p2p-filetransfer"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white cursor-pointer transition-colors"
                >
                    GitHub
                </a>
                <button
                    onClick={onPrivacyClick}
                    className="hover:text-white cursor-pointer transition-colors bg-transparent border-none p-0 text-[10px] sm:text-xs text-gray-600 font-sans"
                >
                    Privacy
                </button>
                <button
                    onClick={onTermsClick}
                    className="hover:text-white cursor-pointer transition-colors bg-transparent border-none p-0 text-[10px] sm:text-xs text-gray-600 font-sans"
                >
                    Terms
                </button>
            </div>
        </footer>
    )
}
