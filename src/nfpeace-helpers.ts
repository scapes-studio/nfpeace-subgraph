import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import {
  NFPeace as NFPeaceContract,
  AuctionInitialised,
  AuctionExtended,
  AuctionSettled,
  Bid as BidEvent,
} from '../generated/NFPeace/NFPeace'
import { Auction, Bid, NFPeace, User } from '../generated/schema'

const INITIAL_AUCTION_ID_V2 = BigInt.fromString('12')

export function isV2 (auctionId: BigInt): bool {
  return auctionId >= INITIAL_AUCTION_ID_V2
}

export function saveUser (address: Address): User {
  const user = new User(address.toString())
  user.save()

  return user
}

export function createAuction (
  event: AuctionInitialised,
): void {
  const contract = NFPeaceContract.bind(event.address)
  const auctionObj = contract.getAuction(event.params.auctionId)
  const donor = saveUser(auctionObj.value2)

  let auction = new Auction(event.params.auctionId.toString())
  auction.donor = donor.id
  auction.tokenContract = auctionObj.value0
  auction.tokenId = auctionObj.value1
  auction.latestBidder = auctionObj.value2.toHexString()
  auction.latestBid = auctionObj.value3
  auction.startingPrice = auctionObj.value4
  auction.endTimestamp = auctionObj.value5
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

export function bidOnAuction (event: BidEvent): void {
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

export function extendAuction (event: AuctionExtended): void {
  const auction = loadAuction(event.params.auctionId.toString())

  auction.endTimestamp = event.params.endTimestamp
  auction.save()
}

export function settleAuction (event: AuctionSettled): void {
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
