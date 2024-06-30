'use client'

import { ContributorsProps } from "@/types"
import { Flex, Text, Input, Button, Heading, useToast, Card, CardBody } from "@chakra-ui/react";
import { formatEther, parseEther } from "viem";

const Contributors = ({ events }: ContributorsProps ) => {
  console.log(events)
  return (
    <>
      <Heading mt='2rem'>
        Contributors
      </Heading>
      <Flex mt='1rem' direction='column'>
        {events.map((event) => {
          return (
            <Card mb='.5rem' key={crypto.randomUUID()}>
              <CardBody>
                <Flex
                  justifyContent='space-between'
                  alignItems='center'
                >
                  <Text>{event.contributor}</Text>
                  <Text>{formatEther(BigInt(event.amount))}</Text>
                </Flex>
              </CardBody>
            </Card>
          )
        })}
      </Flex>

    </>
  )
}

export default Contributors
