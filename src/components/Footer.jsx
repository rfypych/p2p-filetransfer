import { FaGithub } from 'react-icons/fa';

export default function Footer({ onPrivacyClick, onTermsClick, onTechStackClick }) {
    return (
        <footer className="px-6 py-4 sm:px-8 sm:py-5 md:px-12 md:py-6 bg-[#080808] border-t border-white/5 text-xs text-gray-500 transition-colors duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
                <div className="flex items-center gap-2 sm:gap-3">
                    <span className="font-medium text-gray-400">&copy; {new Date().getFullYear()} AirNode</span>
                    <span className="hidden sm:inline text-white/20">|</span>
                    <span className="hidden sm:inline text-gray-600">Serverless • Encrypted • P2P</span>
                </div>

                <div className="flex gap-4 sm:gap-5">
                    <a
                        href="https://github.com/rfypych/p2p-filetransfer"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors"
                    >
                        <FaGithub className="w-3.5 h-3.5" />
                        <span>GitHub</span>
                    </a>
                    <button
                        onClick={onTechStackClick}
                        className="text-gray-500 hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer"
                    >
                        Tech Stack
                    </button>
                    <button
                        onClick={onPrivacyClick}
                        className="text-gray-500 hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer"
                    >
                        Privacy
                    </button>
                    <button
                        onClick={onTermsClick}
                        className="text-gray-500 hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer"
                    >
                        Terms
                    </button>
                </div>
            </div>
        </footer>
    )
}
