/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

import { RootStackParamList } from '../types';

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Root: {
        screens: {
          Home: {
            screens: {
              HomeScreen: 'home',
            },
          },
          Service: {
            screens: {
              ServiceScreen: 'service',
            },
          },
          ShoppingCart: {
            screens: {
              ShoppingCartScreen: 'shoppingcart',
            },
          },
          Shopper: {
            screens: {
              ShopperScreen: 'shopper',
            },
          },
          Profile: {
            screens: {
              ProfileScreen: 'profile',
            },
          },
        },
      },
      Language: 'language',
      Step1: 'step1',
      Step2: 'step2',
      Step3: 'step3',
      SignIn: 'signin',
      SignUp: 'signup',
      MyOrders: 'myorders',
      MyOrderDetails: 'myorderdetails',
      Payments: 'payments',
      Addresses: 'addresses',
      ForgotPassword: 'forgotpassword',
      SelectLanguage: 'selectlanguage',
      NewAddress: 'newaddress',
      NewCard: 'newcard',
      ListPharmacies: 'listpharmacies',
      ListProducts: 'listproducts',
      ProductDetails: 'productdetails',
      Checkout: 'checkout',
      NotFound: '*',
    },
  },
};

export default linking;
