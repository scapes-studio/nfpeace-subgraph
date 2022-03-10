import { BigInt, log } from "@graphprotocol/graph-ts"
import {
  NFPeaceV1,
  AuctionExtended as AuctionExtendedEvent,
  AuctionInitialised as AuctionInitialisedEvent,
  AuctionSettled as AuctionSettledEvent,
  Bid as BidEvent
} from "../generated/NFPeaceV1/NFPeaceV1"
import { Auction, Bid, User } from "../generated/schema"

const INITIAL_AUCTION_ID_V2 = BigInt.fromString('12')

export function handleAuctionInitialised(event: AuctionInitialisedEvent): void {
  if (event.params.auctionId >= INITIAL_AUCTION_ID_V2) return
  let contract = NFPeaceV1.bind(event.address)

  let auctionObj = contract.getAuction(event.params.auctionId);
  const donor = auctionObj.value2.toHex()
  let user = new User(donor)
  user.save()

  let auction = new Auction(event.params.auctionId.toString());
  auction.donor = donor;
  auction.startingPrice = auctionObj.value4;
  auction.endTimestamp = auctionObj.value5;
  auction.tokenContract = auctionObj.value0;
  auction.tokenId = auctionObj.value1;
  auction.tokenStandard = auctionObj.value6;
  auction.tokenCount = auctionObj.value7;
  auction.settled = auctionObj.value8;
  auction.createdAt = event.block.timestamp;
  auction.createdTransaction = event.transaction.hash.toHex();
  auction.save();

  log.info(`NEW AUCTION #{} FROM {}`, [auction.id, donor])
}

export function handleAuctionExtended(event: AuctionExtendedEvent): void {
  if (event.params.auctionId >= INITIAL_AUCTION_ID_V2) return

  const id = event.params.auctionId.toString()
  let auction = Auction.load(id)
  if (auction == null) {
    auction = new Auction(id)
  }

  auction.endTimestamp = event.params.endTimestamp
  auction.save()
}

export function handleAuctionSettled(event: AuctionSettledEvent): void {
  if (event.params.auctionId >= INITIAL_AUCTION_ID_V2) return

  const id = event.params.auctionId.toString()
  let auction = Auction.load(id)
  if (auction == null) {
    auction = new Auction(id)
  }

  auction.settledAt = event.block.timestamp
  auction.settledTransaction = event.transaction.hash.toHex()
  auction.settled = true
  auction.save()
}

export function handleBid(event: BidEvent): void {
  if (event.params.auctionId >= INITIAL_AUCTION_ID_V2) return

  let user = new User(event.params.from.toHex())
  user.save()

  const contract = NFPeaceV1.bind(event.address)
  const auctionObj = contract.getAuction(event.params.auctionId);

  const id = event.params.auctionId.toString()
  let auction = Auction.load(id)
  if (auction == null) {
    auction = new Auction(id)
  }

  auction.latestBidder = auctionObj.value2.toHex()
  auction.latestBid = auctionObj.value3
  auction.save()

  let bid = new Bid(event.transaction.hash.toHex());
  bid.from = event.params.from.toHex();
  bid.value = event.params.bid;
  bid.auction = event.params.auctionId.toString();
  bid.createdAt = event.block.timestamp;
  bid.createdTransaction = event.transaction.hash.toHex();
  bid.save()
}
