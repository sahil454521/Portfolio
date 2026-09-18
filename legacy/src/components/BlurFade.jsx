import React from 'react'

const BlurFade = ({ children }) => {
  return (
    <div className="backdrop-blur-sm bg-opacity-10 bg-gray-900 rounded-lg p-6">
      {children}
    </div>
  )
}

export default BlurFade
