"use client"

import React, { useState, useEffect } from "react"
import { ChevronDown, Search, Star } from "lucide-react"
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
  supply: string;
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('https://api-mainnet.magiceden.io/v2/ord/btc/runes/collection_stats/search?offset=0&limit=200&sort=totalVolume&direction=desc&window=1d&isVerified=false&filter=%7B%22allCollections%22:true%7D')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data: RuneApiResponse = await response.json()
        
        if (!data?.runes) {
          throw new Error('Invalid API response structure')
        }

        const transformedData: RuneData[] = data.runes.map(rune => ({
          id: rune.etching.runeNumber,
          name: rune.etching.runeName,
          symbol: rune.etching.symbol,
          price: rune.unitPriceSats,
          price_change_24h: rune.unitPriceChange,
          market_cap: rune.marketCap,
          volume_24h: rune.vol,
          supply: rune.etching.premine || rune.etching.amount || '0'
        }))

        setRunesData(transformedData)
        
        // Calculate market stats
        const totalMarketCap = transformedData.reduce((sum: number, rune: any) => sum + rune.market_cap, 0)
        const totalVolume = transformedData.reduce((sum: number, rune: any) => sum + rune.volume_24h, 0)
        
        setMarketStats({
          total_market_cap: `$${formatNumber(totalMarketCap)}`,
          total_volume_24h: `$${formatNumber(totalVolume)}`,
          runes_count: transformedData.length.toString(),
          market_cap_change_24h: '0%',
        })

      } catch (error: any) {
        console.error('Error fetching data:', error)
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
    if (a[sortBy] < b[sortBy]) return sortOrder === "asc" ? -1 : 1
    if (a[sortBy] > b[sortBy]) return sortOrder === "asc" ? 1 : -1
    return 0
  })

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Market Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Market Cap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketStats.total_market_cap}</div>
            <p className="text-xs text-muted-foreground">
              {marketStats.market_cap_change_24h}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketStats.total_volume_24h}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Runes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketStats.runes_count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
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
              <Button variant="outline" className="w-[200px] justify-between">
                Sort by: {sortBy.replace("_", " ")}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleSort("market_cap")}>
                Market Cap
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("volume_24h")}>
                Volume
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("price_change_24h")}>
                Price Change
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Search runes..."
            className="w-[300px]"
            type="search"
          />
          <Button variant="secondary">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Runes Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">24h %</TableHead>
            <TableHead className="text-right">Market Cap</TableHead>
            <TableHead className="text-right">Volume (24h)</TableHead>
            <TableHead className="text-right">Supply</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRunesData.map((rune) => (
            <TableRow key={rune.id}>
              <TableCell>
                <Button variant="default" size="icon" className="h-8 w-8">
                  <Star className="h-4 w-4" />
                </Button>
              </TableCell>
              <TableCell className="font-medium">{rune.name}</TableCell>
              <TableCell className="text-right">
                ${rune.price.toFixed(8)}
              </TableCell>
              <TableCell
                className={`text-right ${
                  rune.price_change_24h > 0
                    ? "text-emerald-500"
                    : "text-red-500"
                }`}
              >
                {rune.price_change_24h > 0 ? "+" : ""}
                {rune.price_change_24h.toFixed(2)}%
              </TableCell>
              <TableCell className="text-right">
                ${rune.market_cap.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                ${rune.volume_24h.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">{rune.supply}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}