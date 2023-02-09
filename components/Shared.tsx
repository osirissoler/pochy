import React, { useState, useEffect } from 'react';
import {
	KeyboardAvoidingView,
	Platform,
	SafeAreaView,
	StyleSheet,
	StatusBar,
	Text,
	TouchableOpacity,
	Pressable,
	View,
	FlatList,
	Alert,
	Modal,
	ActivityIndicator
} from 'react-native';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import asyncStorage from '@react-native-async-storage/async-storage';
import { sendData } from '../httpRequests';
import { BlurView } from 'expo-blur';

const Container = ({ children, style, keyboard }: any) => {
	return (
		<SafeAreaView
			style={
				!!style
					? [style, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]
					: styles.container
			}
		>
			{keyboard ? (
				<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'position'}>
					{children}
				</KeyboardAvoidingView>
			) : (
				<>{children}</>
			)}
		</SafeAreaView>
	);
};

const Loading = ({ showLoading, translation }: any) => {
	return (
		<Modal visible={showLoading} transparent animationType='fade'>
			<BlurView intensity={80} tint={'dark'} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<View
					style={{
						height: 120,
						backgroundColor: '#fff',
						width: 150,
						borderRadius: 20,
						justifyContent: 'center',
						alignItems: 'center'
					}}
				>
					<ActivityIndicator size='large' color='#128780' />
					<Text style={{ marginTop: 20, fontSize: 16 }}>{translation.t('loadingText') /* Loading... */}</Text>
				</View>
			</BlurView>
		</Modal>
	);
};

