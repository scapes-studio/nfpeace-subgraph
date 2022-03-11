import { BigInt } from '@graphprotocol/graph-ts'
import {
  NFPeaceV1,
  AuctionExtended as AuctionExtendedEvent,
  AuctionInitialised as AuctionInitialisedEvent,
  AuctionSettled as AuctionSettledEvent,
  Bid as BidEvent
} from '../generated/NFPeaceV1/NFPeaceV1'
import { bid, createAuction, extendAuction, settleAuction } from './nfpeace-helpers'

const INITIAL_AUCTION_ID_V2 = BigInt.fromString('12')
const isV2 = (auctionId: BigInt): bool => auctionId >= INITIAL_AUCTION_ID_V2

export function handleAuctionInitialised(event: AuctionInitialisedEvent): void {
  if (isV2(event.params.auctionId)) return

  createAuction(NFPeaceV1.bind(event.address), event)
}

export function handleAuctionExtended(event: AuctionExtendedEvent): void {
  if (isV2(event.params.auctionId)) return

  extendAuction(event)
}

export function handleAuctionSettled(event: AuctionSettledEvent): void {
  if (isV2(event.params.auctionId)) return

  settleAuction(event)
}

export function handleBid(event: BidEvent): void {
  if (isV2(event.params.auctionId)) return

  bid(event)
}
