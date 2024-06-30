'use client'
import { Flex, Text } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Flex alignItems='center' justifyContent='center' p='2rem'>
      <Text>&copy; Yolo {new Date().getFullYear()}</Text>
    </Flex>
  )
}

export default Footer
