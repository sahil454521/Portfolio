import React, { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import PropTypes from "prop-types"
import { cn } from "../lib/utils"
import emailjs from '@emailjs/browser';

export function PlaceholdersAndVanishInput({
  placeholders,
  onChange,
  onSubmit,
  value,
  type = "text",
  disabled = false,
  roundedLeft,
  roundedRight,
  submitButton,
  triggerDisappear,
  emailConfig, // New prop for email configuration
}) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailStatus, setEmailStatus] = useState(null) // 'success', 'error', or null
  const inputRef = useRef(null)
  const canvasRef = useRef(null)
  const newDataRef = useRef([])

  // Animation logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [placeholders.length])

  // Canvas drawing and animation logic
  const draw = useCallback(() => {
    if (!inputRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Setup canvas and draw text
    canvas.width = 800
    canvas.height = 800
    ctx.clearRect(0, 0, 800, 800)

    const computedStyles = getComputedStyle(inputRef.current)
    ctx.font = `${parseFloat(computedStyles.fontSize) * 2}px ${computedStyles.fontFamily}`
    ctx.fillStyle = "#FFF"
    ctx.fillText(value, 16, 40)

    // Process image data
    const imageData = ctx.getImageData(0, 0, 800, 800)
    const pixelData = imageData.data
    const newData = []

    // Extract non-black pixels
    for (let y = 0; y < 800; y++) {
      for (let x = 0; x < 800; x++) {
        const i = (y * 800 + x) * 4
        if (pixelData[i] || pixelData[i + 1] || pixelData[i + 2]) {
          newData.push({
            x,
            y,
            color: `rgba(${pixelData[i]},${pixelData[i + 1]},${pixelData[i + 2]},${pixelData[i + 3]})`,
          })
        }
      }
    }

    newDataRef.current = newData.map(({ x, y, color }) => ({
      x,
      y,
      r: 1,
      color,
    }))
  }, [value])

  // Function to send email
  const sendEmail = async (message) => {
    if (!emailConfig) return false;
    
    try {
      setSendingEmail(true);
      
      // Use EmailJS or similar service configuration
      const { serviceId, templateId, userId } = emailConfig;
      
      const templateParams = {
        message,
        from_name: emailConfig.fromName || 'Website Visitor',
        reply_to: emailConfig.replyTo || 'no-reply@example.com',
        to_name: emailConfig.toName || 'Site Owner',
      };
      
      await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        userId
      );
      
      setEmailStatus('success');
      setTimeout(() => setEmailStatus(null), 3000);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      setEmailStatus('error');
      setTimeout(() => setEmailStatus(null), 3000);
      return false;
    } finally {
      setSendingEmail(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!animating && value && !sendingEmail) {
      setAnimating(true);
      draw();
      
      // If email config is provided, send the email
      if (emailConfig) {
        const emailSent = await sendEmail(value);
        // If email fails, don't clear the input
        if (!emailSent) {
          setAnimating(false);
          return;
        }
      }
      
      setTimeout(() => {
        onChange({ target: { value: "" } });
        onSubmit(e);
        setAnimating(false);
      }, 400);
    }
  };

  return (
    <form
      className={cn(
        "relative w-full max-w-xl mx-auto flex items-center gap-4", 
      )}
      onSubmit={handleSubmit}
    >
      <div
        className={cn(
          "relative flex-1 bg-gray-800 h-12 overflow-hidden backdrop-blur-sm",
          roundedLeft && "rounded-l-full",
          roundedRight && "rounded-r-full",
          "border border-gray-700 hover:border-gray-600 transition-colors duration-200"
        )}
      >
        <canvas
          ref={canvasRef}
          className={cn(
            "absolute pointer-events-none transform scale-50 origin-top-left",
            animating ? "opacity-100" : "opacity-0"
          )}
        />
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => !animating && onChange(e)}
          disabled={disabled || sendingEmail}
          className={cn(
            "w-full h-full px-4 bg-transparent text-white focus:outline-none",
            animating && "text-transparent"
          )}
        />
        <AnimatePresence mode="wait">
          {!value && (
            <motion.p
              key={`placeholder-${currentPlaceholder}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {placeholders[currentPlaceholder]}
            </motion.p>
          )}
        </AnimatePresence>
        
        {/* Email status indicator */}
        <AnimatePresence>
          {emailStatus && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`absolute right-4 top-1/2 -translate-y-1/2 flex items-center ${
                emailStatus === 'success' ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {emailStatus === 'success' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              )}
              <span className="ml-1 text-xs">
                {emailStatus === 'success' ? 'Sent!' : 'Failed to send'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {submitButton && (
        <motion.button
          type="submit"
          disabled={!value || disabled || sendingEmail}
          className={cn(
            "h-12 px-6 rounded-full",
            "bg-gradient-to-r from-blue-600 to-purple-600",
            "text-white font-medium text-sm",
            "transition-all duration-200 ease-out",
            "hover:from-blue-700 hover:to-purple-700",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "disabled:hover:from-blue-600 disabled:hover:to-purple-600",
            "flex items-center justify-center gap-2"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {sendingEmail ? (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-4 h-4 border-2 border-t-transparent border-white rounded-full"
            />
          ) : (
            <>
              Send
              <motion.svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="transform rotate-45"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </motion.svg>
            </>
          )}
        </motion.button>
      )}
    </form>
  )
}

PlaceholdersAndVanishInput.propTypes = {
  placeholders: PropTypes.arrayOf(PropTypes.string).isRequired,
  value: PropTypes.string.isRequired,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  roundedLeft: PropTypes.bool,
  roundedRight: PropTypes.bool,
  submitButton: PropTypes.bool,
  triggerDisappear: PropTypes.bool,
  emailConfig: PropTypes.shape({
    serviceId: PropTypes.string,
    templateId: PropTypes.string,
    userId: PropTypes.string,
    fromName: PropTypes.string,
    toName: PropTypes.string,
    replyTo: PropTypes.string,
  }),
}

PlaceholdersAndVanishInput.defaultProps = {
  type: "text",
  disabled: false,
  roundedLeft: false,
  roundedRight: false,
  submitButton: false,
  triggerDisappear: false,
  emailConfig: null,
}

export default PlaceholdersAndVanishInput


