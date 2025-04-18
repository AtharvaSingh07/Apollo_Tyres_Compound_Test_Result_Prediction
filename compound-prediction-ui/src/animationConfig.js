// Animation variants for reuse across components

export const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: -30,
      transition: { 
        ease: "easeInOut",
        duration: 0.4 
      }
    }
  };
  
  export const itemVariants = {
    hidden: { opacity: 1, y: 1 },
    visible: { 
      opacity: 1, 
      y: 1,
      transition: { duration: 0.4 }
    }
  };
  
  export const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 200,
        damping: 15,
        duration: 0.5
      }
    },
    hover: { 
      scale: 1.05, 
      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)" 
    },
    tap: { scale: 0.95 }
  };