'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Clock } from 'lucide-react'

export function StopwatchTimer() {
  const [mode, setMode] = useState<'stopwatch' | 'timer'>('stopwatch')
  const [time, setTime] = useState(0) // in milliseconds
  const [isRunning, setIsRunning] = useState(false)
  const [laps, setLaps] = useState<number[]>([])
  const [timerInput, setTimerInput] = useState({ hours: '0', minutes: '0', seconds: '0' })
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prev => {
          if (mode === 'timer') {
            if (prev <= 0) {
              setIsRunning(false)
              // Simple beep sound
              if (typeof window !== 'undefined') {
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
                const oscillator = audioContext.createOscillator()
                const gainNode = audioContext.createGain()
                oscillator.connect(gainNode)
                gainNode.connect(audioContext.destination)
                oscillator.frequency.value = 800
                oscillator.type = 'sine'
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
                oscillator.start(audioContext.currentTime)
                oscillator.stop(audioContext.currentTime + 0.5)
              }
              return 0
            }
            return prev - 1000
          } else {
            return prev + 10
          }
        })
      }, mode === 'timer' ? 1000 : 10)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, mode])

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const milliseconds = Math.floor((ms % 1000) / 10)

    if (mode === 'timer') {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
    
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`
  }

  const handleStart = () => {
    if (mode === 'timer' && time === 0) {
      const hours = parseInt(timerInput.hours) || 0
      const minutes = parseInt(timerInput.minutes) || 0
      const seconds = parseInt(timerInput.seconds) || 0
      setTime((hours * 3600 + minutes * 60 + seconds) * 1000)
    }
    setIsRunning(true)
  }

  const handleStop = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setTime(0)
    setLaps([])
    if (mode === 'timer') {
      setTimerInput({ hours: '0', minutes: '0', seconds: '0' })
    }
  }

  const handleLap = () => {
    if (mode === 'stopwatch') {
      setLaps(prev => [time, ...prev])
    }
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Stopwatch & Timer</h1>
        <p className="text-sm sm:text-base text-neutral-600">Stopwatch digital dengan fungsi lap dan timer countdown</p>
      </div>

      <div className="tool-card p-4 sm:p-8 mb-4 sm:mb-6">
        <div className="flex justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <button
            onClick={() => {
              setMode('stopwatch')
              handleReset()
            }}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all min-h-[44px] text-sm sm:text-base ${
              mode === 'stopwatch'
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Stopwatch
          </button>
          <button
            onClick={() => {
              setMode('timer')
              handleReset()
            }}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all min-h-[44px] text-sm sm:text-base ${
              mode === 'timer'
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Timer
          </button>
        </div>

        {mode === 'timer' && !isRunning && time === 0 && (
          <div className="mb-4 sm:mb-6 grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">Jam</label>
              <input
                type="number"
                value={timerInput.hours}
                onChange={(e) => setTimerInput({ ...timerInput, hours: e.target.value })}
                min="0"
                max="23"
                className="input-field text-center text-sm sm:text-base min-h-[44px]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">Menit</label>
              <input
                type="number"
                value={timerInput.minutes}
                onChange={(e) => setTimerInput({ ...timerInput, minutes: e.target.value })}
                min="0"
                max="59"
                className="input-field text-center text-sm sm:text-base min-h-[44px]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">Detik</label>
              <input
                type="number"
                value={timerInput.seconds}
                onChange={(e) => setTimerInput({ ...timerInput, seconds: e.target.value })}
                min="0"
                max="59"
                className="input-field text-center text-sm sm:text-base min-h-[44px]"
              />
            </div>
          </div>
        )}

        <div className="text-center mb-6 sm:mb-8">
          <div className="text-5xl sm:text-7xl md:text-8xl font-mono font-bold text-neutral-900 mb-4 break-all">
            {formatTime(time)}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="btn-primary flex items-center justify-center gap-2 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 min-h-[44px]"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5" />
              Start
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="btn-secondary flex items-center justify-center gap-2 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 min-h-[44px]"
            >
              <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
              Pause
            </button>
          )}
          
          <button
            onClick={handleReset}
            className="btn-secondary flex items-center justify-center gap-2 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            Reset
          </button>
          
          {mode === 'stopwatch' && (
            <button
              onClick={handleLap}
              disabled={!isRunning}
              className="btn-secondary flex items-center justify-center gap-2 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 min-h-[44px] disabled:opacity-50"
            >
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              Lap
            </button>
          )}
        </div>
      </div>

      {mode === 'stopwatch' && laps.length > 0 && (
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4">Lap Times</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
            {laps.map((lap, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 p-2 sm:p-3 bg-neutral-50 rounded border border-neutral-200"
              >
                <span className="text-xs sm:text-sm font-medium text-neutral-700">Lap {laps.length - index}</span>
                <span className="text-xs sm:text-sm font-mono text-neutral-900">{formatTime(lap)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
