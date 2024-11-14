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
        setError(null)
        // Simulating API call - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Mock data - replace with actual API response
        const mockMarketStats: MarketStats = {
          total_market_cap: "$1.23B",
          total_volume_24h: "$423.5M",
          runes_count: "1,245",
          market_cap_change_24h: "+5.67%",
        }

        const mockRunesData: RuneData[] = [
          {
            id: 1,
            name: "RUNE-20",
            symbol: "RUNE",
            price: 0.00234,
            price_change_24h: 12.5,
            market_cap: 1200000,
            volume_24h: 450000,
            supply: "21,000,000",
          },
          {
            id: 2,
            name: "RUNE-21",
            symbol: "RUNE21",
            price: 0.00567,
            price_change_24h: -3.2,
            market_cap: 980000,
            volume_24h: 320000,
            supply: "15,000,000",
          },
        ]

        setMarketStats(mockMarketStats)
        setRunesData(mockRunesData)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to fetch data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

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