import Logo from './Logo'
import { useTheme } from '../hooks/useTheme'

export default function Header({ onLogoClick }) {
    const { theme, toggleTheme } = useTheme()

    return (
        <header className="px-6 py-6 md:px-12 md:py-8 flex justify-between items-center border-b border-border bg-background relative z-50 transition-all duration-500 ease-in-out">
            <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={onLogoClick}
            >
                <div className="text-primary transition-transform duration-300 group-hover:rotate-180">
                    <Logo className="w-6 h-6" />
                </div>
                <div className="font-serif text-2xl tracking-tight text-primary group-hover:text-secondary transition-colors duration-300">
                    AirNode.
                </div>
            </div>

            <div className="flex items-center gap-6">
                <button
                    onClick={toggleTheme}
                    className="p-2 text-secondary hover:text-primary transition-colors focus:outline-none"
                    aria-label="Toggle Theme"
                >
                    {theme === 'dark' ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>

                <div className="text-xs tracking-widest uppercase text-secondary hidden sm:block opacity-60">
                    P2P File Transfer
                </div>
            </div>
        </header>
    )
}
