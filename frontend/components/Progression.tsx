'use client'

import { contractAddress, abi } from "@/constants"
import { ProgressionProps } from "@/types"
import { useState } from "react"
import { useAccount } from "wagmi"
import { Text, Progress, Heading, Spinner } from "@chakra-ui/react"
import { formatEther } from "viem"


const Progression = ({ isLoading, end, goal, totalCollected }: ProgressionProps ) => {

  const { address, isConnected } = useAccount()

  return (
    <>
      {isLoading ? <Spinner/>
      : (
        <>
          <Heading mt='1rem'>
            Progression
          </Heading>
          <Text mb='.5rem'>
            <Text as='span' fontWeight='bold'>End date: </Text>
            {end}
          </Text>
          <Progress
            colorScheme={(parseInt(totalCollected) / parseInt(goal)) < 1 ? 'red' : 'green'}
            height='32px'
            value={(parseInt(totalCollected) / parseInt(goal)) * 100}
            hasStripe
          />
          <Text mt='.5rem'>
            <Text as='span' fontWeight='bold'>Goal: </Text>
            {Number(formatEther(BigInt(goal)))} ETH
            <Text as='span' fontWeight='bold' ml=".5rem">Total Collected: </Text>
            {Number(formatEther(BigInt(totalCollected))).toFixed(2)} ETH collected
          </Text>
        </>
      )
      }
    </>
  )
}

export default Progression
