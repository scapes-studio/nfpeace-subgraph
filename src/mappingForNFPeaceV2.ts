import {
  NFPeaceV2,
  AuctionExtended as AuctionExtendedEvent,
  AuctionInitialised as AuctionInitialisedEvent,
  AuctionSettled as AuctionSettledEvent,
  Bid as BidEvent
} from "../generated/NFPeaceV2/NFPeaceV2"
import { Auction, Bid, User } from "../generated/schema"

export function handleAuctionInitialised(event: AuctionInitialisedEvent): void {
  let contract = NFPeaceV2.bind(event.address)
  let auctionObj = contract.getAuction(event.params.auctionId);
  let user = new User(auctionObj.value2.toHex())
  user.save()
  let auction = new Auction(event.params.auctionId.toString());
  auction.donor = auctionObj.value2.toHex();
  auction.startingPrice = auctionObj.value4;
  auction.endTimestamp = auctionObj.value5;
  auction.tokenContract = auctionObj.value0;
  auction.tokenId = auctionObj.value1;
  auction.tokenStandard = auctionObj.value6;
  auction.tokenCount = auctionObj.value7;
  auction.settled = auctionObj.value8;
  auction.save();
}

export function handleAuctionExtended(event: AuctionExtendedEvent): void {
  let auction = new Auction(event.params.auctionId.toString());
  auction.endTimestamp = event.params.endTimestamp;
  auction.save();
}

export function handleAuctionSettled(event: AuctionSettledEvent): void {
  let auction = new Auction(event.params.auctionId.toString());
  auction.settled = true;
  auction.save();
}

export function handleBid(event: BidEvent): void {
  let bid = new Bid(event.transaction.hash.toHex());
  let user = new User(event.params.from.toHex())
  user.save()
  bid.from = event.params.from.toHex();
  bid.value = event.params.bid;
  bid.auction = event.params.auctionId.toString();
  bid.save()
}
