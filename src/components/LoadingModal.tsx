import { useEffect, useRef } from 'react'

const LoadingModal = ({ messages }: { messages: string[] }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log('Current messages:', messages)
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-black border border-green-500 p-6 rounded-lg w-3/4 max-h-[80vh] overflow-hidden">
        <div className="font-mono text-green-500 overflow-y-auto max-h-[70vh]">
          {messages.length > 0 ? (
            messages.map((msg, i) => (
              <div 
                key={i} 
                className="py-1"
              >
                <span className="text-green-300 mr-2">&gt;</span>
                <span className="text-green-500">{msg}</span>
              </div>
            ))
          ) : (
            <div className="text-green-500">Initializing...</div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="mt-4 flex justify-center">
          <div className="animate-pulse text-green-500">Processing...</div>
        </div>
      </div>
    </div>
  )
} 

export default LoadingModal
