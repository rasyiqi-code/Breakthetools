'use client'

import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { Download } from 'lucide-react'
import { useIntl } from 'react-intl'

export function QRCodeGenerator() {
  const intl = useIntl()
  const t = (key: string, params?: Record<string, any>) =>
    intl.formatMessage({ id: `tools.qrCode.${key}` }, params as any)
  const [text, setText] = useState('')
  const [qrSize, setQrSize] = useState(300)
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (text && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        text,
        {
          width: qrSize,
          margin: 2,
          errorCorrectionLevel: errorLevel,
        },
        (error) => {
          if (error) console.error(error)
        }
      )
    }
  }, [text, qrSize, errorLevel])

  const handleDownload = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = 'qrcode.png'
      link.href = url
      link.click()
    }
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">{t('title')}</h1>
        <p className="text-sm sm:text-base text-neutral-600">{t('description')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-4 sm:space-y-6">
          <div className="tool-card p-4 sm:p-6">
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              {t('enterTextOrUrl')}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('placeholder')}
              className="textarea-field text-sm sm:text-base"
              rows={5}
            />
          </div>

          <div className="tool-card p-4 sm:p-6">
            <h3 className="text-sm font-medium text-neutral-700 mb-4">{t('settings')}</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-neutral-600 mb-2 block">
                  {t('size')}: {qrSize}px
                </label>
                <input
                  type="range"
                  min="200"
                  max="600"
                  step="50"
                  value={qrSize}
                  onChange={(e) => setQrSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm text-neutral-600 mb-2 block">
                  {t('errorCorrectionLevel')}
                </label>
                <select
                  value={errorLevel}
                  onChange={(e) => setErrorLevel(e.target.value as any)}
                  className="input-field text-sm sm:text-base min-h-[44px]"
                >
                  <option value="L">{t('errorLevels.low')}</option>
                  <option value="M">{t('errorLevels.medium')}</option>
                  <option value="Q">{t('errorLevels.quartile')}</option>
                  <option value="H">{t('errorLevels.high')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-sm font-medium text-neutral-700 mb-4">{t('previewAndDownload')}</h3>

          {text ? (
            <div className="space-y-4">
              <div className="flex justify-center bg-neutral-50 p-4 sm:p-6 rounded overflow-hidden">
                <canvas ref={canvasRef} className="max-w-full h-auto" />
              </div>
              <button
                onClick={handleDownload}
                className="btn-primary w-full flex items-center justify-center space-x-2 min-h-[44px]"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm sm:text-base">{t('downloadQRCode')}</span>
              </button>
            </div>
          ) : (
            <div className="bg-neutral-50 rounded p-8 sm:p-12 text-center text-neutral-400 text-sm sm:text-base">
              {t('enterTextToGenerate')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

