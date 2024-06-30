import { RefundProps } from "@/types"
import { Button, Flex, Heading, useToast, Text } from "@chakra-ui/react"
import { contractAddress, abi } from "@/constants"
import { parseEther } from "viem"
import { prepareWriteContract, writeContract, waitForTransaction } from "@wagmi/core"

const Refund = ({ getData, end, goal, totalCollected }: RefundProps ) => {
  const toast = useToast()

  const refund = async () => {
    try {
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: abi,
        functionName: 'refund',
      })
      const { hash } = await writeContract(request)
      const data = await waitForTransaction({
        hash: hash
      })

      await getData()

      toast({
        title: 'Congratulations!',
        description: "Your contribution has been refunded.",
        status: 'success',
        duration: 4000,
        isClosable: true,
      })
    } catch (e) {
      toast({
        title: 'Error',
        description: 'An error occured while refunding. Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    }
  }

  return (
    <>
      <Heading mt='2rem'>
        Refund
      </Heading>
      <Flex>
        {totalCollected < goal && Math.floor(Date.now() / 1000) > parseInt(end) ? (
      <Button
        colorScheme="red"
        size='lg'
        width='100%'
        onClick={() => refund()}
      >
        Refund
      </Button>
          ) : (
            <Text color='red'>
              Refund is only available if the goal is not reached and the pool is over.
            </Text>
          )}
      </Flex>
    </>
  )
}

export default Refund
