"use client"

import { useState } from "react"

import { Pencil, Trash } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardFooter,
  CardContent,
} from "@/components/ui/card"

import { useNavigate } from "react-router-dom"
import { useTheme } from "../contexts/ThemeContext"
interface Product {
  _id: string
  title: string
  price: number
}
interface ProductCardProps {
  productname: string
  image: string
  price: number
  qty?: number
  category?: string
  sizes?: string[]
  colors?: string[]
  created_date?: string
  description?: string
  product?: Product
  handleAddToOrder?: (product: Product) => void
  handleDelete?: (id: string) => void
  canEdit?: boolean
  canDelete?: boolean
  canAddToOrder?: boolean
}
const CardProductDemo = ({
  productname,
  image,
  price,
  qty,
  category = "Uncategorized",
  sizes = [],
  colors = [],
  created_date,
  description = "Crossing hardwood comfort with off-court flair. The Nike Air Force 1 '07 LV8 is a modern take on the iconic AF1, featuring premium materials and bold design details that elevate your everyday style.",
  product,
  handleAddToOrder,
  handleDelete,
  canEdit = true,
  canDelete = true,
  canAddToOrder = true,
}: ProductCardProps) => {
  const navigate = useNavigate()
  const { isDark } = useTheme()

  const cardSurface = isDark
    ? "border border-amber-400/20 bg-[#1a100a]/90 shadow-[0_14px_40px_rgba(0,0,0,0.35)]"
    : "border border-[#2f2218]/15 bg-[#fff8ee] shadow-[0_12px_35px_rgba(70,45,20,0.16)]"

  const textStrong = isDark ? "text-amber-50" : "text-[#2f2015]"
  const textSoft = isDark ? "text-amber-100/65" : "text-[#74553c]"

  return (
    <div className={`group relative overflow-hidden rounded-2xl ${cardSurface}`}>
      <div className={`relative flex h-48 items-center justify-center overflow-hidden border-b ${isDark ? "border-amber-400/15 bg-[#24150d]" : "border-[#e6ceb1] bg-[#f7ead8]"}`}>
        <div className={`pointer-events-none absolute inset-0 ${isDark ? "bg-[radial-gradient(circle_at_20%_20%,rgba(251,146,60,0.2),transparent_45%)]" : "bg-[radial-gradient(circle_at_20%_20%,rgba(251,146,60,0.15),transparent_45%)]"}`} />
        <img
          src={image}
          alt={productname}
          className="max-h-full max-w-full object-contain p-3 transition duration-300 group-hover:scale-[1.04]"
        />
      </div>
      {(canDelete || canEdit) && (
        <div className="flex justify-center items-center gap-1">
          {canDelete && (
            <Button
              size="icon"
              onClick={() => handleDelete && handleDelete(product!._id)}
              className={`absolute right-2.5 top-2.5 rounded-full ${isDark ? "bg-[#2b1a10]/90 text-amber-100 hover:bg-[#3a2215]" : "bg-[#fff4e4] text-[#6b452b] hover:bg-[#f6e4c9]"}`}
            >
              <Trash />
              <span className="sr-only">Delete</span>
            </Button>
          )}
          {canEdit && (
            <Button
              size="icon"
              onClick={() => navigate(`/add-product?id=${product._id}`)}
              className={`absolute rounded-full ${isDark ? "bg-[#2b1a10]/90 text-amber-100 hover:bg-[#3a2215]" : "bg-[#fff4e4] text-[#6b452b] hover:bg-[#f6e4c9]"}`}
              style={{ top: "0.65rem", right: canDelete ? "3.2rem" : "0.65rem" }}
            >
              <Pencil />
              <span className="sr-only">Edit</span>
            </Button>
          )}
        </div>
      )}

      <Card className="border-none bg-transparent shadow-none">
        <CardHeader>
          <CardTitle className={textStrong}>{productname}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <div className="flex justify-between items-center w-full">
              <div className="space-x-2">
                <Badge variant="outline" className={`rounded-sm ${isDark ? "border-amber-400/25 text-amber-100" : "border-[#d6b48f] text-[#6f4d35]"}`}>
                  Qty : {qty}
                </Badge>
                <Badge variant="outline" className={`rounded-sm ${isDark ? "border-amber-400/25 text-amber-100" : "border-[#d6b48f] text-[#6f4d35]"}`}>
                  {category}
                </Badge>
              </div>
              <div>
                <Badge variant="outline" className={`rounded-sm ${isDark ? "border-amber-400/25 text-amber-100" : "border-[#d6b48f] text-[#6f4d35]"}`}>
                  {new Date(created_date).toLocaleDateString("en-GB")}
                </Badge>
              </div>
            </div>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className={`line-clamp-2 text-xs ${textSoft}`}>
            {description.trim() ? description : "No description available."}
          </p>
        </CardContent>
        <CardFooter className="justify-between gap-2.5 max-sm:flex-col max-sm:items-stretch">
          <div className="flex flex-col">
            <span className={`text-xs font-semibold uppercase tracking-[0.1em] ${textSoft}`}>Price</span>
            <span className="text-lg font-semibold text-orange-300">${price.toFixed(2)}</span>
          </div>
          {canAddToOrder && (
            <Button
              onClick={() => handleAddToOrder && handleAddToOrder(product!)}
              size="lg"
              className={isDark ? "bg-gradient-to-r from-orange-500 to-amber-400 text-[#2b1508] hover:brightness-110" : "bg-gradient-to-r from-[#b06b35] to-[#d0934c] text-[#fff4e4] hover:brightness-105"}
            >
              Add to cart
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

export default CardProductDemo
