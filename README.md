# NFPeace Subgraph

## Links
- [Subgraph](https://thegraph.com/hosted-service/subgraph/jwahdatehagh/nfpeace)
- [Subgraph Query Tool](https://api.thegraph.com/subgraphs/name/jwahdatehagh/nfpeace/graphql)
- [Subgraph HTTP Endpoint](https://api.thegraph.com/subgraphs/name/jwahdatehagh/nfpeace) (`https://api.thegraph.com/subgraphs/name/jwahdatehagh/nfpeace`)

## Example Query
```graphql
{
  nfpeace (id: 0) {
    totalVolume
    totalSettled
  }
  auctions(
    first: 20, 
    orderBy: latestBid,
    orderDirection: desc,
  ) {
    id
    tokenContract
    startingPrice
    endTimestamp
    tokenId
    createdAt
    settledTransaction
    latestBid
    latestBidder
  }
}
```

## Schema
### NFPeace
There is one NFPeace object with the ID `0` that contains overall statistics.

```graphql
type NFPeace @entity {
  id: ID!
  totalVolume: BigInt!
  totalSettled: BigInt!
}
```

To query for the NFPeace object, use the following:
```graphql
{
  nfpeace (id: 0) {
    totalVolume
    totalSettled
  }
}
```

### Users
Users are participating addresses with some additional data like total volume donated.

```graphql
type User @entity {
  id: ID!

  totalBidsVolume: BigInt!
  totalVolumeDonated: BigInt!
  donatedNFTsCount: Int!

  donated: [Auction!]! @derivedFrom(field: "donor")
  bids: [Bid!]! @derivedFrom(field: "from")
}
```

### Auctions
Every donated NFT starts an auction
```graphql
type Auction @entity {
  id: ID!
  donor: User!
  startingPrice: BigInt!
  endTimestamp: BigInt!
  tokenContract: Bytes!
  tokenId: BigInt!
  tokenStandard: Int!
  tokenCount: Int!

  createdAt: BigInt!
  createdTransaction: String!

  settledTransaction: String
  settledAt: BigInt
  settled: Boolean!

  latestBid: BigInt!
  latestBidder: String!

  bids: [Bid!]! @derivedFrom(field: "auction")
}
```

### Bids
Multiple bids can be placed on an auction

```graphql
type Bid @entity {
  id: ID! # bid tx hash
  auction: Auction!
  from: User!
  value: BigInt! # uint128

  createdAt: BigInt!
  createdTransaction: String!
}
```
