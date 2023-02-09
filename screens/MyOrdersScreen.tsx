import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { sendData } from '../httpRequests';
import { checkStorage, Loading } from '../components/Shared';
import { LanguageContext } from '../LanguageContext';

export default function MyOrdersScreen({ navigation }: any) {
	const { translation } = React.useContext(LanguageContext);
	const [orders, setOrders]: any = useState([]);
	const [showLoading, setShowLoading]: any = useState(false);

	useEffect(() => {
		let unsuscribe = navigation.addListener('focus', () => {
			fetchOrders();
		});
		return () => {
			unsuscribe;
			setOrders([]);
		};
	}, []);

	const fetchOrders = () => {
		checkStorage('USER_LOGGED', (userId: any) => {
			setShowLoading(true);
			const url = '/orders/getOrderbyUser';
			const data = {
				user_id: userId
			};
			sendData(url, data).then((response: any) => {
				hideLoadingModal(() => {
					if (Object.keys(response).length > 0) {
						const orders = response['order'];
						orders.sort(function (a: any, b: any) {
							return a.code < b.code;
						});
						setOrders(orders);
					}
				});
			});
		});
	};

	const hideLoadingModal = (callback: Function) => {
		setTimeout(() => {
			setShowLoading(false);
			callback();
		}, 1500);
	};

	return (
		<SafeAreaView style={styles.container}>
			<Loading showLoading={showLoading} translation={translation} />
			<View style={styles.body}>
				{(Object.keys(orders).length > 0 && (
					<FlatList
						data={orders}
						renderItem={({ item }: any) => <Order item={item} navigation={navigation} />}
					/>
				)) || <Text>{translation.t('ordersNoItemsText') /* You don't have any orders. */}</Text>}
			</View>
		</SafeAreaView>
	);
}

function Order({ item, navigation }: any) {
	const { translation } = React.useContext(LanguageContext);
	const [pharmacy, setPharmacy]: any = useState({});

	useEffect(() => {
		const url = '/pharmacies/getPharmacyById';
		const data = {
			id: 560
		};
		sendData(url, data).then((response) => {
			if (Object.keys(response).length > 0) {
				const pharmacy = response['pharmacy'];
				setPharmacy(pharmacy);
			}
		});

		return () => {
			setPharmacy({});
		};
	}, []);

	return (
		<TouchableOpacity
			style={styles.card}
			onPress={() => navigation.navigate('MyOrderDetails', { orderId: item.id })}
		>
			<View>
				<Text style={[styles.cardNumber, { marginBottom: 10 }]}>#{item.code}</Text>
				<Text style={styles.cardPharmacy}>{pharmacy.name}</Text>
				<Text
					style={[
						(item.order_state_id == 5 && { color: '#128780' }) ||
							(item.order_state_id == 7 && { color: '#128780' }) ||
							(item.order_state_id == 6 && { color: 'red' }) || { color: '#8B8B97' },
						{
							marginTop: 3
						}
					]}
				>
					{
						(item.order_state_id == 1 && translation.t('orderStatusPendingText')) /* Pending */ ||
							(item.order_state_id == 2 && translation.t('orderStatusPreparingText')) /* Preparing */ ||
							(item.order_state_id == 3 &&
								translation.t('orderStatusReadyPickupText')) /* Waiting for carrier */ ||
							(item.order_state_id == 4 && translation.t('orderStatusPickedUpText')) /* On the way */ ||
							(item.order_state_id == 5 && translation.t('orderStatusDeliveredText')) /* Delivered */ ||
							(item.order_state_id == 6 && translation.t('orderStatusRejectedText')) /* Rejected */ ||
							(item.order_state_id == 7 &&
								translation.t('orderStatusPickupUserText')) /* Ready to be picked up */
					}
				</Text>
			</View>
			<View>
				<Text style={[styles.cardPrice, { marginBottom: 8 }]}>${item.total_order}</Text>
			</View>
			{/* <Ionicons name="arrow-forward" size={20} style={{ position: 'absolute', top: 5, right: 10, color: "#8B8B97" }}/> */}
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F7F7F7'
	},
	body: {
		marginHorizontal: 20,
		marginVertical: 30,
		padding: 20,
		backgroundColor: '#ffffff',
		borderRadius: 20
	},
	card: {
		alignContent: 'center',
		flexDirection: 'row',
		width: '100%',
		justifyContent: 'space-around',
		paddingVertical: 20,
		borderBottomColor: 'rgba(0, 0, 0,  0.1)',
		borderBottomWidth: 1,
		position: 'relative',
		marginVertical: 10,
		paddingHorizontal: '10%'
	},
	cardNumber: {
		fontSize: 16,
		fontWeight: '700'
	},
	cardPrice: {
		textAlign: 'right',
		fontSize: 18,
		fontWeight: '600',
		color: '#8B8B97'
	},
	cardPharmacy: {
		fontSize: 14,
		color: '#8B8B97'
	}
});