function Addresses({ navigation, setAddress, translation }: any) {
	const [addresses, setAddresses]: any = useState([]);
	const [isFetching, setIsFetching]: any = useState(false);
	const [showLoading, setShowLoading]: any = useState(false);

	useEffect(() => {
		navigation.addListener('focus', () => {
			fetchAddresses();
		});
	}, []);

	const fetchAddresses = () => {
		checkStorage('USER_LOGGED', (userId: any) => {
			const url = '/user/getClientDirection';
			const data = {
				user_id: userId
			};
			sendData(url, data).then((response: any) => {
				if (Object.keys(response).length > 0) {
					const addresses = response['clientDirection'];
					const url = '/user/getUserById';
					const data = {
						user_id: userId
					};
					sendData(url, data).then((response: any) => {
						const user = response['user'];
						const defaultAddress = addresses.find((address: any) => address.id == user.client_direction_id);
						if (defaultAddress) {
							defaultAddress.default = true;
							if (setAddress) setAddress(defaultAddress);
						}
						setAddresses(addresses);
					});
				} else {
					if (setAddress) setAddress({});
					setAddresses([]);
				}
			});
		});
	};

	const hideLoadingModal = (callback: Function) => {
		setTimeout(() => {
			setShowLoading(false);
			callback();
		}, 1500);
	};

	const setDefaultAddress = (item: any) => {
		setShowLoading(true);
		checkStorage('USER_LOGGED', (userId: any) => {
			const url = '/user/getUserById';
			const data = {
				user_id: userId
			};
			sendData(url, data).then((response: any) => {
				hideLoadingModal(() => {
					const user = response['user'];
					const url = '/user/updateCliente';
					if (item.id != user.client_direction_id) {
						const data = {
							user_id: user.id,
							email: user.email,
							first_name: user.first_name,
							last_name: user.last_name,
							client_direction_id: item.id,
							card_id: user.card_id
						};
						sendData(url, data).then((response: any) => {
							fetchAddresses();
							if (setAddress) setAddress(item);
						});
					}
				});
			});
		});
	};

	const deleteAddress = (id: any) => {
		Alert.alert(
			translation.t('alertWarningTitle'),
			translation.t('addressRemoveItemText'), // Do you want to delete this address?
			[
				{
					text: 'Yes',
					onPress: () => {
						setShowLoading(true);
						checkStorage('USER_LOGGED', (userId: any) => {
							const url = '/user/deleteClientDirection';
							const data = {
								id: id,
								user_id: userId
							};
							sendData(url, data).then((response: any) => {
								hideLoadingModal(() => {
									fetchAddresses();
								});
							});
						});
					}
				},
				{
					text: translation.t('alertButtonNoText')
				}
			]
		);
	};

	return (
		<>
			<Loading showLoading={showLoading} translation={translation} />
			<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
				<Text style={{ fontSize: 16 }}>
					{translation.t('addressSelectTitle') /* Select Delivery Address */}
				</Text>
			</View>
			<FlatList
				data={addresses}
				refreshing={isFetching}
				renderItem={({ item }: any) => (
					<TouchableOpacity
						key={item.id}
						style={[
							styles.productCard,
							item.default == true
								? { borderColor: '#128780', borderWidth: 1, backgroundColor: '#d8f3f1' }
								: { borderColor: 'rgba(0, 0, 0, 0.1)' }
						]}
						onPress={() => setDefaultAddress(item)}
					>
						<View
							style={{
								position: 'absolute',
								flexDirection: 'row',
								right: 10,
								top: 6,
								alignItems: 'center'
							}}
						>
							{item.default && (
								<Text style={{ fontSize: 14, marginRight: 5 }}>
									{translation.t('selectDefaultText')}
								</Text>
							)}
							<FontAwesome
								style={{ marginHorizontal: 8, padding: 3 }}
								name='pencil-square-o'
								size={20}
								onPress={() => navigation.navigate('NewAddress', { address: item })}
							/>
							<FontAwesome
								name='trash-o'
								style={{ padding: 3 }}
								size={20}
								onPress={() => deleteAddress(item.id)}
							/>
						</View>
						<View
							style={{
								flex: 1,
								paddingVertical: 10,
								paddingHorizontal: 10,
								flexDirection: 'row',
								alignItems: 'center'
							}}
						>
							<Pressable
								onPress={() => setDefaultAddress(item)}
								style={[
									{
										borderColor: 'rgba(0, 0, 0, 0.2)',
										height: 15,
										width: 15,
										borderRadius: 100
									},
									item.default == true
										? { backgroundColor: '#128780' }
										: { backgroundColor: '#fff', borderWidth: 1 }
								]}
							></Pressable>
							<View style={{ flexDirection: 'column', paddingRight: 20 }}>
								<Text
									style={{
										textAlign: 'left',
										marginLeft: 20,
										fontWeight: '500',
										fontSize: 16
									}}
								>
									{item.alias}
								</Text>
								<Text
									style={{
										textAlign: 'left',
										marginLeft: 20,
										fontWeight: '500',
										color: 'rgba(0, 0, 0, 0.4)',
										fontSize: 15,
										marginTop: 3
									}}
								>
									{item.phone}
								</Text>
								<Text
									style={{
										textAlign: 'left',
										marginLeft: 20,
										fontWeight: '500',
										color: 'rgba(0, 0, 0, 0.4)',
										fontSize: 15
									}}
								>
									{item.address_1}
								</Text>
								{!!item.address_2 && (
									<Text
										style={{
											textAlign: 'left',
											marginLeft: 20,
											fontWeight: '500',
											color: 'rgba(0, 0, 0, 0.4)',
											fontSize: 15
										}}
									>
										{item.address_2}
									</Text>
								)}
							</View>
						</View>
					</TouchableOpacity>
				)}
			></FlatList>
			{Object.keys(addresses).length < 2 && (
				<TouchableOpacity style={styles.productCard} onPress={() => navigation.navigate('NewAddress')}>
					<View style={{ justifyContent: 'center', alignItems: 'center' }}>
						<Text style={{ fontSize: 16, marginBottom: 15 }}>
							{translation.t('addressNewTitle') /* Add new address */}
						</Text>
						<Pressable
							style={{
								backgroundColor: '#128780',
								width: 35,
								borderRadius: 5,
								height: 25,
								justifyContent: 'center',
								alignItems: 'center'
							}}
							onPress={() => navigation.navigate('NewAddress')}
						>
							<AntDesign name='plus' size={18} style={{ color: '#fff' }} />
						</Pressable>
					</View>
				</TouchableOpacity>
			)}
		</>
	);
}

