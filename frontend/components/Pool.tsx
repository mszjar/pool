'use client'

import { Alert, AlertIcon } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { readContract, watchContractEvent } from '@wagmi/core';
import { contractAddress, abi } from '@/constants';
import { parseAbiItem, Log } from 'viem';
import { Contributor } from '@/types';
import Contributors from './Contributors';

import Contribute from './Contribute';
import Progression from './Progression';
import Refund from './Refund';


const Pool = () => {
  const client = usePublicClient();
  const { address, isConnected } = useAccount();

  const [end, setEnd] = useState<string>('');
  const [goal, setGoal] = useState<string>('');
  const [totalCollected, setTotalCollected] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [events, setEvents] = useState<Contributor[]>([])

  const getData = async () => {
    if(isConnected) {
      setIsLoading(true)

      // Get end Date of the Pool
      let data: any = await readContract({
        address: contractAddress,
        abi: abi,
        functionName: 'end'
      })

      // Date Managment
      let date = new Date(parseInt(data) * 1000)
      let day = date.getDate()
      let month = date.getMonth() + 1
      let year = date.getFullYear()
      let endDate: string = `${day}/${month}/${year}`
      setEnd(endDate)

      // Goal
      data = await readContract({
        address: contractAddress,
        abi: abi,
        functionName: 'goal'
      })
      setGoal(data.toString())

      // TotalCollected
      data = await readContract({
        address: contractAddress,
        abi: abi,
        functionName: 'totalCollected'
      })
      setTotalCollected(data.toString())

      // Events
      const event: any = abi.find(item => item.type === 'event' && item.name === 'Contribute');
      const ContributeLogs = await client.getLogs({
        address: contractAddress,
        event,
        fromBlock: 0n,
        toBlock: 'latest'
      })
      setEvents(ContributeLogs.map(log => ({
        contributor: log.args.contributor as string,
        amount: (log.args.amount as BigInt).toString()
      })
    ))


      setIsLoading(false)
    }
  }

  useEffect(() => {
    getData()
  }, [address])

  return (
    <>
     {isConnected ? (
      <>
        <Progression isLoading={isLoading} end={end} goal={goal} totalCollected={totalCollected} />
        <Contribute getData={getData}/>
        <Refund getData={getData} end={end} goal={goal} totalCollected={totalCollected} />
        <Contributors events={events}/>
      </>
      ) : (
      <Alert status='warning'>
        <AlertIcon/>
          Please connect your wallet.
      </Alert>
      )}
    </>
  )
}

export default Pool
