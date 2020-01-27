import React, { useState, Fragment } from 'react';
import useForm from 'rc-form-hooks';
import {
  Form,
  Input,
  Button,
  DatePicker,
  InputNumber,
  Select,
  Switch,
} from 'antd';
import { currencies } from './utils';
import * as web3Utils from 'web3-utils';
import { BigNumber } from '@polymathnetwork/sdk';
import moment from 'moment';

const { Option } = Select;

const { Item } = Form;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

const NONUSD = 3;

const addressValidator = (rule, value, callback) => {
  if (value && !web3Utils.isAddress(value)) {
    callback('Address is invalid');
  } else {
    callback();
  }
};

/**
 * Launch a Tiered STO
 *
 * @param startDate date when the STO should start
 * @param endDate date when the STO should end
 * @param tiers tier information
 * @param tiers[].tokensOnSale amount of tokens to be sold on that tier
 * @param tiers[].price price of each token on that tier
 * @param tiers[].tokensWithDiscount amount of tokens to be sold on that tier at a discount if paid in POLY (must be less than tokensOnSale, defaults to 0)
 * @param tiers[].discountedPrice price of discounted tokens on that tier (defaults to 0)
 * @param nonAccreditedInvestmentLimit maximum investment for non-accredited investors
 * @param minimumInvestment minimum investment amount
 * @param currencies array of currencies in which the funds will be raised (ETH, POLY, StableCoin)
 * @param raisedFundsWallet wallet address that will receive the funds that are being raised
 * @param unsoldTokensWallet wallet address that will receive unsold tokens when the end date is reached
 * @param stableCoinAddresses array of stable coins that the offering supports
 * @param customCurrency custom currency data. Allows the STO to raise funds pegged to a different currency. Optional, defaults to USD
 * @param customCurrency.currencySymbol symbol of the custom currency (USD, CAD, EUR, etc. Default is USD)
 * @param customCurrency.ethOracleAddress address of the oracle that states the price of ETH in the custom currency. Only required if raising funds in ETH
 * @param customCurrency.polyOracleAddress address of the oracle that states the price of POLY in the custom currency. Only required if raising funds in POLY
 * @param allowPreIssuance whether to have all tokens issued on STO start. Default behavior is to issue on purchase
 */

