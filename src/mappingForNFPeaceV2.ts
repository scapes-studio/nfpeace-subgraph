import {
  AuctionExtended,
  AuctionInitialised,
  AuctionSettled,
  Bid as BidEvent
} from '../generated/NFPeace/NFPeace'
import { createAuction, extendAuction, settleAuction, bidOnAuction } from './nfpeace-helpers'

export function handleAuctionInitialised(event: AuctionInitialised): void {
  createAuction(event)
}

export function handleAuctionExtended(event: AuctionExtended): void {
  extendAuction(event)
}

export function handleAuctionSettled(event: AuctionSettled): void {
  settleAuction(event)
}

export function handleBid(event: BidEvent): void {
  bidOnAuction(event)
}
