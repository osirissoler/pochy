import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, StyleSheet, Image, Text, FlatList } from 'react-native';
import { Loading } from '../components/Shared';
import { sendData } from '../httpRequests';
import { LanguageContext } from '../LanguageContext';

export default function MyOrderDetailsScreen({ navigation, route }: any) {
	const { translation } = React.useContext(LanguageContext);
	const [order, setOrder]: any = useState({});
	const [products, setProducts]: any = useState([]);
	const [cartPrices, setCartPrices]: any = useState({});
	const [showLoading, setShowLoading]: any = useState(false);

	useEffect(() => {
		let unsuscribe = navigation.addListener('focus', () => {
			fetchOrderProducts();
		});
		return () => {
			unsuscribe;
			setProducts([]);
			setOrder({});
			setCartPrices({});
		};
	}, []);

	const fetchOrderProducts = () => {
		setShowLoading(true);
		const orderId = route.params.orderId;
		const url = '/orders/getOrderDetails';
		const data = {
			order_id: orderId
		};
		sendData(url, data).then((response: any) => {
			hideLoadingModal(() => {
				if (Object.keys(response).length > 0) {
					const orderProducts = response['orderdetail'];
					setProducts(orderProducts);
					const url = '/orders/getOrderById';
					const data = {
						order_id: orderId
					};
					sendData(url, data).then((orderData: any) => {
						const order = orderData['order'];
						calculatePrices(orderProducts, order);
						const orderDate: string = order.created_at;
						order.orderDate = orderDate.split(' ')[0];
						navigation.setOptions({ title: translation.t('orderDetailsOrderNumberTitle') + order.code }); // Order: #
						setOrder(order);
					});
				}
			});
		});
	};

	const calculatePrices = (orderProducts: any, order: any) => {
		let prices = {
			subTotal: 0.0,
			ivu_est: 0.0,
			ivu_mun: 0.0,
			fee: 1.0,
			deliveryFee: order.pick_up_status ? 0.0 : 6.0,
			total: 0.0
		};

		orderProducts.map((product: any) => {
			let price = product.product_price;
			const subTotal = prices.subTotal + price;
			prices.subTotal = roundNumber(subTotal);
			if (product.ivu_statal) {
				prices.ivu_est += product.product_price * 0.105;
			}
			if (product.ivu_municipal) {
				prices.ivu_mun += product.product_price * 0.01;
			}
		});
		prices.ivu_est = roundNumber(prices.ivu_est);
		prices.ivu_mun = roundNumber(prices.ivu_mun);
		prices.total = roundNumber(prices.subTotal + prices.ivu_est + prices.ivu_mun + prices.fee + prices.deliveryFee);
		setCartPrices(prices);
	};

	const roundNumber = (number: number) => {
		return Number.parseFloat((Math.round(number * 100) / 100).toFixed(2));
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
				{Object.keys(order).length > 0 && Object.keys(products).length > 0 && (
					<>
						<View style={styles.orderHeader}>
							<Text style={styles.orderText}>
								{translation.t('orderDetailsStatusText') /* Status: */}
								{
									(order.order_state_id == 1 &&
										translation.t('orderStatusPendingText')) /* Pending */ ||
									(order.order_state_id == 2 &&
										translation.t('orderStatusPreparingText')) /* Preparing */ ||
									(order.order_state_id == 3 &&
										translation.t('orderStatusReadyPickupText')) /* Waiting for carrier */ ||
									(order.order_state_id == 4 &&
										translation.t('orderStatusPickedUpText')) /* On the way */ ||
									(order.order_state_id == 5 &&
										translation.t('orderStatusDeliveredText')) /* Delivered */ ||
									(order.order_state_id == 6 &&
										translation.t('orderStatusRejectedText')) /* Rejected */ ||
									(order.order_state_id == 7 &&
										translation.t('orderStatusPickupUserText')) /* Ready to be picked up */
								}
							</Text>
							<Text style={styles.orderText}>
								{translation.t('orderDetailsDateText') /* Date: */ + order.orderDate}
							</Text>
							<Text style={styles.orderText}>
								{translation.t('orderDetailsPaymentText') /* Payment Method: */ +
									order.last_card_digit || ''}
							</Text>
						</View>
						<FlatList
							data={products}
							style={{ height: '70%' }}
							renderItem={({ item }) => <OrderProduct item={item} order={order} />}
						/>
						<View style={{ marginTop: 10 }}>
							<View style={styles.cartPrices}>
								<Text>Sub Total</Text>
								<Text style={styles.cartPrice}>${cartPrices.subTotal}</Text>
							</View>
							<View style={styles.cartPrices}>
								<View>
									<Text>{translation.t('orderStateSUTText') /* State SUT */}</Text>
								</View>
								<View>
									<Text style={styles.cartPrice}>${cartPrices.ivu_est}</Text>
								</View>
							</View>
							<View style={styles.cartPrices}>
								<View>
									<Text>{translation.t('orderMunicipalSUTText') /* Municipal SUT */}</Text>
								</View>
								<View>
									<Text style={styles.cartPrice}>${cartPrices.ivu_mun}</Text>
								</View>
							</View>
							<View style={styles.cartPrices}>
								<Text>{translation.t('orderTransactionFeeText') /* Transaction Fee */}</Text>
								<Text style={styles.cartPrice}>${cartPrices.fee}</Text>
							</View>
							<View style={styles.cartPrices}>
								<Text>{translation.t('orderDeliveryFeeText') /* Delivery Fee */}</Text>
								<Text style={styles.cartPrice}>${cartPrices.deliveryFee}</Text>
							</View>
							<View style={styles.cartPrices}>
								<Text style={{ fontWeight: '700', fontSize: 16 }}>Total</Text>
								<Text style={[styles.cartPrice, { fontWeight: '700', fontSize: 16 }]}>
									${cartPrices.total}
								</Text>
							</View>
						</View>
					</>
				)}
			</View>
		</SafeAreaView>
	);
}

