import * as React from "react"
import { cn } from "../../lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "./button"

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title: string
}

export function Drawer({ isOpen, onClose, children, title }: DrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
