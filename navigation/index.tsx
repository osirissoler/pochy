/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { ColorSchemeName, View } from 'react-native';

import useColorScheme from '../hooks/useColorScheme';
import { LanguageContext } from '../LanguageContext';
import AddressesScreen from '../screens/AddressesScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import LanguageScreen from '../screens/LanguageScreen';
import ListPharmaciesScreen from '../screens/ListPharmaciesScreen';
import ListProductsScreen from '../screens/ListProductsScreen';
import MyOrderDetailsScreen from '../screens/MyOrderDetailsScreen';
import MyOrdersScreen from '../screens/MyOrdersScreen';
import NewAddressScreen from '../screens/NewAddresssScreen';
import NewCardScreen from '../screens/NewCardScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SelectLanguageScreen from '../screens/SelectLanguageScreen';
import ServiceScreen from '../screens/ServiceScreen';
import ShopperScreen from '../screens/ShopperScreen';
import ShoppingCartScreen from '../screens/ShoppingCartScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import Step1Screen from '../screens/Steps/Step1Screen';
import Step2Screen from '../screens/Steps/Step2Screen';
import Step3Screen from '../screens/Steps/Step3Screen';
import { RootStackParamList, RootTabParamList } from '../types';
import LinkingConfiguration from './LinkingConfiguration';

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
	return (
		<NavigationContainer linking={LinkingConfiguration} theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
			<RootNavigator />
		</NavigationContainer>
	);
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator({ route }: any) {
	const { translation } = React.useContext(LanguageContext);
	return (
		<Stack.Navigator
			screenOptions={{
				headerBackTitle: translation.t('headerButtonBackText') // Back
			}}
		>
			<Stack.Screen
				name='Language'
				component={LanguageScreen}
				options={{ headerShown: false, animation: 'fade' }}
			/>
			<Stack.Screen name='Step1' component={Step1Screen} options={{ headerShown: false, animation: 'fade' }} />
			<Stack.Screen name='Step2' component={Step2Screen} options={{ headerShown: false, animation: 'fade' }} />
			<Stack.Screen name='Step3' component={Step3Screen} options={{ headerShown: false, animation: 'fade' }} />
			<Stack.Screen
				name='SignIn'
				component={SignInScreen}
				options={{ headerShown: false, animation: 'slide_from_right' }}
			/>
			<Stack.Screen
				name='SignUp'
				component={SignUpScreen}
				options={{ headerShown: false, animation: 'slide_from_right' }}
			/>
			<Stack.Screen
				name='ForgotPassword'
				component={ForgotPasswordScreen}
				options={{
					headerTitle: translation.t('headerTitleForgotPassword') /* Forgot Password */,
					headerStyle: { backgroundColor: '#fff' },
					headerTitleStyle: { color: '#000', fontWeight: '400' },
					animation: 'slide_from_bottom'
				}}
			/>
			<Stack.Screen
				name='SelectLanguage'
				component={SelectLanguageScreen}
				options={{
					headerTitle: translation.t('languageTitle'),
					headerStyle: { backgroundColor: '#fff' },
					headerTitleStyle: { color: '#000', fontWeight: '400' },
					animation: 'slide_from_right'
				}}
			/>
			<Stack.Screen
				name='MyOrders'
				component={MyOrdersScreen}
				options={{
					headerTitle: translation.t('headerTitleMyOrders') /* My Orders */,
					headerStyle: { backgroundColor: '#fff' },
					headerTitleStyle: { color: '#000', fontWeight: '400' }
				}}
			/>
			<Stack.Screen
				name='MyOrderDetails'
				component={MyOrderDetailsScreen}
				options={{
					headerStyle: { backgroundColor: '#fff' },
					headerTitleStyle: { color: '#000', fontWeight: '400' }
				}}
			/>
			<Stack.Screen
				name='Payments'
				component={PaymentsScreen}
				options={{
					headerTitle: translation.t('headerTitlePayments') /* Payments */,
					headerStyle: { backgroundColor: '#fff' },
					headerTitleStyle: { color: '#000', fontWeight: '400' }
				}}
			/>
			<Stack.Screen
				name='Addresses'
				component={AddressesScreen}
				options={{
					headerTitle: translation.t('headerTitleAddresses') /* Addresses */,
					headerStyle: { backgroundColor: '#fff' },
					headerTitleStyle: { color: '#000', fontWeight: '400' }
				}}
			/>
			<Stack.Screen
				name='NewAddress'
				component={NewAddressScreen}
				options={{
					headerTitle: translation.t('headerTitleNewAddress') /* New Address */,
					headerStyle: { backgroundColor: '#fff' },
					headerTitleStyle: { color: '#000', fontWeight: '400' }
				}}
			/>
			<Stack.Screen
				name='NewCard'
				component={NewCardScreen}
				options={{
					headerTitle: translation.t('headerTitleNewCard') /* New Card */,
					headerStyle: { backgroundColor: '#fff' },
					headerTitleStyle: { color: '#000', fontWeight: '400' }
				}}
			/>
			<Stack.Screen
				name='ListPharmacies'
				component={ListPharmaciesScreen}
				options={{
					headerTitle: translation.t('headerTitleSelectPharmacy') /* Select a Pharmacy */,
					headerStyle: { backgroundColor: '#fff' },
					headerTitleStyle: { color: '#000', fontWeight: '400' },
					headerBackVisible: false,
					gestureEnabled: false
				}}
			/>
			<Stack.Screen
				name='ListProducts'
				component={ListProductsScreen}
				options={{
					headerTitle: translation.t('headerTitleSearchProduct') /* Search Products */,
					headerStyle: { backgroundColor: '#fff' },
					headerTitleStyle: { color: '#000', fontWeight: '400' }
				}}
			/>
			<Stack.Screen
				name='ProductDetails'
				component={ProductDetailsScreen}
				options={{
					headerTitle: translation.t('headerTitleProductDetails') /* Product Details */,
					headerStyle: { backgroundColor: '#fff' },
					headerTitleStyle: { color: '#000', fontWeight: '400' }
				}}
			/>
			<Stack.Screen
				name='Checkout'
				component={CheckoutScreen}
				options={{
					headerTitle: translation.t('headerTitleCheckout') /* Checkout */,
					headerStyle: { backgroundColor: '#fff' },
					headerTitleStyle: { color: '#000', fontWeight: '400' }
				}}
			/>
			<Stack.Screen name='Root' component={BottomTabNavigator} options={{ headerShown: false }} />
			<Stack.Screen name='NotFound' component={NotFoundScreen} options={{ title: 'Oops!' }} />
		</Stack.Navigator>
	);
}

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const BottomTab = createBottomTabNavigator<RootTabParamList>();

