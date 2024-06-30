'use client'

import { Flex, Text, Input, Button, Heading, useToast } from "@chakra-ui/react";
import { useState } from 'react';
import { contractAddress, abi } from "@/constants";
import { parseEther } from "viem";
import { prepareWriteContract, writeContract, waitForTransaction } from "wagmi/actions";
import { ContributeProps } from "@/types";

const Contribute = ({ getData }: ContributeProps ) => {
  const toast = useToast()
  const [amount, setAmount] = useState<string>('')

  const contribute = async () => {
    try {
      let money = parseEther(amount)
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: abi,
        functionName: 'contribute',
        value: money
      })
      const { hash } = await writeContract(request)
      const data = await waitForTransaction({
        hash: hash
      })
      
      setAmount('')
      await getData()

      toast({
        title: 'Congratulations!',
        description: "Your contribution has been added.",
        status: 'success',
        duration: 4000,
        isClosable: true,
      })
    } catch (e) {
      toast({
        title: 'Error',
        description: 'An error occured while contributing. Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    }
  }
  return (
    <>
      <Heading mt='2rem'>
        Contribute
      </Heading>
      <Flex mt='1rem'>
        <Input
          placeholder="Your amout in ETH"
          size='lg'
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Button
          colorScheme="purple"
          size='lg'
          onClick={() => contribute()}
        >
          Contribute
        </Button>

      </Flex>
    </>
  )
}

export default Contribute
