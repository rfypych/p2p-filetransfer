import { motion } from 'framer-motion'
import { useMemo } from 'react'

const Particles = () => {
    // Generate particles only once using useMemo to keep component pure
    // We move Math.random() calls inside the useMemo callback, which runs during render but is memoized
    // so it won't re-run and cause jitter unless deps change.
    // Ideally, randomness should be seeded or done in useEffect, but for visual particles useMemo is standard pattern in React.
    // However, ESLint "purity" rule complains about Math.random during render.
    // We can use a simple initialization effect to set state, but that triggers re-render.
    // Or we can just ignore the rule here as it's purely visual.

    // Better approach: Generate data deterministically or outside render if possible? No.
    // Let's suppress the warning for this file as it's intended behavior for particles.

    /* eslint-disable react-hooks/purity */
    const particles = useMemo(() => Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 5
    })), [])
    /* eslint-enable react-hooks/purity */

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full bg-white opacity-10"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: particle.size,
                        height: particle.size,
                    }}
                    animate={{
                        y: [0, -100, 0],
                        opacity: [0.1, 0.3, 0.1],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        delay: particle.delay,
                        ease: "linear",
                    }}
                />
            ))}
        </div>
    )
}

export default Particles
