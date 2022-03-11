import {
  AuctionExtended,
  AuctionInitialised,
  AuctionSettled,
  Bid as BidEvent
} from '../generated/NFPeace/NFPeace'
import { createAuction, extendAuction, settleAuction, bidOnAuction, isV2 } from './nfpeace-helpers'

export function handleAuctionInitialised(event: AuctionInitialised): void {
  if (isV2(event.params.auctionId)) return

  createAuction(event)
}

export function handleAuctionExtended(event: AuctionExtended): void {
  if (isV2(event.params.auctionId)) return

  extendAuction(event)
}

export function handleAuctionSettled(event: AuctionSettled): void {
  if (isV2(event.params.auctionId)) return

  settleAuction(event)
}

export function handleBid(event: BidEvent): void {
  if (isV2(event.params.auctionId)) return

  bidOnAuction(event)
}
