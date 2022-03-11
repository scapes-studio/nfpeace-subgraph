import {
  NFPeaceV2,
  AuctionExtended as AuctionExtendedEvent,
  AuctionInitialised as AuctionInitialisedEvent,
  AuctionSettled as AuctionSettledEvent,
  Bid as BidEvent
} from '../generated/NFPeaceV2/NFPeaceV2'
import { bid, createAuction, extendAuction, settleAuction } from './nfpeace-helpers'

export function handleAuctionInitialised(event: AuctionInitialisedEvent): void {
  createAuction(NFPeaceV2.bind(event.address), event)
}

export function handleAuctionExtended(event: AuctionExtendedEvent): void {
  extendAuction(event)
}

export function handleAuctionSettled(event: AuctionSettledEvent): void {
  settleAuction(event)
}

export function handleBid(event: BidEvent): void {
  bid(event)
}
