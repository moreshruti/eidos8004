'use client'

import UploadForm from '@/components/dashboard/UploadForm'

export default function UploadPage() {
  return (
    <div>
      {/* Header */}
      <section className="border-t border-c2 flow-line">
        <div className="px-8 pt-10 pb-8">
          <h1 className="text-2xl font-pixel uppercase tracking-tight text-c11">Upload Design</h1>
          <p className="font-mono text-c5 text-sm mt-1">Mint your design as a dynamic NFT</p>
        </div>
      </section>

      {/* Form */}
      <section className="border-t border-c2 flow-line">
        <div className="px-8 pt-10 pb-8">
          <div className="max-w-2xl mx-auto">
            <UploadForm />
          </div>
        </div>
      </section>
    </div>
  )
}
