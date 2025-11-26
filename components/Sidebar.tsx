'use client'
import { sidebarLinks } from '@/constants'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from '@/context/ThemeContext'

const Sidebar = () => {
  const pathname = usePathname();
  const { themeColor } = useTheme()

  return (
    <section className="sticky left-0 top-0 flex h-screen w-fit flex-col justify-between p-6 pt-28 text-white max-sm:hidden lg:w-[264px]" style={{ backgroundColor: themeColor }}>
      <div className="flex flex-1 flex-col gap-6">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.route || pathname.startsWith(`${link.route}/`);
          return (
            <Link 
              href={link.route}
              key={link.label}
              className="flex gap-4 items-center p-4 rounded-lg justify-start glassmorphism transition-all"
              style={{
                backgroundColor: isActive ? `rgba(0, 0, 0, 0.3)` : 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: `1px solid rgba(255, 255, 255, 0.2)`,
              }}
            >
              <Image
                src={link.imgUrl}
                alt={link.label}
                width={24}
                height={24}
              />
              <p className="text-lg font-semibold max-lg:hidden">
                {link.label}
              </p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default Sidebar