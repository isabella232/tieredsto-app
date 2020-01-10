import React, { Fragment } from 'react';
import { Descriptions, Table } from 'antd';

const { Item } = Descriptions;

const currencies = ['ETH', 'POLY', 'DAI'];
const columns = [
  {
    title: 'Tokens on Sale',
    dataIndex: 'tokensOnSale',
    key: 'tokensOnSale',
    render: text => formatBN(text),
  },
  {
    title: 'Tokens Sold',
    dataIndex: 'tokensSold',
    key: 'tokensSold',
    render: text => formatBN(text),
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
    render: text => formatBN(text),
  },
  {
    title: 'Tokens on Discount',
    dataIndex: 'tokensWithDiscount',
    key: 'tokensWithDiscount',
    render: text => formatBN(text),
  },
  {
    title: 'Tokens Sold on Discount',
    dataIndex: 'tokensSoldAtDiscount',
    key: 'tokensSoldAtDiscount',
    render: text => formatBN(text),
  },
  {
    title: 'Discounted Price',
    dataIndex: 'discountedPrice',
    key: 'discountedPrice',
    render: text => formatBN(text),
  },
];

const formatDate = date => date.toString();
const formatUrl = url => url;
const formatBN = bn => bn.toString();
const formatCurrency = curr => currencies[curr];
const formatBool = bool => (bool ? 'True' : 'False');

/*
  address: "0xcb3aff8589322c8c80af879e820f3f585d05c463"
  securityTokenSymbol: "ZXCV"
  securityTokenId: "c2VjdXJpdHlUb2tlbjp7InN5bWJvbCI6IlpYQ1YifQ=="
  stoType: "Tiered"
  startDate: Fri Jan 10 2020 00:30:00 GMT-0800 (Pacific Standard Time) {}
  endDate: Fri Jan 24 2020 01:00:00 GMT-0800 (Pacific Standard Time) {}
  raisedFundsWallet: "0x33a2cff8182d82af69ebfc5d3edf8f699555f146"
  unsoldTokensWallet: "0x33a2cff8182d82af69ebfc5d3edf8f699555f146"
  raisedAmount: V {s: 1, e: 0, c: Array(1)}
  soldTokensAmount: V {s: 1, e: 0, c: Array(1)}
  investorCount: 0
  fundraiseCurrencies: [0]
  isPaused: false
  capReached: false
  isFinalized: false
  preIssueAllowed: false
  beneficialInvestmentsAllowed: false
  context: Context {contractWrappers: PolymathBase, currentWallet: Wallet, factories: {…}}
  currentTier: 0
  tiers: [{
    tokensOnSale: V {s: 1, e: 2, c: Array(1)}
    tokensSold: V {s: 1, e: 0, c: Array(1)}
    price: V {s: 1, e: 2, c: Array(1)}
    tokensWithDiscount: V {s: 1, e: 0, c: Array(1)}
    tokensSoldAtDiscount: V {s: 1, e: 0, c: Array(1)}
    discountedPrice: V {s: 1, e: 0, c: Array(1)}
  }]
  */

export default ({
  address,
  startDate,
  endDate,
  raisedFundsWallet,
  unsoldTokensWallet,
  raisedAmount,
  soldTokensAmount,
  investorCount,
  fundraiseCurrencies,
  isPaused,
  capReached,
  isFinalized,
  preIssueAllowed,
  beneficialInvestmentsAllowed,
  currentTier,
  tiers,
}) => {
  tiers = tiers.map((tier, index) => {
    tier.key = index;
    return tier;
  });
  return (
    <Fragment>
      <Descriptions column={1} size="small">
        <Item label="Address">{formatUrl(address)}</Item>
        <Item label="Start Date">{formatDate(startDate)}</Item>
        <Item label="End Date">{formatDate(endDate)}</Item>
        <Item label="Raised Funds Wallet">{formatUrl(raisedFundsWallet)}</Item>
        <Item label="Unsold Tokens Amount">{formatBN(unsoldTokensWallet)}</Item>
        <Item label="Raised Amount">{formatBN(raisedAmount)}</Item>
        <Item label="Sold Tokens Amount">{formatBN(soldTokensAmount)}</Item>
        <Item label="Investor Count">{formatBN(investorCount)}</Item>
        <Item label="Fund-raise Currencies">
          {fundraiseCurrencies.map(curr => formatCurrency(curr)).join(', ')}
        </Item>
        <Item label="Is Paused">{formatBool(isPaused)}</Item>
        <Item label="Cap Reached">{formatBool(capReached)}</Item>
        <Item label="Is Finalized">{formatBool(isFinalized)}</Item>
        <Item label="Pre-issuance Allowed">{formatBool(preIssueAllowed)}</Item>
        <Item label="Beneficial Investments Allowed">
          {formatBool(beneficialInvestmentsAllowed)}
        </Item>
        <Item label="Current Tier">{currentTier}</Item>
      </Descriptions>
      <Table columns={columns} rowKey="key" dataSource={tiers} />
    </Fragment>
  );
};
