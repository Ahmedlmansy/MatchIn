import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex items-center justify-between border-b px-6 py-4"
    >
      <Link to="/" className="text-lg font-semibold">
        SkillMatch
      </Link>
      <nav className="flex items-center gap-4">
        <Link to="/jobs" className="text-sm text-muted-foreground hover:text-foreground">
          Jobs
        </Link>
        <Button size="sm">Sign in</Button>
      </nav>
    </motion.header>
  )
}
