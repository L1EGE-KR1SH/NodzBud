'use client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import MobileNav from './MobileNav'
import { UserButton } from "@clerk/nextjs";
import { useTheme } from '@/context/ThemeContext'

const Navbar = () => {
  const { themeColor } = useTheme()
  
  return (
    <nav className='flex-between fixed z-50 w-full px-6 py-4 lg:px-10' style={{ backgroundColor: themeColor }}>
      <Link href ="/" className ='flex items-center gap-1'>
        <Image
          src = "/icons/logo.svg" 
          width={32}
          height={32}
          alt = "NodzBud"
          className='max-sm:size-10'
        />
        <p className='text-[26px] font-extrabold text-white max-sm:hidden'>
          NodzBud
        </p>
      </Link>
      <UserButton />
      <div className='flex-between gap-5'>
        <MobileNav />
      </div>
    </nav>
  )
}

export default Navbar