function Cards({ navigation, setCard, horizontal = true, style, translation }: any) {
	const [cards, setCards]: any = useState([]);
	const [showLoading, setShowLoading]: any = useState(false);

	useEffect(() => {
		navigation.addListener('focus', () => {
			fetchCards();
		});
	}, []);

	const fetchCards = () => {
		checkStorage('USER_LOGGED', (userId: any) => {
			const url = '/stripe/getCards';
			const data = { id: userId };
			sendData(url, data).then((response) => {
				if (Object.keys(response).length > 0) {
					const cards = response['cards'];
					if (cards.length > 0) {
						const url = '/user/getUserById';
						const data = {
							user_id: userId
						};
						sendData(url, data).then((response: any) => {
							const user = response['user'];
							const defaultCard = cards.find((card: any) => card.id == user.card_id);
							if (defaultCard) {
								defaultCard.default = true;
								if (setCard) setCard(defaultCard.id);
							}
							setCards(cards);
						});
					} else {
						if (setCard) setCard('');
						setCards([]);
					}
				}
			});
		});
	};

	const hideLoadingModal = (callback: Function) => {
		setTimeout(() => {
			setShowLoading(false);
			callback();
		}, 1500);
	};

	const setDefaultCard = (item: any) => {
		setShowLoading(true);
		checkStorage('USER_LOGGED', (userId: any) => {
			const url = '/user/getUserById';
			const data = {
				user_id: userId
			};
			sendData(url, data).then((response: any) => {
				hideLoadingModal(() => {
					const user = response['user'];
					const url = '/user/updateCliente';
					if (item.id != user.card_id) {
						const data = {
							user_id: user.id,
							email: user.email,
							first_name: user.first_name,
							last_name: user.last_name,
							client_direction_id: user.client_direction_id,
							card_id: item.id
						};
						sendData(url, data).then((response: any) => {
							fetchCards();
							if (setCard) setCard(item.id);
						});
					}
				});
			});
		});
	};

	const deleteCard = (id: any) => {
		Alert.alert(
			translation.t('alertWarningTitle'),
			translation.t('cardRemoveItemText'), // Do you want to delete this card?
			[
				{
					text: translation.t('alertButtonYesText'),
					onPress: () => {
						setShowLoading(true);
						checkStorage('USER_LOGGED', (userId: any) => {
							const url = '/stripe/deleteCard';
							const data = {
								id: userId,
								card_id: id
							};
							sendData(url, data).then((response: any) => {
								hideLoadingModal(() => {
									fetchCards();
								});
							});
						});
					}
				},
				{
					text: translation.t('alertButtonNoText')
				}
			]
		);
	};

	return (
		<>
			<Loading showLoading={showLoading} translation={translation} />
			<View style={{ marginTop: 20 }}>
				<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
					<Text style={{ fontSize: 16, marginBottom: 10 }}>
						{translation.t('cardSelectTitle') /* Select Payment System */}
					</Text>
					<Pressable
						style={{
							backgroundColor: '#128780',
							width: 35,
							borderRadius: 5,
							height: 25,
							justifyContent: 'center',
							alignItems: 'center'
						}}
						onPress={() => navigation.navigate('NewCard')}
					>
						<AntDesign name='plus' size={18} style={{ color: '#fff' }} />
					</Pressable>
				</View>
				<FlatList
					horizontal={horizontal}
					style={{ marginTop: 10 }}
					data={cards}
					renderItem={({ item }) => (
						<TouchableOpacity
							style={[
								styles.productCard,
								item.default == true
									? { borderColor: '#128780', borderWidth: 1, backgroundColor: '#d8f3f1' }
									: { borderColor: 'rgba(0, 0, 0, 0.1)' },
								{ marginHorizontal: 5, width: 120 },
								style
							]}
							onPress={() => setDefaultCard(item)}
						>
							<View
								style={{
									position: 'absolute',
									flexDirection: 'row',
									right: 5,
									top: 0,
									alignItems: 'center'
								}}
							>
								{item.default && !horizontal && (
									<Text style={{ fontSize: 14, marginRight: 5 }}>
										{translation.t('selectDefaultText') /* Default */}
									</Text>
								)}
								<FontAwesome
									name='trash-o'
									style={{ padding: 5 }}
									size={20}
									onPress={() => deleteCard(item.id)}
								/>
							</View>
							<View
								style={{
									flex: 1,
									paddingTop: 5,
									paddingHorizontal: 10,
									flexDirection: 'row',
									alignItems: 'center',
									justifyContent: 'center'
								}}
							>
								<View style={{ flexDirection: 'column', alignItems: 'center' }}>
									<AntDesign size={22} name='creditcard' style={{ marginBottom: 5 }} />
									<Text
										style={{
											textAlign: 'left',
											fontWeight: '500',
											fontSize: 16
										}}
									>
										{item.brand}
									</Text>
									<Text
										style={{
											textAlign: 'left',
											fontWeight: '500',
											color: 'rgba(0, 0, 0, 0.4)',
											fontSize: 15,
											marginTop: 3
										}}
									>
										{item.last4}
									</Text>
								</View>
							</View>
						</TouchableOpacity>
					)}
				/>
			</View>
		</>
	);
}

const checkStorage = (key: string, callback: any) => {
	const data = asyncStorage.getItem(key);
	data.then((response: any) => {
		callback(response);
	});
};

const checkLoggedUser = (callback: any, navigation: any, translation: any) => {
	checkStorage('USER_LOGGED', (id: any) => {
		if (!!id) {
			callback(id);
		} else {
			Alert.alert(
				translation.t('alertWarningTitle'), // Alert
				translation.t('alertUserAnonymousMessage'), // You need to be logged in to perfom this action.
				[
					{
						text: translation.t('alertGoToLogin'), // Go to Login
						onPress: () => {
							navigation.reset({
								index: 0,
								routes: [{ name: 'SignIn' }]
							});
						}
					}
				]
			);
		}
	});
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#ffffff',
		paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
	},
	productCard: {
		paddingVertical: 20,
		marginVertical: 8,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: 'rgba(0, 0, 0, 0.1)',
		flexDirection: 'row',
		justifyContent: 'space-around',
		position: 'relative'
	}
});

export { Container, Addresses, Cards, checkStorage, Loading, checkLoggedUser };