function BottomTabNavigator({ route }: any) {
	const colorScheme = useColorScheme();
	const { translation } = React.useContext(LanguageContext);

	return (
		<BottomTab.Navigator
			initialRouteName='Home'
			screenOptions={{
				tabBarActiveTintColor: '#6BBD44',
				tabBarStyle: {
					backgroundColor: '#fff',
					borderTopColor: 'rgba(0, 0, 0, 0.1)'
				}
			}}
		>
			<BottomTab.Screen
				name='Home'
				component={HomeScreen}
				options={{
					headerShown: false,
					title: translation.t('BottomTabHomeText'),
					tabBarIcon: ({ color }) => <TabBarIcon name='home-outline' color={color} />
				}}
				initialParams={route.params}
			/>
			{/* <BottomTab.Screen
				name='Service'
				component={ServiceScreen}
				options={{
					headerShown: false,
					title: translation.t('BottomTabServiceText'),
					tabBarIcon: ({ color }) => <TabBarIcon name='receipt-outline' color={color} />
				}}
				initialParams={route.params}
			/> */}
			<BottomTab.Screen
				name='ShoppingCart'
				component={ShoppingCartScreen}
				options={{
					title: '',
					headerShown: false,
					tabBarIcon: ({ color }) => (
						<View
							style={{
								height: 60,
								width: 60,
								borderRadius: 100,
								backgroundColor: '#6BBD44',
								marginBottom: 8,
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<TabBarIcon name='basket-outline' color={'#fff'} />
						</View>
					)
				}}
			/>
			{/* <BottomTab.Screen
				name='Shopper'
				component={ShopperScreen}
				options={{
					headerShown: false,
					tabBarIcon: ({ color }) => <TabBarIcon name='cart-outline' color={color} />
				}}
				initialParams={route.params}
			/> */}
			<BottomTab.Screen
				name='Profile'
				component={ProfileScreen}
				options={{
					headerShown: false,
					title: translation.t('BottomTabProfileText'),
					tabBarIcon: ({ color }) => <TabBarIcon name='person-outline' color={color} />
				}}
				initialParams={route.params}
			/>
		</BottomTab.Navigator>
	);
}

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: { name: React.ComponentProps<typeof Ionicons>['name']; color: string }) {
	return <Ionicons size={30} style={{ marginBottom: -3 }} {...props} />;
}
