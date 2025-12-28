import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const CollapsibleContext = React.createContext()

const Collapsible = ({ open, onOpenChange, children, ...props }) => {
  const [isOpen, setIsOpen] = React.useState(open ?? false)

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  const handleToggle = () => {
    const newValue = !isOpen
    setIsOpen(newValue)
    if (onOpenChange) {
      onOpenChange(newValue)
    }
  }

  return (
    <CollapsibleContext.Provider value={{ isOpen, handleToggle }}>
      <div {...props}>{children}</div>
    </CollapsibleContext.Provider>
  )
}

const CollapsibleTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { handleToggle } = React.useContext(CollapsibleContext)
  return (
    <div
      ref={ref}
      onClick={handleToggle}
      className={cn("cursor-pointer", className)}
      {...props}
    >
      {children}
    </div>
  )
})
CollapsibleTrigger.displayName = "CollapsibleTrigger"

const CollapsibleContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const { isOpen } = React.useContext(CollapsibleContext)
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className={cn("overflow-hidden", className)}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
})
CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }

