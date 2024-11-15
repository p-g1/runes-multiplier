"use client"

import React, { useState, useEffect } from "react"
import { ChevronDown, Search } from "lucide-react"
import { Button } from "./components/Button"
import { Card, CardContent, CardHeader, CardTitle } from "./components/Card"
import { Input } from "./components/Input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/Table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./components/Dropdown"
import LoadingModal from "./components/LoadingModal"

// Define types for our data structures
type MarketStats = {
  total_market_cap: string;
  total_volume_24h: string;
  runes_count: string;
  market_cap_change_24h: string;
}

type RuneData = {
  id: number;
  name: string;
  symbol: string;
  price: number;
  price_change_24h: number;
  market_cap: number;
  volume_24h: number;
  floor_price?: string;
  available_2x?: number;
  available_5x?: number;
  available_10x?: number;
}

// Define the API response types to match the actual structure
type RuneEtching = {
  divisibility?: number;
  premine?: string;
  amount?: string;
  cap?: string;
  runeId: {
    block: number;
    tx: number;
  };
  runeName: string;
  runeTicker: string;
  runeNumber: number;
  symbol: string;
  txid: string;
  startBlock?: number;
  endBlock?: number;
};

type RuneApiItem = {
  rune: string;
  etching: RuneEtching;
  vol: number;
  totalVol: number;
  totalTxns: number;
  unitPriceSats: number;
  formattedUnitPriceSats: string;
  txnCount: number;
  imageURI?: string;
  unitPriceChange: number;
  holderCount: number;
  pendingCount: number;
  marketCap: number;
  unitPriceSparkLinePath: string;
  isVerified?: boolean;
};

type RuneApiResponse = {
  runes: RuneApiItem[];
};

const HIGH_CAP = 100000

export default function Component() {
  const [sortBy, setSortBy] = useState<keyof RuneData>("market_cap")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [marketStats, setMarketStats] = useState<MarketStats>({
    total_market_cap: "$0",
    total_volume_24h: "$0",
    runes_count: "0",
    market_cap_change_24h: "0%",
  })
  const [runesData, setRunesData] = useState<RuneData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [btcPrice, setBtcPrice] = useState<number>(0)
  const [loadingMessages, setLoadingMessages] = useState<string[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setLoadingMessages(['Starting data fetch...'])
        console.log('Set initial message')

        await fetchBtcPrice()
        setLoadingMessages(prev => {
          console.log('Current messages:', prev)
          return [...prev, `Fetched BTC Price: $${btcPrice}`]
        })

        const response = await fetch('https://api-mainnet.magiceden.io/v2/ord/btc/runes/collection_stats/search?offset=0&limit=200&sort=totalVolume&direction=desc&window=1d&isVerified=false&filter=%7B%22allCollections%22:true%7D')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        setLoadingMessages(prev => [...prev, 'Fetched runes data, processing...'])
        console.log('Runes data fetched')

        const data: RuneApiResponse = await response.json()
        
        if (!data?.runes) {
          throw new Error('Invalid API response structure')
        }

        setLoadingMessages(prev => [...prev, `Processing ${data.runes.length} runes...`])

        const transformedData: RuneData[] = data.runes
          .filter(rune => rune.holderCount > 300 && rune.totalVol > 0.75)
          .map(rune => ({
            id: rune.etching.runeNumber,
            name: rune.etching.runeName,
            symbol: rune.etching.symbol,
            price: rune.unitPriceSats,
            price_change_24h: rune.unitPriceChange,
            market_cap: rune.marketCap * btcPrice,
            volume_24h: rune.vol,
            floor_price: rune.etching.premine || rune.etching.amount || '0'
          }))

        setRunesData(transformedData)
        
        // Calculate market stats
        const totalMarketCap = transformedData.reduce((sum, rune) => sum + rune.market_cap, 0)
        const totalVolume = transformedData.reduce((sum, rune) => sum + rune.volume_24h, 0)
        
        setMarketStats({
          total_market_cap: `$${formatNumber(totalMarketCap)}`,
          total_volume_24h: `$${formatNumber(totalVolume)}`,
          runes_count: transformedData.length.toString(),
          market_cap_change_24h: '0%',
        })

        await fetchOrdersInBatches(transformedData)

      } catch (error: any) {
        console.error('Error fetching data:', error)
        setLoadingMessages(prev => [...prev, `Error occurred: ${error.message}`])
        setError(error instanceof Error ? error.message : 'Failed to fetch data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Helper function to calculate price change percentage
  const calculatePriceChange = (current: number, previous: number): number => {
    if (!previous) return 0
    return ((current - previous) / previous) * 100
  }

  // Helper function to format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
    return num.toFixed(2)
  }

  const handleSort = (column: keyof RuneData) => {
    setSortBy(column)
    setSortOrder(current => current === "asc" ? "desc" : "asc")
  }

  const sortedRunesData = [...runesData].sort((a, b) => {
    const aValue = a[sortBy] ?? 0  // Use nullish coalescing to provide a default
    const bValue = b[sortBy] ?? 0
    
    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
    return 0
  })

  // Add this helper function with your other utility functions
  const trimTrailingZeros = (num: number): string => {
    return parseFloat(num.toString()).toString()
  }

  const fetchBtcPrice = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
      const data = await response.json()
      setBtcPrice(data.bitcoin.usd)
    } catch (error) {
      console.error('Error fetching BTC price:', error)
      setBtcPrice(71000) // Fallback price if API fails
    }
  }

  const fetchOrdersInBatches = async (runes: RuneData[], batchSize: number = 20) => {
    const updatedRunes = [...runes]
    
    for (let i = 0; i < runes.length; i += batchSize) {
      const batch = runes.slice(i, i + batchSize)
      
      const promises = batch.map(rune => 
        fetch(`https://api-mainnet.magiceden.io/v2/ord/btc/runes/orders/${rune.name.replace(/[^A-Za-z0-9]/g, '')}?offset=100&includePending=false&sort=unitPriceAsc&rbfPreventionListingOnly=false&side=sell`)
          .then(async res => {
            const data = await res.json()
            setLoadingMessages(prev => [...prev, `Analyzing ${rune.name}...`])
            return data
          })
          .catch(error => {
            setLoadingMessages(prev => [...prev, `No orders found for ${rune.name}`])
            return { orders: [] } // Return empty orders instead of null
          })
      )

      const results = await Promise.all(promises)
      
      results.forEach((result, index) => {
        if (result?.orders?.length > 0) {
          const floorPrice = parseFloat(result.orders[0].formattedUnitPrice)
          setLoadingMessages(prev => [...prev, `Floor price for ${batch[index].name}: ${floorPrice} sats`])
          
          const available_2x = result.orders
            .filter((order: any) => parseFloat(order.formattedUnitPrice) <= floorPrice * 2)
            .reduce((sum: number, order: any) => {
              const newSum = sum + parseFloat(order.formattedUnitPrice)
              return newSum > HIGH_CAP ? HIGH_CAP : newSum
            }, 0)
            
          const available_5x = result.orders
            .filter((order: any) => parseFloat(order.formattedUnitPrice) <= floorPrice * 5)
            .reduce((sum: number, order: any) => {
              const newSum = sum + parseFloat(order.formattedUnitPrice)
              return newSum > HIGH_CAP ? HIGH_CAP : newSum
            }, 0)
            
          const available_10x = result.orders
            .filter((order: any) => parseFloat(order.formattedUnitPrice) <= floorPrice * 10)
            .reduce((sum: number, order: any) => {
              const newSum = sum + parseFloat(order.formattedUnitPrice)
              return newSum > HIGH_CAP ? HIGH_CAP : newSum
            }, 0)

          updatedRunes[i + index] = {
            ...updatedRunes[i + index],
            floor_price: result.orders[0].formattedUnitPrice,
            available_2x,
            available_5x,
            available_10x
          }
        } else {
          setLoadingMessages(prev => [...prev, `No active orders for ${batch[index].name}`])
          updatedRunes[i + index] = {
            ...updatedRunes[i + index],
            floor_price: undefined,
            available_2x: undefined,
            available_5x: undefined,
            available_10x: undefined
          }
        }
      })

      if (i + batchSize < runes.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    setRunesData(updatedRunes)
  }

  if (isLoading) {
    console.log('Rendering LoadingModal with messages:', loadingMessages)
    return <LoadingModal messages={loadingMessages} />
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-black min-h-screen text-green-500">
      {/* Market Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-black border border-green-500/50 hover:border-green-500 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-green-500/20">
            <CardTitle className="text-sm font-medium text-green-300">Total Market Cap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{marketStats.total_market_cap}</div>
            <p className="text-xs text-green-700">
              {marketStats.market_cap_change_24h}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-black border border-green-500/50 hover:border-green-500 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-green-500/20">
            <CardTitle className="text-sm font-medium text-green-300">24h Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{marketStats.total_volume_24h}</div>
          </CardContent>
        </Card>
        <Card className="bg-black border border-green-500/50 hover:border-green-500 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-green-500/20">
            <CardTitle className="text-sm font-medium text-green-300">Active Runes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{marketStats.runes_count}</div>
          </CardContent>
        </Card>
        <Card className="bg-black border border-green-500/50 hover:border-green-500 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-green-500/20">
            <CardTitle className="text-sm font-medium text-green-300">24h Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-500">
              {marketStats.market_cap_change_24h}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[200px] justify-between bg-black border-green-500 text-green-500 hover:bg-green-500/10">
                Sort by: {sortBy.replace("_", " ")}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-black border-green-500">
              <DropdownMenuItem className="text-green-500 hover:bg-green-500/10" onClick={() => handleSort("market_cap")}>
                Market Cap
              </DropdownMenuItem>
              <DropdownMenuItem className="text-green-500 hover:bg-green-500/10" onClick={() => handleSort("volume_24h")}>
                Volume
              </DropdownMenuItem>
              <DropdownMenuItem className="text-green-500 hover:bg-green-500/10" onClick={() => handleSort("price_change_24h")}>
                Price Change
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Search runes..."
            className="w-[300px] bg-black border-green-500 text-green-500 placeholder:text-green-700"
            type="search"
          />
          <Button variant="secondary" className="bg-green-500/10 hover:bg-green-500/20 text-green-500">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Runes Table */}
      <Table className="border border-green-500/20 [&_.divide-gray-200]:divide-green-500/20 [&_.divide-gray-200]:divide-opacity-20">
        <TableHeader>
          <TableRow className="border-b border-green-500/20">
            <TableHead className="text-green-300 bg-[#001200]"></TableHead>
            <TableHead className="text-green-300 bg-[#001200]">Name</TableHead>
            <TableHead className="text-right text-green-300 bg-[#001200]">Price</TableHead>
            <TableHead className="text-right text-green-300 bg-[#001200]">24h %</TableHead>
            <TableHead className="text-right text-green-300 bg-[#001200]">Market Cap</TableHead>
            <TableHead className="text-right text-green-300 bg-[#001200]">Volume (24h)</TableHead>
            <TableHead className="text-right text-green-300 bg-[#001200]">Floor Price</TableHead>
            <TableHead className="text-right text-green-300 bg-[#001200]">2x</TableHead>
            <TableHead className="text-right text-green-300 bg-[#001200]">5x</TableHead>
            <TableHead className="text-right text-green-300 bg-[#001200]">10x</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRunesData.map((rune) => (
            <TableRow 
              key={rune.id} 
              className="border-b border-green-500/20 hover:bg-green-500/5"
            >
              <TableCell className="text-center font-mono bg-black">
                <div className="flex items-center justify-center text-xl">
                  {rune.symbol}
                </div>
              </TableCell>
              <TableCell className="font-medium font-mono bg-black">{rune.name}</TableCell>
              <TableCell className="text-right font-mono bg-black">
                ${trimTrailingZeros(rune.price)}
              </TableCell>
              <TableCell
                className={`text-right font-mono bg-black ${
                  rune.price_change_24h > 0
                    ? "text-emerald-500"
                    : "text-red-500"
                }`}
              >
                {rune.price_change_24h > 0 ? "+" : ""}
                {rune.price_change_24h.toFixed(2)}%
              </TableCell>
              <TableCell className="text-right font-mono bg-black">
                ${rune.market_cap.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-mono bg-black">
                ${rune.volume_24h.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-mono bg-black">
                {rune.floor_price ? `${trimTrailingZeros(parseFloat(rune.floor_price))} sats` : '-'}
              </TableCell>
              <TableCell className="text-right font-mono bg-black">
                {rune.available_2x 
                  ? (rune.available_2x >= HIGH_CAP 
                    ? 'high' 
                    : Math.ceil(rune.available_2x * 100) / 100) 
                  : '-'}
              </TableCell>
              <TableCell className="text-right font-mono bg-black">
                {rune.available_5x 
                  ? (rune.available_5x >= HIGH_CAP 
                    ? 'high' 
                    : Math.ceil(rune.available_5x * 100) / 100) 
                  : '-'}
              </TableCell>
              <TableCell className="text-right font-mono bg-black">
                {rune.available_10x 
                  ? (rune.available_10x >= HIGH_CAP 
                    ? 'high' 
                    : Math.ceil(rune.available_10x * 100) / 100) 
                  : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}