export default ({ walletAddress, launchSTO, network }) => {
  const { getFieldDecorator, validateFields, resetFields } = useForm();
  const [tiersCount, setTiersCount] = useState(1);
  const [isUSD, setIsUSD] = useState(true);
  const [denomination, setDenomination] = useState('USD');
  const tiersArray = [...Array(tiersCount).keys()];
  console.log('tiersArray', tiersCount, tiersArray);
  console.log('Is USD', isUSD);
  const handleSubmit = async e => {
    e.preventDefault();
    const tierFields = [
      'tokensOnSale',
      'price',
      'tokensWithDiscount',
      'discountedPrice',
    ];

    let fields = [
      'startDate',
      'endDate',
      'nonAccreditedInvestmentLimit',
      'minimumInvestment',
      'currencies',
      'raisedFundsWallet',
      'unsoldTokensWallet',
      'allowPreissuance',
    ];
    if (!isUSD) {
      fields.push('currency');
      fields.push('stablecoinAddress');
    }
    tiersArray.forEach(i => {
      fields.push(...tierFields.map(field => `${field}_${i}`));
    });

    // @TODO switch DAI address based on network
    // @TODO allow adding custom stable coins?
    const usdStableCoinAddresses = [
      '0xc4375b7de8af5a38a93548eb8453a498222c4ff2',
    ];

    validateFields(fields, { force: true })
      .then(async values => {
        const currency = Number(values.currency);
        // In case of Non-USD stablecoin, set fund-raise type to Stablecoin.
        values.currencies = currency === NONUSD ? [2] : [currency];
        values.stableCoinAddresses = isUSD
          ? usdStableCoinAddresses
          : [values.stablecoinAddress];
        values.startDate = values.startDate.toDate();
        values.endDate = values.endDate.toDate();
        values.minimumInvestment = new BigNumber(values.minimumInvestment);
        values.nonAccreditedInvestmentLimit = new BigNumber(
          values.nonAccreditedInvestmentLimit
        );
        if (!isUSD) {
          values.customCurrency = {
            currencySymbol: denomination,
          };
        }

        values.tiers = [];
        tiersArray.forEach(tier => {
          values.tiers[tier] = {};
          tierFields.forEach(field => {
            if (typeof values[`${field}_${tier}`] === 'number') {
              values.tiers[tier][field] = new BigNumber(
                values[`${field}_${tier}`]
              );
            } else {
              values.tiers[tier][field] = values[`${field}_${tier}`];
            }
            delete values[`${field}_${tier}`];
          });
        });

        launchSTO(values);
      })
      .catch(e => console.error(e.message));
  };

  const dateFormat = 'YYYY-MM-DD';

  return (
    <Form
      colon={false}
      style={{ maxWidth: 650, textAlign: 'left' }}
      {...formItemLayout}
    >
      <Item label="Start Date">
        {getFieldDecorator('startDate', {
          // @TODO remove
          initialValue: moment('2020-02-01', dateFormat),
          rules: [{ required: true }],
        })(<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />)}
      </Item>
      <Item label="End Date">
        {getFieldDecorator('endDate', {
          // @TODO remove
          initialValue: moment('2020-02-05', dateFormat),
          rules: [{ required: true }],
        })(<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />)}
      </Item>
      <Item label="Non-accredited Investment Limit">
        {getFieldDecorator('nonAccreditedInvestmentLimit', {
          // @TODO remove
          initialValue: 5,
          rules: [{ required: true }],
        })(<InputNumber />)}
      </Item>
      <Item label="Minimum Investment">
        {getFieldDecorator('minimumInvestment', {
          // @TODO remove
          initialValue: 5,
          rules: [{ required: true }],
        })(<InputNumber />)}
      </Item>
      <Item label="Fund-raise Currency">
        {getFieldDecorator('currency', {
          rules: [{ required: true }],
        })(
          <Select
            onChange={value => {
              console.log('currency value', value);
              if (value == NONUSD) {
                setIsUSD(false);
              } else {
                setIsUSD(true);
                setDenomination('USD');
              }
            }}
          >
            {currencies.map((curr, i) => (
              <Option key={i}>{curr}</Option>
            ))}
          </Select>
        )}
      </Item>
      {!isUSD && (
        <Fragment>
          <Item label="Currency Symbol">
            {getFieldDecorator('denomination', {
              rules: [
                { required: true },
                {
                  pattern: /^[a-zA-Z]{3}$/,
                  message:
                    'Please enter a valid three character currency symbol.',
                },
              ],
            })(
              <Input
                onChange={e => {
                  console.log(e.target.value);
                  if (RegExp(/^[a-zA-Z]{3}$/).test(e.target.value)) {
                    setDenomination(e.target.value);
                  }
                }}
              />
            )}
          </Item>
          <Item label="Non-USD Stablecoin Address">
            {getFieldDecorator('stablecoinAddress', {
              rules: [{ required: true }, { validator: addressValidator }],
            })(<Input />)}
          </Item>
        </Fragment>
      )}

      <Item label="Raised Funds Wallet">
        {getFieldDecorator('raisedFundsWallet', {
          initialValue: walletAddress,
          rules: [{ required: true }, { validator: addressValidator }],
        })(<Input />)}
      </Item>
      <Item label="Unsold Tokens Wallet">
        {getFieldDecorator('unsoldTokensWallet', {
          initialValue: walletAddress,
          rules: [{ required: true }, { validator: addressValidator }],
        })(<Input />)}
      </Item>
      <Item label="Allow Pre-minting">
        {getFieldDecorator('allowPreissuance', {
          initialValue: false,
          valuePropName: 'checked',
        })(<Switch />)}
      </Item>
      <Item label="Tiers #">
        <Select
          value={tiersCount}
          onChange={value => setTiersCount(Number(value))}
        >
          {[1, 2, 3, 4, 5].map(i => (
            <Option key={i}>{i}</Option>
          ))}
        </Select>
      </Item>
      {/*
       * @param tiers[].tokensOnSale amount of tokens to be sold on that tier
       * @param tiers[].price price of each token on that tier
       * @param tiers[].tokensWithDiscount amount of tokens to be sold on that tier at a discount if paid in POLY (must be less than tokensOnSale, defaults to 0)
       * @param tiers[].discountedPrice price of discounted tokens on that tier (defaults to 0)
       */}

      <table>
        <tr>
          <td>Tokens on Sale</td>
          <td>Price</td>
          <td>Discounted Tokens</td>
          <td>Discounted Price</td>
        </tr>
        {tiersArray.map(i => {
          return (
            <tr>
              {/* <div style={{ display: 'flex', flexDirection: 'row' }} key={i}> */}
              <td>
                {/* <Item label="Tokens on Sale"> */}
                {getFieldDecorator(`tokensOnSale_${i}`, {
                  // @TODO remove
                  initialValue: 5,
                  rules: [{ required: true }],
                })(<InputNumber placeholder="Tokens on Sale" />)}
                {/* </Item> */}
              </td>
              <td>
                {/* <Item label="Price"> */}
                {getFieldDecorator(`price_${i}`, {
                  // @TODO remove
                  initialValue: 5,
                  rules: [{ required: true }],
                })(<InputNumber placeholder="Price" />)}
                {/* </Item> */}
              </td>
              <td>
                {/* <Item label="Tokens on Discount"> */}
                {getFieldDecorator(`tokensWithDiscount_${i}`)(
                  <InputNumber placeholder="Tokens on Discount" />
                )}
                {/* </Item> */}
              </td>
              <td>
                {/* <Item label="Price"> */}
                {getFieldDecorator(`discountedPrice_${i}`)(
                  <InputNumber placeholder="Discounted Price" />
                )}
                {/* </Item> */}
              </td>
              {/* </div> */}
            </tr>
          );
        })}
      </table>

      <Item
        wrapperCol={{
          xs: { span: 24, offset: 0 },
          sm: { span: 16, offset: 8 },
        }}
      >
        <Button
          onClick={() => {
            resetFields();
          }}
        >
          Cancel
        </Button>
        <Button type="primary" onClick={handleSubmit}>
          Save
        </Button>
      </Item>
    </Form>
  );
};
