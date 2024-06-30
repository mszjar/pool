'use client'

import { Flex } from "@chakra-ui/react";
import { LayoutChildrenProps } from "@/types";

import Header from './Header'
import Footer from './Footer'

export const Layout = ({ children }: LayoutChildrenProps ) => {
  return (
    <Flex height='100vh' direction='column' justifyContent='space-between' alignItems='center'>
      <Header/>
      <Flex p='2rem' direction='column' width='100%'>
        {children}
      </Flex>
      <Footer/>
    </Flex>
  )
}
