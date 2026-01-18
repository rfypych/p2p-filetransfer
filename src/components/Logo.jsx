export default function Logo({ className = "w-6 h-6" }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M12 2L2 22H22L12 2Z"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
            />
            <circle cx="12" cy="15" r="3" strokeWidth="1.5" className="text-white/50" />
        </svg>
    )
}