function OrderProduct({ item, order }: any) {
	const [product, setProduct]: any = useState({});

	useEffect(() => {
		const url = '/products/getPharmaciesProductByid';
		const data = { pharmacy_id: 560, id: item.pharmacy_product_id };
		sendData(url, data).then((response) => {
			if (Object.keys(response).length > 0) {
				const product = response['pharmacyProduct'];
				setProduct(product);
			}
		});
		return () => {
			setProduct({});
		};
	}, []);

	return (
		<View style={styles.card}>
			<View style={styles.cardImage}>
				<Image source={{ uri: product.product_img }} style={{ flex: 1, resizeMode: 'contain' }} />
			</View>
			<View style={{ marginLeft: 10, paddingRight: 90 }}>
				<Text style={{ fontSize: 15, fontWeight: '700', color: 'rgba(0, 0, 0, 0.5)' }}>
					{product.product_name}
				</Text>
				<Text style={{ fontSize: 15, color: 'rgba(0, 0, 0, 0.6)', marginVertical: 5 }}>
					Quantity: {item.quantity}
				</Text>
				<Text style={{ fontSize: 15, color: 'rgba(0, 0, 0, 0.6)' }}>${item.product_price}</Text>
				{item.gift_status_id == 1 && (
					<View style={{ marginTop: 10 }}>
						<Text style={{ fontStyle: 'italic', color: 'rgba(0, 0, 0, 0.5)' }}>"{item.message}"</Text>
						<Text style={{ fontStyle: 'italic', color: 'rgba(0, 0, 0, 0.5)' }}>From: {item.from}</Text>
					</View>
				)}
			</View>
		</View>
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
		borderRadius: 20,
		height: '90%'
	},
	orderHeader: {
		marginBottom: 10,
		paddingVertical: 10,
		borderBottomColor: 'rgba(0, 0, 0, 0.1)',
		borderBottomWidth: 1
	},
	orderText: {
		fontSize: 15,
		color: 'rgba(0, 0, 0, 0.5)',
		marginBottom: 10
	},
	card: {
		alignContent: 'center',
		flexDirection: 'row',
		width: '100%',
		paddingHorizontal: 15,
		paddingVertical: 20,
		borderBottomColor: 'rgba(0, 0, 0,  0.1)',
		borderBottomWidth: 1,
		position: 'relative',
		marginVertical: 10
	},
	cardImage: {
		height: 100,
		width: 100
	},
	cartPrices: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 2
	},
	cartPrice: {
		textAlign: 'right'
	}
});
