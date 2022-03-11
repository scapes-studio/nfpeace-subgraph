import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import {
  NFPeaceV1,
  AuctionInitialised as AuctionInitialisedV1,
  AuctionExtended as AuctionExtendedV1,
  AuctionSettled as AuctionSettledV1,
  Bid as BidEventV1,
} from '../generated/NFPeaceV1/NFPeaceV1'
import {
  NFPeaceV2 ,
  AuctionInitialised as AuctionInitialisedV2,
  AuctionExtended as AuctionExtendedV2,
  AuctionSettled as AuctionSettledV2,
  Bid as BidEventV2,
} from '../generated/NFPeaceV2/NFPeaceV2'
import { Auction, Bid, NFPeace, User } from '../generated/schema'

export function saveUser (address: Address): User {
  const user = new User(address.toString())
  user.save()

  return user
}

export function createAuction (
  contract: NFPeaceV1|NFPeaceV2,
  event: AuctionInitialisedV1|AuctionInitialisedV2
): void {
  const auctionObj = contract.getAuction(event.params.auctionId)
  const donor = saveUser(auctionObj.value2)

  let auction = new Auction(event.params.auctionId.toString())
  auction.donor = donor.id
  auction.startingPrice = auctionObj.value4
  auction.endTimestamp = auctionObj.value5
  auction.tokenContract = auctionObj.value0
  auction.tokenId = auctionObj.value1
  auction.tokenStandard = auctionObj.value6
  auction.tokenCount = auctionObj.value7
  auction.settled = auctionObj.value8
  auction.createdAt = event.block.timestamp
  auction.createdTransaction = event.transaction.hash.toHex()
  auction.save()

  log.info(`NEW AUCTION #{} FROM {}`, [auction.id, donor.id])
}

export function loadAuction (id: string): Auction {
  let auction = Auction.load(id)
  if (auction == null) {
    auction = new Auction(id)
  }
  return auction
}

export function bid (event: BidEventV1|BidEventV2): void {
  saveUser(event.params.from)

  // Update Auction
  const auction = loadAuction(event.params.auctionId.toString())
  auction.latestBidder = event.params.from.toHex()
  auction.latestBid = event.params.bid
  auction.save()

  let bid = new Bid(event.transaction.hash.toHex())
  bid.from = event.params.from.toHex()
  bid.value = event.params.bid
  bid.auction = event.params.auctionId.toString()
  bid.createdAt = event.block.timestamp
  bid.createdTransaction = event.transaction.hash.toHex()
  bid.save()

  updateTotalVolume(bid.value)
}

export function extendAuction (event: AuctionExtendedV1|AuctionExtendedV2): void {
  const auction = loadAuction(event.params.auctionId.toString())

  auction.endTimestamp = event.params.endTimestamp
  auction.save()
}

export function settleAuction (event: AuctionSettledV1|AuctionSettledV2): void {
  const auction = loadAuction(event.params.auctionId.toString())

  auction.settledAt = event.block.timestamp
  auction.settledTransaction = event.transaction.hash.toHex()
  auction.settled = true
  auction.save()

  updateTotalSettledVolume(auction.latestBid)
}

export function getNFPeace (): NFPeace {
  let nfPeace = NFPeace.load('0')
  if (nfPeace == null) {
    nfPeace = new NFPeace('0')
    nfPeace.save()
  }
  return nfPeace
}

export function updateTotalVolume (value: BigInt): void {
  const nfPeace = getNFPeace()
  nfPeace.totalVolume = nfPeace.totalVolume.plus(value)
  nfPeace.save()
}

export function updateTotalSettledVolume (value: BigInt): void {
  const nfPeace = getNFPeace()
  nfPeace.totalSettled = nfPeace.totalSettled.plus(value)
  nfPeace.save()
}
