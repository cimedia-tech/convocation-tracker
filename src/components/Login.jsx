import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'

export default function Login() {
  const { loginWithGoogle } = useAuth()

  return (
    <div className="min-h-screen bg-church-background text-church-textMain flex flex-col lg:flex-row overflow-hidden font-technical">
      
      {/* 70% Atmospheric Void (Left) */}
      <div className="relative hidden lg:flex flex-col justify-center w-[70%] h-screen border-r border-church-border bg-church-background p-16">
        
        {/* Grain Texture Overlay */}
        <div className="absolute inset-0 z-0 bg-noise pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 40, damping: 20, delay: 0.1 }}
          className="relative z-10 flex flex-col justify-center h-full max-w-4xl"
        >
          {/* Subtle Accent Line */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ type: "spring", stiffness: 50, duration: 1 }}
            className="h-[1px] w-24 bg-church-gold mb-12 origin-left"
          />

          <h1 className="text-7xl xl:text-8xl 2xl:text-[9rem] font-serif italic text-church-textMain leading-[0.9] tracking-tight selection:bg-church-gold selection:text-church-background cursor-default">
            Convocation <br/>
            <span className="text-church-textMuted not-italic">Tracker.</span>
          </h1>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="absolute bottom-12 left-16 z-10 text-church-textMuted text-sm font-light tracking-widest uppercase"
        >
          SYSTEM STATUS: ONLINE <span className="text-church-gold ml-2">•</span>
        </motion.div>
      </div>

      {/* 30% Control Panel (Right) */}
      <div className="w-full lg:w-[30%] min-h-screen bg-church-surface flex flex-col justify-center p-8 lg:p-12 relative z-20">
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.3 }}
          className="w-full max-w-sm mx-auto flex flex-col gap-10"
        >
          {/* Mobile Title (Hidden on Desktop) */}
          <div className="lg:hidden mb-8">
            <h1 className="text-5xl font-serif italic text-church-textMain leading-tight">
              Convocation<br/>Tracker.
            </h1>
            <div className="h-[1px] w-12 bg-church-gold mt-6"></div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold uppercase tracking-widest text-church-textMain">Authorization</h2>
            <p className="text-church-textMuted text-sm leading-relaxed border-l-2 border-church-border pl-4">
              Access is strictly limited to active media team operatives. Authenticate to proceed.
            </p>
          </div>

          <div className="pt-4">
            <motion.button
              whileHover={{ scale: 0.98, backgroundColor: '#ffffff', color: '#000000' }}
              whileTap={{ scale: 0.95 }}
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-between bg-transparent border border-church-border hover:border-white text-church-textMain px-6 py-4 transition-colors duration-300 group rounded-none"
            >
              <span className="font-semibold tracking-wider text-sm uppercase">Authenticate</span>
              <svg 
                className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" 
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"
              >
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </motion.button>
          </div>
          
          <div className="mt-auto pt-24 lg:pt-32">
            <p className="text-[10px] text-church-textMuted uppercase tracking-widest opacity-50">
              © {new Date().getFullYear()} MEDIA PRODUCTION DB.
              <br/>RESTRICTED ENVIRONMENT.
            </p>
          </div>

        </motion.div>
      </div>

    </div>
  )
}
