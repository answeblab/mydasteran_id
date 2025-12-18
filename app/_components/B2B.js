'use client'

import { useState } from 'react'
import { Handshake, Factory, Users } from 'lucide-react'

export default function B2B() {
    const [formData, setFormData] = useState({
        name: '',
        message: ''
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const text = `Hello Mydasteran, I am ${formData.name}. ${formData.message}`
        const whatsappUrl = `https://wa.me/6282234707911?text=${encodeURIComponent(text)}`
        window.open(whatsappUrl, '_blank')
    }

    return (
        <div className="relative w-full py-12 px-6" id="b2b">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500 rounded-full blur-[100px] opacity-10 pointer-events-none"></div>

            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16">
                <div className="text-center md:text-left flex-1">
                    <span className="text-gold-400 font-bold tracking-widest text-xs uppercase mb-2 block">Partnership</span>
                    <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">
                        Let's Talk Business
                    </h2>
                    <p className="text-primary-100 text-sm md:text-base leading-relaxed mb-6 max-w-md mx-auto md:mx-0">
                        From private label to bulk wholesale, we have the capacity to deliver.
                    </p>

                    <div className="hidden md:flex gap-8 text-sm">
                        <div className="flex items-center gap-2 text-gold-200">
                            <Factory size={18} />
                            <span>Own Factory</span>
                        </div>
                        <div className="flex items-center gap-2 text-gold-200">
                            <Users size={18} />
                            <span>Wholesale</span>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-[400px] bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative">
                    <form className="space-y-3" onSubmit={handleSubmit}>
                        <input
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold-500"
                            placeholder="Your Name / Brand"
                            required
                        />
                        <textarea
                            name="message"
                            rows="2"
                            value={formData.message}
                            onChange={handleChange}
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold-500 resize-none"
                            placeholder="Brief message..."
                            required
                        ></textarea>
                        <button type="submit" className="w-full bg-gold-500 text-primary-950 font-bold py-3 rounded-lg hover:bg-gold-400 transition-colors text-sm flex items-center justify-center gap-2">
                            <Handshake size={16} />
                            Start WhatsApp Chat
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
