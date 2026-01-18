import Logo from './Logo'

export default function Header({ onLogoClick }) {
    return (
        <header className="px-6 py-6 md:px-12 md:py-8 flex justify-between items-center border-b border-white/5 transition-opacity duration-500 ease-in-out">
            <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={onLogoClick}
            >
                <div className="text-white transition-transform duration-300 group-hover:rotate-180">
                    <Logo className="w-6 h-6" />
                </div>
                <div className="font-serif text-2xl tracking-tight text-white group-hover:text-gray-300 transition-colors duration-300">
                    AirNode.
                </div>
            </div>
            <div className="text-xs tracking-widest uppercase text-gray-500 hidden sm:block opacity-60">
                P2P File Transfer
            </div>
        </header>
    )
}
